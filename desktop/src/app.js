(function () {
  'use strict';

  /* =====================================================
     Life Owl — вся логика приложения
     Мост к main-процессу: window.lifeOwlApi (preload.js)
     ===================================================== */

  if (!window.lifeOwlApi) {
    document.body.innerHTML = '<div style="padding:40px;color:#fff;font-family:sans-serif">Ошибка запуска: мост lifeOwlApi не найден (preload.js).</div>';
    return;
  }

  /* ---------- утилиты ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function ds(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() { return ds(new Date()); }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return ds(d); }
  function diffDays(a, b) { return Math.round((parse(a) - parse(b)) / 86400000); }
  function weekStart(s) { var d = parse(s); return addDays(s, -((d.getDay() + 6) % 7)); }
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  var DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  var DOW_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  function fmtLong(s) { var d = parse(s); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function fmtShort(s) { var d = parse(s); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + DOW_SHORT[d.getDay()]; }
  function fmtDM(s) { var d = parse(s); return pad(d.getDate()) + '.' + pad(d.getMonth() + 1); }
  function plural(n, f) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return f[2];
    if (b > 1 && b < 5) return f[1];
    if (b === 1) return f[0];
    return f[2];
  }
  function fmtPct(v) {
    if (v >= 10) return String(Math.round(v));
    if (v >= 1) return String(Math.round(v * 10) / 10).replace('.', ',');
    return (Math.round(v * 100) / 100).toFixed(2).replace('.', ',');
  }

  /* ---------- иконки (SVG) ---------- */
  var SVG = {
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    home: '<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    bars: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    pencil: '<path d="M4 20l4-1 10-10-3-3L5 16zM14 6l3 3"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    chevR: '<path d="M9 6l6 6-6 6"/>',
    chevL: '<path d="M15 6l-6 6 6 6"/>',
    chevD: '<path d="M6 9l6 6 6-6"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    dots: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    tick: '<path d="M6 12.5l4 4 8-9"/>'
  };
  function ic(name, cls) {
    return '<svg viewBox="0 0 24 24" class="svg ' + (cls || '') + '">' + SVG[name] + '</svg>';
  }

  var FINISH_MIN = 5;                                   // минимум заданий за день, чтобы можно было «Завершить день»
  var CAPS = { t: 5, m: 2, n: 5, p: 3, h: 5 };         // Сегодня / Мотивации / Разговоры / Проекты / Привычки
  var BG_MAX_W = 5120, BG_MAX_H = 2880, BG_JPEG_Q = 0.98;   // лимиты обоев (4K, качество jpeg)
  var BG_RAW_LIMIT = 8 * 1024 * 1024;                      // файлы меньше N байт хранятся как есть, без пережатия
  var TALK_UNIT = 10;                                       // минут общения с собой = 1 задание КПД
  var MOTIV_DAY_COOLDOWN = 1;                               // N дней одна и та же «мотивация дня»
  var SIZE_K = { small: 0.88, medium: 1, large: 1.15 };    // масштаб интерфейса
  var CAPS_DEF = { t: 5, m: 2, n: 5, p: 3, h: 5 };         // нагрузка по умолчанию
  var DAY_MAX = 20;                                     // 20 заданий в день = 100% КПД дня

  SVG.heart = '<path d="M12 20.5s-7.5-4.6-9.4-9.6A5.3 5.3 0 0 1 12 6.4a5.3 5.3 0 0 1 9.4 4.5c-1.9 5-9.4 9.6-9.4 9.6z"/>';
  SVG.pin = '<path d="M9 3.5h6l-.8 5.6 2.8 3.2v1.7H7v-1.7l2.8-3.2zM12 14.5V21"/>';
  SVG.maxi = '<rect x="5.5" y="5.5" width="13" height="13" rx="1"/>';
  SVG.restore = '<rect x="8.5" y="4.5" width="11" height="11" rx="1.5"/><path d="M4.5 9v9.5a1 1 0 0 0 1 1H15"/>';
  SVG.photo = '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4 4 3 3-2 4 3"/>';

  var FL_PATHS = {
    '1': ['M16 2c1 6 8 9 8 19a8 8 0 0 1-16 0c0-4 2-6 3-9 1 3 2 4 3 4 0-5-1-9 2-14z', 'M16 18c.5 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-2.2 1-3 1.7-4.2.5 1 1.1 1.5 1.6 1.5 0-2.2-.4-3.4.7-5.8z'],
    '2': ['M16 3C12 11 6 15 6 24a10 10 0 0 0 20 0c0-5-3-8-5-12-1 2-2 3-3 3 1-4 0-8-2-12z', 'M16 22c-3 2-4 4-4 6a4 4 0 0 0 8 0c0-2-1-4-4-6z'],
    '3': ['M16 1l3 9 6-5-2 11 6-2-5 12a9 9 0 0 1-16 0L3 14l6 2L7 5l6 5z', 'M16 20l3 4a4 4 0 1 1-6 0z']
  };
  function FLAME(cls) {
    var pp = FL_PATHS[(S && S.settings.flame) || '1'] || FL_PATHS['1'];
    return '<svg viewBox="0 0 32 40" class="flame ' + (cls || '') + '"><defs>' +
      '<linearGradient id="fl1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--fl-a,#ffd23f)"/><stop offset=".55" style="stop-color:var(--fl-b,#ff8a1f)"/><stop offset="1" style="stop-color:var(--fl-c,#ff4d2e)"/></linearGradient>' +
      '<linearGradient id="fl2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset="1" style="stop-color:var(--fl-a,#ffc233)"/></linearGradient></defs>' +
      '<path class="fl-out" d="' + pp[0] + '" fill="url(#fl1)"/><path class="fl-in" d="' + pp[1] + '" fill="url(#fl2)"/></svg>';
  }
  var FL_COLS = { sun: ['#ffd23f', '#ff8a1f', '#ff4d2e'], ice: ['#c8f0ff', '#4fb4ff', '#2f6bff'], vio: ['#e6d0ff', '#a77bff', '#6a3cff'], rose: ['#ffd0e6', '#ff6fb0', '#e0306f'], snow: ['#ffffff', '#dfe6ff', '#aab6ee'] };
  var DONE_COLS = { white: '#ffffff', gold: '#ffd23f', ice: '#6fd0ff', rose: '#ff7bb8', vio: '#b79bff' };

  /* ---------- цвета ---------- */
  function hex2rgb(h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var n = parseInt(h, 16);
    if (isNaN(n) || h.length !== 6) return [91, 108, 255];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgb2hex(r) {
    return '#' + r.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('');
  }
  function mixc(a, b, t) {
    var x = hex2rgb(a), y = hex2rgb(b);
    return rgb2hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
  }
  function hueShift(hex, deg) {
    var c = hex2rgb(hex), r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d) {
      s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0); else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h /= 6;
    }
    h = (h + deg / 360 + 1) % 1;
    function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < .5) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }
    var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return rgb2hex([f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255]);
  }

  function rgba(h, a) { return 'rgba(' + hex2rgb(h).join(',') + ',' + a + ')'; }

  /* нагрузка: лимит заданий в день по категориям (1–40), сумма = 100% КПД дня */
  function applyCaps() {
    var c = (S && S.settings.caps) || {}, sum = 0;
    ['t', 'm', 'n', 'p', 'h'].forEach(function (k) {
      var v = Math.round(+c[k]); if (isNaN(v)) v = CAPS_DEF[k];
      CAPS[k] = Math.max(1, Math.min(40, v)); sum += CAPS[k];
    });
    DAY_MAX = sum;
  }

  var ICONS = ['💪', '📖', '💧', '💻', '❤️', '🏃', '🧘', '🎯', '📚', '✍️', '🎧', '🎮', '🍎', '😴', '🧠', '🎨',
    '🎵', '🧹', '💼', '📞', '🛒', '🚿', '🦷', '📝', '🔬', '🌱', '⚡', '🔥', '⭐', '🚀', '🏋️', '🧩',
    '📅', '☀️', '🌙', '🎓', '🛠️', '📈', '🧗', '🍳', '🚭', '🍬', '📵', '🥤', '🏆', '💡', '🧊', '🎸'];

  /* ---------- состояние ---------- */
  var S = null;           // данные пользователя
  var USER = '';
  var saveTimer = null;
  var UI = {
    view: 'today', popOpen: false, fresh: false,
    projFilter: 'all', projId: null,
    habFilter: 'all', habDate: today(),
    kpdRange: 30, kpdCats: { t: true, m: true, n: true, p: true, h: true },
    motOpen: {}, taskOpen: {}, ta: null,
    todayDate: null, dpY: 0, dpM: 0,
    noteDate: today(), noteMonth: null, noteEditId: null,
    calY: 0, calM: 0
  };

  function defaultState() {
    var t = today();
    return {
      rev: 0, created: t,
      settings: { skin: 'violet', size: 'medium', notifications: false, gfx: '2d', tsh: 'off', qfont: 'normal', bgPreset: (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light-matte' : 'silk'), fx: 'none', lang: 'ru', flame: '1', flameCol: 'sun', flameFx: 'plain', doneCol: 'white', greet: 'auto', pad: 'glass', nstyle: 'plain', nfont: 'normal', tview: 'both', model: 'orb', layout: { custom: false, items: {}, hidden: [], models: [] }, blur: 'off', caps: Object.assign({}, CAPS_DEF), look: Object.assign({}, LOOK_DEF) },
      profile: { avatar: '' },
      tasks: [], projects: [], motivations: [], notes: [],
      habits: [{ id: 'sys-enter', name: 'Зайти в приложение', icon: '📱', type: 'good', goal: 'Каждый день', created: t, log: {}, sys: true }],
      completed: {}, frozen: {}, talk: {}, models: [], pinned: []
    };
  }
  function normalize(st) {
    var d = defaultState();
    if (!st || typeof st !== 'object') return d;
    st.rev = st.rev || 0;
    st.created = st.created || d.created;
    st.settings = Object.assign(d.settings, st.settings || {});
    if (!st.settings.look || typeof st.settings.look !== 'object') st.settings.look = {};
    st.settings.look = Object.assign({}, LOOK_DEF, st.settings.look);
    st.settings.caps = Object.assign({}, CAPS_DEF, st.settings.caps || {});
    st.profile = Object.assign(d.profile, st.profile || {});
    ['tasks', 'projects', 'motivations', 'notes', 'habits'].forEach(function (k) { if (!Array.isArray(st[k])) st[k] = []; });
    st.completed = st.completed || {};
    st.frozen = st.frozen || {};
    st.talk = st.talk || {};
    if (!Array.isArray(st.models)) st.models = [];
    st.settings.model = 'none';
    if (!Array.isArray(st.pinned)) st.pinned = [];
    st.tasks.forEach(function (k) { if (!Array.isArray(k.subs)) k.subs = []; });
    (st.projects || []).forEach(function (p) { (function fix(list) { (list || []).forEach(function (n) { if (n.subs && n.subs.length) { fix(n.subs); n.done = n.subs.every(function (q) { return q.done; }); } }); })(p.actions); });
    st.projects.forEach(function (p) { p.actions.forEach(function (x) { if (!Array.isArray(x.subs)) x.subs = []; }); });
    if (st.motivations.length) {            // мотивации переехали в «Заметки»
      st.motivations.forEach(function (m) { st.notes.push({ id: m.id, date: m.cdate || today(), cdate: m.cdate || today(), at: m.at || Date.now(), time: '', text: m.text, author: m.author || '', bg: m.bg || 'none', pinned: !!m.pinned, liked: !!m.liked, likedDate: m.likedDate, kind: 'quote' }); });
      st.motivations = [];
    }
    if (!st.settings.layout || !st.settings.layout.items) st.settings.layout = { custom: false, items: {}, hidden: [] };
    if (!Array.isArray(st.settings.layout.hidden)) st.settings.layout.hidden = [];
    if (!Array.isArray(st.settings.layout.models)) st.settings.layout.models = [];
    st.projects.forEach(function (p) { if (!Array.isArray(p.actions)) p.actions = []; });
    st.habits.forEach(function (h) { if (!h.log) h.log = {}; });
    (function () { var first = null; st.habits = st.habits.filter(function (h) { if (!h.sys) return true; if (!first) { first = h; h.id = 'sys-enter'; return true; } first.log = Object.assign({}, h.log, first.log); if (h.created && h.created < first.created) first.created = h.created; return false; }); })();
    return st;
  }


  /* ---------- облако: аккаунт и синхронизация ПК ⇄ телефон ---------- */
  var CLOUD = { url: '', token: '', user: '', ver: 0, pw: null, busy: false, pushedRev: -1, timer: null, poll: null, status: 'off', note: '' };
  function cloudLoad() {
    var o = {}; try { o = JSON.parse(localStorage.getItem('lifeowl.cloud') || '{}'); } catch (e) { o = {}; }
    CLOUD.url = String(o.url != null && o.url !== '' ? o.url : (window.LIFEOWL_SERVER || '')).trim().replace(/\/+$/, '');
    CLOUD.token = o.token || ''; CLOUD.user = o.user || ''; CLOUD.ver = o.ver || 0;
  }
  function cloudStore() { try { localStorage.setItem('lifeowl.cloud', JSON.stringify({ url: CLOUD.url, token: CLOUD.token, user: CLOUD.user, ver: CLOUD.ver })); } catch (e) { /* ignore */ } }
  function cloudOn() { return !!CLOUD.url; }
  function cloudSetStatus(s, note) { CLOUD.status = s; CLOUD.note = note || ''; var l = $('#cloud-link'); if (l) l.textContent = cloudLabel(); var c = $('#cloud-state'); if (c) c.textContent = cloudLabel(true); }
  function cloudLabel(long) {
    if (!cloudOn()) return long ? 'Выключена: работает только на этом устройстве' : '☁ Синхронизация: выключена';
    var t = { ok: 'синхронизировано', sync: 'синхронизация…', off: 'ожидание', offline: 'нет связи с сервером', err: 'ошибка' }[CLOUD.status] || '';
    return (long ? '' : '☁ ') + t + (CLOUD.note ? ' · ' + CLOUD.note : '') + (long ? ' · ' + CLOUD.url.replace(/^https?:\/\//, '') : '');
  }
  function cloudApi(path, method, body, noAuth) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
    var h = { 'Content-Type': 'application/json' }; if (CLOUD.token && !noAuth) h.Authorization = 'Bearer ' + CLOUD.token;
    return fetch(CLOUD.url + path, { method: method || 'GET', headers: h, body: body ? JSON.stringify(body) : undefined, signal: ctl ? ctl.signal : undefined })
      .then(function (r) { clearTimeout(to); return r.json().then(function (j) { j.http = r.status; return j; }, function () { return { ok: false, http: r.status, error: 'Некорректный ответ сервера' }; }); })
      .catch(function () { clearTimeout(to); return { ok: false, offline: true, error: 'Нет связи с сервером' }; });
  }
  function cloudAuth(mode, u, p) {
    return cloudApi('/api/' + mode, 'POST', { username: u, password: p }, true).then(function (r) {
      if (r.ok) { CLOUD.token = r.token; CLOUD.user = r.username; CLOUD.ver = r.ver || 0; cloudStore(); }
      return r;
    });
  }
  function cloudBusyUi() { return !!DR || !!$('#modal.open') || (document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)); }
  function cloudMerge(L, R) {
    var out = JSON.parse(JSON.stringify(R));
    ['tasks', 'projects', 'notes', 'habits', 'models', 'pinned'].forEach(function (k) {
      var res = (out[k] || []).slice();
      (L[k] || []).forEach(function (x) {
        var i = -1; for (var j = 0; j < res.length; j++) if (res[j].id === x.id) { i = j; break; }
        if (i < 0) res.push(x);
        else if (k === 'habits') { var m = JSON.parse(JSON.stringify(x)); m.log = Object.assign({}, res[i].log, x.log); m.late = Object.assign({}, res[i].late, x.late); res[i] = m; }
        else res[i] = x;
      });
      out[k] = res;
    });
    ['completed', 'frozen'].forEach(function (k) { out[k] = Object.assign({}, R[k], L[k]); });
    out.talk = Object.assign({}, R.talk); Object.keys(L.talk || {}).forEach(function (d) { out.talk[d] = Math.max(out.talk[d] || 0, L.talk[d]); });
    out.settings = L.settings; out.profile = L.profile || R.profile; out.draft = L.draft; out.created = (L.created && R.created) ? (L.created < R.created ? L.created : R.created) : (L.created || R.created);
    return out;
  }
  function cloudApply(st) {
    var keepRev = S.rev; S = normalize(st); S.rev = keepRev + 1; CLOUD.pushedRev = S.rev;
    cache = { rev: -1, data: null }; ucache = { rev: -1, ix: null };
    window.lifeOwlApi.saveState(S);
    applySettings(); applyFreezes(); ensureSysHabit(); ensurePinned(); render();
  }
  function cloudRelogin() {
    if (!CLOUD.pw) { CLOUD.token = ''; cloudStore(); cloudSetStatus('err', 'нужно войти заново'); return Promise.resolve(false); }
    return cloudAuth('login', USER, CLOUD.pw).then(function (r) {
      if (r.ok) return true;
      if (r.code === 'no_user') return cloudAuth('register', USER, CLOUD.pw).then(function (r2) { return !!r2.ok; });     // сервер потерял аккаунт — создаём заново
      return false;
    });
  }
  function cloudPush(force) {
    if (!cloudOn() || !CLOUD.token || !S || CLOUD.busy) return Promise.resolve();
    CLOUD.busy = true; var rev = S.rev; cloudSetStatus('sync');
    return cloudApi('/api/state', 'PUT', { state: S, base: CLOUD.ver, force: !!force }).then(function (r) {
      CLOUD.busy = false;
      if (r.ok) { CLOUD.ver = r.ver; CLOUD.pushedRev = rev; cloudStore(); cloudSetStatus('ok', ''); if (S.rev !== rev) cloudSchedule(); return; }
      if (r.offline) { cloudSetStatus('offline'); return; }
      if (r.code === 'conflict') {
        CLOUD.ver = r.ver; var merged = r.state ? cloudMerge(S, r.state) : S;
        if (cloudBusyUi()) { cloudSetStatus('sync', 'ждём завершения ввода'); setTimeout(function () { cloudPush(); }, 4000); return; }
        cloudApply(merged); return cloudPush();
      }
      if (r.code === 'auth') return cloudRelogin().then(function (ok) { if (ok) return cloudPush(); });
      cloudSetStatus('err', r.error || '');
    });
  }
  function cloudPull() {
    if (!cloudOn() || !CLOUD.token || !S || CLOUD.busy) return Promise.resolve();
    CLOUD.busy = true;
    return cloudApi('/api/state', 'GET').then(function (r) {
      CLOUD.busy = false;
      if (r.offline) { cloudSetStatus('offline'); return; }
      if (r.code === 'auth') return cloudRelogin().then(function (ok) { if (ok) return cloudPull(); });
      if (!r.ok) { cloudSetStatus('err', r.error || ''); return; }
      if (!r.state) { return cloudPush(true); }
      if (r.ver === CLOUD.ver) { cloudSetStatus('ok'); if (S.rev !== CLOUD.pushedRev) return cloudPush(); return; }
      if (cloudBusyUi()) { cloudSetStatus('sync', 'ждём завершения ввода'); return; }
      var dirtyLocal = S.rev !== CLOUD.pushedRev;
      CLOUD.ver = r.ver; cloudStore();
      cloudApply(dirtyLocal ? cloudMerge(S, r.state) : r.state); cloudSetStatus('ok');
      if (dirtyLocal) return cloudPush();
    });
  }
  function cloudSchedule() { if (!cloudOn() || !CLOUD.token) return; clearTimeout(CLOUD.timer); CLOUD.timer = setTimeout(function () { cloudPush(); }, 3500); }
  function cloudStart() {
    clearInterval(CLOUD.poll); clearTimeout(CLOUD.timer);
    if (!cloudOn()) { cloudSetStatus('off'); return; }
    var go = CLOUD.token ? Promise.resolve(true) : (CLOUD.pw ? cloudAuth('login', USER, CLOUD.pw).then(function (r) { if (r.ok) return true; if (r.code === 'no_user') return cloudAuth('register', USER, CLOUD.pw).then(function (r2) { return !!r2.ok; }); return false; }) : Promise.resolve(false));
    go.then(function (ok) { if (!ok) { cloudSetStatus(CLOUD.pw ? 'offline' : 'err', CLOUD.pw ? '' : 'войди заново, чтобы включить синхронизацию'); return; } return cloudPull(); });
    CLOUD.poll = setInterval(function () { if (!document.hidden) cloudPull(); }, 30000);
  }
  window.addEventListener('focus', function () { if (S && cloudOn()) cloudPull(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && S && cloudOn()) cloudPull(); });

  function save() {
    S.rev++; cloudSchedule();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 200);
  }
  function flush() {
    clearTimeout(saveTimer);
    if (!S) return Promise.resolve();
    return window.lifeOwlApi.saveState(S);
  }

  /* ---------- расчёты ---------- */
  var cache = { rev: -1, data: null };
  var ucache = { rev: -1, ix: null };
  var NOTE_GAP = 3, QUICK_SEC = 30;                         // пауза между засчитанными заметками (мин) · «мгновенное» закрытие (сек)
  function noteValid(n) { var t = (n.text || '').trim(), w = t.split(/\s+/).filter(Boolean).length; return !!n.draw || (t.length >= 20 && w >= 3); }

  /* Индекс «единиц КПД» по датам: сколько чего сделано в каждый день */
  function unitIndex() {
    if (ucache.rev === S.rev && ucache.ix) return ucache.ix;
    var ix = { t: {}, p: {}, n: {}, m: {}, h: {} };
    function inc(o, d) { if (d) o[d] = (o[d] || 0) + 1; }
    var seenT = {};
    S.tasks.forEach(function (k) {
      if (!k.done || !k.date || k.noKpd) return;
      var key = k.date + '|' + (k.text || '').trim().toLowerCase(); if (seenT[key]) return; seenT[key] = 1;     // одинаковые действия за день — один раз
      ix.t[k.date] = (ix.t[k.date] || 0) + (k.subs && k.subs.length ? 3 : 1);
    });
    S.projects.forEach(function (p) { p.actions.forEach(function (a) { if (a.done && !a.noKpd) inc(ix.p, a.doneDate); }); });
    var lastN = {}, seenN = {}, okN = {};
    S.notes.slice().sort(function (x, y) { return (x.at || 0) - (y.at || 0); }).forEach(function (n) {
      var d = n.cdate || n.date, key = d + '|' + (n.text || '').trim().toLowerCase();
      if (!noteValid(n)) { okN[n.id] = false; return; }
      if (n.text && seenN[key]) { okN[n.id] = false; return; }
      if (lastN[d] && n.at && n.at - lastN[d] < NOTE_GAP * 60000) { okN[n.id] = false; return; }
      seenN[key] = 1; lastN[d] = n.at || 0; okN[n.id] = true; inc(ix.n, d);
    });
    Object.keys(S.talk || {}).forEach(function (d) { var u = Math.floor(S.talk[d] / (TALK_UNIT * 60)); if (u > 0) ix.n[d] = (ix.n[d] || 0) + u; });
    S.notes.forEach(function (n) { if (okN[n.id] && (n.liked || n.pinned)) inc(ix.m, n.markDate || n.likedDate || n.cdate || n.date); });
    S.habits.forEach(function (h) { Object.keys(h.log).forEach(function (d) { if (h.log[d] && !(h.late && h.late[d])) inc(ix.h, d); }); });
    ucache = { rev: S.rev, ix: ix };
    return ix;
  }

  /* КПД дня: максимум 20 заданий = 100% (3 проекты + 5 сегодня + 5 разговоры + 2 мотивации + 5 привычки) */
  function dayStats(d) {
    var ix = unitIndex();
    var u = {
      t: Math.min(ix.t[d] || 0, CAPS.t), p: Math.min(ix.p[d] || 0, CAPS.p), n: Math.min(ix.n[d] || 0, CAPS.n),
      m: Math.min(ix.m[d] || 0, CAPS.m), h: Math.min(ix.h[d] || 0, CAPS.h)
    };
    u.total = u.t + u.p + u.n + u.m + u.h;
    u.frac = { t: u.t / CAPS.t, m: u.m / CAPS.m, n: u.n / CAPS.n, p: u.p / CAPS.p, h: u.h / CAPS.h };
    u.pct = (u.frac.t + u.frac.m + u.frac.n + u.frac.p + u.frac.h) / 5 * 100;
    return u;
  }

  /* Все дни от начала + префиксные суммы по категориям (для КПД года) */
  function daily() {
    if (cache.rev === S.rev && cache.data) return cache.data;
    var t = today(), start = S.created > t ? t : S.created;
    var n = diffDays(t, start), days = [], pre = { t: [0], p: [0], n: [0], m: [0], h: [0] };
    for (var i = 0; i <= n; i++) {
      var d = addDays(start, i), s = dayStats(d);
      days.push({ date: d, t: s.t, p: s.p, n: s.n, m: s.m, h: s.h, total: s.total, pct: s.pct });
      ['t', 'p', 'n', 'm', 'h'].forEach(function (k) { pre[k].push(pre[k][i] + s.frac[k]); });
    }
    cache = { rev: S.rev, data: { start: start, days: days, pre: pre } };
    return cache.data;
  }
  /* вклад категории в КПД года на день с индексом i: сумма за последние 365 дней / (20 × 365) */
  function contrib(dd, k, i, N) {
    N = N || 365;
    if (i < 0) return 0;
    i = Math.min(i, dd.days.length - 1);
    var lo = Math.max(0, i - N + 1);
    return (dd.pre[k][i + 1] - dd.pre[k][lo]) / (N * 5) * 100;      // 5 категорий = 5 очков; период = среднее за N дней
  }
  function yearKpd() {
    var dd = daily(), last = dd.days.length - 1, v = 0;
    ['t', 'm', 'n', 'p', 'h'].forEach(function (k) { v += contrib(dd, k, last); });
    return Math.min(100, v);
  }

  function totals() {
    var tasksDone = S.tasks.filter(function (k) { return k.done; }).length;
    var actionsDone = 0, actionsAll = 0;
    S.projects.forEach(function (p) {
      p.actions.forEach(function (a) { actionsAll++; if (a.done) actionsDone++; });
    });
    var habitsDone = 0;
    S.habits.forEach(function (h) { habitsDone += Object.keys(h.log).filter(function (k) { return h.log[k]; }).length; });
    return {
      tasksDone: tasksDone, tasksAll: S.tasks.length, actionsDone: actionsDone, actionsAll: actionsAll, habitsDone: habitsDone,
      xp: tasksDone * 10 + actionsDone * 20 + habitsDone * 5,
      count: tasksDone + actionsDone + habitsDone + S.notes.length
    };
  }

  function xpToday() {
    var t = today(), x = 0;
    S.tasks.forEach(function (k) { if (k.done && k.date === t) x += 10; });
    S.projects.forEach(function (p) { p.actions.forEach(function (a) { if (a.done && a.doneDate === t) x += 20; }); });
    S.habits.forEach(function (h) { if (h.log[t]) x += 5; });
    return x;
  }
  var RANKS = [
    { name: 'Новичок', xp: 0 }, { name: 'Любитель', xp: 500 }, { name: 'Почти задрот', xp: 1500 },
    { name: 'Постоянец', xp: 3500 }, { name: 'Легенда', xp: 7500 }
  ];
  function rankInfo(xp) {
    var i = 0;
    for (var k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].xp) i = k;
    var cur = RANKS[i], next = RANKS[i + 1] || null;
    var prog = next ? (xp - cur.xp) / (next.xp - cur.xp) : 1;
    return { cur: cur, next: next, prog: prog };
  }

  function earnedFreezes(c) { return c < 10 ? 0 : 1 + Math.floor((c - 10) / 15); }
  function streakInfo(from) {
    var t = today();
    var d = from || (S.completed[t] ? t : addDays(t, -1));
    var c = 0, used = 0, guard = 0;
    while ((S.completed[d] || S.frozen[d]) && guard++ < 4000) {
      if (S.completed[d]) c++; else used++;
      d = addDays(d, -1);
    }
    var earned = earnedFreezes(c);
    return { streak: c, earned: earned, used: used, avail: Math.max(0, earned - used) };
  }
  function applyFreezes() {
    var t = today();
    var keys = Object.keys(S.completed).concat(Object.keys(S.frozen)).filter(function (k) { return k < t; }).sort();
    if (!keys.length) return;
    var last = keys[keys.length - 1];
    var gap = diffDays(t, last) - 1;
    if (gap < 1) return;
    var si = streakInfo(last);
    if (si.streak > 0 && si.avail >= gap) {
      for (var i = 1; i <= gap; i++) S.frozen[addDays(last, i)] = true;
      save();
    }
  }
  function ensurePinned() {
    var t = today();
    S.pinned.forEach(function (p) {
      if (S.tasks.some(function (k) { return k.date === t && k.tpl === p.id; })) return;
      S.tasks.push({ id: uid(), text: p.text, icon: p.icon, done: false, date: t, tpl: p.id, ind: !!p.ind, subs: (p.subs || []).map(function (s) { return { id: uid(), text: s, done: false }; }) });
    });
  }
  function ensureSysHabit() {
    var t = today(), ch = false;
    S.habits.forEach(function (h) { if (h.sys && !h.log[t]) { h.log[t] = true; ch = true; } });
    if (ch) save();
  }

  function projPct(p) {
    var tot = p.actions.length;
    if (!tot) return 0;
    return Math.round(p.actions.filter(function (a) { return a.done; }).length / tot * 100);
  }
  function habitWeek(h) {
    var t = today(), ws = weekStart(t), done = 0, el = 0;
    for (var i = 0; i < 7; i++) {
      var d = addDays(ws, i);
      if (d > t) break;
      el++; if (h.log[d]) done++;
    }
    return { done: done, el: el || 1 };
  }

  /* ---------- графики ---------- */
  var chartReg = [];
  function niceMax(max) {
    if (max <= 0) return 1;
    var c = [0.5, 1, 2, 5, 10, 20, 50, 100];
    for (var i = 0; i < c.length; i++) if (c[i] >= max * 1.15) return c[i];
    return 100;
  }
  function rnd(v) { return Math.round(v * 10) / 10; }
  function smooth(P, lo, hi) {
    function cl(v) { return Math.max(lo, Math.min(hi, v)); }
    if (P.length === 1) return 'M' + P[0].x + ',' + P[0].y + ' L' + P[0].x + ',' + P[0].y;
    var d = 'M' + rnd(P[0].x) + ',' + rnd(P[0].y);
    for (var i = 0; i < P.length - 1; i++) {
      var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      d += ' C' + rnd(p1.x + (p2.x - p0.x) / 6) + ',' + rnd(cl(p1.y + (p2.y - p0.y) / 6)) + ' ' +
        rnd(p2.x - (p3.x - p1.x) / 6) + ',' + rnd(cl(p2.y - (p3.y - p1.y) / 6)) + ' ' + rnd(p2.x) + ',' + rnd(p2.y);
    }
    return d;
  }
  /* ширина viewBox компенсирует масштаб интерфейса: UI мельче → поле шире, высота в CSS-px прежняя → график компактный */
  function chartW(w) { var z = SIZE_K[(S && S.settings.size) || 'medium'] || 1; return Math.round(w / z); }
  function chartGeom(o) {
    var W = o.abs ? o.W : chartW(o.W || 640), H = o.H || 230, pl = 46, pr = 22, pt = 26, pb = 30;
    var iw = W - pl - pr, ih = H - pt - pb, n = o.pts.length;
    var P = o.pts.map(function (v, i) {
      return { x: rnd(pl + (n <= 1 ? iw / 2 : iw * i / (n - 1))), y: rnd(pt + ih * (1 - Math.min(v, o.ymax) / o.ymax)) };
    });
    var line = smooth(P, pt, pt + ih);
    var area = line + ' L' + P[P.length - 1].x + ',' + (pt + ih) + ' L' + P[0].x + ',' + (pt + ih) + ' Z';
    var ticks = [0, 0.25, 0.5, 0.75, 1].map(function (f) {
      return { y: rnd(pt + ih * (1 - f)), label: fmtPct(o.ymax * f) + '%' };
    });
    var last = P[P.length - 1];
    var tagX = Math.max(pl + 30, Math.min(W - pr - 30, last.x));
    return { W: W, H: H, pl: pl, pr: pr, pt: pt, ih: ih, P: P, line: line, area: area, ticks: ticks, tagX: tagX, tagY: last.y, tag: fmtPct(o.pts[o.pts.length - 1]) + '%' };
  }
  function dpath(d) { return "path('" + d + "')"; }
  function chartSvg(o) {
    var g = chartGeom(o), id = o.id;
    chartReg.push({ id: id, labels: o.labels, vals: o.pts, g: g, o: o });
    var h = '<svg class="chart' + (UI.fresh ? ' fresh' : '') + '" id="' + id + '" viewBox="0 0 ' + g.W + ' ' + g.H + '"><defs>' +
      '<linearGradient id="' + id + '-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7cff" stop-opacity=".42"/><stop offset="1" stop-color="#6b7cff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + id + '-s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b8cff"/><stop offset="1" stop-color="#a98bff"/></linearGradient>' +
      '</defs>';
    g.ticks.forEach(function (t, i) {
      h += '<line class="c-grid" x1="' + g.pl + '" x2="' + (g.W - g.pr) + '" y1="' + t.y + '" y2="' + t.y + '"/>' +
        '<text class="c-tick" data-t="' + i + '" x="' + (g.pl - 8) + '" y="' + (t.y + 4) + '" text-anchor="end">' + t.label + '</text>';
    });
    h += '<path class="c-area" d="' + g.area + '" fill="url(#' + id + '-g)"/>' +
      '<path class="c-glow" pathLength="1" d="' + g.line + '" stroke="url(#' + id + '-s)"/>' +
      '<path class="c-line" pathLength="1" d="' + g.line + '" stroke="url(#' + id + '-s)"/>';
    var lp = g.P[g.P.length - 1], n = g.P.length;
    h += '<circle class="c-pulse" cx="' + lp.x + '" cy="' + lp.y + '" r="5"/><g class="c-dots">' + g.P.map(function (p, i) {
      var last = i === n - 1;
      if (n > 32 && !last) return '';
      return '<circle class="c-dot' + (last ? ' last' : '') + '" data-i="' + i + '" style="--i:' + i + '" cx="' + p.x + '" cy="' + p.y + '" r="' + (last ? 5 : 3.5) + '"/>';
    }).join('') + '</g>';
    var step = Math.max(1, Math.ceil(n / 7));
    o.labels.forEach(function (l, i) {
      if (i % step === 0 || i === n - 1) h += '<text class="c-x" x="' + g.P[i].x + '" y="' + (g.H - 8) + '" text-anchor="middle">' + esc(l) + '</text>';
    });
    h += '<g class="c-hov"><line class="c-hl" x1="0" x2="0" y1="' + g.pt + '" y2="' + (g.pt + g.ih) + '"/><circle class="c-hd" cx="0" cy="0" r="5.5"/>' +
      '<g class="c-ht"><rect x="-44" y="-52" width="88" height="40" rx="10"/><text class="t1" x="0" y="-36" text-anchor="middle"></text><text class="t2" x="0" y="-20" text-anchor="middle"></text></g></g>';
    h += '<g class="c-tag" style="transform:translate(' + g.tagX + 'px,' + g.tagY + 'px)"><rect x="-30" y="-36" width="60" height="22" rx="11"/><text x="0" y="-21" text-anchor="middle">' + g.tag + '</text></g></svg>';
    return h;
  }
  function chartPatch(o) {
    var svg = document.getElementById(o.id);
    if (!svg) return;
    var reg0 = chartReg.filter(function (r) { return r.id === o.id; })[0];
    var g = chartGeom(reg0 ? { pts: o.pts, ymax: o.ymax, W: reg0.g.W, H: reg0.g.H, abs: true } : o);
    chartReg.forEach(function (r) { if (r.id === o.id) { r.g = g; r.vals = o.pts; r.o.pts = o.pts; r.o.ymax = o.ymax; } });
    $$('.c-line, .c-glow', svg).forEach(function (p) { p.style.d = dpath(g.line); });
    $('.c-area', svg).style.d = dpath(g.area);
    $$('.c-dot', svg).forEach(function (c) {
      var p = g.P[+c.getAttribute('data-i')];
      if (p) { c.style.cx = p.x + 'px'; c.style.cy = p.y + 'px'; }
    });
    var lp = g.P[g.P.length - 1], pu = $('.c-pulse', svg);
    pu.style.cx = lp.x + 'px'; pu.style.cy = lp.y + 'px';
    $$('.c-tick', svg).forEach(function (t) { t.textContent = g.ticks[+t.getAttribute('data-t')].label; });
    var tag = $('.c-tag', svg);
    tag.style.transform = 'translate(' + g.tagX + 'px,' + g.tagY + 'px)';
    $('text', tag).textContent = g.tag;
  }
  /* подгоняет viewBox каждого графика под реальную ширину контейнера: подписи всегда нормального размера, высота постоянная */
  function fitCharts() {
    var olds = chartReg.slice(); chartReg = [];
    olds.forEach(function (r) {
      var svg = document.getElementById(r.id);
      if (!svg) return;
      var w = Math.round(svg.getBoundingClientRect().width);
      if (w > 120 && Math.abs(w - r.g.W) > 3) {
        var tmp = document.createElement('div');
        tmp.innerHTML = chartSvg(Object.assign({}, r.o, { W: w, abs: true }));
        svg.parentNode.replaceChild(tmp.firstChild, svg);
      } else chartReg.push(r);
    });
  }
  function attachHover(reg) {
    var svg = document.getElementById(reg.id);
    if (!svg) return;
    if (svg._hov) return;
    svg._hov = true;
    var hov = $('.c-hov', svg);
    svg.addEventListener('mousemove', function (ev) {
      var g = reg.g, r = svg.getBoundingClientRect();
      if (!r.width) return;
      var x = (ev.clientX - r.left) / r.width * g.W, best = 0, bd = 1e9;
      for (var i = 0; i < g.P.length; i++) { var d = Math.abs(g.P[i].x - x); if (d < bd) { bd = d; best = i; } }
      var p = g.P[best], dx = 0;
      if (p.x - 44 < 4) dx = 4 - (p.x - 44);
      if (p.x + 44 > g.W - 4) dx = (g.W - 4) - (p.x + 44);
      hov.style.transform = 'translate(' + p.x + 'px,0px)';
      $('.c-hd', hov).setAttribute('cy', p.y);
      $('.c-ht', hov).setAttribute('transform', 'translate(' + dx + ',' + p.y + ')');
      $('.t1', hov).textContent = reg.labels[best];
      $('.t2', hov).textContent = fmtPct(reg.vals[best]) + '%';
      hov.classList.add('on');
    });
    svg.addEventListener('mouseleave', function () { hov.classList.remove('on'); });
  }
    function ringSvg(pct, size) {
    var r = 46, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return '<svg class="ring" viewBox="0 0 120 120" style="width:' + (size || 110) + 'px;height:' + (size || 110) + 'px">' +
      '<defs><linearGradient id="rg' + Math.round(pct) + (size || 0) + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b8cff"/><stop offset="1" stop-color="#9a6cff"/></linearGradient></defs>' +
      '<circle cx="60" cy="60" r="' + r + '" class="ring-bg"/>' +
      '<circle cx="60" cy="60" r="' + r + '" class="ring-fg" stroke="url(#rg' + Math.round(pct) + (size || 0) + ')" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 60 60)"/>' +
      '<text x="60" y="67" text-anchor="middle" class="ring-t">' + Math.round(pct) + '%</text></svg>';
  }

  /* ---------- модалки ---------- */
  var modalCfg = null;
  function openModal(html, wide) {
    var m = $('#modal');
    m.innerHTML = '<div class="modal-bg" data-action="modal-close"></div><div class="modal-card glass ' + (wide ? 'wide' : '') + '">' + html + '</div>';
    m.classList.add('open');
  }
  function closeModal() {
    var m = $('#modal');
    m.classList.remove('open');
    modalCfg = null; UI.stylesOpen = false; UI.helpOpen = false;
    setTimeout(function () { if (!m.classList.contains('open')) m.innerHTML = ''; }, 320);
  }
  function toast(msg, ok) {
    var t = $('#toast');
    t.innerHTML = (ok ? '<span class="t-ico">' + ic('tick') + '</span>' : '') + '<span>' + esc(msg) + '</span>';
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  /* «Задание выполнено! +5% к КПД» — одна единица = 5% КПД дня (20 единиц = 100%) */
  function gainToast(title, units) {
    var pct = units * 100 / DAY_MAX;   // приблизительно: 1 очко категории
    toast(units > 0 ? title + ' +' + fmtPct(pct) + '% к КПД' : title + ' Дневной лимит этой категории уже набран', true);
  }
  function confirmBox(text, onYes, yesLabel) {
    openModal('<h3>Подтверди действие</h3><p class="muted mb">' + esc(text) + '</p>' +
      '<div class="modal-actions"><button class="btn-soft" data-action="modal-close">Отмена</button>' +
      '<button class="btn-danger" id="confirm-yes">' + esc(yesLabel || 'Удалить') + '</button></div>');
    $('#confirm-yes').addEventListener('click', function () { closeModal(); onYes(); });
  }
  function avatarOrIcon(avatar, icon, cls) {
    if (avatar) return '<span class="ibox ' + (cls || '') + '"><img src="' + avatar + '" alt=""></span>';
    return '<span class="ibox ' + (cls || '') + '"><span class="emo">' + esc(icon || '⭐') + '</span></span>';
  }

  /* универсальная форма: fields = [{key,label,type:text|textarea|select|icon|avatar,options,required,max}] */
  function formModal(cfg) {
    var vals = Object.assign({}, cfg.values || {});
    var h = '<h3>' + esc(cfg.title) + '</h3><form id="mform" autocomplete="off">';
    cfg.fields.forEach(function (f) {
      h += '<div class="fld"><span>' + esc(f.label) + '</span>';
      if (f.type === 'text') {
        h += '<input name="' + f.key + '" maxlength="' + (f.max || 120) + '" value="' + esc(vals[f.key] || '') + '">';
      } else if (f.type === 'textarea') {
        h += '<textarea name="' + f.key + '" rows="3" maxlength="' + (f.max || 400) + '">' + esc(vals[f.key] || '') + '</textarea>';
      } else if (f.type === 'select') {
        h += '<div class="seg" data-seg="' + f.key + '">' + f.options.map(function (o) {
          return '<button type="button" class="seg-b ' + (vals[f.key] === o[0] ? 'on' : '') + '" data-val="' + o[0] + '">' + esc(o[1]) + '</button>';
        }).join('') + '</div>';
      } else if (f.type === 'icon') {
        h += '<div class="muted mb" style="font-size:12px">Иконка необязательна: нажми на выбранную ещё раз, чтобы убрать</div><div class="icon-grid" data-icons="' + f.key + '">' + ICONS.map(function (e) {
          return '<button type="button" class="ico-pick ' + (vals[f.key] === e ? 'on' : '') + '" data-emo="' + e + '">' + e + '</button>';
        }).join('') + '</div>';
      } else if (f.type === 'avatar') {
        h += '<div class="avatar-pick"><span id="av-prev">' + (vals[f.key] ? '<img src="' + vals[f.key] + '" alt="">' : '<em>нет</em>') + '</span>' +
          '<button type="button" class="btn-soft sm" id="av-btn">Загрузить своё изображение</button>' +
          '<button type="button" class="btn-soft sm" id="av-clear">Убрать</button>' +
          '<input type="file" id="av-file" accept="image/*" class="hidden"></div>';
      }
      h += '</div>';
    });
    h += '<div class="err" id="merr"></div><div class="modal-actions"><button type="button" class="btn-soft" data-action="modal-close">Отмена</button>' +
      '<button type="submit" class="btn-primary">' + esc(cfg.submit || 'Сохранить') + '</button></div></form>';
    openModal(h);
    var form = $('#mform');
    $$('[data-icons] .ico-pick', form).forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.parentNode.getAttribute('data-icons');
        var was = b.classList.contains('on'); vals[key] = was ? '' : b.getAttribute('data-emo');
        $$('.ico-pick', b.parentNode).forEach(function (x) { x.classList.toggle('on', !was && x === b); });
      });
    });
    $$('[data-seg] .seg-b', form).forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.parentNode.getAttribute('data-seg');
        vals[key] = b.getAttribute('data-val');
        $$('.seg-b', b.parentNode).forEach(function (x) { x.classList.toggle('on', x === b); });
      });
    });
    var avF = cfg.fields.filter(function (f) { return f.type === 'avatar'; })[0];
    if (avF) {
      $('#av-btn').addEventListener('click', function () { $('#av-file').click(); });
      $('#av-clear').addEventListener('click', function () { vals[avF.key] = ''; $('#av-prev').innerHTML = '<em>нет</em>'; });
      $('#av-file').addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        resizeImage(f, 160, function (url) {
          vals[avF.key] = url;
          $('#av-prev').innerHTML = '<img src="' + url + '" alt="">';
        });
      });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      cfg.fields.forEach(function (f) {
        if (f.type === 'text' || f.type === 'textarea') vals[f.key] = form.elements[f.key].value.trim();
      });
      for (var i = 0; i < cfg.fields.length; i++) {
        var f = cfg.fields[i];
        if (f.required && !vals[f.key]) { $('#merr').textContent = 'Заполни поле «' + f.label + '»'; return; }
      }
      closeModal();
      cfg.onSubmit(vals);
    });
    var first = $('input[name]', form) || $('textarea', form);
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function resizeImageMax(file, maxW, maxH, q, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, maxW / img.width, maxH / img.height);
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', q));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }
  /* обои: маленькие файлы — как есть, большие — не больше 4K и jpeg 0.95 */
  /* обои: подгоняем под экран (×1.5) с высоким качеством, как раз чтобы Chromium не сжимал картинку грубо (это и даёт «пиксели») */
  function loadBgImage(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        if (file.size <= 14e6 && img.width <= 7680 && img.height <= 4320) { cb(fr.result); return; }       // хорошее по размеру — храним как есть, без пересжатия
        var dpr = Math.max(1, window.devicePixelRatio || 1);
        var tw = Math.min(BG_MAX_W, Math.ceil((screen.width || 1920) * dpr * 1.25)), th = Math.min(BG_MAX_H, Math.ceil((screen.height || 1080) * dpr * 1.25));
        var k = Math.max(tw / img.width, th / img.height);
        if (k >= 1) { cb(fr.result); return; }               // картинка не больше экрана — храним оригинал как есть
        var w = img.width, h = img.height, src = img, c;
        var fw = Math.round(img.width * k), fh = Math.round(img.height * k);
        while (w / 2 >= fw) {                                 // ступенчатое уменьшение вдвое — без «лесенок»
          c = document.createElement('canvas'); c.width = w = Math.round(w / 2); c.height = h = Math.round(h / 2);
          var x1 = c.getContext('2d'); x1.imageSmoothingEnabled = true; x1.imageSmoothingQuality = 'high'; x1.drawImage(src, 0, 0, w, h); src = c;
        }
        c = document.createElement('canvas'); c.width = fw; c.height = fh;
        var x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, fw, fh);
        cb(c.toDataURL('image/jpeg', BG_JPEG_Q));
      };
      img.onerror = function () { cb(fr.result); };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }
  function resizeImage(file, size, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas');
        c.width = size; c.height = size;
        var x = c.getContext('2d');
        var s = Math.min(img.width, img.height);
        x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        cb(c.toDataURL('image/png'));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  /* ---------- календарь ---------- */
  function habMin() { var m = today(); S.habits.forEach(function (h) { if (h.created && h.created < m) m = h.created; }); return m; }
  function firstDay() {
    var t = today(), lo = t;
    function u(d) { if (d && d < lo) lo = d; }
    S.tasks.forEach(function (k) { u(k.date); });
    S.notes.forEach(function (n) { u(n.cdate || n.date); });
    Object.keys(S.completed).forEach(u); Object.keys(S.frozen).forEach(u);
    S.habits.forEach(function (h) { Object.keys(h.log || {}).forEach(function (d) { if (h.log[d]) u(d); }); });
    S.projects.forEach(function (p) { p.actions.forEach(function (x) { if (x.done) u(x.doneDate); }); });
    S.motivations.forEach(function (m) { u(m.cdate); });
    return lo;
  }
  function calHtml(y, m, cellFn, action) {
    var lo = firstDay(), hi = today(), ymC = y * 12 + m, ymLo = +lo.slice(0, 4) * 12 + (+lo.slice(5, 7) - 1), ymHi = +hi.slice(0, 4) * 12 + (+hi.slice(5, 7) - 1);
    var first = new Date(y, m, 1), off = (first.getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
    var h = '<div class="cal"><div class="cal-head"><button class="ico-btn" data-action="' + action + '-prev"' + (ymC <= ymLo ? ' disabled' : '') + '>' + ic('chevL') + '</button>' +
      '<b>' + MONTHS_NOM[m] + ' ' + y + '</b><button class="ico-btn" data-action="' + action + '-next"' + (ymC >= ymHi ? ' disabled' : '') + '>' + ic('chevR') + '</button></div><div class="cal-grid">';
    DOW.forEach(function (d) { h += '<i class="dw">' + d + '</i>'; });
    for (var i = 0; i < off; i++) h += '<i></i>';
    for (var d = 1; d <= dim; d++) {
      var s = y + '-' + pad(m + 1) + '-' + pad(d);
      var c = cellFn(s), outR = s < lo || s > hi, at = c.attr || '';
      if (outR && at.indexOf('disabled') < 0 && at) at += ' disabled';
      h += '<button class="cd ' + c.cls + (outR ? ' off' : '') + '" ' + at + '>' + d + '</button>';
    }
    return h + '</div></div>';
  }
  /* ---------- плашка серии (под огоньком) ---------- */
  function dayHeat(d) {
    var u = dayStats(d).total;
    return u >= 10 ? 'heat3' : u >= 5 ? 'heat2' : u >= 1 ? 'heat1' : '';
  }
  function finishBtn() {
    var t = today(), st = dayStats(t), fin = !!S.completed[t], can = st.total >= FINISH_MIN;
    if (fin) return '<button class="btn-finish ok" disabled><span>День завершён ✓</span></button>';
    return '<button class="btn-finish" data-action="finish-day" ' + (can ? '' : 'disabled') + '><span>Завершить день</span><small>' +
      (can ? 'Можно завершать!' : st.total + ' / ' + FINISH_MIN + ' заданий') + '</small></button>';
  }
  function popHtml() {
    var si = streakInfo(), t = today(), st = dayStats(t), ws = weekStart(t);
    var week = DOW.map(function (n, i) {
      var d = addDays(ws, i), c = S.completed[d], f = S.frozen[d];
      return '<div class="wk ' + (c ? 'done' : f ? 'froze' : '') + (d === t ? ' today' : '') + (d > t ? ' fut' : '') + '"><i>' +
        (c ? FLAME('mini') : f ? '🧊' : '') + '</i><span>' + n + '</span></div>';
    }).join('');
    var pct = Math.min(100, st.total / FINISH_MIN * 100);
    return '<div class="sp-head">' + FLAME('big') + '<div class="sp-t"><b class="sp-num">' + si.streak + '</b><span>' + plural(si.streak, ['день', 'дня', 'дней']) + ' подряд</span></div>' +
      '<button class="ico-btn" data-action="pop-close" title="Закрыть">' + ic('close') + '</button></div>' +
      '<div class="sp-week">' + week + '</div>' +
      '<div class="freeze"><span class="fz-ico">🧊</span><div><b>Заморозки: ' + si.avail + '</b><small>10 дней серии — 1 заморозка, 25 — 2, 40 — 3 и так далее. Заморозка спасает серию, если пропустить день.</small></div></div>' +
      calHtml(UI.calY, UI.calM, function (s) {
        var c = [], h = dayHeat(s);
        if (h) c.push(h);
        if (S.completed[s]) c.push('done');
        else if (S.frozen[s]) c.push('froze');
        if (s === t) c.push('today');
        return { cls: c.join(' ') };
      }, 'cal') +
      '<div class="sp-prog"><div class="sp-pt"><span>Сегодня выполнено</span><b>' + (st.total >= FINISH_MIN ? st.total + ' ✓' : st.total + ' из ' + FINISH_MIN) + '</b></div><div class="progress"><i style="width:' + pct + '%"></i></div></div>' +
      finishBtn();
  }
  var HELP = {
    ru: [['🗓', 'Ежедневник', 'Твой день на одной сцене. Простое действие даёт 1 очко, сложное (с поддействиями) — 3. Индикатор сложности: до 5 поддействий — тёмно-зелёный, больше 5 — тёмно-оранжевый, 10 и больше — тёмно-красный. Закреплённое действие возвращается каждое утро.'],
      ['⚖', 'Честный КПД', 'Очки даются только за настоящие дела: заметка от 20 символов и 3 слов (или с рисунком), не чаще раза в 3 минуты, без дублей; время в заметках копится при активности (2 минуты без действий — пауза); действие, закрытое в первые 30 секунд после создания, очков не даёт; отметка привычки за прошлый день в КПД не идёт; в избранное идут только засчитанные заметки.'],
      ['🧊', 'Заморозки', 'Заморозка спасает серию в день, который ты пропустил. 10 дней серии — 1 заморозка, 25 дней — 2, 40 — 3 и так далее. Количество видно в окошке серии (нажми на огонёк) и в профиле.'],
      ['🔥', 'Серия и календарь', 'Огонёк считает дни подряд, когда ты завершал день. В календаре серии закрашены дни с активностью. Вид, цвет и эффект огонька меняются в «Стили → Огонёк».'],
      ['⏱', 'Время за заметками сегодня', 'Часы в заметках тикают, пока ты находишься во вкладке «Заметки» (можно поставить на паузу). Каждые 10 минут общения с собой — 1 единица в категории «Заметки» для КПД. Время накапливается за сегодня и сбрасывается завтра. Задним числом время начислить нельзя.'],
      ['✍', 'Заметки', 'Мысли с датой и точным временем. Мысль можно редактировать (карандаш) или дополнять («＋»). Рядом с изменённой заметкой видна отметка «изменено». Сердце — в избранное, кнопка закрепа — наверх. Кнопка «Рисунок» открывает холст на весь экран или пол-экрана: кисти, цвета, штампы-фигурки и бумага.'],
      ['🧩', 'Проекты', 'Большая цель из действий. Три режима: «Все действия» — полный список проекта; «На сегодня» — то, что ты выбрал на сегодня значком ☀ (кнопка «Подобрать» сама берёт нужное число действий по нагрузке на день); «Ветка» — карта проекта.'],
      ['🌿', 'Ветка проекта', 'В центре название проекта, от него растут ветки-действия и их поддействия любой глубины. Тяни узел — он вращается вокруг родителя и меняет длину. Тяни пустое место или жми ↺ ↻ — вращается вся ветка. Колесо мыши — масштаб. Выбери узел и меняй форму, цвет, название, добавляй ветки. «Добавить из списка» берёт действия из Ежедневника.'],
      ['🌱', 'Привычки', 'Полезные отмечаются галочкой, когда сделал. Вредные помечены жёлтым предупреждением — их отмечаешь, когда удержался.'],
      ['📈', 'КПД и формула дня', 'Пять категорий (Ежедневник, Избранное, Заметки, Проекты, Привычки) — пять очков на день, в сумме 100%. Каждая категория даёт долю очка, пока ты не наберёшь её лимит. Лимиты настраиваются кнопкой «Настроить нагрузку» (1–40). Периоды 7 / 30 / 90 / год — средний результат за выбранное время, поэтому короткие периоды выше.'],
      ['🗺', 'Карта ветки проекта', 'Зажми пустое место поля (левой или правой кнопкой) и тяни — карта едет, как на телефоне. Shift + тяни — вращать всё. Два пальца — масштаб и поворот. Колесо — масштаб. Кнопка ⌖ возвращает в центр. Узел можно тянуть, чтобы качать ветку вокруг родителя.'],
      ['📝', 'Свернуть заметку', 'Длинные заметки и рисунки сворачиваются кнопкой ▴ в заголовке карточки; «Свернуть все / Развернуть все» — над лентой.'],
      ['🎛', 'Редактирование Ежедневника', 'Кнопка «Редактировать» (справа внизу, или удерживай палец/мышь на пустом месте блока): тяни блок целиком, меняй размер за круглые точки в углах, серая кнопка «−» убирает блок, убранные возвращаются в верхней панели. «＋ Действие» внизу всегда под рукой. «Модельки» — накладывай сколько угодно декораций, двигай, вращай, масштабируй. Своя моделька: PNG, WebP или SVG с прозрачным фоном, квадрат (лучше 512×512, минимум 128×128, до 2 МБ), объект по центру. Модельки меняются только в Ежедневнике.'],
      ['🎨', 'Стили', 'Кнопка «Стили» в настройках открывает окно с разделами: Текст, Огонёк, Настройки графики (3D/2D, размытие, размер, язык), Приветствие, Фон (пресеты, картинка, анимация, цвет волн). Режим 2D и выключенное размытие — самое лёгкое для слабых ПК.'],
      ['⌨', 'Окно', 'Alt+Enter — полный экран, Escape — выйти из него. Двойной клик по верхней полосе — развернуть.']],
    en: [['🗓', 'Daily planner', 'Your day on one stage. A simple action is 1 point, a complex one is 3. Complexity indicator: up to 5 sub-actions — dark green, over 5 — dark orange, 10+ — dark red. A pinned action returns every morning.'],
      ['🧊', 'Freezes', 'A freeze saves your streak on a skipped day. 10 streak days — 1 freeze, 25 — 2, 40 — 3 and so on.'],
      ['🔥', 'Streak & calendar', 'The flame counts consecutive finished days. Days with activity are painted in the calendar. Look and color: Styles → Flame.'],
      ['⏱', 'Notes time today', 'The clock ticks while you are in the Notes tab (it can be paused). Every 10 minutes is 1 unit of the Notes category for KPI. It resets tomorrow and cannot be added retroactively.'],
      ['✍', 'Notes', 'Thoughts with date and exact time. Edit a thought (pencil) or extend it (＋). Heart — favorite, pin — on top. The Drawing button opens a full-screen or half-screen canvas: brushes, colors, stamps and paper.'],
      ['🧩', 'Projects', 'A big goal made of actions. Three modes: All actions; Today — chosen with the ☀ icon (Auto-pick takes as many as your daily load); Branch — the project map.'],
      ['🌿', 'Project branch', 'The project name sits in the center, actions and sub-actions of any depth grow from it. Drag a node to swing it around its parent; drag the background or press ↺ ↻ to rotate everything; mouse wheel zooms. Select a node to change shape, color, name or add branches. “Add from list” imports daily actions.'],
      ['🌱', 'Habits', 'Useful habits get a check mark. Harmful ones carry a yellow warning — mark them when you resisted.'],
      ['📈', 'KPI & day formula', 'Five categories — five points per day, 100% total. Each gives a share of a point until its cap. Caps are set with “Adjust load” (1–40). 7 / 30 / 90 / year show the average, so shorter periods read higher.'],
      ['🎛', 'Planner editing', 'Edit button (bottom right, or press and hold a block): drag a whole block, resize with the round corner dots, the grey “−” removes a block (bring it back from the top bar). The “＋ Action” button is always at the bottom. Models: layer decorations, move, rotate, scale. Custom model: PNG/WebP/SVG, transparent, square (512×512 best, min 128×128, up to 2 MB). Only in the Planner.'],
      ['🎨', 'Styles', 'Settings → Styles: Text, Flame, Graphics settings (3D/2D, blur, size, language), Greeting, Background (presets, image, animation, wave color). 2D and blur off are lightest.'],
      ['⌨', 'Window', 'Alt+Enter — full screen, Escape — leave it. Double click the top bar to maximize.']]
  };
  function helpHtml() {
    var en = S && S.settings.lang === 'en', list = en ? HELP.en : HELP.ru;
    return '<div class="hw-head"><h3>' + (en ? 'Guide' : 'Инструкции') + '</h3><button class="btn-primary sm" data-action="modal-close">' + (en ? 'Close' : 'Закрыть') + '</button></div><div class="hw-list">' +
      list.map(function (h) { return '<div class="hw-i"><span class="hw-ic">' + h[0] + '</span><p><b>' + h[1] + ':</b> ' + h[2] + '</p></div>'; }).join('') + '</div>';
  }
  function renderHelp() { if (UI.helpOpen) { openModal(helpHtml(), true); var mc = $('#modal .modal-card'); if (mc) { mc.classList.add('xwide', 'help-win'); mc.classList.remove('glass'); } } }
  function closeHelp() { if (UI.helpOpen) { UI.helpOpen = false; if ($('#modal .help-win')) closeModal(); } }
  function renderPop() {
    if (!UI.calY) { var n = new Date(); UI.calY = n.getFullYear(); UI.calM = n.getMonth(); }
    var p = $('#streak-pop');
    p.innerHTML = popHtml();
    p.classList.toggle('open', UI.popOpen);
  }
  function closePop() { UI.popOpen = false; $('#streak-pop').classList.remove('open'); }

  /* ---------- шапка / меню ---------- */
  var NAV = [
    ['today', 'Ежедневник', 'home'], ['notes', 'Заметки', 'chat'],
    ['projects', 'Проекты', 'folder'], ['habits', 'Привычки', 'check'], ['kpd', 'КПД', 'bars'], ['settings', 'Настройки', 'gear']
  ];
  function renderNav() {
    $('#nav').innerHTML = NAV.map(function (n) {
      return '<button class="nav-i ' + (UI.view === n[0] ? 'on' : '') + '" data-action="nav" data-view="' + n[0] + '">' + ic(n[2]) + '<span>' + esc(n[1]) + '</span></button>';
    }).join('');
  }
  function renderTop() {
    var si = streakInfo();
    $('#streak-chip').innerHTML = FLAME('hdr') + '<b>' + si.streak + '</b> ' + plural(si.streak, ['день', 'дня', 'дней']);
    var av = $('#avatar');
    if (S.profile.avatar) av.innerHTML = '<img src="' + S.profile.avatar + '" alt="">';
    else av.innerHTML = '<span>' + esc((USER || '?').charAt(0).toUpperCase()) + '</span>';
  }

  /* ---------- вид: Сегодня ---------- */
  var ORB = '<svg viewBox="0 0 240 230" class="orb"><defs>' +
    '<radialGradient id="o1" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="#ffffff"/><stop offset=".18" stop-color="#c6ceff"/><stop offset=".55" stop-color="#6f78ff"/><stop offset="1" stop-color="#1b1560"/></radialGradient>' +
    '<radialGradient id="o2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8a7bff" stop-opacity=".55"/><stop offset="1" stop-color="#8a7bff" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="o3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fb0ff" stop-opacity=".1"/><stop offset=".5" stop-color="#e3e7ff"/><stop offset="1" stop-color="#c9a8ff" stop-opacity=".15"/></linearGradient>' +
    '<filter id="ob" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter></defs>' +
    '<circle cx="120" cy="108" r="104" fill="url(#o2)"/>' +
    '<ellipse cx="120" cy="206" rx="64" ry="10" fill="#000" opacity=".4" filter="url(#ob)"/>' +
    '<g transform="rotate(-18 120 108)"><path d="M10 108 A110 28 0 0 1 230 108" fill="none" stroke="url(#o3)" stroke-width="2.5"/></g>' +
    '<circle cx="120" cy="108" r="72" fill="url(#o1)"/>' +
    '<ellipse cx="96" cy="74" rx="28" ry="15" fill="#fff" opacity=".28" transform="rotate(-28 96 74)"/>' +
    '<g transform="rotate(-18 120 108)"><path d="M10 108 A110 28 0 0 0 230 108" fill="none" stroke="url(#o3)" stroke-width="3"/></g>' +
    '<path d="M205 44l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#fff" opacity=".9"/><path d="M36 150l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5z" fill="#cfd6ff" opacity=".8"/></svg>';

  var MOTIV_START = ['Один шаг — и ты уже впереди вчерашнего себя.', 'Начни с самого простого дела. Остальное подтянется.', 'Сегодня ты можешь стать на 1% лучше. Начни прямо сейчас!', 'Большие результаты начинаются с одного маленького действия.'];
  var MOTIV_GO = ['Отличный старт! Не останавливайся — ты набираешь ход.', 'Ты уже в игре. Ещё чуть-чуть — и день будет твоим!', 'Так держать! Каждый шаг приближает к цели.'];
  function motivMsg(done, total, units) {
    var di = Math.abs(diffDays(today(), '2026-01-01'));
    if (total > 0 && done === total) return ['Ты справился со всем!', 'Все задачи дня выполнены — КПД дня уже ' + fmtPct(units / DAY_MAX * 100) + '%. Отличная работа!'];
    if (done > 0) return ['Ты на верном пути!', MOTIV_GO[di % MOTIV_GO.length]];
    return ['Время действовать!', MOTIV_START[di % MOTIV_START.length]];
  }

  /* архив дня: что было сделано в выбранный день */
  function archHtml(t) {
    var notes = S.notes.filter(function (n) { return n.date === t; }).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
    var habs = S.habits.filter(function (h) { return h.log[t]; });
    var acts = [];
    S.projects.forEach(function (p) { p.actions.forEach(function (a) { if (a.done && a.doneDate === t) acts.push({ icon: a.icon, text: p.name + ': ' + a.text }); }); });
    var mots = S.motivations.filter(function (m) { return m.cdate === t; });
    function col(title, items) {
      return '<div class="arch-col"><h5>' + title + ' <em>' + items.length + '</em></h5><ul>' +
        (items.length ? items.map(function (x) { return '<li>' + (x.icon ? '<span class="emo">' + esc(x.icon) + '</span> ' : '') + esc(x.text) + '</li>'; }).join('') : '<li class="none">—</li>') + '</ul></div>';
    }
    return '<section class="glass arch-card"><div class="arch-head"><b>Архив дня · ' + esc(fmtLong(t)) + ', ' + WD_FULL[parse(t).getDay()] + '</b>' +
      (S.completed[t] ? '<span class="chip ok">День завершён ✓</span>' : '') + '</div><div class="arch-cols">' +
      col('Разговоры с собой', notes.map(function (n) { return { text: (n.time ? n.time + ' · ' : '') + n.text }; })) +
      col('Привычки', habs.map(function (h) { return { icon: h.icon, text: h.name }; })) +
      col('Проекты', acts) +
      col('Мотивации', mots.map(function (m) { return { text: m.text }; })) + '</div></section>';
  }
  function dayPicker() {
    var t = today(), sel = UI.todayDate || t;
    openModal('<h3>Выбери день</h3>' + calHtml(UI.dpY, UI.dpM, function (s) {
      var c = [], h = dayHeat(s);
      if (h) c.push(h);
      if (S.completed[s]) c.push('done');
      if (s === t) c.push('today');
      if (s === sel) c.push('sel');
      return { cls: c.join(' '), attr: 'data-action="day-set" data-date="' + s + '"' + (s > t ? ' disabled' : '') };
    }, 'dcal') +
      '<div class="modal-actions"><button class="btn-soft" data-action="day-today">Сегодня</button><button class="btn-soft" data-action="modal-close">Закрыть</button></div>');
  }

  var GREETS = [['Привет!', 'Сегодня отличный день,<br>чтобы стать лучше.'], ['Доброго дня!', 'Маленькие шаги<br>приводят к большим целям.'], ['Здорово, что ты здесь!', 'Начни с одного дела —<br>остальное пойдёт легче.'], ['Вперёд!', 'Сделай сегодня то, за что<br>завтра скажешь себе спасибо.'], ['Новый день', 'Новая страница.<br>Напиши её сам.']];
  function greeting() { var g = S.settings.greet, i = g === 'auto' || g == null ? Math.abs(diffDays(today(), '2026-01-01')) % GREETS.length : +g; return GREETS[i] || GREETS[0]; }
  var MODELS = {
    orb: null,
    moon: '<svg viewBox="0 0 120 120"><defs><radialGradient id="mo1" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#c9b97a"/></radialGradient></defs><circle cx="60" cy="60" r="50" fill="url(#mo1)"/><circle cx="42" cy="46" r="9" fill="#00000022"/><circle cx="72" cy="70" r="12" fill="#00000018"/><circle cx="76" cy="38" r="5" fill="#00000018"/></svg>',
    planet: '<svg viewBox="0 0 120 120"><defs><radialGradient id="pl1" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffd9a0"/><stop offset="1" stop-color="#c0602f"/></radialGradient></defs><ellipse cx="60" cy="62" rx="56" ry="14" fill="none" stroke="#e7c27a" stroke-width="5" transform="rotate(-18 60 62)"/><circle cx="60" cy="60" r="32" fill="url(#pl1)"/><path d="M30 52q30 10 60 0" stroke="#00000022" stroke-width="4" fill="none"/><path d="M12 76q48 16 96-12" stroke="#e7c27a" stroke-width="5" fill="none" stroke-linecap="round"/></svg>',
    gem: '<svg viewBox="0 0 120 120"><defs><linearGradient id="gm1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bff3ff"/><stop offset="1" stop-color="#6a7bff"/></linearGradient></defs><path d="M30 20h60l22 30-52 58L8 50z" fill="url(#gm1)" stroke="#ffffff88" stroke-width="2"/><path d="M8 50h104M40 20l-10 30 30 58M80 20l10 30-30 58" stroke="#ffffff77" stroke-width="2" fill="none"/></svg>',
    star: '<svg viewBox="0 0 120 120"><defs><linearGradient id="st1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset="1" stop-color="#ff9f2e"/></linearGradient></defs><path d="M60 8l15 33 36 4-27 24 8 36-32-19-32 19 8-36L9 45l36-4z" fill="url(#st1)" stroke="#b8650a" stroke-width="3" stroke-linejoin="round"/></svg>',
    rocket: '<svg viewBox="0 0 120 120"><defs><linearGradient id="rk1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#9aa6d8"/></linearGradient></defs><path d="M60 6c18 14 22 40 18 66H42C38 46 42 20 60 6z" fill="url(#rk1)" stroke="#4b5694" stroke-width="3"/><circle cx="60" cy="40" r="9" fill="#5bc8ff" stroke="#4b5694" stroke-width="3"/><path d="M42 58L26 78l16-2zM78 58l16 20-16-2z" fill="#e0405f" stroke="#7f1730" stroke-width="2.5"/><path d="M50 76q10 30 20 0z" fill="#ffb347"/></svg>',
    cloud: '<svg viewBox="0 0 120 120"><defs><linearGradient id="cl1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b6c4f2"/></linearGradient></defs><path d="M30 86a20 20 0 0 1 2-40 26 26 0 0 1 50-4 22 22 0 0 1 6 44z" fill="url(#cl1)" stroke="#8a97cf" stroke-width="3" stroke-linejoin="round"/></svg>'
  };
  var MODEL_NAMES = { orb: 'Сфера', moon: 'Луна', planet: 'Планета', gem: 'Кристалл', star: 'Звезда', rocket: 'Ракета', cloud: 'Облако' };
  function modelInner(k) {
    if (k === 'orb') return ORB;
    if (MODELS[k]) return MODELS[k];
    var m = byId(S.models, k); return m ? '<img src="' + m.data + '" alt="">' : '';
  }
  function ovStyle(o) { return 'left:' + o.x + '%;top:' + o.y + 'px;width:' + o.s + 'px;height:' + o.s + 'px;transform:rotate(' + o.r + 'deg);'; }
  function modelHtml() {
    var k = S.settings.model || 'none';
    if (k === 'none') return '';
    if (k === 'orb' || (!MODELS[k] && !byId(S.models, k))) return ORB;
    var m = MODELS[k] || '<img src="' + byId(S.models, k).data + '" alt="">';
    return '<div class="model">' + m + '</div>';
  }
    var RS = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16, LROW = Math.round(54 * RS), LGAP = Math.round(10 * RS);
  var LAY_DEF = { hero: { x: 0, y: 0, w: 12, h: 4 }, tasks: { x: 0, y: 4, w: 8, h: 8 }, msg: { x: 8, y: 4, w: 4, h: 3 }, add: { x: 8, y: 7, w: 4, h: 2 }, kpd: { x: 8, y: 9, w: 4, h: 3 } };
  var LAY_MIN = { hero: [3, 2], tasks: [3, 3], msg: [2, 1], add: [2, 1], kpd: [2, 2] };
  function layItems() {
    var it = {}, cur = S.settings.layout.items || {};
    Object.keys(LAY_DEF).forEach(function (k) { it[k] = Object.assign({}, LAY_DEF[k], cur[k] || {}); });
    return it;
  }
  function layHit(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
  function layResolve(items, ids, mv) {              // двигаемый блок стоит где поставили, остальные съезжают вниз, чтобы не наезжать
    var order = ids.slice().sort(function (p, q) { if (p === mv) return -1; if (q === mv) return 1; return items[p].y - items[q].y || items[p].x - items[q].x; });
    var placed = [];
    order.forEach(function (id) { while (placed.some(function (o) { return layHit(items[id], items[o]); })) items[id].y++; placed.push(id); });
  }
  function layStyle(it) { return 'left:' + (it.x / 12 * 100) + '%;width:calc(' + (it.w / 12 * 100) + '% - ' + LGAP + 'px);top:' + it.y * LROW + 'px;height:' + (it.h * LROW - LGAP) + 'px;'; }
  var LAY_NAMES = { hero: 'Приветствие', tasks: 'Действия', msg: 'Дополнение', add: 'Кнопка «Добавить»', kpd: 'КПД сегодня' };
  function viewToday() {
    var t = UI.todayDate || today(), arch = t !== today();
    var list = S.tasks.filter(function (k) { return k.date === t; });
    var done = list.filter(function (k) { return k.done; }).length;
    var st = dayStats(t), mm = motivMsg(done, list.length, st.total);
    var pct = list.length ? Math.round(done / list.length * 100) : 0;
    var rows = list.length ? list.map(function (k) {
      var n = k.subs ? k.subs.length : 0, dn = n ? k.subs.filter(function (s) { return s.done; }).length : 0, open = !!UI.taskOpen[k.id];
      var lvl = n >= 10 ? 'hard' : n > 5 ? 'mid' : 'easy';
      var subs = n && open ? '<div class="subs">' + k.subs.map(function (s) {
        return '<div class="sub ' + (s.done ? 'done' : '') + '"><button class="check sm ' + (s.done ? 'on' : '') + '" data-action="sub-toggle" data-id="' + k.id + '" data-sid="' + s.id + '"' + (arch ? ' disabled' : '') + '>' + (s.done ? ic('tick') : '') + '</button><span class="txt">' + esc(s.text) + '</span></div>';
      }).join('') + '</div>' : '';
      return '<div class="trow"><div class="row task ' + (k.done ? 'done' : '') + '">' +
        '<button class="check ' + (k.done ? 'on' : '') + '" data-action="task-toggle" data-id="' + k.id + '"' + (arch ? ' disabled' : '') + '>' + (k.done ? ic('tick') : '') + '</button>' +
        '<span class="emo">' + esc(k.icon) + '</span><span class="txt">' + esc(k.text) + '</span>' +
        (k.ind && n ? '<i class="lvl ' + lvl + '" title="Сложность: ' + n + ' поддействий"></i>' : '') +
        (arch ? '' : '<button class="ico-btn" data-action="task-sub" data-id="' + k.id + '" title="Добавить поддействие">＋</button>') + (n ? '<button class="sub-cnt" data-action="task-open" data-id="' + k.id + '">' + dn + '/' + n + ' <b class="' + (open ? 'up' : '') + '">▾</b></button>' : '') +
        (arch ? '' : '<button class="ico-btn ' + (k.tpl ? 'pinon' : '') + '" data-action="task-pin" data-id="' + k.id + '" title="Закрепить на каждый день">' + ic('pin') + '</button>') +
        '<button class="ico-btn" data-action="task-edit" data-id="' + k.id + '" title="Редактировать">' + ic('pencil') + '</button>' +
        '<button class="ico-btn" data-action="task-del" data-id="' + k.id + '" title="Удалить">' + ic('trash') + '</button></div>' + subs + '</div>';
    }).join('') : '<div class="empty">' + (arch ? 'В этот день действий не было.' : 'Пока пусто') + '</div>';
    var gr = greeting();
    var heroH = '<div class="hero"><div class="hero-text"><h1 class="hello">' + gr[0] + '</h1><p class="sub">' + gr[1] + '</p></div>' + (arch || !modelHtml() ? '' : '<div class="model-wrap">' + modelHtml() + '</div>') + '</div>';
    var tasksH = '<section class="glass tasks pad-' + (S.settings.pad || 'glass') + '"><div class="tasks-head"><span class="ti">' + ic('cal') + '</span><b>' + (arch ? 'Действия за ' + esc(fmtLong(t)) : 'Твои действия на сегодня') + '</b>' +
      '<span class="cnt">' + done + ' из ' + list.length + '</span><div class="progress sm"><i style="width:' + pct + '%"></i></div></div><div class="task-list">' + rows + '</div></section>';
    var msgH = '<div class="glass motiv-card"><svg viewBox="0 0 24 24" class="star"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg><h4>' + esc(mm[0]) + '</h4><p>' + esc(mm[1]) + '</p></div>';
    var addH = '<button class="btn-add" data-action="task-add"><span class="plus">＋</span><span>Добавить действие</span></button>';
    var kpdH = '<div class="glass kpd-today">' + ringSvg(st.pct, 104) + '<div class="kt-txt"><small>КПД сегодня</small><b>' + st.total + ' из ' + DAY_MAX + '</b><span>заданий выполнено</span></div></div>';
    var foot = '<div class="today-foot"><button class="chip" data-action="day-pick">' + ic('cal') + ' ' + fmtShort(t) + '</button>' + (arch ? '<button class="btn-soft" data-action="day-today">Вернуться к сегодня</button>' : finishBtn()) + '</div>';
    var dock = arch ? '' : '<div class="fab-dock"><button class="fab-add" data-action="task-add" title="Добавить действие"><span>＋</span>Действие</button>' + (UI.layEdit ? '<button class="fab-edit on" data-action="lay-done">Готово</button>' : '<button class="fab-edit" data-action="lay-edit" title="Менять расположение и размер блоков">✎ Редактировать</button>') + '</div>';
    var lay = S.settings.layout, parts = { hero: heroH, tasks: tasksH, msg: msgH, add: addH, kpd: kpdH };
    if (lay.custom && !arch) {
      var ed = !!UI.layEdit, LY = layItems(), hid = lay.hidden || [];
      var ids = Object.keys(LAY_DEF).filter(function (id) { return hid.indexOf(id) < 0; }), Hh = 0;
      ids.forEach(function (id) { Hh = Math.max(Hh, LY[id].y + LY[id].h); });
      var blocks = ids.map(function (id) {
        return '<div class="lb' + (ed ? ' edit' : '') + '" data-b="' + id + '" style="' + layStyle(LY[id]) + '">' + (ed ? '<button class="lb-x" data-action="lay-hide" data-b="' + id + '" title="Убрать блок">−</button><span class="lb-name">' + LAY_NAMES[id] + '</span>' : '') +
          '<div class="lb-in">' + parts[id] + '</div>' + (ed ? ['nw', 'ne', 'sw', 'se'].map(function (c) { return '<span class="lb-rs ' + c + '" data-c="' + c + '"></span>'; }).join('') : '') + '</div>';
      }).join('');
      var bar = ed ? '<div class="lay-bar glass"><b>Редактирование</b>' +
        '<button class="btn-soft sm" data-action="model-open">Модельки</button>' +
        hid.map(function (id) { return '<button class="btn-soft sm" data-action="lay-show" data-b="' + id + '">＋ ' + LAY_NAMES[id] + '</button>'; }).join('') +
        '<button class="btn-soft sm" data-action="lay-reset">Сбросить</button><button class="btn-primary sm" data-action="lay-done">Готово</button></div>' : '';
      var ovs = (lay.models || []).map(function (o) {
        return '<div class="ov' + (ed ? ' edit' : '') + '" data-ov="' + o.id + '" style="' + ovStyle(o) + '"><div class="ov-in">' + modelInner(o.key) + '</div>' + (ed ? '<span class="ov-rot"></span><span class="ov-rs"></span><button class="ov-x" data-action="ov-del" data-id="' + o.id + '" title="Удалить модельку">' + ic('trash') + '</button>' : '') + '</div>';
      }).join('');
      return '<div class="today custom' + (ed ? ' editing' : '') + '">' + bar + '<div class="lgrid" id="lgrid" style="height:' + Math.max(1, Hh) * LROW + 'px">' + ovs + blocks + '</div>' + (ed ? '' : foot) + dock + '</div>';
    }
    return '<div class="today' + (arch ? ' arch' : '') + '">' + heroH + (arch ? archHtml(t) : '') + '<div class="today-grid">' + tasksH + '<aside class="side">' + msgH + addH + kpdH + '</aside></div>' + foot + dock + '</div>';
  }

  /* ---------- вид: Мотивации ---------- */
  var WD_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  function fmtDateFull(ms) { var d = new Date(ms); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ' г., ' + WD_FULL[d.getDay()]; }
  function fmtTimeFull(ms) { var d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  var MV_LONG = 150;                                       // длиннее — сворачиваем с кнопкой «Развернуть»
  /* «мотивация дня» держится MOTIV_DAY_COOLDOWN дней; выбор хранится в S.motDay */
  function motPick() {
    if (!S.motivations.length) return null;
    var base = '2026-01-01', slot = Math.floor(diffDays(today(), base) / MOTIV_DAY_COOLDOWN), cur = S.motDay;
    var m = cur && cur.slot === slot ? byId(S.motivations, cur.id) : null;
    if (!m) {
      var list = S.motivations.slice().sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
      var h = 0, s = 'slot' + slot;
      for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
      var ix = h % list.length;
      if (list.length > 1 && cur && list[ix].id === cur.id) ix = (ix + 1) % list.length;
      m = list[ix];
      S.motDay = { slot: slot, id: m.id };
      save();
    }
    return { m: m, since: addDays(base, slot * MOTIV_DAY_COOLDOWN) };
  }
  var ORN = {
    crown: '<svg viewBox="0 0 130 74" class="plate-orn crown"><defs><linearGradient id="cr1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#ffc83d"/><stop offset="1" stop-color="#d98a12"/></linearGradient></defs>' +
      '<path d="M8 62 L0 14 L34 38 L65 2 L96 38 L130 14 L122 62 Z" fill="url(#cr1)" stroke="#8a5a08" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<rect x="8" y="58" width="114" height="14" rx="4" fill="url(#cr1)" stroke="#8a5a08" stroke-width="2.5"/>' +
      '<circle cx="65" cy="40" r="6" fill="#ff5c8a" stroke="#8a5a08" stroke-width="1.5"/><circle cx="36" cy="50" r="4" fill="#5bc8ff" stroke="#8a5a08" stroke-width="1.2"/><circle cx="94" cy="50" r="4" fill="#5bc8ff" stroke="#8a5a08" stroke-width="1.2"/>' +
      '<path d="M20 58 L12 24 L30 40" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" stroke-linecap="round"/></svg>',
    heart: '<svg viewBox="0 0 56 52" class="plate-orn heart"><defs><linearGradient id="ht1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9ab8"/><stop offset="1" stop-color="#e0304f"/></linearGradient></defs>' +
      '<path d="M28 49S3 34 3 17A12.5 12.5 0 0 1 28 11a12.5 12.5 0 0 1 25 6C53 34 28 49 28 49z" fill="url(#ht1)" stroke="#8a1530" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M14 16a6 6 0 0 1 8-3" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round"/></svg>',
    pin: '<svg viewBox="0 0 44 64" class="plate-orn pin"><defs><linearGradient id="pn1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8ecff"/><stop offset=".5" stop-color="#9aa6d8"/><stop offset="1" stop-color="#5d679a"/></linearGradient></defs>' +
      '<path d="M12 3h20l-3 20 9 11v6H6v-6l9-11z" fill="url(#pn1)" stroke="#3a4170" stroke-width="2.5" stroke-linejoin="round"/><path d="M22 40v22" stroke="#aeb6dd" stroke-width="3.5" stroke-linecap="round"/></svg>'
  };
  /* карточка: слева текст, справа (отдельной колонкой) дата, значки и кнопки; рамка — только сверху и по бокам, книзу гаснет */
  var MV_DECO = { snow: '⛄ ❄️', hween: '🎃 🦇', easter: '🐣 🌷' };
  function motCard(m, o) {
    o = o || {};
    var kind = o.kind || 'rest', long = m.text.length > MV_LONG, open = !!UI.motOpen[m.id], d = m.at ? new Date(m.at) : null;
    var left = o.day ? MOTIV_DAY_COOLDOWN - diffDays(today(), o.since) : 0;
    var date = o.day ? '<b>Цитата дня</b>' + esc(fmtLong(today())) :
      (d ? '<b>' + esc(fmtLong(ds(d))) + '</b>' + pad(d.getHours()) + ':' + pad(d.getMinutes()) : 'без даты');
    return '<article class="glass mv-card k-' + kind + (m.bg && m.bg !== 'none' ? ' mbg mbg-' + m.bg : '') + '">' + (MV_DECO[m.bg] ? '<span class="mv-deco">' + MV_DECO[m.bg] + '</span>' : '') + (o.day ? ORN.crown.replace('plate-orn', 'card-orn') : '') +
      '<div class="mv-tools"><button class="ico-btn sm" data-action="mot-edit" data-id="' + m.id + '" title="Редактировать">' + ic('pencil') + '</button>' +
      '<button class="ico-btn sm" data-action="mot-del" data-id="' + m.id + '" title="Удалить">' + ic('trash') + '</button></div>' +
      '<div class="mv-body">' + (m.iconOn && m.icon ? '<span class="mv-ico">' + esc(m.icon) + '</span>' : '') +
      '<p class="mv-text' + (long && !open ? ' clamp' : '') + '">' + esc(m.text) + '</p>' +
      (long ? '<button class="mv-more" data-action="mot-expand" data-id="' + m.id + '">' + (open ? 'Свернуть' : 'Развернуть') + '</button>' : '') +
      (m.author ? '<div class="mv-author">— ' + esc(m.author) + '</div>' : '') + '</div>' +
      '<div class="mv-side"><div class="mv-badges">' + (m.pinned ? '<span class="bdg pin">' + ic('pin') + '</span>' : '') + (m.liked ? '<span class="bdg heart">' + ic('heart') + '</span>' : '') + '</div>' +
      '<div class="mv-date">' + date + '</div><div class="mv-acts">' +
      '<button class="ico-btn sm act pin ' + (m.pinned ? 'on' : '') + '" data-action="mot-pin" data-id="' + m.id + '" title="Закрепить">' + ic('pin') + '</button>' +
      '<button class="ico-btn sm act heart ' + (m.liked ? 'on' : '') + '" data-action="mot-like" data-id="' + m.id + '" title="В избранное">' + ic('heart') + '</button></div></div></article>';
  }
  function viewMotiv() {
    var all = S.motivations.slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    var pk = motPick(), day = pk ? pk.m : null;
    var rest = all.filter(function (m) { return !day || m.id !== day.id; });
    var liked = rest.filter(function (m) { return m.liked; }), pinned = rest.filter(function (m) { return m.pinned; });
    var others = rest.filter(function (m) { return !m.liked && !m.pinned; });
    var cd = MOTIV_DAY_COOLDOWN + ' ' + plural(MOTIV_DAY_COOLDOWN, ['день', 'дня', 'дней']);
    function sec(kind, orn, title, sub, list, none) {
      if (!list.length && kind !== 'rest') return '';
      return '<section class="mv-sec s-' + kind + '"><div class="mv-sh">' + (orn ? '<span class="sh-orn">' + orn.replace('plate-orn', 'sh-svg') + '</span>' : '') + '<h3>' + title + '</h3><em>' + list.length + '</em><span>' + sub + '</span></div>' +
        (list.length ? '<div class="mv-grid">' + list.map(function (m) { return motCard(m, { kind: kind === 'liked' ? 'fav' : kind === 'pinned' ? 'pin' : kind }); }).join('') + '</div>' : '<div class="mv-none">' + none + '</div>') + '</section>';
    }
    return '<div class="page-head"><span class="page-ico">' + ic('trophy') + '</span><div><h1 class="title">Мотивации</h1><p class="sub2">Твои причины двигаться вперёд.</p></div>' +
      '<div class="qf-sel"><small>Шрифт</small><div class="seg">' + [['normal', 'Обычный'], ['serif', 'Курсив'], ['hand', 'Рукописный'], ['bold', 'Жирный']].map(function (p) {
        return '<button class="seg-b ' + ((S.settings.qfont || 'normal') === p[0] ? 'on' : '') + '" data-action="set-qfont" data-s="' + p[0] + '">' + p[1] + '</button>';
      }).join('') + '</div></div>' +
      '<button class="btn-add sm" data-action="mot-add"><span class="plus">＋</span><span>Добавить мотивацию</span></button></div>' +
      (day ? '<section class="mv-sec s-day"><div class="mv-sh"><h3>Мотивация дня</h3><span>меняется каждый день</span></div><div class="mv-grid">' + motCard(day, { kind: 'day', day: true, since: pk.since }) + '</div></section>' +
        sec('pinned', ORN.pin, 'Закреплённые', 'всегда под рукой', pinned, '') +
        sec('liked', ORN.heart, 'Избранное', 'то, что понравилось', liked, '') +
        sec('rest', '', 'Все остальные', 'остальные цитаты', others, 'Остальных цитат пока нет.') :
        '<div class="glass empty-big">Здесь пока пусто. Добавь то, что тебя вдохновляет: цель, цитату, обещание себе.</div>');
  }

  /* ---------- вид: Проекты ---------- */
  var STATUS = { active: 'Активный', done: 'Завершён', frozen: 'Заморожен' };
  function viewProjects() {
    var ps = S.projects;
    var cnt = { all: ps.length, active: 0, done: 0, frozen: 0 };
    ps.forEach(function (p) { cnt[p.status]++; });
    var shown = ps.filter(function (p) { return UI.projFilter === 'all' || p.status === UI.projFilter; });
    var cur = ps.filter(function (p) { return p.id === UI.projId; })[0];
    if (!cur || (UI.projFilter !== 'all' && cur.status !== UI.projFilter)) cur = shown[0] || null;
    UI.projId = cur ? cur.id : null;
    var tabs = [['all', 'Все'], ['active', 'Активные'], ['done', 'Завершённые'], ['frozen', 'Замороженные']].map(function (f) {
      return '<button class="tab ' + (UI.projFilter === f[0] ? 'on' : '') + '" data-action="proj-filter" data-f="' + f[0] + '">' + f[1] + ' <em>' + cnt[f[0]] + '</em></button>';
    }).join('');
    var cards = shown.length ? shown.map(function (p) {
      var pc = projPct(p), dn = p.actions.filter(function (a) { return a.done; }).length;
      return '<div class="glass pcard ' + (cur && cur.id === p.id ? 'sel' : '') + '" data-action="proj-select" data-id="' + p.id + '">' +
        avatarOrIcon(p.avatar, p.icon, 'md') +
        '<div class="pc-body"><div class="pc-top"><b>' + esc(p.name) + '</b><span class="badge ' + p.status + '">' + STATUS[p.status] + '</span></div>' +
        '<div class="pc-bot"><div class="progress"><i style="width:' + pc + '%"></i></div><small>' + dn + ' / ' + p.actions.length + ' ' + plural(p.actions.length, ['действие', 'действия', 'действий']) + '</small><b>' + pc + '%</b></div></div></div>';
    }).join('') : '<div class="empty">' + (ps.length ? 'В этой категории проектов нет.' : 'Проектов пока нет. Создай первый!') + '</div>';
    return '<div class="page-head"><span class="page-ico">' + ic('folder') + '</span><div><h1 class="title">Проекты</h1><p class="sub2">Планируй. Выполняй. Достигай.</p></div><div class="tabs">' + tabs + '</div></div>' +
      '<div class="proj-grid"><div class="proj-left"><button class="btn-primary big" data-action="proj-add">＋ Создать проект</button><div class="pcards">' + cards + '</div></div>' +
      '<div class="proj-right">' + (cur ? projDetail(cur) : '<div class="glass empty-big">Выбери проект слева или создай новый.</div>') + '</div></div>';
  }
  /* ---------- ветка проекта (интеллект-карта) ---------- */
  var BM_SHAPES = ['pill', 'round', 'hex', 'para', 'ticket', 'cloud', 'leaf', 'oct'];
  var BM_COLS = ['#6a5cff', '#ff7bb8', '#ffb347', '#34d3b4', '#4fb4ff', '#9ad13a', '#ff6b6b', '#c084fc'];
  function bmFind(list, id, par) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return { n: list[i], list: list, parent: par || null, i: i };
      var r = list[i].subs && bmFind(list[i].subs, id, list[i]); if (r) return r;
    }
    return null;
  }
  function bmLayout(p) {
    var M = p.map || (p.map = { rot: 0, zoom: 1 }), pos = {}, order = [], rot = (M.rot || 0) * Math.PI / 180;
    function walk(n, ppos, pAng, idx, cnt, depth, col, pid) {
      var base = depth === 1 ? idx * 360 / Math.max(cnt, 1) - 90 : pAng + (idx - (cnt - 1) / 2) * 55;
      var ang = n.ang != null ? n.ang : base, len = n.len != null ? n.len : (depth === 1 ? 190 : depth === 2 ? 135 : 115);
      var a = ang * Math.PI / 180 + rot;
      var me = { x: ppos.x + len * Math.cos(a), y: ppos.y + len * Math.sin(a), ang: ang, depth: depth, pid: pid, col: n.col || col, n: n, px: ppos.x, py: ppos.y, shape: n.shape || BM_SHAPES[(idx + depth * 3) % BM_SHAPES.length] };
      pos[n.id] = me; order.push(me);
      (n.subs || []).forEach(function (s, j) { walk(s, me, ang, j, n.subs.length, depth + 1, col, n.id); });
    }
    p.actions.forEach(function (a, i) { walk(a, { x: 0, y: 0 }, 0, i, p.actions.length, 1, BM_COLS[i % BM_COLS.length], null); });
    return { pos: pos, order: order };
  }
  function bmStageHtml(p) {
    var L = bmLayout(p), M = p.map, W = 4000, H = 3000, cx = W / 2, cy = H / 2, sel = UI.bmSel, h = '<svg class="bm-svg" width="' + W + '" height="' + H + '">';
    L.order.forEach(function (o) {
      var mx = (o.px + o.x) / 2, my = (o.py + o.y) / 2, dx = o.x - o.px, dy = o.y - o.py, k = .18;
      h += '<path d="M' + (cx + o.px) + ',' + (cy + o.py) + ' Q' + (cx + mx - dy * k) + ',' + (cy + my + dx * k) + ' ' + (cx + o.x) + ',' + (cy + o.y) + '" stroke="' + o.col + '" stroke-width="' + Math.max(2, 6 - o.depth * 1.3) + '" fill="none" stroke-linecap="round" opacity="' + (o.n.done ? .35 : .85) + '"/>';
    });
    h += '</svg>';
    h += '<div class="bn root ' + (sel === 'root' ? 'sel' : '') + '" data-nid="root" style="left:' + cx + 'px;top:' + cy + 'px"><div class="bn-in">' + avatarOrIcon(p.avatar, p.icon, 'md') + '<b>' + esc(p.name) + '</b></div></div>';
    L.order.forEach(function (o) {
      var n = o.n, txt = n.text.length > 26 ? n.text.slice(0, 25) + '…' : n.text;
      h += '<div class="bn sh-' + o.shape + ' d' + Math.min(o.depth, 3) + (n.done ? ' done' : '') + (sel === n.id ? ' sel' : '') + '" data-nid="' + n.id + '" style="left:' + (cx + o.x) + 'px;top:' + (cy + o.y) + 'px;--c:' + o.col + '"><div class="bn-in">' +
        (n.icon ? '<i>' + esc(n.icon) + '</i>' : '') + '<span>' + esc(txt) + '</span>' + (n.done ? '<em>✓</em>' : '') + '</div></div>';
    });
    return h;
  }
  function bmHtml(p) {
    var M = p.map || (p.map = { rot: 0, zoom: 1 }), z = M.zoom || 1, selN = UI.bmSel && UI.bmSel !== 'root' ? bmFind(p.actions, UI.bmSel) : null;
    if (UI.bmSel && UI.bmSel !== 'root' && !selN) UI.bmSel = null;
    var sel = UI.bmSel, tools = '<div class="bm-tools">' + (sel ? '<span class="bm-sel">' + (sel === 'root' ? esc(p.name) : esc(selN.n.text)) + '</span>' +
      (sel !== 'root' ? '<button class="btn-soft sm" data-action="bm-done">' + (selN.n.done ? '↺ Вернуть' : '✓ Выполнено') + '</button>' : '') +
      '<button class="btn-soft sm" data-action="bm-add">＋ Ветка</button>' +
      (sel !== 'root' ? '<button class="btn-soft sm" data-action="bm-edit">✎ Изменить</button><button class="btn-soft sm" data-action="bm-shape">◇ Форма</button><button class="btn-soft sm" data-action="bm-col">🎨 Цвет</button><button class="btn-soft sm" data-action="bm-reset">⟲ Выровнять</button><button class="btn-soft sm" data-action="bm-del">🗑</button>' : '')
      : '<span class="bm-sel">Выбери узел</span>') + '</div>';
    return '<div class="bm-wrap' + (UI.bmFull ? ' full' : '') + '" id="bm-wrap"><div class="bm-top"><b>Ветка проекта</b><div class="bm-ctl">' +
      '<button class="btn-soft sm" data-action="bm-rot" data-d="-15">↺</button><button class="btn-soft sm" data-action="bm-rot" data-d="15">↻</button>' +
      '<button class="btn-soft sm" data-action="bm-center" title="В центр">⌖</button><button class="btn-soft sm" data-action="bm-zoom" data-d="-.15">−</button><button class="btn-soft sm" data-action="bm-zoom" data-d=".15">＋</button>' +
      '<button class="btn-soft sm" data-action="bm-full">' + (UI.bmFull ? '✕' : '⤢') + '</button></div></div>' +
      '<div class="bm-view" id="bm-view"><div class="bm-stage" id="bm-stage" style="transform:' + bmTf(M) + '">' + bmStageHtml(p) + '</div>' +
      '<button class="btn-primary bm-pick" data-action="bm-list">＋ Добавить из списка</button></div>' + tools + '</div>';
  }
  function bmTf(M) { return 'translate(-50%,-50%) translate(' + (M.px || 0) + 'px,' + (M.py || 0) + 'px) scale(' + (M.zoom || 1) + ')'; }
  function bmApply(M) { var st = $('#bm-stage'); if (st) st.style.transform = bmTf(M); }
  function bmRedraw() { var p = curProj(), st = $('#bm-stage'); if (p && st) st.innerHTML = bmStageHtml(p); }
  var BMD = null;
  function bmXY(e) { var v = $('#bm-view'), r = v.getBoundingClientRect(), M = curProj().map, z = M.zoom || 1; return { x: (e.clientX - r.left - r.width / 2 - (M.px || 0)) / z, y: (e.clientY - r.top - r.height / 2 - (M.py || 0)) / z }; }
  var BMP = {};
  function bmPinch() {
    var k = Object.keys(BMP); if (k.length < 2) return null; var a = BMP[k[0]], b = BMP[k[1]];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), ang: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI };
  }
  document.addEventListener('pointerdown', function (e) {
    var v = e.target.closest && e.target.closest('#bm-view'); if (!v || e.target.closest('.bm-pick')) return;
    var p = curProj(); if (!p) return; var M = p.map || (p.map = { rot: 0, zoom: 1 });
    if (e.pointerType === 'touch') { BMP[e.pointerId] = { x: e.clientX, y: e.clientY }; if (Object.keys(BMP).length === 2 && BMD) { var pc = bmPinch(); BMD.pinch = { d0: pc.d, a0: pc.ang, z0: M.zoom || 1, r0: M.rot || 0 }; BMD.moved = true; BMD.id = null; BMD.mode = 'pinch'; return; } }
    if (e.button > 2) return;
    var nd = e.target.closest('.bn'), pt = bmXY(e), mode = nd && e.button === 0 ? 'node' : (e.shiftKey && !nd ? 'rot' : 'pan');
    BMD = { p: p, id: nd ? nd.getAttribute('data-nid') : null, mode: mode, sx: e.clientX, sy: e.clientY, moved: false, a0: Math.atan2(pt.y, pt.x), rot0: M.rot || 0, px0: M.px || 0, py0: M.py || 0, L: bmLayout(p) };
    v.classList.add('grab'); try { v.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
  });
  document.addEventListener('pointermove', function (e) {
    if (BMP[e.pointerId]) BMP[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (!BMD) return;
    var p = BMD.p, M = p.map;
    if (BMD.mode === 'pinch' && BMD.pinch) { var pc = bmPinch(); if (!pc) return; M.zoom = Math.max(.4, Math.min(2.2, +(BMD.pinch.z0 * pc.d / BMD.pinch.d0).toFixed(2))); M.rot = Math.round(BMD.pinch.r0 + pc.ang - BMD.pinch.a0); bmApply(M); bmRedraw(); return; }
    if (!BMD.moved && Math.abs(e.clientX - BMD.sx) + Math.abs(e.clientY - BMD.sy) < 5) return; BMD.moved = true;
    if (BMD.mode === 'pan') { M.px = Math.round(BMD.px0 + e.clientX - BMD.sx); M.py = Math.round(BMD.py0 + e.clientY - BMD.sy); bmApply(M); return; }
    var pt = bmXY(e);
    if (BMD.mode === 'node' && BMD.id && BMD.id !== 'root') {
      var o = BMD.L.pos[BMD.id]; if (!o) return; var dx = pt.x - o.px, dy = pt.y - o.py, f = bmFind(p.actions, BMD.id);
      f.n.ang = Math.round((Math.atan2(dy, dx) - (M.rot || 0) * Math.PI / 180) * 180 / Math.PI); f.n.len = Math.max(70, Math.min(420, Math.round(Math.sqrt(dx * dx + dy * dy))));
      bmRedraw();
    } else if (BMD.mode === 'rot') { M.rot = Math.round(BMD.rot0 + (Math.atan2(pt.y, pt.x) - BMD.a0) * 180 / Math.PI); bmRedraw(); }
  });
  function bmUp(e) {
    delete BMP[e.pointerId]; var v = $('#bm-view'); if (v) v.classList.remove('grab');
    if (!BMD) return; if (BMD.mode === 'pinch' && Object.keys(BMP).length > 0) return; var d = BMD; BMD = null;
    if (d.moved) { save(); return; }
    if (d.mode === 'pan' && e.button === 2) return;
    UI.bmSel = d.id; render();
  }
  document.addEventListener('pointerup', bmUp); document.addEventListener('pointercancel', function (e) { delete BMP[e.pointerId]; BMD = null; });
  document.addEventListener('wheel', function (e) {
    if (!e.target.closest || !e.target.closest('#bm-view')) return; var p = curProj(); if (!p) return; var M = p.map;
    M.zoom = Math.max(.4, Math.min(2.2, +((M.zoom || 1) + (e.deltaY < 0 ? .1 : -.1)).toFixed(2))); bmApply(M); save();
  }, { passive: true });
  function bmRecalc(p, id) {
    var f = bmFind(p.actions, id); if (!f) return;
    (function up(par) { if (!par) return; par.done = par.subs.every(function (q) { return q.done; }); var g = bmFind(p.actions, par.id); up(g && g.parent); })(f.parent);
    p.actions.forEach(function (a) { if (a.done && !a.doneDate) a.doneDate = today(); if (!a.done) a.doneDate = null; });
  }
  function bmSetAll(n, v) { n.done = v; (n.subs || []).forEach(function (s) { bmSetAll(s, v); }); }
  function projDetail(p) {
    var t = today(), pc = projPct(p), dn = p.actions.filter(function (a) { return a.done; }).length;
    var pts = [], labels = [];
    for (var i = 4; i >= 0; i--) {
      var d = addDays(t, -i);
      var cnt = p.actions.filter(function (a) { return a.done && (a.doneDate || t) <= d; }).length;
      pts.push(p.actions.length ? cnt / p.actions.length * 100 : 0);
      labels.push(i === 0 ? 'Сегодня' : fmtDM(d));
    }
    var todayDone = p.actions.filter(function (a) { return a.done && a.doneDate === t; }).length;
    var growth = p.actions.length ? todayDone / p.actions.length * 100 : 0;
    var pend = p.actions.filter(function (a) { return !a.done; }), dn2 = p.actions.filter(function (a) { return a.done; });
    var tab = UI.projTab || 'all', capP = (S.settings.caps && +S.settings.caps.p) || 3, plannedN = p.actions.filter(function (a) { return a.plan === t; }).length;
    function arow(a, depth) {
      depth = depth || 0;
      var kids = (a.subs || []).map(function (c) { return arow(c, depth + 1); }).join('');
      return '<div class="arow-wrap lv' + Math.min(depth, 4) + '"><div class="arow ' + (a.done ? 'done' : '') + '"><button class="check sm ' + (a.done ? 'on' : '') + '" data-action="node-toggle" data-id="' + a.id + '">' + (a.done ? ic('tick') : '') + '</button>' +
        '<span class="emo">' + esc(a.icon || (depth ? '•' : '🧩')) + '</span><span class="txt">' + esc(a.text) + '</span>' +
        (depth === 0 ? '<button class="ico-btn sm sun ' + (a.plan === t ? 'on' : '') + '" data-action="act-today" data-id="' + a.id + '" title="На сегодня">☀</button>' : '') +
        '<button class="ico-btn sm" data-action="act-edit" data-id="' + a.id + '" title="Изменить">' + ic('pencil') + '</button>' +
        '<button class="ico-btn sm" data-action="node-add" data-id="' + a.id + '" title="Добавить поддействие">＋</button>' +
        '<button class="ico-btn sm" data-action="node-del" data-id="' + a.id + '" title="Удалить">' + ic('trash') + '</button></div>' + (kids ? '<div class="psubs">' + kids + '</div>' : '') + '</div>';
    }
    var listSrc = tab === 'today' ? p.actions.filter(function (a) { return a.plan === t; }) : p.actions;
    var rowsA = listSrc.filter(function (a) { return !a.done; }).concat(listSrc.filter(function (a) { return a.done; })).map(arow).join('');
    var statusItems = ['active', 'frozen', 'done'].map(function (s) {
      return '<button data-action="proj-status" data-s="' + s + '">' + (p.status === s ? '✓ ' : '') + STATUS[s] + '</button>';
    }).join('');
    return '<div class="glass pdet' + (tab === 'map' ? ' map' : '') + '"><div class="pd-head"><div class="pd-ico">' + avatarOrIcon(p.avatar, p.icon, 'lg') +
      '<button class="ico-btn pen" data-action="proj-edit" title="Изменить">' + ic('pencil') + '</button></div>' +
      '<div class="pd-title"><h2>' + esc(p.name) + '</h2><p>' + esc(p.desc || 'Без описания') + '</p></div>' +
      '<div class="menu-wrap"><button class="ico-btn" data-action="menu-toggle">' + ic('dots') + '</button><div class="menu">' +
      '<button data-action="proj-edit">Редактировать</button>' + statusItems + '<button class="danger" data-action="proj-del">Удалить проект</button></div></div></div>' +
      '<div class="pd-stats"><div class="stat"><small>Прогресс</small><b>' + pc + '%</b></div><div class="stat"><small>Выполнено</small><b>' + dn + ' / ' + p.actions.length + '</b></div>' +
      '<div class="stat"><small>Статус</small><b>' + STATUS[p.status] + '</b></div></div>' +
      '<div class="pd-mid"><div class="glass inner"><h4>Прогресс проекта</h4>' + chartSvg({ id: 'ch-proj', pts: pts, labels: labels, ymax: 100, W: 520, H: 200 }) + '</div>' +
      '<div class="glass inner ring-box">' + ringSvg(pc, 140) + '<small class="gain">Рост за сегодня: +' + fmtPct(growth) + '%</small></div></div>' +
      '<div class="pd-tabs">' + '<div class="plan-tabs">' + [['all', 'Все действия'], ['today', 'На сегодня'], ['map', 'Ветка']].map(function (x) { return '<button class="tab sm ' + (tab === x[0] ? 'on' : '') + '" data-action="proj-tab" data-t="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' + '</div>' +
      (tab === 'map' ? '<div class="glass inner">' + bmHtml(p) + '</div>' :
      '<div class="pd-bot"><div class="glass inner plan"><div class="plan-head"><b>' + (tab === 'today' ? plannedN + ' / ' + capP : dn + ' / ' + p.actions.length) + '</b>' + (tab === 'today' ? '<button class="btn-soft sm" data-action="plan-auto">Подобрать на сегодня</button>' : '') + '</div>' +
      '<div class="progress"><i style="width:' + pc + '%"></i></div><div class="alist">' + rowsA + '</div>' +
      '<button class="btn-primary wide-b" data-action="act-add">＋ Действие</button></div>' +
      '<div class="glass inner det"><h4>Детали проекта</h4><ul><li>Всего действий: <b>' + p.actions.length + '</b></li><li>Начало: <b>' + fmtLong(p.created) + '</b></li>' +
      '<li>Статус: <b>' + STATUS[p.status] + '</b></li><li>Сегодня выполнено: <b>' + todayDone + '</b></li></ul></div></div>') + '</div>';
  }

  /* ---------- вид: Привычки ---------- */
  var WARN_SVG = '<svg viewBox="0 0 24 24"><path d="M12 3 L22 20 H2 Z" fill="#ffd23f" stroke="#ffd23f" stroke-width="2" stroke-linejoin="round"/><rect x="11" y="9" width="2" height="6" rx="1" fill="#3a3d4d"/><circle cx="12" cy="17.2" r="1.2" fill="#3a3d4d"/></svg>';
  function viewHabits() {
    var t = today(), ws = weekStart(t), hs = S.habits;
    var shown = hs.filter(function (h) { return UI.habFilter === 'all' || h.type === UI.habFilter; });
    var wd = 0, wt = 0;
    hs.forEach(function (h) { var w = habitWeek(h); wd += w.done; wt += w.el; });
    var wpct = wt ? Math.round(wd / wt * 100) : 0;
    var xpWeek = 0;
    hs.forEach(function (h) { for (var i = 0; i < 7; i++) if (h.log[addDays(ws, i)]) xpWeek += 5; });
    var header = DOW.map(function (d) { return '<i>' + d + '</i>'; }).join('');
    var rows = shown.length ? shown.map(function (h) {
      var w = habitWeek(h), pc = Math.round(w.done / w.el * 100);
      var cells = '';
      for (var i = 0; i < 7; i++) {
        var d = addDays(ws, i), on = !!h.log[d], fut = d > t;
        cells += '<button class="hc ' + (on ? 'on' : '') + (fut ? ' fut' : '') + '" ' + (fut ? 'disabled' : '') + ' data-action="hab-toggle" data-id="' + h.id + '" data-date="' + d + '">' + (on ? ic('tick') : '') + '</button>';
      }
      return '<div class="hrow' + (h.type === 'bad' ? ' bad' : '') + '"><span class="hemo">' + esc(h.icon) + '<span class="hb-ic ' + (h.type === 'bad' ? 'bad' : 'good') + '" title="' + (h.type === 'bad' ? 'Вредная привычка' : 'Полезная привычка') + '">' + (h.type === 'bad' ? WARN_SVG : ic('tick')) + '</span></span><div class="hn"><b>' + esc(h.name) + '</b><small>' + esc(h.goal || '') + '</small></div>' +
        '<div class="hcells">' + cells + '</div><span class="pct">' + pc + '%</span>' +
        '<button class="ico-btn sm" data-action="hab-edit" data-id="' + h.id + '">' + ic('pencil') + '</button>' +
        '<button class="ico-btn sm" data-action="hab-del" data-id="' + h.id + '">' + ic('trash') + '</button></div>';
    }).join('') : '<div class="empty">Привычек в этой категории пока нет.</div>';
    // кольца за 30 дней
    function rate(type) {
      var done = 0, tot = 0;
      hs.filter(function (h) { return h.type === type; }).forEach(function (h) {
        var from = h.created > addDays(t, -29) ? h.created : addDays(t, -29), n = diffDays(t, from) + 1;
        tot += 30; for (var i = 0; i < n; i++) { if (h.log[addDays(from, i)]) done++; }
      });
      return tot ? Math.round(done / tot * 100) : 0;
    }
    // аналитика 30 дней
    var pts = [], labels = [];
    for (var i = 29; i >= 0; i--) {
      var d = addDays(t, -i);
      var act = hs.filter(function (h) { return h.created <= d; });
      pts.push(act.length ? act.filter(function (h) { return h.log[d]; }).length / act.length * 100 : 0);
      labels.push(fmtDM(d));
    }
    // детальный отчёт
    var rd = UI.habDate, act = hs.filter(function (h) { return h.created <= rd; });
    var okL = act.filter(function (h) { return h.log[rd]; }), noL = act.filter(function (h) { return !h.log[rd]; });
    function li(h, ok) { return '<li class="' + (ok ? 'ok' : 'no') + '"><span class="dot"></span><span class="emo">' + esc(h.icon) + '</span>' + esc(h.name) + '</li>'; }
    var good = rate('good'), bad = rate('bad');
    var tabs = [['all', 'Все'], ['good', 'Полезные'], ['bad', 'Вредные']].map(function (f) {
      return '<button class="tab ' + (UI.habFilter === f[0] ? 'on' : '') + '" data-action="hab-filter" data-f="' + f[0] + '">' + f[1] + '</button>';
    }).join('');
    return '<div class="page-head"><span class="page-ico solid">' + ic('check') + '</span><div><h1 class="title">Привычки</h1><p class="sub2">Формируй полезные привычки.<br>Избавляйся от вредных.</p></div>' +
      '<div class="glass hstats"><div><b>' + wpct + '%</b><small>Общий прогресс за неделю</small></div><div><b>' + wd + ' / ' + wt + '</b><small>Выполнено за неделю</small></div><div><b>+' + xpWeek + '</b><small>XP за привычки</small></div></div></div>' +
      '<div class="hab-grid"><section class="glass hab-main"><div class="hm-head"><h3>Мои привычки</h3><button class="btn-primary" data-action="hab-add">＋ Добавить привычку</button></div>' +
      '<div class="tabs sm">' + tabs + '</div><div class="hdays">' + header + '</div><div class="hlist">' + rows + '</div></section>' +
      '<section class="glass hab-an"><h3>Аналитика привычек <small>30 дней</small></h3>' + chartSvg({ id: 'ch-hab', pts: pts, labels: labels, ymax: 100, W: 520, H: 220 }) + '</section>' +
      '<section class="glass hab-ring"><h3>Полезные привычки</h3><div class="rr">' + ringSvg(good, 104) + '<p>Выполнено<br>за 30 дней</p></div></section>' +
      '<section class="glass hab-ring"><h3>Вредные привычки</h3><div class="rr">' + ringSvg(bad, 104) + '<p>Воздержался<br>за 30 дней</p></div></section>' +
      '<section class="glass hab-rep"><div class="rep-head"><h3>Детальный отчёт</h3><div class="day-nav"><button class="ico-btn" data-action="hab-day" data-n="-1">' + ic('chevL') + '</button>' +
      '<input type="date" id="hab-date" value="' + rd + '" min="' + habMin() + '" max="' + t + '"><button class="ico-btn" data-action="hab-day" data-n="1">' + ic('chevR') + '</button></div></div>' +
      '<div class="rep-sum"><b>' + okL.length + ' из ' + act.length + '</b> привычек выполнено — ' + esc(fmtLong(rd)) + '</div>' +
      '<div class="rep-cols"><div><h5>Выполнено</h5><ul>' + (okL.map(function (h) { return li(h, true); }).join('') || '<li class="none">—</li>') + '</ul></div>' +
      '<div><h5>Не выполнено</h5><ul>' + (noL.map(function (h) { return li(h, false); }).join('') || '<li class="none">—</li>') + '</ul></div></div></section></div>';
  }

  /* ---------- вид: КПД ---------- */
  var CATS = [['t', 'Ежедневник', 'cal'], ['m', 'Избранное', 'trophy'], ['n', 'Заметки', 'chat'], ['p', 'Проекты', 'folder'], ['h', 'Привычки', 'check']];
  function kpdSeries() {
    var dd = daily(), t = today(), N = UI.kpdRange, idxs = [], step = N > 90 ? 7 : (N > 30 ? 3 : 1);
    for (var back = N - 1; back >= 0; back -= step) idxs.push(back);
    if (idxs[idxs.length - 1] !== 0) idxs.push(0);
    var keys = CATS.filter(function (c) { return UI.kpdCats[c[0]]; }).map(function (c) { return c[0]; });
    var pts = [], labels = [], mx = 0;
    idxs.forEach(function (b) {
      var d = addDays(t, -b), i = diffDays(d, dd.start), v = 0;
      if (i >= 0) keys.forEach(function (k) { v += contrib(dd, k, i, N); });
      pts.push(v); labels.push(fmtDM(d)); if (v > mx) mx = v;
    });
    return { pts: pts, labels: labels, ymax: niceMax(mx) };
  }
  function kpdNow() {
    var dd = daily(), last = dd.days.length - 1, v = 0;
    CATS.forEach(function (c) { if (UI.kpdCats[c[0]]) v += contrib(dd, c[0], last, UI.kpdRange); });
    return v;
  }
  function capsLevel(n) {
    return n <= 14 ? 'Лёгкий режим' : n <= 30 ? 'Средне — рекомендуется (около 20)' : n <= 60 ? 'Тяжело (около 40)' : n <= 80 ? 'Очень напряжённо' : 'Очень тяжело — почти нереально';
  }
  function capsCalc() {
    var o = capsRead(), n = 0, k;
    for (k in o) n += o[k];
    var t = $('#cap-total'), l = $('#cap-level');
    if (t) t.textContent = n + ' = 100%';
    if (l) { l.textContent = capsLevel(n); l.className = n <= 30 ? 'ok' : n <= 80 ? 'hard' : 'x'; }
  }
  function capsRead() {
    var o = {};
    $$('#modal [data-cap]').forEach(function (i) { var v = Math.round(+i.value); o[i.getAttribute('data-cap')] = Math.max(1, Math.min(40, isNaN(v) ? 1 : v)); });
    return o;
  }
  function capsModal() {
    var rows = CATS.map(function (c) {
      return '<label class="cap-row"><span class="cap-ic">' + ic(c[2]) + '</span><b>' + c[1] + '</b><input type="number" min="1" max="40" step="1" data-cap="' + c[0] + '" value="' + CAPS[c[0]] + '"><small>1–40</small></label>';
    }).join('');
    openModal('<h3>Нагрузка на день</h3><div class="cap-ref" style="margin-bottom:12px"><b>Что такое «нагрузка» и зачем она</b><p class="muted" style="margin:6px 0">Нагрузка — это норма на день: сколько заданий в каждой категории ты считаешь «полностью сделанной». Например, нагрузка 20 у Ежедневника значит: день по этой категории закрыт, когда выполнено все 20 заданий.</p><p class="muted" style="margin:6px 0">Как считается: какое бы число ты ни поставил, категория даёт свой 1 балл за день только после того, как выполнены <b>абсолютно все</b> задания по этой норме. Выполнил половину — получил половину балла, и так до полного. Пять категорий по 1 баллу = 5 баллов = 100% КПД дня.</p><p class="muted" style="margin:6px 0">Меньше нагрузка — проще набрать балл, больше — строже счёт. Подбери то, что реально можешь делать каждый день.</p></div>' + rows +
      '<div class="cap-sum"><span>Всего в день: <b id="cap-total"></b></span><em id="cap-level"></em></div>' +
      '<div class="cap-ref"><b>Подсказка</b><ul><li><i>20</i> — средняя нагрузка, рекомендуется</li><li><i>40</i> — тяжело</li><li><i>80+</i> — очень тяжело</li></ul>' +
      '<small>Прошлые дни пересчитаются по новым лимитам, остальное не меняется.</small></div>' +
      '<div class="modal-actions"><button class="btn-soft" data-action="caps-reset">По умолчанию</button><button class="btn-soft" data-action="modal-close">Отмена</button><button class="btn-primary" data-action="caps-save">Сохранить</button></div>');
    capsCalc();
  }
  /* шкала рангов: заполнение по всем рангам, тултип при наведении */
  function rankHtml(rk, tt) {
    var n = RANKS.length - 1, idx = RANKS.indexOf(rk.cur), pos = rk.next ? (idx + rk.prog) / n * 100 : 100;
    var tip = rk.next ? tt.xp + ' / ' + rk.next.xp + ' XP до ранга «' + rk.next.name + '»' : 'Максимальный ранг · ' + tt.xp + ' XP';
    return '<section class="glass rank"><small>Текущий ранг</small><h2>' + esc(rk.cur.name) + '</h2>' +
      '<p>' + (rk.next ? 'До ранга «' + esc(rk.next.name) + '» осталось ' + (rk.next.xp - tt.xp) + ' XP' : 'Максимальный ранг достигнут') + '</p>' +
      '<div class="xscale" data-tip="' + esc(tip) + '"><div class="xtrack"><i style="--w:' + pos.toFixed(1) + '%"></i></div>' +
      RANKS.map(function (r, i) {
        return '<span class="xnode' + (i <= idx ? ' got' : '') + (i === idx ? ' show' : '') + (i === 0 ? ' first' : i === n ? ' last' : '') + '" title="' + esc(r.name) + ' · ' + r.xp + ' XP" style="left:' + (i / n * 100) + '%"><b></b><small>' + esc(r.name) + '</small></span>';
      }).join('') + '</div></section>';
  }
  function xpHtml(tt) {
    return '<section class="glass xp"><span class="k-ic">' + ic('trophy') + '</span><div class="xp-main"><small>Общий опыт</small><b>' + tt.xp + ' <em>XP</em></b></div>' +
      '<span class="xp-badge">+' + xpToday() + ' XP сегодня</span></section>';
  }
  function viewKpd() {
    var tt = totals(), rk = rankInfo(tt.xp), si = streakInfo(), dd = daily(), last = dd.days.length - 1;
    var st = dayStats(today()), total = yearKpd(), ser = kpdSeries();
    var chk = CATS.map(function (c) {
      return '<button class="cbx ' + (UI.kpdCats[c[0]] ? 'on' : '') + '" data-action="kpd-cat" data-k="' + c[0] + '"><i>' + (UI.kpdCats[c[0]] ? ic('tick') : '') + '</i>' + c[1] + '</button>';
    }).join('');
    var ranges = [[7, '7д'], [30, '30д'], [90, '90д'], [365, 'Год']].map(function (r) {
      return '<button class="tab sm ' + (UI.kpdRange === r[0] ? 'on' : '') + '" data-action="kpd-range" data-r="' + r[0] + '">' + r[1] + '</button>';
    }).join('');
    var brk = CATS.map(function (c) {
      var k = c[0], cv = contrib(dd, k, last, UI.kpdRange), fill = Math.min(100, cv * 5);
      return '<div class="b-row"><span class="b-ic">' + ic(c[2]) + '</span><div class="b-main"><div class="b-top"><b>' + c[1] + '</b><em>до ' + CAPS[k] + ' в день</em>' +
        '<span class="b-today">сегодня ' + st[k] + ' / ' + CAPS[k] + '</span></div><div class="progress big"><i style="width:' + fill + '%"></i></div></div>' +
        '<div class="b-val"><b>' + fmtPct(fill) + '%</b><small>+' + fmtPct(cv) + '% к КПД</small></div></div>';
    }).join('');
    var formula = CATS.map(function (c) { return '<span>' + c[1].replace(' с собой', '') + ' <b>' + CAPS[c[0]] + '</b></span>'; }).join('');
    return '<div class="page-head"><span class="page-ico">' + ic('bars') + '</span><div><h1 class="title">Статистика КПД</h1><p class="sub2">Твой прогресс. Вся картина в одном месте.</p></div></div>' +
      '<div class="kpd-grid' + (UI.fresh ? ' fresh' : '') + '">' + rankHtml(rk, tt) + xpHtml(tt) +
      '<section class="glass dyn"><div class="dyn-head"><div><h3>Динамика КПД</h3><div class="dyn-now">Сейчас: <b id="kpd-now">' + fmtPct(kpdNow()) + '%</b></div></div><div class="tabs sm">' + ranges + '</div></div>' +
      '<div class="cbxs">' + chk + '</div>' +
      chartSvg({ id: 'ch-kpd', pts: ser.pts, labels: ser.labels, ymax: ser.ymax, W: 640, H: 215 }) + '</section>' +
      '<section class="glass brk"><div class="brk-head"><h3>Разбивка по категориям</h3><span>Общий КПД за период: <b>' + fmtPct(kpdNow()) + '%</b></span><button class="btn-soft sm" data-action="caps-edit">Настроить нагрузку</button></div>' +
      '<div class="formula"><div class="f-top"><b>Формула дня</b><span>5 категорий = 5 очков = 100%</span><small class="f-lvl">' + capsLevel(DAY_MAX) + '</small><em>Сегодня: ' + st.total + ' из ' + DAY_MAX + ' · ' + fmtPct(st.pct) + '%</em></div><div class="f-chips">' + formula + '</div></div>' +
      '<div class="b-list">' + brk + '</div></section>' +
      '<section class="glass keys"><h3>Ключевая статистика</h3><div class="key-row">' +
      '<div class="key"><span class="k-ic fire">' + FLAME('mini') + '</span><div><b>' + si.streak + '</b><small>дней серии</small></div></div>' +
      '<div class="key"><span class="k-ic">' + ic('check') + '</span><div><b>' + tt.count + '</b><small>выполненных действий</small></div></div></div></section>' +
      '</div>';
  }
  function kpdUpdateChart() {
    var s = kpdSeries();
    chartPatch({ id: 'ch-kpd', pts: s.pts, ymax: s.ymax, W: 760, H: 290 });
    var n = $('#kpd-now'); if (n) n.textContent = fmtPct(kpdNow()) + '%';
  }

  /* ---------- вид: Разговоры с собой ---------- */
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function viewNotes() {
    if (!UI.noteMonth) { var n = parse(UI.noteDate); UI.noteMonth = [n.getFullYear(), n.getMonth()]; }
    var cnt = {};
    S.notes.forEach(function (x) { cnt[x.date] = (cnt[x.date] || 0) + 1; });
    var t = today();
    var cal = calHtml(UI.noteMonth[0], UI.noteMonth[1], function (s) {
      var c = [], k = cnt[s] || 0;
      if (k) c.push(k >= 4 ? 'heat3' : k >= 2 ? 'heat2' : 'heat1');
      if (s === t) c.push('today');
      if (s === UI.noteDate) c.push('sel');
      return { cls: c.join(' '), attr: 'data-action="note-day" data-date="' + s + '"' };
    }, 'ncal');
    var recent = Object.keys(cnt).sort().reverse().slice(0, 5).map(function (d) {
      return '<button class="dl ' + (d === UI.noteDate ? 'on' : '') + '" data-action="note-day" data-date="' + d + '"><span>' + fmtLong(d) + '</span><em>' + cnt[d] + '</em></button>';
    }).join('') || '<div class="empty sm">Записей пока нет</div>';
    var entries = S.notes.filter(function (x) { return x.date === UI.noteDate; }).sort(function (a, b) { return (a.at || 0) - (b.at || 0) || (a.time < b.time ? -1 : 1); });
    var editing = entries.filter(function (x) { return x.id === UI.noteEditId; })[0];
    var isT = UI.noteDate === t;
    var el = entries.length ? entries.map(function (x) {
      return '<article class="entry2"><div class="e2-top"><span>' + esc(x.time || '') + '</span>' + (!isT ? '' : '<div class="acts"><button class="ico-btn sm" data-action="note-edit" data-id="' + x.id + '" title="Редактировать">' + ic('pencil') + '</button>' +
        '<button class="ico-btn sm" data-action="note-del" data-id="' + x.id + '" title="Удалить">' + ic('trash') + '</button></div>') + '</div><p>' + esc(x.text) + '</p></article>';
    }).join('') : '<div class="nm-empty"><div class="ne-ico">' + ic('chat') + '</div><b>В этот день записей нет</b><span>' + (isT ? 'Напиши что-нибудь для себя — мысль, итог дня, план.' : 'Прошлые дни только для чтения.') + '</span></div>';
    var d = parse(UI.noteDate), k = entries.length;
    return '<div class="notes2"><aside class="glass nside"><div class="ns-head"><h3>Дневник</h3><button class="btn-soft sm" data-action="note-today">Сегодня</button></div>' +
      '<div class="ns-stats"><div><b>' + S.notes.length + '</b><small>' + plural(S.notes.length, ['запись', 'записи', 'записей']) + '</small></div><div><b>' + Object.keys(cnt).length + '</b><small>' + plural(Object.keys(cnt).length, ['день', 'дня', 'дней']) + '</small></div></div>' +
      talkCard() + cal +
      '<h5>Последние дни</h5><div class="dlist">' + recent + '</div></aside>' +
      '<section class="glass nmain ns-' + (S.settings.nstyle || 'plain') + '"><div class="nm-head"><div><h1 class="nm-title">' + fmtLong(UI.noteDate) + '</h1><div class="nm-sub">' + cap1(WD_FULL[d.getDay()]) + (UI.noteDate === t ? ' · сегодня' : '') + '</div></div>' +
      '<span class="nm-count">' + k + ' ' + plural(k, ['запись', 'записи', 'записей']) + '</span></div>' +
      '<div class="nm-list">' + el + '</div>' +
      (!isT ? '<div class="ro-note">Прошлые дни только для чтения — писать можно только сегодня.</div>' : '<div class="composer"><label>' + (editing ? 'Редактирование записи' : 'Новая запись') + '</label><textarea id="note-text" rows="3" maxlength="5000" placeholder="О чём ты думаешь сегодня?">' + esc(editing ? editing.text : '') + '</textarea>' +
      '<div class="cmp-foot"><span class="cmp-hint">Enter — сохранить · Shift+Enter — новая строка</span><div class="ed-act">' + (editing ? '<button class="btn-soft sm" data-action="note-cancel">Отмена</button>' : '') + '<button class="btn-primary" data-action="note-save">Сохранить запись</button></div></div></div>') + '</section></div>';
  }

  /* ---------- вид: Настройки ---------- */
  var SKINS = [['violet', 'Фиолетовый', '#9a7bff'], ['blue', 'Синий', '#4d8dff'], ['cyan', 'Голубой', '#4fc8ff'], ['pink', 'Розовый', '#ff7bc8']];
  var LOOK_IDLE = ['#ffffff', '#9aa3d6', '#5b6cff', '#2fc4ff', '#ff5fb0', '#ffb347', '#6f7685'];
  var LOOK_ACC = ['#5b6cff', '#8a5cff', '#3f9bff', '#2fc4ff', '#ff5fb0', '#ff8a3d', '#ff5470'];
  var LOOK_TXT = ['#eaedff', '#ffffff', '#bcd2ff', '#ffe9b5', '#ffd0f0'];
  var LOOK_TXT_L = ['#1b2040', '#000000', '#2b3a8c', '#4a2a7a', '#6a2a3a'];   // цвета надписей для светлого фона
  var LOOK_BG = ['#0a1038', '#0b0b1f', '#121038', '#08162e', '#1a0a2e', '#101114'];
  var LOOK_GRAD = ['#8fa2ff', '#5be0ff', '#ffb347', '#ff8bd0', '#ffe066', '#ffffff'];
  var LOOK_DEF = { textOpacity: 100, textGlow: 0, textGrad: false, textGradA: '#8fa2ff', textGradB: '#e0a8ff' };
  function swatches(key, list, cur) {
    return '<div class="sw-row">' + list.map(function (c) {
      return '<button class="sw ' + (cur === c ? 'on' : '') + '" style="background:' + c + '" data-action="look-set" data-k="' + key + '" data-v="' + c + '"></button>';
    }).join('') + '<label class="sw custom" title="Свой цвет"><input type="color" data-look="' + key + '" value="' + (cur || list[0]) + '"><span>+</span></label></div>';
  }
  function segRow(title, sub, key, opts) {
    var cur = (S.settings[key] == null ? opts[0][0] : S.settings[key]);
    return '<div class="look-row"><div class="lk-l"><b>' + title + '</b><small>' + sub + '</small></div><div class="seg">' + opts.map(function (o) {
      return '<button class="seg-b ' + (cur === o[0] ? 'on' : '') + '" data-action="set-s" data-k="' + key + '" data-s="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div></div>';
  }
  function dotRow(title, sub, key, map) {
    var cur = S.settings[key];
    return '<div class="look-row"><div class="lk-l"><b>' + title + '</b><small>' + sub + '</small></div><div class="dots">' + Object.keys(map).map(function (k) {
      var c = map[k], bg = Array.isArray(c) ? 'linear-gradient(135deg,' + c[0] + ',' + c[1] + ',' + c[2] + ')' : c;
      return '<button class="dot ' + (cur === k ? 'on' : '') + '" style="background:' + bg + '" data-action="set-s" data-k="' + key + '" data-s="' + k + '"></button>';
    }).join('') + '</div></div>';
  }
  function modelModal() {
    var mine = S.models.map(function (m) {
      return '<div class="mdl"><div class="mdl-pic"><img src="' + m.data + '" alt=""></div><span>' + esc(m.name) + '</span>' +
        '<button class="ico-btn sm mdl-x" data-action="model-del" data-m="' + m.id + '" title="Удалить">' + ic('trash') + '</button></div>';
    }).join('') || '<div class="empty sm">Своих моделей пока нет</div>';
    function ovGrid(list) { return list.map(function (k) { return '<div class="mdl" data-action="ov-add" data-m="' + k + '"><div class="mdl-pic">' + modelInner(k) + '</div><span>＋ ' + (MODEL_NAMES[k] || (byId(S.models, k) || {}).name || '') + '</span></div>'; }).join(''); }
    var allKeys = Object.keys(MODELS).concat(S.models.map(function (m) { return m.id; }));
    openModal('<h3>Модельки</h3><h5>Ваши модельки</h5><div class="mdl-grid">' + mine + '</div>' +
      '<h5>Наложить на экран (можно несколько, двигать, крутить, менять размер)</h5><div class="mdl-grid">' + ovGrid(allKeys) + '</div>' +
      '<button class="btn-soft" data-action="model-add">Добавить модельку</button>' +
      '<div class="mdl-help"><b>Требования к своей модельке</b>PNG, WebP или SVG с прозрачным фоном, квадрат (рекомендуем 512×512, минимум 128×128, до 2 МБ). Объект по центру с небольшим полем со всех сторон. Изображение автоматически приводится к 256×256 и стабилизируется — без искажений пропорций. Добавлять и менять модельки можно только в Ежедневнике.</div>' +
      '<div class="modal-actions"><button class="btn-soft" data-action="modal-close">Закрыть</button></div>', true);
  }
  function taRead() {
    var T = UI.ta, i = $('#ta-text'); if (T && i) T.text = i.value;
  }
  function taskModal() {
    var T = UI.ta; T.cx = true;
    var n = T.subs.length, lvl = n >= 10 ? 'hard' : n > 5 ? 'mid' : 'easy';
    function chk(act, on, label, sub) { return '<button type="button" class="ta-chk ' + (on ? 'on' : '') + '" data-action="' + act + '"><i>' + (on ? ic('tick') : '') + '</i><span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></button>'; }
    openModal('<h3>' + (T.id ? 'Изменить действие' : 'Новое действие') + '</h3>' +
      '<div class="fld"><span>1. Название</span><input id="ta-text" maxlength="120" value="' + esc(T.text) + '" placeholder="Что нужно сделать"></div>' +
      '<div class="fld"><span>2. Стикер (необязательно, нажми ещё раз — убрать)</span><div class="icon-grid">' + ICONS.map(function (e) { return '<button type="button" class="ico-pick ' + (T.icon === e ? 'on' : '') + '" data-action="ta-icon" data-emo="' + e + '">' + e + '</button>'; }).join('') + '</div></div>' +
      (T.cx ? '<div class="fld"><span>3. Поддействия (необязательно · 3 очка вместо 1)' + (n ? ' · ' + n : '') + '</span><div class="ta-subs">' + T.subs.map(function (s, i) {
        return '<div class="ta-sub"><em>' + (i + 1) + '</em><span>' + esc(s) + '</span><button type="button" class="ico-btn sm" data-action="ta-sub-del" data-i="' + i + '">' + ic('trash') + '</button></div>'; }).join('') +
        '</div><div class="ta-add"><input id="ta-sub" maxlength="120" placeholder="Новое поддействие"><button type="button" class="btn-soft sm" data-action="ta-sub-add">Добавить</button></div>' +
        chk('ta-ind', T.ind, 'Индикатор сложности', 'До 5 поддействий — тёмно-зелёный, больше 5 — тёмно-оранжевый, 10 и больше — тёмно-красный') +
        (T.ind && n ? '<div class="ta-lvl"><i class="lvl ' + lvl + '"></i> Сейчас: ' + (lvl === 'hard' ? 'тяжёлое' : lvl === 'mid' ? 'среднее' : 'лёгкое') + '</div>' : '') + '</div>' : '') +
      '<div class="fld">' + chk('ta-pin', T.pin, 'Закрепить', 'Будет появляться каждый день автоматически') + '</div>' +
      '<div class="modal-actions"><button class="btn-soft" data-action="modal-close">Отмена</button><button class="btn-primary" data-action="ta-save">Сохранить</button></div>', true);
  }
  function langRow() { return segRow('Язык / Language', 'Язык интерфейса', 'lang', [['ru', 'Русский'], ['en', 'English']]); }
  function settingsAll() {
    return '<div class="page-head"><span class="page-ico">' + ic('gear') + '</span><div><h1 class="title">Настройки</h1></div></div>';
  }
  var STY_TABS = [['text', '🔤', 'Текст'], ['flame', '🔥', 'Огонёк'], ['gfx', '🧊', 'Настройки графики'], ['greet', '👋', 'Приветствие'], ['bg', '🌌', 'Фон']];
  function lrow(title, right, cls) { return '<div class="look-row' + (cls ? ' ' + cls : '') + '"><div class="lk-l"><b>' + title + '</b></div>' + right + '</div>'; }
  function segOpts(key, opts, act, cur) {
    return '<div class="seg">' + opts.map(function (o) { return '<button class="seg-b ' + (cur === o[0] ? 'on' : '') + '" data-action="' + (act || 'set-s') + '" ' + (act ? '' : 'data-k="' + key + '" ') + 'data-s="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
  }
  function stylePane(tab) {
    var st = S.settings, L = st.look || {}, LD = Object.assign({}, LOOK_DEF, L), gfx = st.gfx || '3d', preset = st.bgPreset || 'custom', light = preset === 'light-matte', tb = L.textBright || 0, bgOp = L.bgOpacity == null ? 60 : L.bgOpacity, h = '';
    if (tab === 'text') {
      h += lrow('Цвет надписей', '<div class="lk-r">' + swatches(light ? 'textL' : 'text', light ? LOOK_TXT_L : LOOK_TXT, light ? (L.textL || LOOK_TXT_L[0]) : (L.text || LOOK_TXT[0])) +
        '<div class="rng"><span>' + (light ? 'Затемнение' : 'Яркость') + '</span><input type="range" min="0" max="100" value="' + tb + '" data-look="textBright"><b class="rv">' + tb + '%</b></div></div>');
      h += lrow('Прозрачность текста', '<div class="lk-r"><div class="rng"><span>Непрозрачность</span><input type="range" min="30" max="100" value="' + LD.textOpacity + '" data-look="textOpacity"><b class="rv">' + LD.textOpacity + '%</b></div></div>');
      h += lrow('Свечение текста', '<div class="lk-r"><div class="rng"><span>Сила</span><input type="range" min="0" max="100" value="' + LD.textGlow + '" data-look="textGlow"><b class="rv">' + LD.textGlow + '%</b></div></div>', gfx === '2d' ? 'dis' : '');
      h += lrow('Перелив текста', '<div class="lk-r"><div class="set-row"><span class="muted">' + (LD.textGrad ? 'Включён' : 'Выключен') + '</span><button class="switch ' + (LD.textGrad ? 'on' : '') + '" data-action="look-tgrad"><i></i></button></div>' +
        (LD.textGrad ? swatches('textGradA', LOOK_GRAD, LD.textGradA) + swatches('textGradB', LOOK_GRAD, LD.textGradB) : '') + '</div>', gfx === '2d' ? 'dis' : '');
      h += lrow('Тень текста', segOpts('', [['off', 'Без тени'], ['soft', 'Мягкая'], ['full', 'Объёмная']], 'set-tsh', st.tsh || 'soft'), gfx === '2d' ? 'dis' : '');
      h += lrow('Шрифт цитат', segOpts('', [['normal', 'Обычный'], ['serif', 'Курсив'], ['hand', 'Рукописный'], ['bold', 'Жирный']], 'set-qfont', st.qfont || 'normal'));
    } else if (tab === 'flame') {
      h += segRow('Огонёк серии', '', 'flame', [['1', 'Классика'], ['2', 'Капля'], ['3', 'Искра']]);
      h += dotRow('Цвет огонька', '', 'flameCol', FL_COLS);
      h += segRow('Эффект огонька', '', 'flameFx', [['plain', 'Обычный'], ['glow', 'Свечение'], ['shimmer', 'Переливающийся матовый']]);
      h += dotRow('Цвет выполненных дней', '', 'doneCol', DONE_COLS);
    } else if (tab === 'gfx') {
      h += lrow('Оформление интерфейса', segOpts('', [['concept', 'Концепт'], ['classic', 'Классика']], 'set-ui', st.ui || 'concept'));
      h += lrow('Режим графики', segOpts('', [['3d', '3D'], ['2d', '2D']], 'set-gfx', gfx));
      h += segRow('Размытие стекла', '', 'blur', [['off', 'Выкл (быстро)'], ['on', 'Вкл']]);
      h += lrow('Цвет кнопок (нажатых, акцент)', swatches('accent', LOOK_ACC, L.accent));
      h += lrow('Цвет обычных кнопок и вкладок', swatches('idle', LOOK_IDLE, L.idle) + (L.idle ? '<button class="btn-soft sm" data-action="look-set" data-k="idle" data-v="">Сбросить</button>' : ''));
      h += lrow('Размер интерфейса', segOpts('', [['small', 'Маленький'], ['medium', 'Средний'], ['large', 'Крупный']], 'set-size', st.size));
      h += langRow();
      h += '<div class="look-row"><div class="lk-l"><b>Сброс стилей</b></div><button class="btn-soft sm" data-action="look-reset">Сбросить</button></div>';
    } else if (tab === 'greet') {
      h += segRow('Приветствие', '', 'greet', [['auto', 'Каждый день новое'], ['0', '1'], ['1', '2'], ['2', '3'], ['3', '4'], ['4', '5']]);
      h += segRow('Стиль задач', '', 'pad', [['glass', 'Стекло'], ['lined', 'Блокнот'], ['neon', 'Неон'], ['kraft', 'Крафт']]);
      h += segRow('Стиль дневника', '', 'nstyle', [['plain', 'Простой'], ['notebook', 'Блокнот'], ['jelly', 'Мармелад'], ['neon', 'Неон']]);
      h += segRow('Шрифт дневника', '', 'nfont', [['normal', 'Обычный'], ['serif', 'Курсив'], ['hand', 'Рукописный'], ['mono', 'Печатный']]);
      h += segRow('Таймер общения', '', 'tview', [['both', 'Оба'], ['glass', 'Песочные часы'], ['dial', 'Циферблат']]);
    } else {
      h += lrow('Фон приложения', segOpts('', [['silk', 'Шёлк (концепт)'], ['dark-matte', 'Тёмный матовый'], ['light-matte', 'Белый матовый'], ['custom', 'Свой градиент']], 'set-bgpreset', preset));
      if (preset === 'custom') h += lrow('Основной цвет фона', swatches('bg', LOOK_BG, L.bg));
      h += lrow('Фоновое изображение', '<div class="lk-r"><div class="bg-pick"><span class="bg-prev">' + (L.bgImage ? '<img src="' + L.bgImage + '" alt="">' : ic('photo')) + '</span><button class="btn-soft sm" data-action="bg-pick">Выбрать изображение</button>' +
        (L.bgImage ? '<button class="btn-soft sm" data-action="bg-edit">✥ Положение и размер</button><button class="btn-soft sm" data-action="bg-clear">Убрать</button>' : '') + '</div><div class="rng"><span>Прозрачность фона</span><input type="range" min="0" max="100" value="' + bgOp + '" data-look="bgOpacity"><b class="rv">' + bgOp + '%</b></div></div>');
      h += lrow('Анимация фона', segOpts('', [['waves', 'Волны'], ['snow', 'Снег'], ['rain', 'Дождь'], ['none', 'Нет']], 'set-fx', st.fx || 'waves'));
      if ((st.fx || 'waves') === 'waves') h += lrow('Скин (цвет волн)', '<div class="skins">' + SKINS.map(function (s) {
        return '<button class="skin ' + (st.skin === s[0] ? 'on' : '') + '" data-action="set-skin" data-s="' + s[0] + '"><i style="background:' + s[2] + '"></i>' + s[1] + '</button>'; }).join('') + '</div>');
    }
    return h;
  }
  function stylesHtml() {
    var tab = UI.stylesTab || 'text';
    return '<div class="sty-head"><h3>Настройки стиля</h3><button class="btn-primary sm" data-action="modal-close">Готово</button></div>' +
      '<div class="sty"><nav class="sty-nav">' + STY_TABS.map(function (t) { return '<button class="sty-tab ' + (t[0] === tab ? 'on' : '') + '" data-action="sty-tab" data-t="' + t[0] + '"><i>' + t[1] + '</i>' + t[2] + '</button>'; }).join('') +
      '</nav><div class="sty-body">' + stylePane(tab) + '</div></div>';
  }
  function viewSettings() {
    return settingsAll() + '<div class="set-grid">' +
      '<section class="glass set wide2"><div class="set-row"><div><h3>Стили</h3></div><button class="btn-primary" data-action="styles-open">Открыть стили</button></div></section>' +
      '<section class="glass set"><div class="set-row"><div><h3>Уведомления</h3></div>' +
      '<button class="switch ' + (S.settings.notifications ? 'on' : '') + '" data-action="set-notif"><i></i></button></div></section>' +
      '<section class="glass set wide2"><div class="set-row"><div><h3>Синхронизация ПК ⇄ телефон</h3><p class="muted" id="cloud-state">' + esc(cloudLabel(true)) + '</p></div><div class="set-btns"><button class="btn-soft" data-action="cloud-cfg">Сервер</button>' + (cloudOn() ? '<button class="btn-primary" data-action="cloud-now">Синхронизировать</button>' : '') + '</div></div></section>' +
      '<section class="glass set wide2"><h3>Профиль</h3><div class="set-row"><div class="prof"><span class="avatar big">' + (S.profile.avatar ? '<img src="' + S.profile.avatar + '" alt="">' : '<span>' + esc((USER || '?').charAt(0).toUpperCase()) + '</span>') + '</span><b>' + esc(USER) + '</b></div>' +
      '<div class="set-btns"><button class="btn-soft" data-action="avatar-pick">Сменить аватарку</button><button class="btn-soft" data-action="logout">Выйти</button></div></div></section>' +
      '<section class="glass set wide2 danger-zone"><div class="set-row"><div><h3>Сброс прогресса</h3></div>' +
      '<button class="btn-danger" data-action="reset-all">Сбросить весь прогресс</button></div></section></div>';
  }
  function stylesModal() { UI.stylesOpen = true; openModal(stylesHtml(), true); var mc = $('#modal .modal-card'); if (mc) { mc.classList.add('xwide', 'sty-card'); mc.classList.remove('glass'); } }
  function stylesRefresh() {
    var card = $('#modal .modal-card'); if (!card) return; var b = card.querySelector('.sty-body'), sc = b ? b.scrollTop : 0;
    card.innerHTML = stylesHtml(); b = card.querySelector('.sty-body'); if (b) b.scrollTop = sc;
  }
  function bgTf(L) { return 'translate(' + (L.bgX || 0) + '%,' + (L.bgY || 0) + '%) rotate(' + (L.bgRot || 0) + 'deg) scale(' + ((L.bgScale || 100) / 100) + ')'; }
  /* редактор положения фона: двигать / вращать / масштабировать на самом фоне */
  var BE = null;
  function bgEditStart() {
    var L = S.settings.look; if (!L.bgImage) return; closeModal();
    var ov = document.createElement('div'); ov.id = 'bg-edit';
    ov.innerHTML = '<div class="be-box" id="be-box"><span class="be-rs"></span><span class="be-rot"></span></div><div class="be-bar glass"><b>Фон</b><label class="be-op">Прозрачность <input type="range" min="0" max="100" id="be-op" value="' + (L.bgOpacity == null ? 60 : L.bgOpacity) + '"><i id="be-ov"></i></label><button class="btn-soft sm" data-action="bg-edit-reset">Сбросить</button><button class="btn-primary sm" data-action="bg-edit-done">Готово</button></div>';
    document.body.appendChild(ov); BE = { mode: null }; bgEditSync();
  }
  function bgEditSync() {
    var L = S.settings.look, bx = $('#be-box'); if (!bx) return; bx.style.transform = bgTf(L); var ov = $('#be-ov'); if (ov) ov.textContent = (L.bgOpacity == null ? 60 : L.bgOpacity) + '%';
  }
  function bgEditEnd() { var ov = $('#bg-edit'); if (ov) ov.remove(); BE = null; save(); stylesModal(); }
  document.addEventListener('pointerdown', function (e) {
    if (!BE || !e.target.closest('#be-box')) return; var L = S.settings.look, W = innerWidth, Hh = innerHeight, cx = W / 2 + (L.bgX || 0) / 100 * W, cy = Hh / 2 + (L.bgY || 0) / 100 * Hh;
    BE = { mode: e.target.closest('.be-rs') ? 'sc' : e.target.closest('.be-rot') ? 'rot' : 'mv', sx: e.clientX, sy: e.clientY, cx: cx, cy: cy, x0: L.bgX || 0, y0: L.bgY || 0, s0: L.bgScale || 100, r0: L.bgRot || 0, d0: Math.hypot(e.clientX - cx, e.clientY - cy) || 1, a0: Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI, W: W, H: Hh };
    e.preventDefault(); try { e.target.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
  });
  document.addEventListener('pointermove', function (e) {
    if (!BE || !BE.mode) return; var L = S.settings.look;
    if (BE.mode === 'mv') { L.bgX = +(BE.x0 + (e.clientX - BE.sx) / BE.W * 100).toFixed(2); L.bgY = +(BE.y0 + (e.clientY - BE.sy) / BE.H * 100).toFixed(2); }
    else if (BE.mode === 'sc') L.bgScale = Math.round(Math.max(30, Math.min(500, BE.s0 * Math.hypot(e.clientX - BE.cx, e.clientY - BE.cy) / BE.d0)));
    else { var a = Math.atan2(e.clientY - BE.cy, e.clientX - BE.cx) * 180 / Math.PI; L.bgRot = Math.round(BE.r0 + a - BE.a0); if (e.shiftKey) L.bgRot = Math.round(L.bgRot / 15) * 15; }
    var pic = $('#bg-img img'); if (pic) pic.style.transform = bgTf(L); bgEditSync();
  });
  document.addEventListener('pointerup', function () { if (BE && BE.mode) { BE.mode = null; save(); } });
  document.addEventListener('input', function (e) { if (e.target.id === 'be-op' && S) { S.settings.look.bgOpacity = +e.target.value; var im = $('#bg-img'); if (im) im.style.opacity = String(+e.target.value / 100); bgEditSync(); } });
  function applyLook() {
    var L = (S && S.settings && S.settings.look) || {}, st = document.body.style;
    function set(k, v) { if (v) st.setProperty(k, v); else st.removeProperty(k); }
    set('--idle', L.idle || ''); document.body.setAttribute('data-idle', L.idle ? '1' : '');
    if (L.accent) { set('--acc1', L.accent); set('--acc2', hueShift(L.accent, 32)); } else { set('--acc1', ''); set('--acc2', ''); }
    var preset = (S && S.settings.bgPreset) || 'custom', light = preset === 'light-matte', custom = preset === 'custom';
    var op = Math.max(30, Math.min(100, L.textOpacity == null ? 100 : L.textOpacity)) / 100;      // clamp 30–100
    var glow = Math.max(0, Math.min(100, L.textGlow || 0)), gpx = Math.round(glow * .3);
    var base = light ? (L.textL || '#1b2040') : (L.text || '#eaedff');
    var hasT = !!(light ? L.textL : L.text) || !!L.textBright, tc = mixc(base, light ? '#000000' : '#ffffff', (L.textBright || 0) / 100);
    var bg = light ? '#e9ecf3' : (custom ? (L.bg || '#0a1038') : '#14161b');
    var tOn = light || hasT || op < 1;
    set('--text', tOn ? rgba(tc, op) : '');
    set('--muted', tOn ? rgba(mixc(tc, bg, .36), op) : '');
    set('--text-opacity', String(op));
    set('--text-glow', gpx ? gpx + 'px' : '');
    set('--tglow-col', gpx ? rgba(tc, .35 + glow / 200) : '');
    set('--tshadow', gpx ? '0 0 ' + gpx + 'px ' + rgba(tc, .35 + glow / 200) : '');
    set('--text-gradient-a', L.textGradA || '#8fa2ff');
    set('--text-gradient-b', L.textGradB || '#e0a8ff');
    document.body.setAttribute('data-tgrad', L.textGrad ? 'on' : 'off');
    set('--bgA', custom && L.bg ? mixc(L.bg, '#000000', .6) : '');
    set('--bgB', custom ? (L.bg || '') : '');
    set('--bgD', custom && L.bg ? mixc(L.bg, '#000000', .35) : '');
    set('--bgC', custom && L.bg ? mixc(L.bg, '#000000', .75) : '');
    var im = $('#bg-img');
    if (im) {
      var pic = im.firstChild;
      if (L.bgImage) { if (!pic) { pic = document.createElement('img'); pic.alt = ''; pic.decoding = 'async'; pic.draggable = false; im.appendChild(pic); } if (pic.getAttribute('data-s') !== String(L.bgImage.length)) { pic.src = L.bgImage; pic.setAttribute('data-s', String(L.bgImage.length)); } pic.style.transform = bgTf(L); }
      else if (pic) im.removeChild(pic);
      im.style.opacity = L.bgImage ? String((L.bgOpacity == null ? 60 : L.bgOpacity) / 100) : '0';
    }
  }

  /* ---------- отрисовка ---------- */

  /* ---------- таймер «Разговоры с собой» ---------- */
  function talkSecs(d) { return (S.talk && S.talk[d]) || 0; }
  var IDLE_MS = 120000;                                     // нет активности 2 минуты — время не копится
  UI.lastAct = Date.now();
  function talkLive() { if (!UI.talkStart) return 0; var end = Math.min(Date.now(), (UI.lastAct || Date.now()) + IDLE_MS); return Math.max(0, Math.floor((end - UI.talkStart) / 1000)); }
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].concat([]).forEach(function (ev) { document.addEventListener(ev, function () { if (UI.talkStart && Date.now() - UI.lastAct > IDLE_MS) { talkCommit(); UI.talkStart = Date.now(); } UI.lastAct = Date.now(); }, true); });
  var mvT = 0; document.addEventListener('pointermove', function () { var n = Date.now(); if (n - mvT < 1500) return; mvT = n; if (UI.talkStart && n - UI.lastAct > IDLE_MS) { talkCommit(); UI.talkStart = n; } UI.lastAct = n; }, true);
  function talkCommit() {
    if (!UI.talkStart) return;
    var sec = talkLive(); if (sec < 1) return;
    var day = UI.talkDay || today(), before = talkSecs(day);
    S.talk[day] = before + sec;
    UI.talkStart = Date.now();
    var gain = Math.floor(S.talk[day] / (TALK_UNIT * 60)) - Math.floor(before / (TALK_UNIT * 60));
    save();
    if (gain > 0) gainToast('Время с собой: +' + TALK_UNIT * gain + ' мин', gain);
  }
  function fmtClock(s) { return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60); }
  var HG_GLASS = 'M10 6H50V14C50 28 34 36 34 45C34 54 50 62 50 76V84H10V76C10 62 26 54 26 45C26 36 10 28 10 14Z';
  function talkCard() {
    var ticks = '';
    for (var i = 0; i < 12; i++) ticks += '<line x1="35" y1="5" x2="35" y2="' + (i % 3 ? 8 : 10) + '" transform="rotate(' + i * 30 + ' 35 35)"/>';
    return '<div class="talk glass-in"><div class="tk-top"><svg class="hg" viewBox="0 0 60 90"><defs><clipPath id="hgc"><path d="' + HG_GLASS + '"/></clipPath></defs>' +
      '<g clip-path="url(#hgc)"><rect id="hgT" class="sand" x="0" y="6" width="60" height="39"/><rect id="hgB" class="sand" x="0" y="84" width="60" height="0"/></g>' +
      '<line id="hgS" class="stream" x1="30" y1="45" x2="30" y2="84"/><path class="hg-glass" d="' + HG_GLASS + '"/><rect class="hg-cap" x="6" y="2" width="48" height="5" rx="2"/><rect class="hg-cap" x="6" y="83" width="48" height="5" rx="2"/></svg>' +
      '<div class="tk-mid"><div class="tk-label">⏱</div><div id="talk-clock" class="tk-clock">00:00:00</div><div id="talk-next" class="tk-next"></div></div>' +
      '<svg class="dial" viewBox="0 0 70 70"><circle class="dl-face" cx="35" cy="35" r="32"/><g class="dl-tk">' + ticks + '</g><line id="dl-m" class="dl-m" x1="35" y1="35" x2="35" y2="14"/><line id="dl-s" class="dl-s" x1="35" y1="39" x2="35" y2="9"/><circle cx="35" cy="35" r="2.6" class="dl-c"/></svg></div>' +
      '<button id="talk-btn" class="btn-primary tk-btn" data-action="talk-toggle">Старт</button></div>';
  }
  function talkPaint() {
    var clk = $('#talk-clock'); if (!clk) return;
    var run = !!UI.talkStart, tot = talkSecs(UI.talkDay || today()) + (run ? talkLive() : 0);
    if (!run) tot = talkSecs(today());
    var cyc = TALK_UNIT * 60, p = (tot % cyc) / cyc;
    clk.textContent = fmtClock(tot);
    $('#talk-next').textContent = 'до +1 КПД: ' + pad(Math.floor((cyc - tot % cyc) / 60)) + ':' + pad((cyc - tot % cyc) % 60);
    $('#hgT').setAttribute('y', 6 + 39 * p); $('#hgT').setAttribute('height', 39 * (1 - p));
    $('#hgB').setAttribute('y', 84 - 39 * p); $('#hgB').setAttribute('height', 39 * p);
    var st = $('#hgS'); st.setAttribute('y2', 84 - 39 * p); st.style.opacity = run ? 1 : 0;
    $('#dl-s').setAttribute('transform', 'rotate(' + (tot % 60) * 6 + ' 35 35)');
    $('#dl-m').setAttribute('transform', 'rotate(' + (tot % 3600) / 10 + ' 35 35)');
    var b = $('#talk-btn'); b.textContent = run ? 'Пауза' : 'Продолжить'; b.classList.toggle('run', run);
  }
  /* ---------- профиль ---------- */
  function bestStreak() {
    var keys = Object.keys(S.completed).concat(Object.keys(S.frozen)).sort(), best = 0, cur = 0, prev = null;
    keys.forEach(function (k, i) {
      if (i && keys[i - 1] === k) return;
      cur = (prev && diffDays(k, prev) === 1 ? cur : 0) + (S.completed[k] ? 1 : 0);
      if (cur > best) best = cur; prev = k;
    });
    return best;
  }
  function profStats() {
    var si = streakInfo(), tt = totals(), dd = daily(), rk = rankInfo(tt.xp), last = dd.days.length - 1;
    var avg = 0, bestDay = 0, n = Math.min(30, dd.days.length);
    ['t', 'm', 'n', 'p', 'h'].forEach(function (k) { avg += contrib(dd, k, last, 30); });
    dd.days.forEach(function (d) { if (d.pct > bestDay) bestDay = d.pct; });
    return { si: si, tt: tt, rk: rk, year: yearKpd(), today: dayStats(today()).pct, avg: avg, best: bestDay, bs: bestStreak(), dd: dd, last: last, done: Object.keys(S.completed).length };
  }
  function avatarHtml(cls) {
    return '<span class="avatar ' + (cls || '') + '">' + (S.profile.avatar ? '<img src="' + S.profile.avatar + '" alt="">' : '<span>' + esc((USER || '?').charAt(0).toUpperCase()) + '</span>') + '</span>';
  }
  function profPopHtml() {
    var s = profStats();
    return '<div class="pp-head">' + avatarHtml('big') + '<div><b>' + esc(USER || '') + '</b><small>' + esc(s.rk.cur.name) + ' · ' + s.tt.xp + ' XP</small></div></div>' +
      '<div class="pp-tiles"><div><b>' + s.si.streak + '</b><small>серия, дн.</small></div><div><b>' + fmtPct(s.year) + '%</b><small>КПД года</small></div><div><b>' + fmtPct(s.today) + '%</b><small>КПД сегодня</small></div></div>' +
      '<div class="pp-rows"><div><span>Лучшая серия</span><b>' + s.bs + '</b></div><div><span>Заморозки</span><b>' + s.si.avail + '</b></div><div><span>Дней завершено</span><b>' + s.done + '</b></div><div><span>КПД за 30 дней</span><b>' + fmtPct(s.avg) + '%</b></div></div>' +
      '<div class="pp-btns"><button class="btn-primary" data-action="prof-view">Посмотреть профиль</button><button class="btn-soft" data-action="prof-kpd">Детальный КПД</button></div>';
  }
  function renderProf() { var p = $('#prof-pop'); p.innerHTML = profPopHtml(); p.classList.toggle('open', !!UI.profOpen); }
  function closeProf() { UI.profOpen = false; var p = $('#prof-pop'); if (p) p.classList.remove('open'); }
  function viewProfile() {
    var s = profStats(), t = totals(), ps = S.projects.length, tal = 0;
    Object.keys(S.talk || {}).forEach(function (d) { tal += S.talk[d]; });
    var names = { t: 'Ежедневник', m: 'Избранное', n: 'Заметки', p: 'Проекты', h: 'Привычки' };
    var bars = ['t', 'm', 'n', 'p', 'h'].map(function (k) {
      var v = contrib(s.dd, k, s.last), mx = 20;
      return '<div class="pf-bar"><span>' + names[k] + '</span><div class="pf-tr"><i style="width:' + Math.min(100, v / mx * 100) + '%"></i></div><b>' + fmtPct(v) + '%</b></div>';
    }).join('');
    function tile(v, l) { return '<div class="pf-tile glass"><b>' + v + '</b><small>' + l + '</small></div>'; }
    return '<div class="page-head"><span class="page-ico">' + ic('chat') + '</span><div><h1 class="title">Профиль</h1><p class="sub2">Вся твоя статистика в одном месте.</p></div></div>' +
      '<div class="pf-top glass">' + avatarHtml('huge') + '<div class="pf-who"><h2>' + esc(USER || '') + '</h2><div>' + esc(s.rk.cur.name) + ' · ' + t.xp + ' XP' + (s.rk.next ? ' · до «' + esc(s.rk.next.name) + '»: ' + (s.rk.next.xp - t.xp) + ' XP' : '') + '</div>' +
      '<div class="progress"><i style="width:' + Math.round(s.rk.prog * 100) + '%"></i></div></div><button class="btn-soft" data-action="avatar-pick">Сменить аватарку</button></div>' +
      '<div class="pf-grid">' + tile(s.si.streak, 'текущая серия') + tile(s.bs, 'лучшая серия') + tile(s.done, 'дней завершено') + tile(s.si.avail, 'заморозок доступно') +
      tile(fmtPct(s.year) + '%', 'КПД года') + tile(fmtPct(s.today) + '%', 'КПД сегодня') + tile(fmtPct(s.avg) + '%', 'КПД за 30 дней') + tile(fmtPct(s.best) + '%', 'лучший день') + '</div>' +
      '<section class="glass pf-sec"><h3>Вклад категорий в КПД года</h3>' + bars + '</section>' +
      '<div class="pf-grid">' + tile(t.tasksDone, 'задач выполнено') + tile(S.notes.length, 'записей') + tile(t.actionsDone, 'действий в проектах') + tile(S.notes.filter(function (n) { return n.liked; }).length, 'в избранном') +
      tile(S.habits.length, 'привычек') + tile(ps, 'проектов') + tile(Math.floor(tal / 3600) + ' ч ' + Math.floor(tal % 3600 / 60) + ' мин', 'время с собой') + '</div>';
  }
  /* ---------- пояснения внизу категорий ---------- */
  var CAT_NOTE = {
    today: ['Ежедневник', 'Действия на день. Простое действие даёт 1 очко, сложное (с поддействиями) — 3. Закрепи действие — и оно будет возвращаться каждый день.'],
    motiv: ['Заметки', 'Цитаты, цели и обещания себе. Лучшие можно закрепить или добавить в избранное; раз в день показывается «Цитата дня».'],
    notes: ['Заметки', 'Пиши, рисуй, отмечай важное. Время, проведённое здесь, тикает в КПД. Заметку можно только дополнять — с отметкой даты.'],
    projects: ['Проекты', 'Большие цели, разбитые на маленькие действия. Закрывай действия — проект движется вперёд.'],
    habits: ['Привычки', 'Полезные отмечай, когда сделал. Вредные — когда удержался и не сделал.'],
    kpd: ['КПД', 'Итог всех категорий: насколько полно ты использовал свой день и год.'],
    profile: ['Профиль', 'Твоя общая статистика: серия, КПД и достижения.']
  };
  function catNote(v) { var c = CAT_NOTE[v]; return c ? '<div class="cat-note"><b>' + c[0] + '</b> — ' + c[1] + '</div>' : ''; }
  /* ---------- анимация фона: волны / снег / ничего ---------- */
  var snow = { on: false, fl: [], raf: 0 };
  function snowInit() {
    var c = $('#snow'), W = innerWidth, H = innerHeight, dpr = 1;
    c.width = W; c.height = H; c.style.width = W + 'px'; c.style.height = H + 'px';
    snow.W = W; snow.H = H; snow.dpr = dpr;
    var rain = snow.mode === 'rain';
    snow.fl = []; for (var i = 0; i < (rain ? 90 : 70); i++) snow.fl.push(rain ? { x: Math.random() * W, y: Math.random() * H, r: 10 + Math.random() * 16, v: 520 + Math.random() * 380 } : { x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.6, v: 18 + Math.random() * 38, ph: Math.random() * 6.28, sw: 8 + Math.random() * 18 });
  }
  function snowStep(ts) {
    if (!snow.on) return;
    snow.raf = requestAnimationFrame(snowStep);
    if (document.body.classList.contains('paused') || (ts - (snow.t || 0)) < 33 || $('#modal').classList.contains('open')) { if (!snow.t) snow.t = ts; return; }
    var c = $('#snow'), g = c.getContext('2d'), dt = Math.min(0.1, (ts - (snow.t || ts)) / 1000);
    snow.t = ts;
    var light = document.body.getAttribute('data-bg') === 'light-matte';
    g.clearRect(0, 0, snow.W, snow.H);
    if (snow.mode === 'rain') {
      g.strokeStyle = light ? 'rgba(80,110,180,.55)' : 'rgba(190,210,255,.55)'; g.lineWidth = 1.2; g.beginPath();
      snow.fl.forEach(function (f) {
        f.y += f.v * dt; f.x -= f.v * dt * .12;
        if (f.y > snow.H + 20) { f.y = -20; f.x = Math.random() * (snow.W + 120); }
        g.moveTo(f.x, f.y); g.lineTo(f.x + f.r * .12, f.y - f.r);
      });
      g.stroke(); return;
    }
    g.fillStyle = light ? 'rgba(120,140,190,.75)' : 'rgba(255,255,255,.85)'; g.beginPath();
    snow.fl.forEach(function (f) {
      f.y += f.v * dt; f.ph += dt * .8;
      if (f.y > snow.H + 5) { f.y = -5; f.x = Math.random() * snow.W; }
      var x = f.x + Math.sin(f.ph) * f.sw; g.moveTo(x + f.r, f.y); g.arc(x, f.y, f.r, 0, 6.2832);
    });
    g.fill();
  }
  function applyFx() {
    var fx = (S && S.settings.fx) || 'waves';
    document.body.setAttribute('data-fx', fx);
    var canv = fx === 'snow' || fx === 'rain';
    if (canv && (!snow.on || snow.mode !== fx)) { snow.mode = fx; snowInit(); if (!snow.on) { snow.on = true; snow.t = 0; snow.raf = requestAnimationFrame(snowStep); } }
    else if (!canv && snow.on) { snow.on = false; cancelAnimationFrame(snow.raf); var c = $('#snow'); c.getContext('2d').clearRect(0, 0, c.width, c.height); }
  }
  window.addEventListener('resize', function () { if (snow.on) snowInit(); });
  function talkSync() {
    var want = !!S && UI.view === 'notes' && !UI.talkPaused && !document.hidden;
    if (want && !UI.talkStart) { UI.talkStart = Date.now(); UI.talkDay = today(); }
    else if (!want && UI.talkStart) { talkCommit(); UI.talkStart = null; }
  }
  document.addEventListener('visibilitychange', function () { document.body.classList.toggle('paused', document.hidden); talkSync(); talkPaint(); });
  function nfmt(n) { return esc(fmtLong(n.date)) + (n.time ? ' · ' + n.time : ''); }
  function noteOpen(n) { return n.open === undefined ? !(n.draw || (n.text || '').length > 260 || (n.text || '').split('\n').length > 5) : n.open; }
  function noteCard(n) {
    var big = !!(n.draw || (n.text || '').length > 260 || (n.text || '').split('\n').length > 5), op = noteOpen(n);
    return '<article class="note3 ' + (op ? '' : 'collapsed ') + (n.bg && n.bg !== 'none' ? 'mbg-' + n.bg : '') + (n.pinned ? ' ispin' : '') + (n.liked ? ' isfav' : '') + '">' +
      '<div class="n3-head"><span class="n3-date">' + nfmt(n) + '</span><div class="n3-badges">' + (n.pinned ? '<span class="bdg pin">' + ic('pin') + '</span>' : '') + (n.liked ? '<span class="bdg heart">' + ic('heart') + '</span>' : '') + '</div>' +
      '<div class="n3-acts">' + (big ? '<button class="ico-btn sm" data-action="n3-toggle" data-id="' + n.id + '" title="' + (op ? 'Свернуть' : 'Развернуть') + '">' + (op ? '▴' : '▾') + '</button>' : '') + '<button class="ico-btn sm act pin ' + (n.pinned ? 'on' : '') + '" data-action="n3-pin" data-id="' + n.id + '" title="Закрепить">' + ic('pin') + '</button>' +
      '<button class="ico-btn sm act heart ' + (n.liked ? 'on' : '') + '" data-action="n3-like" data-id="' + n.id + '" title="В избранное">' + ic('heart') + '</button>' +
      '<button class="ico-btn sm" data-action="n3-edit" data-id="' + n.id + '" title="Редактировать">' + ic('pencil') + '</button>' + '<button class="ico-btn sm" data-action="n3-append" data-id="' + n.id + '" title="Дополнить">＋</button>' +
      '<button class="ico-btn sm" data-action="n3-del" data-id="' + n.id + '" title="Удалить">' + ic('trash') + '</button></div></div>' +
      (n.text ? '<p class="nt-txt">' + esc(n.text) + '</p>' : '') + (n.edited ? '<div class="n3-ed">изменено ' + esc(n.edited) + '</div>' : '') + (n.draw ? (op ? '<img class="n3-draw" data-action="n3-draw-edit" data-id="' + n.id + '" title="Нажми, чтобы дорисовать" src="' + n.draw + '" alt="" decoding="async" loading="lazy"><button class="n3-chip" data-action="n3-toggle" data-id="' + n.id + '">▴ Свернуть рисунок</button>' : '<button class="n3-chip" data-action="n3-toggle" data-id="' + n.id + '">🖼 рисунок · развернуть</button>') : '') + (n.author ? '<div class="n3-author">— ' + esc(n.author) + '</div>' : '') + '</article>';
  }
  var DRAW_COLS = ['#6a5cff', '#ff7bb8', '#ffd23f', '#6fd0ff', '#2b2b3a', '#ffffff'];
  function viewNotes3() {
    var f = UI.nFilter || 'all', all = S.notes.slice().sort(function (p, q) { var rp = p.pinned ? 0 : p.liked ? 1 : 2, rq = q.pinned ? 0 : q.liked ? 1 : 2; return rp - rq || (q.at || 0) - (p.at || 0); });
    var cnt = { all: all.length, pin: all.filter(function (n) { return n.pinned; }).length, fav: all.filter(function (n) { return n.liked; }).length };
    var list = all.filter(function (n) { return f === 'all' || (f === 'pin' && n.pinned) || (f === 'fav' && n.liked); });
    var tabs = [['all', 'Все'], ['pin', 'Закреплённые'], ['fav', 'Избранные']].map(function (x) { return '<button class="tab sm ' + (f === x[0] ? 'on' : '') + '" data-action="n3-filter" data-f="' + x[0] + '">' + x[1] + ' <em>' + cnt[x[0]] + '</em></button>'; }).join('');
    var feed = list.length ? list.map(noteCard).join('') : '<div class="nm-empty"><div class="ne-ico">' + ic('chat') + '</div><b>Здесь пока пусто</b><span>Напиши мысль, нарисуй что-нибудь или отметь заметку.</span></div>';
    var N = UI.n3 || (UI.n3 = Object.assign({ fav: false, pin: false, draw: false, color: DRAW_COLS[0], size: 6, drawn: false, brush: 'pencil', paper: 'dark', half: false, drawData: '', textDraft: '' }, S.draft || {}));
    return '<div class="notes3"><div class="n3-main"><div class="glass composer3' + (UI.n3full ? ' full' : '') + '"><div class="n3-fh"><button class="btn-soft sm" data-action="n3-full-off">← Свернуть</button><b>Новая заметка</b><button class="btn-primary sm" data-action="n3-save">Сохранить</button></div><textarea id="n3-text" rows="3" maxlength="6000" placeholder="О чём ты думаешь? Любой текст, мысль, цитата…">' + esc(N.textDraft || '') + '</textarea>' +
      (N.drawData ? '<div class="n3-prev"><img src="' + N.drawData + '" alt=""><div><button class="btn-soft sm" data-action="dr-open">Изменить рисунок</button><button class="btn-soft sm" data-action="dr-remove">Убрать</button></div></div>' : '') +
      '<div class="n3-foot"><button class="chip-t" data-action="n3-full-on">⤢ На весь экран</button><button class="chip-t ' + (N.drawData ? 'on' : '') + '" data-action="dr-open">✎ Рисунок</button><button class="chip-t ' + (N.fav ? 'on' : '') + '" data-action="n3-fav">♥ В избранное</button><button class="chip-t ' + (N.pin ? 'on' : '') + '" data-action="n3-pin-new">📌 Закрепить</button>' +
      '<button class="btn-primary" data-action="n3-save">Сохранить заметку</button></div></div>' +
      '<div class="n3-bar"><div class="tabs sm">' + tabs + '</div><div class="tabs sm"><button class="tab sm" data-action="n3-all" data-o="0">▴ Свернуть все</button><button class="tab sm" data-action="n3-all" data-o="1">▾ Развернуть все</button></div></div><div class="n3-feed">' + feed + '</div></div>' +
      '<aside class="n3-side">' + talkCard() + '<div class="glass n3-stats"><div><b>' + S.notes.length + '</b><small>' + plural(S.notes.length, ['заметка', 'заметки', 'заметок']) + '</small></div><div><b>' + cnt.pin + '</b><small>закреплено</small></div><div><b>' + cnt.fav + '</b><small>в избранном</small></div></div></aside></div>';
  }
  /* полноэкранный редактор заметки */
  function noteEditor(o) {
    var old = $('#ned'); if (old) old.remove();
    var el = document.createElement('div'); el.id = 'ned'; el.className = 'ned';
    el.innerHTML = '<div class="ned-card"><div class="ned-bar"><button class="btn-soft sm" data-ned="x">← Назад</button><b>' + esc(o.title) + '</b><span class="ned-cnt"></span><button class="btn-primary sm" data-ned="ok">Сохранить</button></div><textarea class="ned-ta" maxlength="6000" placeholder="' + esc(o.ph || '') + '">' + esc(o.value || '') + '</textarea></div>';
    document.body.appendChild(el); document.body.classList.add('n3-fs');
    var ta = el.querySelector('textarea'), cnt = el.querySelector('.ned-cnt');
    function upd() { var w = (ta.value.trim().match(/\S+/g) || []).length; cnt.textContent = ta.value.length + ' зн. · ' + w + ' сл.'; } upd(); ta.addEventListener('input', upd);
    function close() { el.classList.remove('in'); document.body.classList.remove('n3-fs'); setTimeout(function () { el.remove(); }, 300); }
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-ned]'); if (!b) return; if (b.getAttribute('data-ned') === 'x') { close(); return; } if (o.onSave(ta.value) !== false) close(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { if (o.onSave(ta.value) !== false) close(); } });
    requestAnimationFrame(function () { el.classList.add('in'); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); });
  }
  var VIEWS = { profile: viewProfile, today: viewToday, motiv: viewNotes3, notes: viewNotes3, projects: viewProjects, habits: viewHabits, kpd: viewKpd, settings: viewSettings };
  function render() {
    var v = $('#view');
    var sc = v.scrollTop;
    var pl = $('.pcards'), plTop = pl ? pl.scrollTop : 0;
    chartReg = [];
    v.innerHTML = VIEWS[UI.view]() + catNote(UI.view);
    v.scrollTop = sc;
    var pl2 = $('.pcards'); if (pl2) pl2.scrollTop = plTop;
    fitCharts();
    chartReg.forEach(attachHover);
    UI.fresh = false;
    renderNav(); renderTop();
    if (UI.popOpen) renderPop();
    if (UI.profOpen) renderProf();
    talkSync(); talkPaint();
    if (UI.stylesOpen && $('#modal').classList.contains('open')) stylesRefresh();
  }
  function go(view) {
    UI.view = view;
    UI.fresh = true;
    var v = $('#view');
    v.classList.remove('in');
    render();
    v.scrollTop = 0;
    void v.offsetWidth;
    v.classList.add('in');
  }

  /* ---------- настройки применения ---------- */
  function applySettings() {
    document.body.setAttribute('data-skin', (S && S.settings.skin) || 'violet');
    applyCaps();
    document.body.setAttribute('data-gfx', (S && S.settings.gfx) || '3d');
    document.body.setAttribute('data-bg', (S && S.settings.bgPreset) || 'custom');
    document.body.setAttribute('data-ui', (S && S.settings.ui) || 'concept');
    document.body.setAttribute('data-tsh', (S && S.settings.tsh) || 'soft');
    document.body.setAttribute('data-qfont', (S && S.settings.qfont) || 'normal');
    var s0 = (S && S.settings) || {}, fc = FL_COLS[s0.flameCol] || FL_COLS.sun, bs = document.body.style;
    bs.setProperty('--fl-a', fc[0]); bs.setProperty('--fl-b', fc[1]); bs.setProperty('--fl-c', fc[2]);
    bs.setProperty('--done-col', DONE_COLS[s0.doneCol] || '#ffffff');
    ['flameFx', 'pad', 'nstyle', 'nfont', 'tview', 'blur'].forEach(function (k) { document.body.setAttribute('data-' + k.toLowerCase(), s0[k] || ''); });
    applyFx();
    document.documentElement.lang = (s0.lang === 'en') ? 'en' : 'ru'; if (window.LO_LANG) window.LO_LANG.pass(s0.lang === 'en');
    window.lifeOwlApi.setZoom(SIZE_K[(S && S.settings.size) || 'medium'] || 1);
    applyLook();
  }

  /* ---------- действия ---------- */
  function byId(arr, id) { return arr.filter(function (x) { return x.id === id; })[0]; }
  function curProj() { return byId(S.projects, UI.projId); }
  function findAction(id) {
    var p = curProj(), f = p ? bmFind(p.actions, id) : null;
    return f ? f.n : null;
  }
  function syncProjStatus(p) {
    var pc = projPct(p);
    if (p.actions.length && pc === 100 && p.status === 'active') p.status = 'done';
    else if (pc < 100 && p.status === 'done') p.status = 'active';
  }

  var H = {
    nav: function (el) { go(el.getAttribute('data-view')); },
    'modal-close': function () { closeModal(); },

    /* день / серия */
    'open-calendar': function (el) {
      var chip = !!(el && el.id === 'streak-chip');
      closeProf(); closeHelp();
      UI.popOpen = chip ? !UI.popOpen : true;
      if (UI.popOpen) { var n = new Date(); UI.calY = n.getFullYear(); UI.calM = n.getMonth(); renderPop(); } else closePop();
    },
    'pop-close': function () { closePop(); },
    /* выбор дня на вкладке «Сегодня» (не связан с плашкой серии) */
    'day-pick': function () { var d = parse(UI.todayDate || today()); UI.dpY = d.getFullYear(); UI.dpM = d.getMonth(); dayPicker(); },
    'dcal-prev': function () { UI.dpM--; if (UI.dpM < 0) { UI.dpM = 11; UI.dpY--; } dayPicker(); },
    'dcal-next': function () { UI.dpM++; if (UI.dpM > 11) { UI.dpM = 0; UI.dpY++; } dayPicker(); },
    'day-set': function (el) { var d = el.getAttribute('data-date'); UI.todayDate = d === today() ? null : d; closeModal(); render(); },
    'day-today': function () { UI.todayDate = null; closeModal(); render(); },
    'cal-prev': function () { UI.calM--; if (UI.calM < 0) { UI.calM = 11; UI.calY--; } renderPop(); },
    'cal-next': function () { UI.calM++; if (UI.calM > 11) { UI.calM = 0; UI.calY++; } renderPop(); },
    'finish-day': function () {
      var t = today();
      if (S.completed[t]) return;
      if (dayStats(t).total < FINISH_MIN) { toast('Нужно выполнить минимум ' + FINISH_MIN + ' заданий за день'); return; }
      S.completed[t] = true; save(); toast('День завершён. Серия растёт!', true); render(); renderPop();
    },

    /* задачи */
    'task-add': function () {
      formModal({
        title: 'Новая задача', values: { icon: '🎯' },
        fields: [{ key: 'text', label: 'Что нужно сделать', type: 'text', required: true }, { key: 'icon', label: 'Иконка', type: 'icon' }],
        onSubmit: function (v) { S.tasks.push({ id: uid(), text: v.text, icon: v.icon || '🎯', done: false, date: today(), cat: Date.now() }); save(); render(); }
      });
    },
    'task-edit': function (el) {
      var k = byId(S.tasks, el.getAttribute('data-id')); if (!k) return;
      formModal({
        title: 'Изменить задачу', values: { text: k.text, icon: k.icon },
        fields: [{ key: 'text', label: 'Что нужно сделать', type: 'text', required: true }, { key: 'icon', label: 'Иконка', type: 'icon' }],
        onSubmit: function (v) { k.text = v.text; k.icon = v.icon || k.icon; save(); render(); }
      });
    },
    'task-toggle': function (el) {
      var k = byId(S.tasks, el.getAttribute('data-id')); if (!k) return;
      var before = dayStats(today()).total;
      var ns = !k.done; k.done = ns; if (ns) { if (k.cat && !k.tpl && Date.now() - k.cat < QUICK_SEC * 1000) { k.noKpd = true; toast('Закрыто сразу после создания — очки КПД не начисляются'); } else delete k.noKpd; } else delete k.noKpd;
      if (k.subs && k.subs.length) k.subs.forEach(function (s) { s.done = ns; });
      save();
      var after = dayStats(today()).total;
      render();
      if (k.done && !k.noKpd) gainToast('Действие выполнено!', after - before);
    },
    'sub-toggle': function (el) {
      var k = byId(S.tasks, el.getAttribute('data-id')); if (!k) return;
      var s = byId(k.subs, el.getAttribute('data-sid')); if (!s) return;
      var before = dayStats(today()).total;
      s.done = !s.done; k.done = k.subs.every(function (x) { return x.done; });
      save(); var after = dayStats(today()).total; render();
      if (k.done) gainToast('Сложное действие выполнено!', after - before);
    },
    'task-sub': function (el) {
      var k = byId(S.tasks, el.getAttribute('data-id')); if (!k) return;
      formModal({ title: 'Новое поддействие', values: {}, fields: [{ key: 'text', label: 'Что сделать в рамках «' + k.text + '»', type: 'text', required: true }],
        onSubmit: function (v) { k.subs = k.subs || []; k.subs.push({ id: uid(), text: v.text, done: false }); k.done = false; UI.taskOpen[k.id] = true; save(); render(); } });
    },
    'task-open': function (el) { var id = el.getAttribute('data-id'); UI.taskOpen[id] = !UI.taskOpen[id]; render(); },
    'task-pin': function (el) {
      var k = byId(S.tasks, el.getAttribute('data-id')); if (!k) return;
      if (k.tpl) { S.pinned = S.pinned.filter(function (p) { return p.id !== k.tpl; }); k.tpl = null; toast('Больше не повторяется каждый день'); }
      else { var id = uid(); S.pinned.push({ id: id, text: k.text, icon: k.icon, ind: !!k.ind, subs: (k.subs || []).map(function (s) { return s.text; }) }); k.tpl = id; toast('Будет появляться каждый день', true); }
      save(); render();
    },
    'task-del': function (el) { var k = byId(S.tasks, el.getAttribute('data-id')); if (k && k.tpl) S.pinned = S.pinned.filter(function (p) { return p.id !== k.tpl; }); S.tasks = S.tasks.filter(function (x) { return x.id !== el.getAttribute('data-id'); }); save(); render(); },
    'task-add': function () { UI.ta = { text: '', icon: '🎯', cx: false, subs: [], ind: true, pin: false, id: null }; taskModal(); },
    'task-edit': function (el) {
      var k = byId(S.tasks, el.getAttribute('data-id')); if (!k) return;
      UI.ta = { text: k.text, icon: k.icon, cx: !!(k.subs && k.subs.length), subs: (k.subs || []).map(function (s) { return s.text; }), ind: k.ind !== false, pin: !!k.tpl, id: k.id }; taskModal();
    },
    'ta-icon': function (el) { taRead(); var e = el.getAttribute('data-emo'); UI.ta.icon = UI.ta.icon === e ? '' : e; taskModal(); },
    'ta-cx': function () { taRead(); UI.ta.cx = !UI.ta.cx; taskModal(); },
    'ta-ind': function () { taRead(); UI.ta.ind = !UI.ta.ind; taskModal(); },
    'ta-pin': function () { taRead(); UI.ta.pin = !UI.ta.pin; taskModal(); },
    'ta-sub-add': function () { taRead(); var inp = $('#ta-sub'); var v = inp ? inp.value.trim() : ''; if (v) { UI.ta.subs.push(v); } taskModal(); var i2 = $('#ta-sub'); if (i2) i2.focus(); },
    'ta-sub-del': function (el) { taRead(); UI.ta.subs.splice(+el.getAttribute('data-i'), 1); taskModal(); },
    'ta-save': function () {
      taRead(); var T = UI.ta; if (!T.text.trim()) { toast('Введи название'); return; }
      var inp = $('#ta-sub'); if (T.cx && inp && inp.value.trim()) T.subs.push(inp.value.trim());
      var subs = T.cx ? T.subs : [];
      var k = T.id ? byId(S.tasks, T.id) : null;
      if (k) {
        k.text = T.text.trim(); k.icon = T.icon; k.ind = T.ind;
        var old = k.subs || []; k.subs = subs.map(function (tx, i) { var o = old.filter(function (s) { return s.text === tx; })[0]; return { id: o ? o.id : uid(), text: tx, done: o ? o.done : false }; });
        k.done = k.subs.length ? k.subs.every(function (s) { return s.done; }) : k.done;
        if (T.pin && !k.tpl) { var pid = uid(); S.pinned.push({ id: pid, text: k.text, icon: k.icon, ind: k.ind, subs: subs.slice() }); k.tpl = pid; }
        else if (!T.pin && k.tpl) { S.pinned = S.pinned.filter(function (p) { return p.id !== k.tpl; }); k.tpl = null; }
        else if (k.tpl) { var pp = byId(S.pinned, k.tpl); if (pp) { pp.text = k.text; pp.icon = k.icon; pp.ind = k.ind; pp.subs = subs.slice(); } }
      } else {
        var nk = { id: uid(), cat: Date.now(), text: T.text.trim(), icon: T.icon, done: false, date: today(), ind: T.ind, subs: subs.map(function (tx) { return { id: uid(), text: tx, done: false }; }) };
        if (T.pin) { var pid2 = uid(); S.pinned.push({ id: pid2, text: nk.text, icon: nk.icon, ind: nk.ind, subs: subs.slice() }); nk.tpl = pid2; }
        S.tasks.push(nk);
      }
      UI.ta = null; closeModal(); save(); render();
    },

    /* мотивации */
    'mot-expand': function (el) { var id = el.getAttribute('data-id'); UI.motOpen[id] = !UI.motOpen[id]; render(); },
    'mot-add': function () {
      formModal({
        title: 'Новая мотивация', values: { icon: '🚀', iconOn: 'no', bg: 'none' },
        fields: [{ key: 'text', label: 'Текст или цитата', type: 'textarea', required: true }, { key: 'author', label: 'Автор (необязательно)', type: 'text' },
          { key: 'bg', label: 'Фон плашки', type: 'select', options: [['none', 'Обычный'], ['snow', 'Снеговик ⛄'], ['hween', 'Хэллоуин 🎃'], ['easter', 'Пасха 🐣'], ['sun', 'Закат'], ['ocean', 'Океан'], ['rose', 'Роза'], ['mono', 'Графит']] }, { key: 'iconOn', label: 'Показывать иконку на карточке', type: 'select', options: [['no', 'Нет'], ['yes', 'Да']] }, { key: 'icon', label: 'Иконка (если включена)', type: 'icon' }],
        onSubmit: function (v) {
          var before = dayStats(today()).total;
          S.motivations.push({ id: uid(), text: v.text, author: v.author || '', icon: v.icon || '🚀', iconOn: v.iconOn === 'yes', bg: v.bg || 'none', at: Date.now(), cdate: today(), liked: false, pinned: false });
          save(); render(); gainToast('Мотивация добавлена!', dayStats(today()).total - before);
        }
      });
    },
    'mot-edit': function (el) {
      var m = byId(S.motivations, el.getAttribute('data-id')); if (!m) return;
      formModal({
        title: 'Изменить мотивацию', values: { text: m.text, author: m.author, icon: m.icon, iconOn: m.iconOn ? 'yes' : 'no', bg: m.bg || 'none' },
        fields: [{ key: 'text', label: 'Текст или цитата', type: 'textarea', required: true }, { key: 'author', label: 'Автор (необязательно)', type: 'text' },
          { key: 'bg', label: 'Фон плашки', type: 'select', options: [['none', 'Обычный'], ['snow', 'Снеговик ⛄'], ['hween', 'Хэллоуин 🎃'], ['easter', 'Пасха 🐣'], ['sun', 'Закат'], ['ocean', 'Океан'], ['rose', 'Роза'], ['mono', 'Графит']] }, { key: 'iconOn', label: 'Показывать иконку на карточке', type: 'select', options: [['no', 'Нет'], ['yes', 'Да']] }, { key: 'icon', label: 'Иконка (если включена)', type: 'icon' }],
        onSubmit: function (v) { m.text = v.text; m.author = v.author || ''; m.icon = v.icon || m.icon; m.iconOn = v.iconOn === 'yes'; m.bg = v.bg || 'none'; save(); render(); }
      });
    },
    'mot-like': function (el) {
      var m = byId(S.motivations, el.getAttribute('data-id')); if (!m) return;
      var before = dayStats(today()).total;
      m.liked = !m.liked;
      if (m.liked) { m.likedAt = Date.now(); m.likedDate = today(); } else { delete m.likedAt; delete m.likedDate; }
      save(); render();
      if (m.liked) gainToast('Добавлено в избранное!', dayStats(today()).total - before);
    },
    'mot-pin': function (el) {
      var m = byId(S.motivations, el.getAttribute('data-id')); if (!m) return;
      m.pinned = !m.pinned; save(); render();
      toast(m.pinned ? 'Цитата закреплена' : 'Цитата откреплена');
    },
    'mot-del': function (el) {
      var id = el.getAttribute('data-id');
      confirmBox('Удалить эту мотивацию?', function () { S.motivations = S.motivations.filter(function (m) { return m.id !== id; }); save(); render(); });
    },

    /* проекты */
    'proj-tab': function (el) { UI.projTab = el.getAttribute('data-t'); render(); },
    'act-today': function (el) { var a = findAction(el.getAttribute('data-id')); if (!a) return; a.plan = a.plan === today() ? null : today(); save(); render(); },
    'plan-auto': function () {
      var p = curProj(); if (!p) return; var t = today(), cap = (S.settings.caps && +S.settings.caps.p) || 3;
      var have = p.actions.filter(function (a) { return a.plan === t; }).length;
      p.actions.filter(function (a) { return !a.done && a.plan !== t; }).slice(0, Math.max(0, cap - have)).forEach(function (a) { a.plan = t; });
      save(); render();
    },
    'bm-rot': function (el) { var p = curProj(); p.map.rot = (p.map.rot || 0) + (+el.getAttribute('data-d')); save(); bmRedraw(); },
    'bm-center': function () { var p = curProj(); if (!p) return; p.map.px = 0; p.map.py = 0; bmApply(p.map); save(); },
    'bm-zoom': function (el) { var p = curProj(); p.map.zoom = Math.max(.4, Math.min(2.2, +((p.map.zoom || 1) + (+el.getAttribute('data-d'))).toFixed(2))); save(); bmApply(p.map); },
    'bm-full': function () { UI.bmFull = !UI.bmFull; render(); },
    'bm-done': function () {
      var p = curProj(), f = bmFind(p.actions, UI.bmSel); if (!f) return;
      if (!f.parent) { H['act-toggle']({ getAttribute: function () { return f.n.id; } }); return; }
      var before = dayStats(today()).total, was = bmFind(p.actions, UI.bmSel); var root = p.actions.filter(function (a) { return a.done; }).length;
      bmSetAll(f.n, !f.n.done); bmRecalc(p, f.n.id); syncProjStatus(p); save(); render();
      var g = dayStats(today()).total - before; if (g > 0) gainToast('Действие выполнено!', g);
    },
    'bm-add': function () {
      var p = curProj(), id = UI.bmSel; if (!p) return;
      if (!id || id === 'root') { H['act-add'](); return; }
      formModal({ title: 'Новая ветка', values: { icon: '' }, fields: [{ key: 'text', label: 'Название', type: 'text', required: true }, { key: 'icon', label: 'Иконка', type: 'icon' }],
        onSubmit: function (v) { var f = bmFind(p.actions, id); if (!f) return; f.n.subs = f.n.subs || []; f.n.subs.push({ id: uid(), text: v.text, icon: v.icon || '', done: false, subs: [] }); f.n.done = false; bmRecalc(p, id); syncProjStatus(p); save(); render(); } });
    },
    'bm-edit': function () {
      var p = curProj(), f = bmFind(p.actions, UI.bmSel); if (!f) return;
      formModal({ title: 'Изменить', values: { text: f.n.text, icon: f.n.icon || '' }, fields: [{ key: 'text', label: 'Название', type: 'text', required: true }, { key: 'icon', label: 'Иконка', type: 'icon' }],
        onSubmit: function (v) { f.n.text = v.text; f.n.icon = v.icon || ''; save(); render(); } });
    },
    'bm-shape': function () { var p = curProj(), L = bmLayout(p), o = L.pos[UI.bmSel]; if (!o) return; o.n.shape = BM_SHAPES[(BM_SHAPES.indexOf(o.shape) + 1) % BM_SHAPES.length]; save(); render(); },
    'bm-col': function () { var p = curProj(), L = bmLayout(p), o = L.pos[UI.bmSel]; if (!o) return; o.n.col = BM_COLS[(BM_COLS.indexOf(o.col) + 1) % BM_COLS.length]; save(); render(); },
    'bm-reset': function () { var p = curProj(), f = bmFind(p.actions, UI.bmSel); if (!f) return; (function r(n) { delete n.ang; delete n.len; (n.subs || []).forEach(r); })(f.n); save(); render(); },
    'bm-del': function () {
      var p = curProj(), f = bmFind(p.actions, UI.bmSel); if (!f) return;
      confirmBox('Удалить «' + f.n.text + '» вместе с ветками?', function () { f.list.splice(f.i, 1); if (f.parent) bmRecalc(p, f.parent.id); UI.bmSel = null; syncProjStatus(p); save(); render(); });
    },
    'bm-list': function () {
      var p = curProj(), seen = {}, items = S.tasks.filter(function (k) { var kk = (k.text || '').toLowerCase(); if (!kk || seen[kk]) return false; seen[kk] = 1; return true; }).slice(-60).reverse();
      UI.bmPick = {};
      openModal('<h3>Добавить из списка</h3><div class="pick-list">' + (items.length ? items.map(function (k) { return '<button class="ta-chk" data-action="bm-pick" data-id="' + k.id + '"><i></i><span><b>' + esc(k.icon || '') + ' ' + esc(k.text) + '</b></span></button>'; }).join('') : '<div class="empty">В Ежедневнике пока нет действий</div>') + '</div>' +
        '<div class="modal-actions"><button class="btn-soft" data-action="modal-close">Отмена</button><button class="btn-primary" data-action="bm-pick-ok">Добавить</button></div>', true);
    },
    'bm-pick': function (el) { var id = el.getAttribute('data-id'); UI.bmPick[id] = !UI.bmPick[id]; el.classList.toggle('on', !!UI.bmPick[id]); el.querySelector('i').innerHTML = UI.bmPick[id] ? ic('tick') : ''; },
    'bm-pick-ok': function () {
      var p = curProj(), ids = Object.keys(UI.bmPick || {}).filter(function (k) { return UI.bmPick[k]; }); if (!p || !ids.length) { closeModal(); return; }
      var par = UI.bmSel && UI.bmSel !== 'root' ? bmFind(p.actions, UI.bmSel) : null;
      ids.forEach(function (id) { var k = byId(S.tasks, id); if (!k) return;
        if (par) { par.n.subs = par.n.subs || []; par.n.subs.push({ id: uid(), text: k.text, icon: k.icon || '', done: false, subs: [] }); par.n.done = false; }
        else p.actions.push({ id: uid(), cat: Date.now(), text: k.text, icon: k.icon || '🧩', done: false, doneDate: null, subs: [] }); });
      syncProjStatus(p); save(); closeModal(); render();
    },
    'proj-filter': function (el) { UI.projFilter = el.getAttribute('data-f'); render(); },
    'proj-select': function (el) { UI.projId = el.getAttribute('data-id'); render(); },
    'proj-add': function () {
      formModal({
        title: 'Новый проект', values: { icon: '🎯' },
        fields: [{ key: 'name', label: 'Название', type: 'text', required: true }, { key: 'desc', label: 'Описание', type: 'textarea' },
          { key: 'icon', label: 'Иконка', type: 'icon' }, { key: 'avatar', label: 'Или своя аватарка', type: 'avatar' }],
        submit: 'Создать',
        onSubmit: function (v) {
          var p = { id: uid(), name: v.name, desc: v.desc || '', icon: v.icon || '🎯', avatar: v.avatar || '', status: 'active', created: today(), actions: [] };
          S.projects.push(p); UI.projId = p.id; UI.projFilter = 'all'; save(); render();
        }
      });
    },
    'proj-edit': function () {
      var p = curProj(); if (!p) return;
      formModal({
        title: 'Изменить проект', values: { name: p.name, desc: p.desc, icon: p.icon, avatar: p.avatar },
        fields: [{ key: 'name', label: 'Название', type: 'text', required: true }, { key: 'desc', label: 'Описание', type: 'textarea' },
          { key: 'icon', label: 'Иконка', type: 'icon' }, { key: 'avatar', label: 'Или своя аватарка', type: 'avatar' }],
        onSubmit: function (v) { p.name = v.name; p.desc = v.desc || ''; p.icon = v.icon || p.icon; p.avatar = v.avatar || ''; save(); render(); }
      });
    },
    'proj-del': function () {
      var p = curProj(); if (!p) return;
      confirmBox('Удалить проект «' + p.name + '» вместе со всеми действиями?', function () {
        S.projects = S.projects.filter(function (x) { return x.id !== p.id; }); UI.projId = null; save(); render();
      });
    },
    'proj-status': function (el) {
      var p = curProj(); if (!p) return;
      p.status = el.getAttribute('data-s'); save(); render();
    },
    'menu-toggle': function (el) { el.parentNode.classList.toggle('open'); },
    'act-add': function () {
      var p = curProj(); if (!p) return;
      formModal({
        title: 'Новое действие', values: { icon: '🧩' },
        fields: [{ key: 'text', label: 'Действие', type: 'text', required: true }, { key: 'icon', label: 'Иконка', type: 'icon' }],
        onSubmit: function (v) { p.actions.push({ id: uid(), cat: Date.now(), text: v.text, icon: v.icon || '🧩', done: false, doneDate: null, subs: [] }); syncProjStatus(p); save(); render(); }
      });
    },
    'act-edit': function (el) {
      var a = findAction(el.getAttribute('data-id')); if (!a) return;
      formModal({
        title: 'Изменить действие', values: { text: a.text, icon: a.icon },
        fields: [{ key: 'text', label: 'Действие', type: 'text', required: true }, { key: 'icon', label: 'Иконка', type: 'icon' }],
        onSubmit: function (v) { a.text = v.text; a.icon = v.icon || a.icon; save(); render(); }
      });
    },
    'act-toggle': function (el) {
      var p = curProj(), a = findAction(el.getAttribute('data-id'));
      if (!a) return;
      var before = dayStats(today()).total;
      a.done = !a.done; a.doneDate = a.done ? today() : null;
      if (a.done && a.cat && Date.now() - a.cat < QUICK_SEC * 1000 && !(a.subs && a.subs.length)) { a.noKpd = true; toast('Закрыто сразу после создания — очки КПД не начисляются'); } else delete a.noKpd;
      bmSetAll(a, a.done); a.doneDate = a.done ? today() : null;
      syncProjStatus(p); save(); render();
      if (a.done && !a.noKpd) gainToast('Действие выполнено!', dayStats(today()).total - before);
    },
    'node-add': function (el) {
      var p = curProj(), f = p ? bmFind(p.actions, el.getAttribute('data-id')) : null; if (!f) return;
      formModal({ title: 'Новое поддействие', values: { icon: '' }, fields: [{ key: 'text', label: 'Название', type: 'text', required: true }, { key: 'icon', label: 'Иконка (необязательно)', type: 'icon' }],
        onSubmit: function (v) { f.n.subs = f.n.subs || []; f.n.subs.push({ id: uid(), text: v.text, icon: v.icon || '', done: false, subs: [] }); f.n.done = false; f.n.doneDate = null; bmRecalc(p, f.n.id); syncProjStatus(p); save(); render(); } });
    },
    'node-toggle': function (el) {
      var p = curProj(), id = el.getAttribute('data-id'), f = p ? bmFind(p.actions, id) : null; if (!f) return;
      if (!f.parent) { H['act-toggle'](el); return; }
      var before = dayStats(today()).total;
      bmSetAll(f.n, !f.n.done); bmRecalc(p, id); syncProjStatus(p); save(); render();
      var g = dayStats(today()).total - before; if (g > 0) gainToast('Действие выполнено!', g);
    },
    'node-del': function (el) {
      var p = curProj(), id = el.getAttribute('data-id'), f = p ? bmFind(p.actions, id) : null; if (!f) return;
      confirmBox('Удалить «' + f.n.text + '»' + (f.n.subs && f.n.subs.length ? ' вместе с поддействиями' : '') + '?', function () { f.list.splice(f.i, 1); if (f.parent) bmRecalc(p, f.parent.id); syncProjStatus(p); save(); render(); });
    },
    'act-del': function (el) {
      var p = curProj(), id = el.getAttribute('data-id');
      if (!p) return;
      p.actions = p.actions.filter(function (a) { return a.id !== id; });
      syncProjStatus(p); save(); render();
    },

    /* привычки */
    'hab-filter': function (el) { UI.habFilter = el.getAttribute('data-f'); render(); },
    'hab-toggle': function (el) {
      var h = byId(S.habits, el.getAttribute('data-id')), d = el.getAttribute('data-date');
      if (!h || d > today()) return;
      var before = dayStats(today()).total;
      if (h.log[d]) { delete h.log[d]; if (h.late) delete h.late[d]; } else { h.log[d] = true; if (d < today()) { h.late = h.late || {}; h.late[d] = true; toast('Отметка за прошлый день сохранена, но в КПД не идёт'); } }
      save(); render();
      if (h.log[d] && d === today()) gainToast('Привычка отмечена!', dayStats(today()).total - before);
    },
    'hab-add': function () { habitForm(null); },
    'hab-edit': function (el) { habitForm(byId(S.habits, el.getAttribute('data-id'))); },
    'hab-del': function (el) {
      var id = el.getAttribute('data-id'), h = byId(S.habits, id); if (!h) return;
      confirmBox('Удалить привычку «' + h.name + '»?', function () { S.habits = S.habits.filter(function (x) { return x.id !== id; }); save(); render(); });
    },
    'hab-day': function (el) {
      var d = addDays(UI.habDate, +el.getAttribute('data-n'));
      if (d > today() || d < habMin()) return;
      UI.habDate = d; render();
    },

    /* КПД */
    'kpd-range': function (el) { UI.kpdRange = +el.getAttribute('data-r'); UI.fresh = true; render(); },
    'kpd-cat': function (el) {
      var k = el.getAttribute('data-k');
      UI.kpdCats[k] = !UI.kpdCats[k];
      el.classList.toggle('on', UI.kpdCats[k]);
      el.querySelector('i').innerHTML = UI.kpdCats[k] ? ic('tick') : '';
      kpdUpdateChart();
    },

    /* заметки */
    'ncal-prev': function () { var m = UI.noteMonth; m[1]--; if (m[1] < 0) { m[1] = 11; m[0]--; } render(); },
    'ncal-next': function () { var m = UI.noteMonth; m[1]++; if (m[1] > 11) { m[1] = 0; m[0]++; } render(); },
    'note-day': function (el) { UI.noteDate = el.getAttribute('data-date'); UI.noteEditId = null; render(); },
    'note-today': function () { UI.noteDate = today(); UI.noteMonth = null; UI.noteEditId = null; render(); },
    'note-save': function () {
      if (UI.noteDate !== today()) { toast('Писать можно только сегодня'); return; }
      var ta = $('#note-text'), text = ta ? ta.value.trim() : '';
      if (!text) { toast('Напиши что-нибудь'); return; }
      var gain = 0;
      if (UI.noteEditId) {
        var n = byId(S.notes, UI.noteEditId); if (n) n.text = text;
        UI.noteEditId = null;
        save(); render(); toast('Запись обновлена', true);
      } else {
        var now = new Date(), before = dayStats(today()).total;
        S.notes.push({ id: uid(), date: UI.noteDate, cdate: today(), at: now.getTime(), text: text, time: pad(now.getHours()) + ':' + pad(now.getMinutes()) });
        save(); gain = dayStats(today()).total - before; render();
        gainToast('Запись сохранена!', gain);
      }
      var ta2 = $('#note-text'); if (ta2) ta2.focus();
    },
    'note-edit': function (el) { if (UI.noteDate !== today()) return; UI.noteEditId = el.getAttribute('data-id'); render(); var ta = $('#note-text'); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } },
    'note-cancel': function () { UI.noteEditId = null; render(); },
    'note-del': function (el) {
      var id = el.getAttribute('data-id');
      confirmBox('Удалить эту запись?', function () { S.notes = S.notes.filter(function (n) { return n.id !== id; }); if (UI.noteEditId === id) UI.noteEditId = null; save(); render(); });
    },

    /* настройки */
    'caps-edit': function () { capsModal(); },
    'caps-reset': function () { $$('#modal [data-cap]').forEach(function (i) { i.value = CAPS_DEF[i.getAttribute('data-cap')]; }); capsCalc(); },
    'caps-save': function () { S.settings.caps = capsRead(); applyCaps(); save(); closeModal(); render(); if ($('#streak-pop.open')) renderPop(); toast('Нагрузка обновлена', true); },
    'set-ui': function (el) { S.settings.ui = el.getAttribute('data-s'); applySettings(); save(); render(); },
    'set-tsh': function (el) { S.settings.tsh = el.getAttribute('data-s'); applySettings(); save(); render(); },
    'set-qfont': function (el) { S.settings.qfont = el.getAttribute('data-s'); applySettings(); save(); render(); },
    'set-gfx': function (el) { S.settings.gfx = el.getAttribute('data-s'); applySettings(); save(); render(); },
    'set-bgpreset': function (el) { S.settings.bgPreset = el.getAttribute('data-s'); applySettings(); save(); render(); },
    'look-tgrad': function () { S.settings.look.textGrad = !S.settings.look.textGrad; applyLook(); save(); render(); },
    'set-skin': function (el) { S.settings.skin = el.getAttribute('data-s'); applySettings(); save(); render(); },
    'set-size': function (el) { S.settings.size = el.getAttribute('data-s'); applySettings(); save(); render(); },
    'set-notif': function () {
      S.settings.notifications = !S.settings.notifications;
      if (S.settings.notifications) { try { new Notification('Life Owl', { body: 'Уведомления включены' }); } catch (e) { /* ignore */ } }
      save(); render();
    },
    'look-set': function (el) { S.settings.look[el.getAttribute('data-k')] = el.getAttribute('data-v'); applyLook(); save(); render(); },
    'look-reset': function () { S.settings.look = Object.assign({}, LOOK_DEF); applyLook(); save(); render(); toast('Внешний вид сброшен'); },
    'bg-pick': function () { $('#file-bg').click(); },
    'bg-edit': function () { bgEditStart(); },
    'bg-edit-done': function () { bgEditEnd(); },
    'bg-edit-reset': function () { var L = S.settings.look; L.bgX = 0; L.bgY = 0; L.bgScale = 100; L.bgRot = 0; var pic = $('#bg-img img'); if (pic) pic.style.transform = bgTf(L); bgEditSync(); },
    'bg-clear': function () { delete S.settings.look.bgImage; applyLook(); save(); render(); },
    'reset-all': function () {
      confirmBox('Сбросить весь прогресс? Задачи, проекты, мотивации, записи, привычки и серия будут удалены. Логин, пароль и настройки останутся.', function () {
        var d = defaultState();
        ['tasks', 'projects', 'motivations', 'notes', 'habits', 'completed', 'frozen', 'talk', 'created'].forEach(function (k) { S[k] = d[k]; });
        delete S.motDay; delete S.draft; UI.n3 = null; UI.talkStart = null;
        UI.projId = null; UI.todayDate = null; UI.noteEditId = null; UI.noteMonth = null; UI.noteDate = today(); UI.habDate = today();
        ensureSysHabit(); save(); closePop(); render(); toast('Прогресс сброшен', true);
      }, 'Сбросить');
    },
    'avatar-pick': function () { $('#file-avatar').click(); },
    'set-s': function (el) {
      S.settings[el.getAttribute('data-k')] = el.getAttribute('data-s'); applySettings(); save(); render();
    },
    'lay-edit': function () { var L = S.settings.layout; L.custom = true; L.items = layItems(); UI.layEdit = true; save(); render(); var vw = $('#view'); if (vw) vw.scrollTop = 0; },
    'lay-done': function () { UI.layEdit = false; render(); },
    'lay-reset': function () { S.settings.layout = { custom: false, items: {}, hidden: [] }; UI.layEdit = false; save(); render(); },
    'lay-hide': function (el) { var L = S.settings.layout, b = el.getAttribute('data-b'); if (L.hidden.indexOf(b) < 0) L.hidden.push(b); save(); render(); },
    'lay-show': function (el) {
      var L = S.settings.layout, b = el.getAttribute('data-b'); L.hidden = L.hidden.filter(function (x) { return x !== b; });
      var it = layItems(), ids = Object.keys(LAY_DEF).filter(function (id) { return L.hidden.indexOf(id) < 0 && id !== b; }), me = it[b], done = false;
      for (var yy = 0; yy < 80 && !done; yy++) for (var xx = 0; xx + me.w <= 12 && !done; xx++) {
        me.x = xx; me.y = yy;
        if (!ids.some(function (o) { return layHit(me, it[o]); })) done = true;
      }
      L.items = it; save(); render();
    },
    'model-open': function () { modelModal(); },
    'ov-add': function (el) {
      var L = S.settings.layout; if (!L.custom) { L.custom = true; L.items = layItems(); } UI.layEdit = true;
      L.models.push({ id: uid(), key: el.getAttribute('data-m'), x: 38, y: 60, s: 150, r: 0 }); save(); closeModal(); render();
    },
    'ov-del': function (el) { var L = S.settings.layout, id = el.getAttribute('data-id'); L.models = L.models.filter(function (o) { return o.id !== id; }); save(); render(); },
    'model-pick': function (el) { S.settings.model = el.getAttribute('data-m'); save(); closeModal(); render(); },
    'model-add': function () { $('#file-model').click(); },
    'model-del': function (el) {
      var id = el.getAttribute('data-m'); S.models = S.models.filter(function (m) { return m.id !== id; });
      if (S.settings.model === id) S.settings.model = 'none';
      save(); modelModal(); render();
    },
    'n3-filter': function (el) { UI.nFilter = el.getAttribute('data-f'); render(); },
    'dr-open': function () { var t = $('#n3-text'); if (t) UI.n3.textDraft = t.value; draftSave(); drawOpen(UI.n3.drawData ? { data: UI.n3.drawData } : null); },
    'dr-remove': function () { var t = $('#n3-text'); if (t) UI.n3.textDraft = t.value; UI.n3.drawData = ''; UI.n3.drawn = false; draftSave(); render(); },
    'dr-brush': function (el) { UI.n3.brush = el.getAttribute('data-b'); drRefreshBar(); },
    'dr-color': function (el) { UI.n3.color = el.getAttribute('data-c'); if (UI.n3.brush === 'eraser') UI.n3.brush = 'pencil'; drRefreshBar(); },
    'dr-paper': function (el) { UI.n3.paper = el.getAttribute('data-p'); UI.n3.paperSet = true; drPaper(); drRefreshBar(); },
    'dr-mode': function () { UI.n3.half = !UI.n3.half; var ov = $('#draw-ov'); ov.classList.toggle('half', UI.n3.half); drFit(); drRefreshBar(); },
    'dr-undo': function () { drUndo(); },
    'dr-redo': function () { drRedo(); },
    'dr-clear': function () { if (!DR) return; drPush(); var cv = $('#dr-canvas'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); },
    'dr-image': function () { var f = $('#dr-file'); if (!f) { f = document.createElement('input'); f.type = 'file'; f.id = 'dr-file'; f.accept = 'image/*'; f.style.display = 'none'; document.body.appendChild(f); } f.click(); },
    'dr-fl-ok': function () { drFloatCommit(); },
    'dr-fl-x': function () { drFloatCancel(); },
    'n3-draw-edit': function (el) { var n = byId(S.notes, el.getAttribute('data-id')); if (!n || !n.draw) return; UI.n3 = UI.n3 || {}; drawOpen({ data: n.draw, noteId: n.id }); },
    'dr-ok': function () { drClose(true); },
    'dr-cancel': function () { drClose(false); },
    'n3-fav': function (el) { UI.n3.fav = !UI.n3.fav; el.classList.toggle('on', UI.n3.fav); draftSave(); },
    'n3-pin-new': function (el) { UI.n3.pin = !UI.n3.pin; el.classList.toggle('on', UI.n3.pin); draftSave(); },
    'n3-save': function () {
      var N = UI.n3, ta = $('#n3-text'), text = ta ? ta.value.trim() : '', draw = '';
      draw = N.drawData || '';
      if (!text && !draw) { toast('Напиши что-нибудь или нарисуй'); return; }
      var warn = !noteValid({ text: text, draw: draw }) ? 'Заметка сохранена, но короче 20 символов — очки КПД не начисляются' : '';
      var now = new Date(), before = dayStats(today()).total, nt = { id: uid(), date: today(), cdate: today(), at: now.getTime(), time: pad(now.getHours()) + ':' + pad(now.getMinutes()), text: text, draw: draw, pinned: N.pin, liked: N.fav };
      if (N.pin || N.fav) nt.markDate = today();
      UI.n3full = false; document.body.classList.remove('n3-fs'); S.notes.push(nt); N.fav = false; N.pin = false; N.drawn = false; N.draw = false; N.drawData = ''; N.textDraft = ''; S.draft = null; save();
      var gain = dayStats(today()).total - before; render(); if (warn) toast(warn); else if (gain <= 0 && noteValid(nt)) toast('Заметка сохранена. Очки: одна зачтённая заметка раз в ' + NOTE_GAP + ' мин, дубли не считаются'); else gainToast('Заметка сохранена!', gain);
    },
    'n3-toggle': function (el) { var n = byId(S.notes, el.getAttribute('data-id')); if (!n) return; n.open = !noteOpen(n); save(); render(); },
    'n3-all': function (el) { var o = el.getAttribute('data-o') === '1'; S.notes.forEach(function (n) { n.open = o; }); save(); render(); },
    'n3-like': function (el) { var n = byId(S.notes, el.getAttribute('data-id')); if (!n) return; var b = dayStats(today()).total; n.liked = !n.liked; if ((n.liked || n.pinned) && !n.markDate) n.markDate = today(); save(); var g = dayStats(today()).total - b; render(); if (n.liked && g) gainToast('В избранном!', g); },
    'n3-pin': function (el) { var n = byId(S.notes, el.getAttribute('data-id')); if (!n) return; var b = dayStats(today()).total; n.pinned = !n.pinned; if ((n.liked || n.pinned) && !n.markDate) n.markDate = today(); save(); var g = dayStats(today()).total - b; render(); if (n.pinned && g) gainToast('Закреплено!', g); },
    'n3-del': function (el) { var id = el.getAttribute('data-id'); confirmBox('Удалить эту заметку?', function () { S.notes = S.notes.filter(function (n) { return n.id !== id; }); save(); render(); }); },
    'n3-full-on': function () { var t = $('#n3-text'); UI.n3full = true; var c = $('.composer3'); if (c) c.classList.add('full'); document.body.classList.add('n3-fs'); if (t) setTimeout(function () { t.focus(); }, 60); },
    'n3-full-off': function () { UI.n3full = false; var c = $('.composer3'); if (c) c.classList.remove('full'); document.body.classList.remove('n3-fs'); var t = $('#n3-text'); if (t) t.blur(); },
    'n3-append': function (el) {
      var n = byId(S.notes, el.getAttribute('data-id')); if (!n) return;
      noteEditor({ title: 'Дополнить заметку', value: '', ph: 'Новые мысли…', onSave: function (t) { t = t.trim(); if (!t) return false; var d = new Date(); n.text = (n.text ? n.text + '\n\n' : '') + t; n.edited = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ', ' + fmtLong(today()); save(); render(); } });
    },
    'n3-edit': function (el) {
      var n = byId(S.notes, el.getAttribute('data-id')); if (!n) return;
      noteEditor({ title: 'Заметка', value: n.text || '', ph: 'Текст заметки…', onSave: function (t) { t = t.trim(); if (!t && !n.draw) { toast('Заметка не может быть пустой'); return false; } if (t === (n.text || '')) return; var d = new Date(); n.text = t; n.edited = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ', ' + fmtLong(today()); save(); render(); } });
    },
    'talk-toggle': function () { UI.talkPaused = !UI.talkPaused; talkSync(); talkPaint(); },
    'styles-open': function () { stylesModal(); },
    'sty-tab': function (el) { UI.stylesTab = el.getAttribute('data-t'); stylesRefresh(); },
    'set-fx': function (el) { S.settings.fx = el.getAttribute('data-s'); applyFx(); save(); render(); },
    'prof-toggle': function () { UI.profOpen = !UI.profOpen; if (UI.profOpen) { closePop(); closeHelp(); renderProf(); } else closeProf(); },
    'help-toggle': function () { UI.helpOpen = true; closePop(); closeProf(); renderHelp(); },
    'prof-view': function () { closeProf(); go('profile'); },
    'prof-kpd': function () { closeProf(); go('kpd'); },
    'cloud-cfg': function () {
      cloudLoad();
      formModal({ title: 'Сервер синхронизации', values: { url: CLOUD.url }, fields: [{ key: 'url', label: 'Адрес сервера (например https://life-owl.onrender.com). Пусто — без синхронизации', type: 'text', max: 200 }],
        onSubmit: function (v) { var u = (v.url || '').trim().replace(/\/+$/, ''); if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u; if (u !== CLOUD.url) { CLOUD.token = ''; CLOUD.ver = 0; } CLOUD.url = u; cloudStore(); cloudSetStatus(u ? 'off' : 'off'); if (S) { cloudStart(); render(); } toast(u ? 'Сервер сохранён' : 'Синхронизация выключена'); } });
    },
    'cloud-now': function () { cloudSetStatus('sync'); cloudPull().then(function () { return cloudPush(); }).then(function () { toast(CLOUD.status === 'ok' ? 'Синхронизировано' : cloudLabel(true)); }); },
    logout: function () {
      talkCommit(); UI.talkStart = null; clearInterval(CLOUD.poll); clearTimeout(CLOUD.timer);
      (cloudOn() && CLOUD.token ? cloudPush() : Promise.resolve()).then(function () { CLOUD.token = ''; CLOUD.pw = null; CLOUD.ver = 0; CLOUD.pushedRev = -1; cloudStore(); return flush(); }).then(function () { return window.lifeOwlApi.logout(); }).then(function () { showLogin(); });
    }
  };

  function habitForm(h) {
    formModal({
      title: h ? 'Изменить привычку' : 'Новая привычка',
      values: h ? { name: h.name, goal: h.goal, type: h.type, icon: h.icon } : { type: 'good', icon: '' },
      fields: [{ key: 'name', label: 'Название', type: 'text', required: true }, { key: 'goal', label: 'Цель (например: 2 л в день)', type: 'text' },
        { key: 'type', label: 'Тип', type: 'select', options: [['good', 'Полезная'], ['bad', 'Вредная']] },
        { key: 'icon', label: 'Иконка', type: 'icon' }],
      submit: h ? 'Сохранить' : 'Добавить',
      onSubmit: function (v) {
        if (h) { h.name = v.name; h.goal = v.goal || ''; h.type = v.type || 'good'; h.icon = v.icon || ''; }
        else S.habits.push({ id: uid(), name: v.name, goal: v.goal || '', type: v.type || 'good', icon: v.icon || '', created: today(), log: {} });
        save(); render();
      }
    });
  }

  /* ---------- вход ---------- */
  function showLogin() {
    S = null; USER = '';
    $('#app').classList.add('hidden');
    $('#login').classList.remove('hidden');
    $('#lg-pass').value = '';
    $('#lg-err').textContent = '';
    closePop();
    applySettings();
    closeModal();
  }
  function enterApp(res) {
    S = normalize(res.state);
    USER = res.username;
    cache = { rev: -1, data: null }; ucache = { rev: -1, ix: null };
    UI.popOpen = false; UI.n3 = null;
    applySettings();
    applyFreezes();
    ensureSysHabit(); ensurePinned();
    UI.habDate = today(); UI.noteDate = today(); UI.noteMonth = null; UI.noteEditId = null; UI.projId = null; UI.todayDate = null;
    save();
    $('#login').classList.add('hidden');
    $('#app').classList.remove('hidden');
    go('today');
    cloudStart();
  }
  function doAuth(mode) {
    var u = $('#lg-user').value, p = $('#lg-pass').value, err = $('#lg-err'), L = window.lifeOwlApi;
    err.textContent = ''; cloudLoad();
    function fail(e) { err.textContent = e || 'Не удалось войти'; }
    function enter(res) { CLOUD.pw = p; CLOUD.pushedRev = -1; enterApp(res); }
    if (mode === 'register') {
      var go = cloudOn() ? cloudAuth('register', u, p) : Promise.resolve({ ok: true, local: true });
      go.then(function (r) {
        if (!r.ok) { fail(r.offline ? 'Нет связи с сервером. Проверь адрес («☁ Сервер») или отключи синхронизацию.' : r.error); return; }
        return L.register(u, p).then(function (res) {
          if (!res || !res.ok) { fail(res && res.error); return; }
          enter(res);
        });
      }).catch(function () { fail('Ошибка связи с приложением'); });
      return;
    }
    L.login(u, p).then(function (res) {
      if (res && res.ok) { enter(res); return; }
      if (!cloudOn()) { fail(res && res.error); return; }
      /* на этом устройстве аккаунта нет — пробуем облако */
      return cloudAuth('login', u, p).then(function (r) {
        if (!r.ok) { fail(r.offline ? 'Нет связи с сервером' : (r.code === 'no_user' ? (res && res.error) : r.error)); return; }
        return cloudApi('/api/state', 'GET').then(function (st) {
          return L.register(r.username || u, p).then(function (loc) {
            if (!loc || !loc.ok) { fail(loc && loc.error === 'Такой пользователь уже есть' ? 'На этом устройстве есть аккаунт с таким именем, но другим паролем' : (loc && loc.error)); return; }
            if (st && st.ok && st.state) { CLOUD.ver = st.ver; cloudStore(); loc.state = st.state; }
            enter(loc);
          });
        });
      });
    }).catch(function () { fail('Ошибка связи с приложением'); });
  }

  /* ---------- события ---------- */
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { e.preventDefault(); });
  document.addEventListener('selectstart', function (e) {
    var t = e.target;
    if (t && t.nodeType === 1 && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    if (t && t.nodeType === 3 && t.parentNode && (t.parentNode.tagName === 'INPUT' || t.parentNode.tagName === 'TEXTAREA')) return;
    e.preventDefault();
  });

  document.addEventListener('click', function (e) {
    // закрыть меню проекта при клике вне
    var onToggle = e.target.closest('[data-action="menu-toggle"]');
    $$('.menu-wrap.open').forEach(function (m) { if (!onToggle || !m.contains(onToggle)) m.classList.remove('open'); });
    // закрыть плашку серии при клике вне её
    if (UI.profOpen && !e.target.closest('.prof-wrap')) closeProf();
    if (UI.popOpen && !e.target.closest('.streak-wrap') && !e.target.closest('[data-action="open-calendar"]') && !e.target.closest('#modal.open')) closePop();
    var win = e.target.closest('[data-win]');
    if (win) {
      var w = win.getAttribute('data-win');
      if (w === 'min') window.lifeOwlApi.minimize();
      else if (w === 'max') window.lifeOwlApi.toggleMaximize().then(setMaxIcon);
      else if (w === 'full') window.lifeOwlApi.toggleFullscreen();
      else if (w === 'close') { flush().then(function () { window.lifeOwlApi.close(); }, function () { window.lifeOwlApi.close(); }); }
      return;
    }
    var el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    var a = el.getAttribute('data-action');
    if (H[a]) {
      if (a === 'menu-toggle') e.stopPropagation();
      H[a](el, e);
    }
  });
  // клик по меню проекта: закрыть после выбора
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'hab-date') {
      var v = e.target.value;
      if (v && v <= today() && v >= habMin()) { UI.habDate = v; } render();
    }
    if (e.target && e.target.id === 'file-bg') {
      var fb = e.target.files && e.target.files[0];
      if (fb && S) loadBgImage(fb, function (url) { S.settings.look.bgImage = url; S.settings.look.bgX = 0; S.settings.look.bgY = 0; S.settings.look.bgScale = 100; S.settings.look.bgRot = 0; if (S.settings.look.bgOpacity == null) S.settings.look.bgOpacity = 60; applyLook(); save(); render(); });
      e.target.value = '';
    }
    if (e.target && e.target.id === 'file-model') {
      var fm = e.target.files && e.target.files[0];
      if (fm && S) {
        if (fm.size > 2 * 1024 * 1024) toast('Файл больше 2 МБ');
        else resizeImage(fm, 256, function (url) { var id = uid(); S.models.push({ id: id, name: (fm.name || 'Моя').replace(/\.[^.]+$/, '').slice(0, 20), data: url }); S.settings.model = id; save(); modelModal(); render(); });
      }
      e.target.value = '';
    }
    if (e.target && e.target.id === 'file-avatar') {
      var f = e.target.files && e.target.files[0];
      if (f && S) resizeImage(f, 160, function (url) { S.profile.avatar = url; save(); render(); });
      e.target.value = '';
    }
  });
  /* ---------- черновик заметки (сохраняется между вкладками и запусками) ---------- */
  function draftSave() {
    var N = UI.n3; if (!N || !S) return;
    var any = (N.textDraft || '').trim() || N.drawData || N.fav || N.pin;
    S.draft = any ? { textDraft: N.textDraft || '', fav: !!N.fav, pin: !!N.pin, drawData: N.drawData || '', drawn: !!N.drawData, paper: N.paper, brush: N.brush, color: N.color, size: N.size } : null;
    save();
  }
  var draftTimer = 0;
  document.addEventListener('input', function (e) {
    if (e.target.id !== 'n3-text' || !UI.n3) return;
    UI.n3.textDraft = e.target.value; clearTimeout(draftTimer); draftTimer = setTimeout(draftSave, 500);
  });
  window.addEventListener('beforeunload', function () { var t = $('#n3-text'); if (t && UI.n3) { UI.n3.textDraft = t.value; draftSave(); } });
  /* ---------- рисование: полный экран / пол-экрана ---------- */
  var DRI = {
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
    pen: '<path d="M12 3l5 8-3 8h-4l-3-8z"/><path d="M12 12v4"/><circle cx="12" cy="9.5" r="1.2"/><path d="M8 21h8"/>',
    marker: '<path d="M5 18l3-1 9-9-2-2-9 9z"/><path d="M15 6l2 2 2-2-2-2z"/><path d="M4 21h9"/>',
    soft: '<path d="M20 4c-6 1-10 5-11 9l2 2c4-1 8-5 9-11z"/><path d="M9 14c-3 0-4 2-4 4 0 1-1 2-2 2 3 1 7 0 7-4"/>',
    spray: '<rect x="7" y="10" width="9" height="11" rx="2"/><path d="M9 10V7h5v3M10 4h3"/><path d="M18 6h2M18 9l2 1M18 3l2-1"/>',
    eraser: '<path d="M4 15l8-9 8 8-5 5H8z"/><path d="M9 11l7 7"/><path d="M13 20h8"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    check: '<path d="M5 12l5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    half: '<rect x="3" y="12" width="18" height="8" rx="2"/><path d="M3 8h18"/>', full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'
  };
  function dri(k) { return '<svg viewBox="0 0 24 24" class="dr-svg">' + DRI[k] + '</svg>'; }
  var BRUSHES = [['pencil', 'Карандаш'], ['pen', 'Каллиграфическое перо'], ['marker', 'Маркер'], ['soft', 'Мягкая кисть'], ['spray', 'Спрей'], ['eraser', 'Ластик']];
  var PAPERS = [['none', 'Прозрачная'], ['dark', 'Тёмная'], ['white', 'Белая'], ['kraft', 'Крафт']];
  var PAPER_COL = { none: 'transparent', dark: '#161a3e', white: '#ffffff', kraft: '#d8b98a' };
  var DR_COLS = ['#ffffff', '#1c1f3a', '#ff4d4d', '#ff9a3c', '#ffd23f', '#4be08d', '#6fd0ff', '#6a5cff', '#ff7bb8', '#8a5a3c'];
  var DR = null;
  function isLight() { return document.body.getAttribute('data-bg') === 'light-matte'; }
  function drTop() {
    var N = UI.n3, ed = DR && DR.edit;
    function b(a, k, t, on) { return '<button class="dr-t' + (on ? ' on' : '') + '" data-action="' + a + '" title="' + t + '">' + dri(k) + '</button>'; }
    return '<div class="dr-grp">' + b('dr-undo', 'undo', 'Отменить (Ctrl+Z)') + b('dr-redo', 'redo', 'Вернуть (Ctrl+Y)') + b('dr-clear', 'trash', 'Очистить всё') + '</div>' +
      '<div class="dr-grp">' + b('dr-image', 'image', 'Вставить изображение') + '</div>' +
      (ed ? '' : '<div class="dr-grp">' + PAPERS.map(function (p) { return '<button class="chip-t ' + (N.paper === p[0] ? 'on' : '') + '" data-action="dr-paper" data-p="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div>') +
      '<div class="dr-grp dr-end">' + b('dr-mode', N.half ? 'full' : 'half', N.half ? 'На весь экран' : 'Пол-экрана') + '<button class="btn-soft sm" data-action="dr-cancel">Закрыть без сохранения</button><button class="btn-primary sm" data-action="dr-ok">' + dri('check') + ' Готово</button></div>';
  }
  function drSide() {
    var N = UI.n3, cols = DR_COLS.map(function (c) { return '<button class="dot ' + (N.color === c ? 'on' : '') + '" style="background:' + c + '" data-action="dr-color" data-c="' + c + '"></button>'; }).join('');
    return '<div class="dr-tools">' + BRUSHES.map(function (b) { return '<button class="dr-b ' + (N.brush === b[0] ? 'on' : '') + '" data-action="dr-brush" data-b="' + b[0] + '" title="' + b[1] + '">' + dri(b[0]) + '</button>'; }).join('') + '</div>' +
      '<div class="dr-size"><span class="dr-l">Размер</span><div class="dr-slide"><input type="range" min="1" max="60" value="' + N.size + '" id="dr-size"></div><div class="dr-prev"><i id="dr-pv"></i></div><b id="dr-sv">' + N.size + '</b></div>' +
      '<div class="dr-cols">' + cols + '<label class="dot custom"><input type="color" id="dr-col" value="' + N.color + '"><span>+</span></label></div>';
  }
  function drPv() { var N = UI.n3, p = $('#dr-pv'), v = $('#dr-sv'); if (p) { var d = Math.max(2, Math.min(52, N.size)); p.style.width = p.style.height = d + 'px'; p.style.background = N.brush === 'eraser' ? 'transparent' : N.color; p.style.border = N.brush === 'eraser' ? '1px dashed currentColor' : 'none'; } if (v) v.textContent = N.size; }
  function drRefreshBar() { var b = $('#dr-bar'), s = $('#dr-side'); if (b) b.innerHTML = drTop(); if (s) { s.innerHTML = drSide(); drPv(); } }
  function drFit() {
    var cv = $('#dr-canvas'), wrap = $('#dr-wrap'); if (!cv || DR.edit) return;
    var w = wrap.clientWidth, h = wrap.clientHeight, tmp = null;
    if (cv.width > 2 && cv.height > 2) { tmp = document.createElement('canvas'); tmp.width = cv.width; tmp.height = cv.height; tmp.getContext('2d').drawImage(cv, 0, 0); }
    cv.width = w; cv.height = h; if (tmp) cv.getContext('2d').drawImage(tmp, 0, 0);
  }
  function drPaper() { var cv = $('#dr-canvas'); if (!cv) return; cv.style.background = PAPER_COL[UI.n3.paper] || 'transparent'; if (UI.n3.paper === 'none') cv.style.background = 'repeating-conic-gradient(#8a90c8 0% 25%, #6d73ab 0% 50%) 50% / 24px 24px'; }
  /* opts: {data, noteId}: открыть уже сохранённый рисунок для правки */
  function drawOpen(opts) {
    opts = opts || {}; var N = UI.n3, light = isLight();
    N.brush = N.brush || 'pencil'; if (!N.paperSet) { N.paper = light ? 'white' : 'dark'; if (light && (N.color === '#ffffff' || !N.color)) N.color = '#1c1f3a'; if (!light && N.color === '#1c1f3a') N.color = '#ffffff'; }
    if (!N.color) N.color = light ? '#1c1f3a' : '#ffffff';
    var ov = document.createElement('div'); ov.id = 'draw-ov'; ov.className = (N.half ? 'half ' : '') + (light ? 'lt' : '');
    DR = { strokes: 0, undo: [], redo: [], drawing: false, last: null, edit: !!opts.data, noteId: opts.noteId || null, fl: null };
    ov.innerHTML = '<div class="dr-top" id="dr-bar">' + drTop() + '</div><div class="dr-main"><aside class="dr-side" id="dr-side">' + drSide() + '</aside><div class="dr-wrap" id="dr-wrap"><canvas id="dr-canvas" width="2" height="2"></canvas></div></div>';
    document.body.appendChild(ov); drPv();
    if (opts.data) {
      var im = new Image(); im.onload = function () {
        var cv = $('#dr-canvas'), wrap = $('#dr-wrap'); if (!cv) return; cv.width = im.naturalWidth; cv.height = im.naturalHeight;
        var sc = Math.min(wrap.clientWidth / cv.width, wrap.clientHeight / cv.height, 1.6); cv.style.width = Math.round(cv.width * sc) + 'px'; cv.style.height = Math.round(cv.height * sc) + 'px'; cv.classList.add('fixed');
        cv.getContext('2d').drawImage(im, 0, 0); drPaper(); cv.style.background = 'repeating-conic-gradient(#8a90c8 0% 25%, #6d73ab 0% 50%) 50% / 24px 24px';
      }; im.src = opts.data;
    } else { drFit(); drPaper(); if (N.drawData) { var im2 = new Image(); im2.onload = function () { var c2 = $('#dr-canvas'); if (c2) c2.getContext('2d').drawImage(im2, 0, 0); }; im2.src = N.drawData; } }
  }
  function drClose(ok) {
    var ov = $('#draw-ov'); if (!ov) return;
    if (DR && DR.fl) drFloatCommit();
    if (ok && !DR.edit && !DR.strokes) { ok = false; toast('Пустой рисунок не сохранён'); }
    if (ok) {
      var cv = $('#dr-canvas'), out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height; var g = out.getContext('2d');
      if (!DR.edit && UI.n3.paper !== 'none') { g.fillStyle = PAPER_COL[UI.n3.paper]; g.fillRect(0, 0, out.width, out.height); }
      g.drawImage(cv, 0, 0);
      if (out.width > 1400) { var sc = 1400 / out.width, o2 = document.createElement('canvas'); o2.width = 1400; o2.height = Math.round(out.height * sc); o2.getContext('2d').drawImage(out, 0, 0, o2.width, o2.height); out = o2; }
      var url = out.toDataURL('image/png'), nid = DR.noteId;
      if (nid) { var nn = byId(S.notes, nid); if (nn) { nn.draw = url; nn.open = true; save(); } }
      else { UI.n3.drawData = url; UI.n3.drawn = true; var t = $('#n3-text'); if (t) UI.n3.textDraft = t.value; draftSave(); }
    }
    ov.remove(); DR = null; render();
  }
  function drPt(e) { var c = $('#dr-canvas'), r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height }; }
  function drPush() { var cv = $('#dr-canvas'); DR.undo.push(cv.getContext('2d').getImageData(0, 0, cv.width, cv.height)); if (DR.undo.length > 14) DR.undo.shift(); DR.redo = []; }
  function drUndo() { if (!DR || !DR.undo.length) return; var cv = $('#dr-canvas'), g = cv.getContext('2d'); DR.redo.push(g.getImageData(0, 0, cv.width, cv.height)); g.putImageData(DR.undo.pop(), 0, 0); }
  function drRedo() { if (!DR || !DR.redo.length) return; var cv = $('#dr-canvas'), g = cv.getContext('2d'); DR.undo.push(g.getImageData(0, 0, cv.width, cv.height)); g.putImageData(DR.redo.pop(), 0, 0); }
  function drStroke(g, a, b, pr) {
    var N = UI.n3, sz = N.size * (pr || 1); g.lineCap = 'round'; g.lineJoin = 'round'; g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.shadowBlur = 0; g.strokeStyle = N.color; g.fillStyle = N.color; g.lineWidth = sz;
    if (N.brush === 'eraser') { g.globalCompositeOperation = 'destination-out'; g.lineWidth = sz * 2; }
    else if (N.brush === 'marker') { g.globalAlpha = .4; g.lineWidth = sz * 2.2; g.lineCap = 'square'; }
    else if (N.brush === 'soft') { g.shadowBlur = sz * 1.4; g.shadowColor = N.color; }
    else if (N.brush === 'pen') {
      var w = Math.max(2, sz * 1.6), ox = Math.cos(Math.PI / 4) * w / 2, oy = -Math.sin(Math.PI / 4) * w / 2;
      g.beginPath(); g.moveTo(a.x - ox, a.y - oy); g.lineTo(a.x + ox, a.y + oy); g.lineTo(b.x + ox, b.y + oy); g.lineTo(b.x - ox, b.y - oy); g.closePath(); g.fill(); g.lineWidth = 1; g.stroke(); return;
    }
    if (N.brush === 'spray') { for (var i = 0; i < 14; i++) { var an = Math.random() * 6.28, rr = Math.random() * sz * 2.2; g.fillRect(b.x + Math.cos(an) * rr, b.y + Math.sin(an) * rr, 1.6, 1.6); } return; }
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.globalAlpha = 1; g.shadowBlur = 0; g.globalCompositeOperation = 'source-over';
  }
  /* вставка изображения: двигаем и масштабируем, потом «Вставить» */
  function drFloatStart(url) {
    if (!DR) return; if (DR.fl) drFloatCommit();
    var im = new Image(); im.onload = function () {
      var wrap = $('#dr-wrap'), cv = $('#dr-canvas'); if (!wrap || !cv || !DR) return;
      var cr = cv.getBoundingClientRect(), wr = wrap.getBoundingClientRect(), mw = cr.width * .6, mh = cr.height * .6, sc = Math.min(mw / im.naturalWidth, mh / im.naturalHeight, 1), w = im.naturalWidth * sc, h = im.naturalHeight * sc;
      var el = document.createElement('div'); el.id = 'dr-float'; el.innerHTML = '<img alt="" src="' + url + '"><span class="drf-rs"></span><div class="drf-bar"><button data-action="dr-fl-ok" title="Вставить (Enter)">' + dri('check') + '</button><button data-action="dr-fl-x" title="Отмена (Esc)">' + dri('x') + '</button></div>';
      el.style.cssText = 'left:' + (cr.left - wr.left + (cr.width - w) / 2) + 'px;top:' + (cr.top - wr.top + (cr.height - h) / 2) + 'px;width:' + w + 'px;height:' + h + 'px';
      wrap.appendChild(el); DR.fl = { el: el, im: im, ar: im.naturalWidth / im.naturalHeight };
    }; im.src = url;
  }
  function drFloatCommit() {
    var f = DR && DR.fl; if (!f) return; var cv = $('#dr-canvas'), cr = cv.getBoundingClientRect(), er = f.el.getBoundingClientRect(), k = cv.width / cr.width;
    DR.strokes++; drPush(); cv.getContext('2d').drawImage(f.im, (er.left - cr.left) * k, (er.top - cr.top) * k, er.width * k, er.height * k); f.el.remove(); DR.fl = null;
  }
  function drFloatCancel() { if (DR && DR.fl) { DR.fl.el.remove(); DR.fl = null; } }
  var FD = null;
  document.addEventListener('pointerdown', function (e) {
    if (!DR) return;
    var fl = e.target.closest && e.target.closest('#dr-float');
    if (fl && !e.target.closest('.drf-bar')) { var rs = e.target.closest('.drf-rs'); FD = { rs: !!rs, sx: e.clientX, sy: e.clientY, l: fl.offsetLeft, t: fl.offsetTop, w: fl.offsetWidth, h: fl.offsetHeight }; e.preventDefault(); try { fl.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } return; }
    if (e.target.id !== 'dr-canvas') return;
    var N = UI.n3, g = e.target.getContext('2d'), p = drPt(e); drPush(); DR.strokes++;
    DR.drawing = true; DR.last = p; try { e.target.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
    drStroke(g, p, { x: p.x + .01, y: p.y }, e.pointerType === 'pen' ? Math.max(.3, e.pressure * 1.6) : 1);
  });
  document.addEventListener('pointermove', function (e) {
    if (FD && DR && DR.fl) {
      var dx = e.clientX - FD.sx, dy = e.clientY - FD.sy, el = DR.fl.el;
      if (FD.rs) { var w = Math.max(30, FD.w + dx); el.style.width = w + 'px'; el.style.height = (w / DR.fl.ar) + 'px'; } else { el.style.left = (FD.l + dx) + 'px'; el.style.top = (FD.t + dy) + 'px'; }
      return;
    }
    if (!DR || !DR.drawing || e.target.id !== 'dr-canvas') return;
    var p = drPt(e); drStroke(e.target.getContext('2d'), DR.last, p, e.pointerType === 'pen' ? Math.max(.3, e.pressure * 1.6) : 1); DR.last = p;
  });
  document.addEventListener('pointerup', function () { FD = null; if (DR) DR.drawing = false; });
  document.addEventListener('keydown', function (e) {
    if (!DR) return; var k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && (k === 'z' || k === 'я') && !e.shiftKey) { e.preventDefault(); drUndo(); }
    else if (ctrl && (k === 'y' || k === 'н' || ((k === 'z' || k === 'я') && e.shiftKey))) { e.preventDefault(); drRedo(); }
    else if (e.key === 'Enter' && DR.fl) { e.preventDefault(); drFloatCommit(); }
    else if (e.key === 'Escape' && DR.fl) { e.preventDefault(); e.stopPropagation(); drFloatCancel(); }
  }, true);
  document.addEventListener('input', function (e) {
    if (e.target.id === 'dr-size' && UI.n3) { UI.n3.size = +e.target.value; drPv(); }
    if (e.target.id === 'dr-col' && UI.n3) { UI.n3.color = e.target.value; drPv(); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'dr-file' || !DR) return; var f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
    var rd = new FileReader(); rd.onload = function () { drFloatStart(rd.result); }; rd.readAsDataURL(f);
  });
  document.addEventListener('focusin', function (e) { if (e.target.id === 'n3-text' && window.matchMedia('(pointer: coarse)').matches && !UI.n3full) H['n3-full-on'](); });
  var OD = null;
  document.addEventListener('pointerdown', function (e) {
    if (!UI.layEdit || !S || e.button > 0 || e.target.closest('.ov-x')) return;
    var box = e.target.closest('.ov.edit'); if (!box) return;
    var o = byId(S.settings.layout.models, box.getAttribute('data-ov')); if (!o) return;
    var grid = $('#lgrid'), r = box.getBoundingClientRect();
    OD = { o: o, box: box, grid: grid, gw: grid.clientWidth, gh: grid.clientHeight, sx: e.clientX, sy: e.clientY, s0: Object.assign({}, o), cx: r.left + r.width / 2, cy: r.top + r.height / 2,
      mode: e.target.closest('.ov-rs') ? 'sc' : e.target.closest('.ov-rot') ? 'rot' : 'mv' };
    e.preventDefault(); try { box.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
  });
  document.addEventListener('pointermove', function (e) {
    if (!OD) return;
    var o = OD.o, s0 = OD.s0, dx = e.clientX - OD.sx, dy = e.clientY - OD.sy;
    if (OD.mode === 'mv') { o.x = Math.max(-10, Math.min(105, s0.x + dx / OD.gw * 100)); o.y = Math.max(-40, Math.min(OD.gh + 100, s0.y + dy)); }
    else if (OD.mode === 'sc') o.s = Math.round(Math.max(40, Math.min(800, s0.s + (dx + dy) / 2)));
    else { var ang = Math.atan2(e.clientY - OD.cy, e.clientX - OD.cx) * 180 / Math.PI + 90; o.r = Math.round(e.shiftKey ? Math.round(ang / 15) * 15 : ang); }
    OD.box.style.cssText = ovStyle(o);
  });
  function odEnd() { if (OD) { OD = null; save(); } }
  document.addEventListener('pointerup', odEnd); document.addEventListener('pointercancel', odEnd);
  /* перетаскивание и изменение размера блоков (мышь/перо/палец) */
  var LD = null, lpT = 0, lpX = 0, lpY = 0;
  document.addEventListener('pointerdown', function (e) {
    clearTimeout(lpT);
    if (!S || UI.layEdit || UI.view !== 'today' || e.button > 0 || e.target.closest('button, input, textarea, a, .modal, .fab-dock')) return;
    if (!e.target.closest('.today') || UI.todayDate) return;
    lpX = e.clientX; lpY = e.clientY;
    lpT = setTimeout(function () { H['lay-edit'](); }, 650);
  });
  document.addEventListener('pointermove', function (e) { if (lpT && (Math.abs(e.clientX - lpX) > 8 || Math.abs(e.clientY - lpY) > 8)) { clearTimeout(lpT); lpT = 0; } });
  document.addEventListener('pointerup', function () { clearTimeout(lpT); lpT = 0; });
  document.addEventListener('pointerdown', function (e) {
    if (!UI.layEdit || !S || e.button > 0) return;
    var rs = e.target.closest('.lb-rs'); if (e.target.closest('.lb-x')) return;
    var box = e.target.closest('.lb'); if (!box || e.target.closest('.ov')) return;
    var grid = $('#lgrid'), id = box.getAttribute('data-b'), it = layItems();
    LD = { id: id, c: rs ? rs.getAttribute('data-c') : '', mode: rs ? 'rs' : 'mv', sx: e.clientX, sy: e.clientY, o: Object.assign({}, it[id]), items: it, grid: grid, colW: grid.clientWidth / 12, box: box };
    e.preventDefault(); try { box.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
    box.classList.add('drag');
    if (LD.mode === 'mv') { LD.ghost = document.createElement('div'); LD.ghost.className = 'lb-ghost'; LD.ghost.style.cssText = layStyle(it[id]); grid.insertBefore(LD.ghost, grid.firstChild); }
  });
  document.addEventListener('pointermove', function (e) {
    if (!LD) return;
    var dc = Math.round((e.clientX - LD.sx) / LD.colW), dr = Math.round((e.clientY - LD.sy) / LROW), it = LD.items, me = it[LD.id], o = LD.o, mn = LAY_MIN[LD.id];
    Object.keys(it).forEach(function (k) { if (k !== LD.id) it[k] = Object.assign({}, (S.settings.layout.items || {})[k] || LAY_DEF[k]); });
    if (LD.mode === 'mv') { me.x = Math.max(0, Math.min(12 - o.w, o.x + dc)); me.y = Math.max(0, o.y + dr); }
    else {
      var cc = LD.c, nx = o.x, ny = o.y, nw = o.w, nh = o.h;
      if (cc.indexOf('e') >= 0) nw = Math.max(mn[0], Math.min(12 - o.x, o.w + dc));
      if (cc.indexOf('w') >= 0) { var rr = o.x + o.w; nx = Math.max(0, Math.min(rr - mn[0], o.x + dc)); nw = rr - nx; }
      if (cc.indexOf('s') >= 0) nh = Math.max(mn[1], o.h + dr);
      if (cc.indexOf('n') >= 0) { var bb = o.y + o.h; ny = Math.max(0, Math.min(bb - mn[1], o.y + dr)); nh = bb - ny; }
      me.x = nx; me.y = ny; me.w = nw; me.h = nh;
    }
    var ids = Object.keys(LAY_DEF).filter(function (id) { return S.settings.layout.hidden.indexOf(id) < 0; }), Hh = 0;
    layResolve(it, ids, LD.id);
    ids.forEach(function (id) { var el = LD.grid.querySelector('.lb[data-b="' + id + '"]'); if (el && !(LD.mode === 'mv' && id === LD.id)) el.style.cssText = layStyle(it[id]); Hh = Math.max(Hh, it[id].y + it[id].h); });
    if (LD.mode === 'mv') { LD.ghost.style.cssText = layStyle(me); LD.box.style.transform = 'translate(' + (e.clientX - LD.sx) + 'px,' + (e.clientY - LD.sy) + 'px) scale(1.03)'; }
    LD.grid.style.height = (Hh + (LD.mode === 'mv' ? 2 : 0)) * LROW + 'px';
  });
  function layEnd() {
    if (!LD) return;
    S.settings.layout.items = LD.items; var b = LD.grid.querySelector('.drag'); if (b) { b.classList.remove('drag'); b.style.transform = ''; } if (LD.ghost) LD.ghost.remove();
    LD = null; save(); render();
  }
  document.addEventListener('pointerup', layEnd); document.addEventListener('pointercancel', layEnd);
  // живое применение цветов и ползунков из «Внешнего вида»
  document.addEventListener('input', function (e) {
    var t = e.target, k = t && t.getAttribute && t.getAttribute('data-look');
    if (!k || !S) return;
    S.settings.look[k] = t.type === 'range' ? +t.value : t.value;
    applyLook(); save();
    if (t.type === 'range') { var rv = t.parentNode.querySelector('.rv'); if (rv) rv.textContent = t.value + '%'; }
    else { var row = t.closest('.sw-row'); if (row) $$('.sw.on', row).forEach(function (b) { b.classList.remove('on'); }); }
  });
  document.addEventListener('input', function (e) { if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-cap')) capsCalc(); });
  window.addEventListener('resize', function () {
    clearTimeout(window._rz);
    window._rz = setTimeout(function () { if (S) { fitCharts(); chartReg.forEach(attachHover); } }, 160);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if ($('#modal').classList.contains('open')) closeModal();
      else if (UI.popOpen) closePop();
      else if (UI.profOpen) closeProf();
      else if (UI.helpOpen) closeHelp();
    }
    if (e.key === 'Enter' && !$('#login').classList.contains('hidden')) doAuth('login');
    // Enter в «Разговорах с собой» сохраняет запись, Shift+Enter — перенос строки
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.target && e.target.id === 'note-text') {
      e.preventDefault();
      H['note-save']();
    }
  });
  function setMaxIcon(isMax) {
    var b = $('[data-win="max"]');
    if (b) { b.innerHTML = '<svg viewBox="0 0 24 24">' + (isMax ? SVG.restore : SVG.maxi) + '</svg>'; b.title = isMax ? 'Свернуть в окно' : 'Развернуть'; }
  }
  window.lifeOwlApi.onMaximizeChange(setMaxIcon);
  document.addEventListener('dblclick', function (e) {
    if (e.target.closest && (e.target.closest('.logo') || e.target.id === 'view' === false && e.target.classList && e.target.classList.contains('topbar'))) window.lifeOwlApi.toggleFullscreen();
  });

  $('#btn-login').addEventListener('click', function () { doAuth('login'); });
  $('#btn-register').addEventListener('click', function () { doAuth('register'); });

  window.addEventListener('beforeunload', function () {
    try { talkCommit(); } catch (e) { /* ignore */ }
    if (S) { try { window.lifeOwlApi.saveStateSync(S); } catch (e) { /* ignore */ } }
  });

  /* новый день / уведомления */
  var lastDay = today(), notifiedDay = '';
  setInterval(function () {
    if (!S) return;
    var t = today();
    if (t !== lastDay) {
      lastDay = t; applyFreezes(); ensureSysHabit(); ensurePinned(); save(); render();
    }
    var now = new Date();
    if (S.settings.notifications && now.getHours() >= 20 && !S.completed[t] && notifiedDay !== t) {
      notifiedDay = t;
      try { new Notification('Life Owl', { body: 'Не забудь завершить день и сохранить серию' }); } catch (e) { /* ignore */ }
    }
  }, 60000);
  setInterval(function () {
    if (!S) return;
    var t = today();
    if (UI.talkStart) {
      if (UI.talkDay !== t) { talkCommit(); UI.talkStart = Date.now(); UI.talkDay = t; }
      else if (talkLive() >= 30) talkCommit();
    }
    talkPaint();
  }, 1000);

  /* старт */
  if (window.lifeOwlApi.isMaximized) window.lifeOwlApi.isMaximized().then(setMaxIcon).catch(function () { });
  cloudLoad(); cloudSetStatus('off');
  window.lifeOwlApi.lastUser().then(function (u) { if (u) $('#lg-user').value = u; $('#lg-' + (u ? 'pass' : 'user')).focus(); }).catch(function () { });
})();
