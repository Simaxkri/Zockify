/*
 * Zockify – Geräteerkennung
 * --------------------------
 * Erkennt, ob die Seite auf einem normalen Handy, einem (aufgeklappten)
 * Fold-Handy oder einem Tablet läuft.
 *
 * WICHTIG: Diese Datei verändert NICHTS am Layout. Sie stellt die
 * Information nur bereit, damit die Spiele sie später nutzen können.
 *
 * Verfügbar gemacht wird die Info über drei Wege:
 *   1. window.Zockify.device        -> 'handy' | 'fold' | 'tablet'
 *   2. <html data-device="...">      -> z.B. für späteres CSS
 *   3. Event 'devicechange'          -> wird bei Größenänderung ausgelöst
 */
(function () {
  'use strict';

  // Schwellen in CSS-Pixeln (kurze Bildschirmseite = Standard-Breakpoint)
  var TABLET_MIN_SHORT_SIDE = 600; // ab hier gilt es als Tablet
  var FOLD_MAX_RATIO = 1.5;        // fast quadratisch => Fold aufgeklappt

  function detect() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var shortSide = Math.min(w, h);
    var longSide = Math.max(w, h);
    var ratio = longSide / shortSide; // 1.0 = quadratisch, ~2.0 = längliches Handy
    var hasTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    var device;
    if (shortSide >= TABLET_MIN_SHORT_SIDE) {
      // Breite kurze Seite -> großes Display -> Tablet
      device = 'tablet';
    } else if (ratio <= FOLD_MAX_RATIO) {
      // Schmal, aber fast quadratisch -> aufgeklapptes Fold-Handy
      device = 'fold';
    } else {
      // Schmal und länglich -> normales Handy
      device = 'handy';
    }

    return {
      device: device,
      width: w,
      height: h,
      ratio: Math.round(ratio * 100) / 100,
      touch: hasTouch
    };
  }

  function apply() {
    var info = detect();

    // 1. Global verfügbar machen
    window.Zockify = window.Zockify || {};
    var changed = window.Zockify.device !== info.device;
    window.Zockify.device = info.device;
    window.Zockify.deviceInfo = info;

    // 2. Als data-Attribut am <html> (für späteres CSS, ändert noch nichts)
    document.documentElement.setAttribute('data-device', info.device);

    // 3. Event auslösen, wenn sich der Typ geändert hat
    if (changed) {
      window.dispatchEvent(new CustomEvent('devicechange', { detail: info }));
    }

    return info;
  }

  // Beim Laden einmal ausführen ...
  var initial = apply();
  // ... und bei Größen-/Orientierungsänderung neu bewerten.
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', apply);

  // Kleiner Hinweis in der Konsole zum Testen (verändert nichts am Spiel).
  console.info('[Zockify] Gerät erkannt:', initial.device, initial);
})();
