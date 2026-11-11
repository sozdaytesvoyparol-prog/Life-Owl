/* ===== Хранилище: localStorage вместо Electron-моста (то же API: window.lifeOwlApi) ===== */
(function () {
  'use strict';
  var KEY = 'lifeowl.v1', SES = 'lifeowl.session', mem = null, cur = null;
  var enc = (typeof TextEncoder !== 'undefined') ? new TextEncoder() : null;

  function load() {
    try { var j = JSON.parse(localStorage.getItem(KEY)); if (j && typeof j === 'object' && j.users) return j; } catch (e) { /* ignore */ }
    return mem || { users: {}, last: '' };
  }
  function store(db) {
    mem = db;
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
    catch (e) { try { window.dispatchEvent(new Event('lifeowl-quota')); } catch (_) { /* ignore */ } return false; }
  }
  function norm(n) { return String(n || '').trim().toLowerCase(); }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return (b < 16 ? '0' : '') + b.toString(16); }).join(''); }
  function rndHex(n) {
    var a = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a); else for (var i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    return hex(a);
  }
  function fallbackHash(s) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57, out = '';
    for (var r = 0; r < 2000; r++) {
      for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    }
    out = (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
    return out;
  }
  function canSubtle() { return !!(enc && window.crypto && crypto.subtle && crypto.subtle.importKey); }
  function hashPw(pw, salt, alg) {
    if (alg === 'pbkdf2') {
      if (!canSubtle()) return Promise.reject(new Error('no-subtle'));
      return crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']).then(function (k) {
        return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 60000 }, k, 256);
      }).then(hex);
    }
    return Promise.resolve(fallbackHash(pw + '|' + salt));
  }

  window.lifeOwlApi = {
    /* окно (в мобильной версии не нужно) */
    minimize: function () { }, close: function () { },
    toggleMaximize: function () { return Promise.resolve(false); },
    isMaximized: function () { return Promise.resolve(false); },
    onMaximizeChange: function () { },
    setZoom: function (f) {
      try { document.documentElement.style.fontSize = (16 * (window.__loBase || 1) * (Number(f) || 1)) + 'px'; } catch (e) { /* ignore */ }
    },

    /* авторизация */
    lastUser: function () { return Promise.resolve(load().last || ''); },
    register: function (username, password) {
      var key = norm(username), pass = String(password || '');
      if (key.length < 2) return Promise.resolve({ ok: false, error: 'Имя должно быть не короче 2 символов' });
      if (pass.length < 4) return Promise.resolve({ ok: false, error: 'Пароль должен быть не короче 4 символов' });
      var db = load();
      if (db.users[key]) return Promise.resolve({ ok: false, error: 'Такой пользователь уже есть' });
      var salt = rndHex(16), alg = canSubtle() ? 'pbkdf2' : 'fb';
      return hashPw(pass, salt, alg).then(function (h) {
        db.users[key] = { display: String(username).trim(), salt: salt, alg: alg, hash: h, state: null };
        db.last = db.users[key].display;
        if (!store(db)) return { ok: false, error: 'Не удалось сохранить: браузер блокирует память' };
        cur = key;
        try { localStorage.setItem(SES, key); } catch (e) { /* ignore */ }
        return { ok: true, username: db.users[key].display, state: null };
      });
    },
    login: function (username, password) {
      var key = norm(username), db = load(), u = db.users[key];
      if (!u) return Promise.resolve({ ok: false, error: 'Неверное имя или пароль' });
      return hashPw(String(password || ''), u.salt, u.alg || 'fb').then(function (h) {
        if (h !== u.hash) return { ok: false, error: 'Неверное имя или пароль' };
        cur = key; db.last = u.display; store(db);
        try { localStorage.setItem(SES, key); } catch (e) { /* ignore */ }
        return { ok: true, username: u.display, state: u.state };
      }, function () { return { ok: false, error: 'Этот браузер не поддерживает шифрование. Открой файл в Chrome или Safari' }; });
    },
    resume: function () {
      var key = null;
      try { key = localStorage.getItem(SES); } catch (e) { /* ignore */ }
      var db = load();
      if (!key || !db.users[key]) return Promise.resolve(null);
      cur = key;
      return Promise.resolve({ ok: true, username: db.users[key].display, state: db.users[key].state });
    },
    logout: function () {
      cur = null;
      try { localStorage.removeItem(SES); } catch (e) { /* ignore */ }
      return Promise.resolve(true);
    },

    /* данные */
    saveState: function (state) { return Promise.resolve(this.saveStateSync(state)); },
    saveStateSync: function (state) {
      if (!cur) return false;
      var db = load();
      if (!db.users[cur]) return false;
      db.users[cur].state = state;
      return store(db);
    }
  };
})();

