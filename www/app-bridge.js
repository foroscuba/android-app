/**
 * FCuba app-bridge.js
 *
 * Injected by MainActivity into every WebView page load. Jobs:
 *   1. Haptic feedback on key XenForo interactions.
 *   2. Offline overlay when the network drops mid-browsing.
 *   3. Auto-register the FCM token with the XenForo addon so per-user
 *      pushes (DM, mention, reply) reach the device.
 *
 * No-ops on local app pages (only runs on fcuba.net).
 */
(function () {
  'use strict';

  // Skip on local app pages (app.fcuba.net) — they have their own logic.
  var host = (location.hostname || '').toLowerCase();
  var isForumHost = (host === 'fcuba.net' || /\.fcuba\.net$/.test(host)) && host !== 'app.fcuba.net';
  if (!isForumHost) return;

  if (window.__fcubaBridgeLoaded) return;
  window.__fcubaBridgeLoaded = true;

  var Plugins = (window.Capacitor && window.Capacitor.Plugins) || {};
  var Haptics = Plugins.Haptics;
  var Network = Plugins.Network;

  var FcubaNative = window.FcubaNative; // injected by MainActivity, cross-origin safe

  function buzz(style) {
    // Prefer the native interface — works cross-origin (fcuba.net)
    if (FcubaNative && typeof FcubaNative.impact === 'function') {
      try { FcubaNative.impact(style || 'Light'); return; }
      catch (e) { /* fall through to Capacitor plugin */ }
    }
    // Fallback: Capacitor Haptics plugin (works on local app pages)
    if (Haptics && typeof Haptics.impact === 'function') {
      Haptics.impact({ style: style || 'Light' }).catch(function () {});
    }
  }

  // ===========================================================
  // 1. Haptics on XenForo interactions
  // ===========================================================

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || typeof t.closest !== 'function') return;

      // Reaction / like (covers XF 2.x default + theme variants)
      if (t.closest(
        '.actionBar-action--reaction, .actionBar-action--like, ' +
        '[data-xf-click="reaction"], .reaction'
      )) return buzz('Light');

      // Quote
      if (t.closest('[data-xf-click="quote"], .actionBar-action--quote')) {
        return buzz('Light');
      }

      // Reply (the FCuba theme button)
      if (t.closest('.button--icon--reply, [data-xf-click="reply"]')) {
        return buzz('Light');
      }
    },
    true
  );

  document.addEventListener(
    'submit',
    function (e) {
      var f = e.target;
      if (!f || typeof f.matches !== 'function') return;
      if (f.matches('form.js-quickReply, form[id*="js-quickReply"], form.js-replyForm')) {
        buzz('Medium');
      }
    },
    true
  );

  ['xf:alert-shown', 'xf:notification', 'xf:visitor:alert'].forEach(function (evt) {
    document.addEventListener(evt, function () { buzz('Medium'); });
  });

  // ===========================================================
  // 2. Offline overlay (covers mid-browsing connection loss)
  // ===========================================================

  var overlay = null;

  function showOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'fcuba-offline-overlay';
    overlay.innerHTML =
      '<style>' +
      '#fcuba-offline-overlay{position:fixed;inset:0;z-index:2147483647;background:#0F1115;color:#F3F4F6;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;font-family:-apple-system,BlinkMacSystemFont,Roboto,sans-serif;}' +
      '#fcuba-offline-overlay .icon{width:64px;height:64px;border-radius:50%;background:rgba(255,79,87,.15);color:#FF4757;display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:24px;font-weight:700;}' +
      '#fcuba-offline-overlay h1{font-size:30px;font-weight:800;margin:0 0 12px;letter-spacing:-.6px;}' +
      '#fcuba-offline-overlay p{font-size:15px;color:rgba(255,255,255,.62);margin:0 0 32px;max-width:300px;line-height:1.5;}' +
      '#fcuba-offline-overlay button{background:#fff;color:#0F1115;border:none;border-radius:999px;padding:14px 36px;font-size:15px;font-weight:600;cursor:pointer;}' +
      '</style>' +
      '<div class="icon">!</div>' +
      '<h1>Sin conexión.</h1>' +
      '<p>Necesitas internet para usar el foro. Comprueba tu wifi o tus datos móviles.</p>' +
      '<button id="fcuba-offline-retry">Reintentar</button>';
    document.body.appendChild(overlay);
    document
      .getElementById('fcuba-offline-retry')
      .addEventListener('click', function () { location.reload(); });
  }

  function hideOverlay() {
    if (overlay) { overlay.remove(); overlay = null; }
  }

  if (Network && typeof Network.addListener === 'function') {
    Network.addListener('networkStatusChange', function (status) {
      if (!status.connected) showOverlay();
      else if (overlay) { hideOverlay(); location.reload(); }
    });
    Network.getStatus()
      .then(function (status) { if (!status.connected) showOverlay(); })
      .catch(function () {});
  }

  // ===========================================================
  // 3. Auto-register the FCM token with the XenForo addon
  // ===========================================================
  // push.js stores the token in Capacitor Preferences. Until we POST it to
  // /fcuba-app/fcm-register, production has no row for the user, so per-user
  // alerts (DM, mention, reply) never reach the device. Topic broadcasts
  // bypass the token list — that's why announcements work without this.
  //
  // sessionStorage is cleared on cold-start, so the call fires once per app
  // session, and re-fires automatically if the FCM token rotates.

  (function autoRegisterToken() {
    if (!FcubaNative || typeof FcubaNative.getFcmToken !== 'function') return;

    var csrf = (window.XF && window.XF.config && window.XF.config.csrf) || '';
    if (!csrf) return; // user not logged in, or XF JS not ready yet

    var token;
    try { token = FcubaNative.getFcmToken(); }
    catch (e) { return; }
    if (!token) return;

    if (sessionStorage.getItem('fcuba_token_sent') === token) return;

    var body =
      'token=' + encodeURIComponent(token) +
      '&platform=android' +
      '&_xfToken=' + encodeURIComponent(csrf);

    fetch('/fcuba-app/fcm-register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (r) {
      if (r.ok) sessionStorage.setItem('fcuba_token_sent', token);
    }).catch(function () { /* swallow — retry next session */ });
  })();
})();
