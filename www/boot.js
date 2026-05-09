(function () {
  'use strict';

  var FORUM_URL = 'https://fcuba.net';
  var ONBOARDING_URL = 'onboarding.html';
  var deepLinkHandled = false;

  function go(url) {
    window.location.replace(url);
  }

  function getPlugins() {
    return (window.Capacitor && window.Capacitor.Plugins) || {};
  }

  function init() {
    var plugins = getPlugins();
    var App = plugins.App;
    var Preferences = plugins.Preferences;

    // Cold-started by tapping an FCM notification? MainActivity stashed the
    // url; consume it here so we skip both onboarding and the forum-root
    // flash and jump straight to the conversation/post.
    if (window.FcubaNative && typeof window.FcubaNative.getPendingNotificationUrl === 'function') {
      try {
        var pending = window.FcubaNative.getPendingNotificationUrl();
        if (pending) {
          deepLinkHandled = true;
          return go(pending);
        }
      } catch (e) { /* fall through to normal boot */ }
    }

    if (App && typeof App.addListener === 'function') {
      App.addListener('appUrlOpen', function (event) {
        if (event && event.url) {
          deepLinkHandled = true;
          go(event.url);
        }
      });
    }

    var launchPromise = (App && typeof App.getLaunchUrl === 'function')
      ? App.getLaunchUrl().catch(function () { return null; })
      : Promise.resolve(null);

    launchPromise.then(function (launch) {
      if (launch && launch.url) {
        deepLinkHandled = true;
        go(launch.url);
        return;
      }

      var prefPromise = (Preferences && typeof Preferences.get === 'function')
        ? Preferences.get({ key: 'onboarding_completed' }).catch(function () { return null; })
        : Promise.resolve(null);

      prefPromise.then(function (result) {
        if (deepLinkHandled) return;
        var completed = result && result.value === 'true';

        // Returning user: register for FCM push so we capture a real token.
        // Fires on every cold-start until permission is granted, then becomes
        // a no-op after the first successful register(). Engagement notifs
        // now ship from XenForo's cron, not the device.
        if (completed && typeof window.fcubaInitPush === 'function') {
          window.fcubaInitPush();
        }

        // First-launch users always go through onboarding regardless of network.
        if (!completed) {
          go(ONBOARDING_URL);
          return;
        }

        // Returning users go to the forum, but only if there is a network.
        var Network = plugins.Network;
        if (Network && typeof Network.getStatus === 'function') {
          Network.getStatus()
            .then(function (status) {
              go(status.connected ? FORUM_URL : 'offline.html');
            })
            .catch(function () { go(FORUM_URL); });
        } else {
          go(FORUM_URL);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
