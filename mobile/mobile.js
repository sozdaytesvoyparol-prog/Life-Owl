(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  /* масштаб: если браузер игнорирует viewport (широкий виртуальный экран) — подгоняем */
  var base = 1;
  try { var r = innerWidth / (screen.width || innerWidth); if (r > 1.3 && screen.width < 700) base = r; } catch (e) { /* ignore */ }
  window.__loBase = base;
  document.documentElement.style.fontSize = (16 * base) + 'px';
  function fire(action) { var b = document.createElement('button'); b.setAttribute('data-action', action); b.style.display = 'none'; document.body.appendChild(b); b.click(); b.remove(); }
  function go(view) { var n = document.querySelector('#nav .nav-i[data-view="' + view + '"]'); if (n) n.click(); document.body.classList.remove('m-detail'); sync(); }
  var ITEMS = [['today', '🏠', 'Ежедневник'], ['notes', '💬', 'Заметки'], ['projects', '📁', 'Проекты'], ['habits', '✅', 'Привычки'], ['kpd', '📈', 'КПД'], ['settings', '⚙️', 'Настройки'], ['styles', '🎨', 'Стили'], ['help', '📖', 'Инструкция'], ['prof', '👤', 'Профиль']];
  var fab = document.createElement('button'); fab.id = 'mfab'; fab.setAttribute('aria-label', 'Меню');
  fab.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="19" r="1.9"/></svg>';
  var side = document.createElement('div'); side.id = 'mside';
  side.innerHTML = '<div class="ms-panel"><div class="ms-h">Меню</div>' + ITEMS.map(function (x, i) { return (i === 4 ? '<div class="ms-sep"></div>' : '') + '<button class="ms-b" data-ms="' + x[0] + '"><i>' + x[1] + '</i><span>' + x[2] + '</span></button>'; }).join('') + '</div>';
  document.body.appendChild(fab); document.body.appendChild(side);
  function curView() { var o = document.querySelector('#nav .nav-i.on'); return o ? o.getAttribute('data-view') : 'today'; }
  function sync() {
    var v = curView();
    [].forEach.call(side.querySelectorAll('.ms-b'), function (b) { b.classList.toggle('on', b.getAttribute('data-ms') === v); });
    fab.style.display = document.getElementById('app').classList.contains('hidden') ? 'none' : 'flex';
    if (fab.style.display === 'none') side.classList.remove('open');
  }
  fab.addEventListener('click', function () { side.classList.toggle('open'); });
  side.addEventListener('click', function (e) {
    var b = e.target.closest('.ms-b'); side.classList.remove('open'); if (!b) return; var k = b.getAttribute('data-ms');
    if (k === 'styles') { go('settings'); setTimeout(function () { fire('styles-open'); }, 120); } else if (k === 'help') fire('help-toggle'); else if (k === 'prof') fire('prof-toggle'); else go(k);
  });
  /* проекты: список → экран проекта */
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-action="proj-select"]')) document.body.classList.add('m-detail'); if (e.target.closest && e.target.closest('.m-back')) { document.body.classList.remove('m-detail'); } }, true);
  var view = $('#view');
  new MutationObserver(function () {
    var right = document.querySelector('.proj-right');
    if (right) { var has = right.querySelector('.pdet'); if (!has) document.body.classList.remove('m-detail'); else if (!right.querySelector('.m-back')) { var b = document.createElement('button'); b.className = 'm-back'; b.textContent = '← Проекты'; right.insertBefore(b, right.firstChild); } }
    else document.body.classList.remove('m-detail');
    sync();
  }).observe(view, { childList: true, subtree: false });
  new MutationObserver(sync).observe($('#nav'), { childList: true, subtree: true, attributes: true });
  new MutationObserver(sync).observe($('#app'), { attributes: true, attributeFilter: ['class'] });
  sync();
})();
