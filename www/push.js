/**
 * FCuba push notifications bootstrap.
 *
 *  - Asks for POST_NOTIFICATIONS, registers with FCM, captures the device
 *    token and stores it in Capacitor Preferences. The same SharedPreferences
 *    file is exposed cross-origin via FcubaNative.getFcmToken() so the
 *    XenForo bridge running on fcuba.net can POST the token to the addon
 *    /api/app/fcm-register endpoint when the user is logged in.
 *  - Routes deep links from FCM payloads (data.url) into the WebView.
 */
(function () {
  'use strict';

  function init() {
    var Plugins = (window.Capacitor && window.Capacitor.Plugins) || {};
    var Push = Plugins.PushNotifications;
    var Pref = Plugins.Preferences;
    if (!Push) return;
    if (window.__fcubaPushInited) return;
    window.__fcubaPushInited = true;

    Push.addListener('registration', function (token) {
      var t = (token && (token.value || token.token)) || '';
      if (!t) return;
      console.log('[FCuba Push] FCM token captured');
      if (Pref) {
        Pref.set({ key: 'fcm_token', value: t }).catch(function () {});
      }
    });

    Push.addListener('registrationError', function (err) {
      console.error('[FCuba Push] Registration error:', err);
    });

    Push.addListener('pushNotificationReceived', function (notification) {
      // Foreground delivery — Android does not auto-show the notification.
      console.log('[FCuba Push] Received in foreground:', notification);
    });

    Push.addListener('pushNotificationActionPerformed', function (action) {
      // Tap on a system notification — route the deep link if there is one.
      var data = action && action.notification && action.notification.data;
      if (data && data.url && typeof data.url === 'string') {
        window.location.replace(data.url);
      }
    });

    Push.checkPermissions()
      .then(function (perm) {
        if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
          return Push.requestPermissions();
        }
        return perm;
      })
      .then(function (perm) {
        if (perm.receive === 'granted') {
          return Push.register();
        }
      })
      .catch(function (e) {
        console.error('[FCuba Push] Setup error:', e);
      });
  }

  window.fcubaInitPush = init;
})();
