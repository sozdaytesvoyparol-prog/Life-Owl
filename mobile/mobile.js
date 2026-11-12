(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  /* масштаб интерфейса: подгоняем «виртуальный ПК-экран» под ширину телефона */
  function scale() {
    var w = Math.max(innerWidth, innerHeight), b = Math.min(1, Math.max(.78, w / 1120));
    window.__loBase = b;
  }
  scale();
  /* подсказка «поверни телефон» (в apk экран заблокирован горизонтально) */
  var hint = document.createElement('div'); hint.id = 'rot-hint'; hint.className = 'on';
  hint.innerHTML = '<i>📱</i><b>Поверни телефон горизонтально</b><span>Life Owl работает в горизонтальном режиме</span>';
  document.body.appendChild(hint);
  /* анимация перехода при смене раздела */
  var last = '';
  function cur() { var o = document.querySelector('#nav .nav-i.on'); return o ? o.getAttribute('data-view') : ''; }
  var view = $('#view');
  new MutationObserver(function () {
    var c = cur(); if (c === last) return; last = c;
    view.classList.remove('in'); void view.offsetWidth; view.classList.add('in');
  }).observe(view, { childList: true });
  /* системная кнопка «Назад» (Capacitor) и жест назад */
  function back() {
    var ned = $('#ned'); if (ned) { ned.querySelector('[data-ned="x"]').click(); return true; }
    if ($('.composer3.full')) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); var b = $('[data-action="n3-full-off"]'); if (b) b.click(); return true; }
    if ($('.modal') || $('.help-pop.open') || $('.prof-pop.open') || $('.streak-pop.open')) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true; }
    var c = cur(); if (c && c !== 'today') { var n = document.querySelector('#nav .nav-i[data-view="today"]'); if (n) { n.click(); return true; } }
    return false;
  }
  try {
    var cap = window.Capacitor, App = cap && cap.Plugins && cap.Plugins.App;
    if (App && App.addListener) App.addListener('backButton', function () { if (!back() && App.exitApp) App.exitApp(); });
  } catch (e) { /* ignore */ }
  addEventListener('resize', function () { scale(); });
  /* блокируем жест «щипок» и двойной тап-зум вне карты проектов */
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
})();
