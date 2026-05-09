(function () {
  'use strict';

  var FORUM_URL = 'https://fcuba.net';
  var TOTAL_SLIDES = 5;

  var slidesEl = document.getElementById('slides');
  var dotsEl = document.getElementById('dots');
  var skipBtn = document.getElementById('skip');
  var nextBtn = document.getElementById('next');
  var enterBtn = document.getElementById('enter');

  var plugins = (window.Capacitor && window.Capacitor.Plugins) || {};
  var Haptics = plugins.Haptics;
  var Dialog = plugins.Dialog;
  var Preferences = plugins.Preferences;

  var current = 0;
  var dots = dotsEl.querySelectorAll('.dot');

  function buzz(style) {
    if (!Haptics || typeof Haptics.impact !== 'function') {
      return Promise.resolve();
    }
    return Haptics.impact({ style: style || 'Light' }).catch(function () {});
  }

  function updateUI() {
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === current);
    });
    var isLast = current === TOTAL_SLIDES - 1;
    nextBtn.hidden = isLast;
    skipBtn.hidden = isLast;
  }

  function goToSlide(idx) {
    if (idx < 0 || idx >= TOTAL_SLIDES) return;
    var target = document.getElementById('slide-' + (idx + 1));
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  }

  // Sync UI to wherever the user has scroll-snapped after a swipe.
  // No haptic here on purpose — calling goToSlide() on a Next tap also
  // triggers this listener, so firing buzz() in both places caused a
  // double vibration. Haptics now fire only from the explicit button taps.
  var scrollTimeout = null;
  slidesEl.addEventListener('scroll', function () {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
      var idx = Math.round(slidesEl.scrollLeft / slidesEl.clientWidth);
      if (idx !== current && idx >= 0 && idx < TOTAL_SLIDES) {
        current = idx;
        updateUI();
      }
    }, 80);
  });

  nextBtn.addEventListener('click', function () {
    buzz('Light');
    goToSlide(current + 1);
  });

  enterBtn.addEventListener('click', function () {
    buzz('Medium')
      .then(markCompleted)
      .then(function () {
        // Kick FCM registration in onboarding context so the system permission
        // dialog appears with a clear cause / effect. The same dialog covers
        // both push and (now-removed) local notifications since they share
        // the POST_NOTIFICATIONS Android permission.
        if (typeof window.fcubaInitPush === 'function') {
          window.fcubaInitPush();
        }
        window.location.replace('index.html');
      });
  });

  skipBtn.addEventListener('click', function () {
    confirmSkip().then(function (ok) {
      if (!ok) return;
      markCompleted().then(function () {
        window.location.replace('index.html');
      });
    });
  });

  function confirmSkip() {
    if (Dialog && typeof Dialog.confirm === 'function') {
      return Dialog.confirm({
        title: 'Saltar la presentación',
        message: '¿Quieres saltar y entrar al foro directamente?',
        okButtonTitle: 'Saltar',
        cancelButtonTitle: 'Cancelar'
      }).then(function (res) {
        return !!(res && res.value);
      }).catch(function () {
        return window.confirm('¿Saltar la presentación?');
      });
    }
    return Promise.resolve(window.confirm('¿Saltar la presentación?'));
  }

  function markCompleted() {
    if (Preferences && typeof Preferences.set === 'function') {
      return Preferences.set({ key: 'onboarding_completed', value: 'true' })
        .catch(function () {});
    }
    return Promise.resolve();
  }

  updateUI();
})();
