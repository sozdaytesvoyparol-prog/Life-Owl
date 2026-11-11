'use strict';
/* Life Owl — сервер синхронизации. Без зависимостей: только Node 18+.
   Хранит аккаунты (пароль — scrypt) и состояние приложения (JSON) в файле data.json.
   Переменные окружения: PORT (по умолчанию 3000), DATA_DIR (по умолчанию ./data). */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = +process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'data.json');
const SECRET_FILE = path.join(DATA_DIR, 'secret.key');
const MAX_BODY = 30 * 1024 * 1024;
const TOKEN_DAYS = 120;

fs.mkdirSync(DATA_DIR, { recursive: true });
let secret;
try { secret = fs.readFileSync(SECRET_FILE, 'utf8').trim(); } catch (e) { /* создадим */ }
if (!secret) { secret = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex'); try { fs.writeFileSync(SECRET_FILE, secret); } catch (e) { /* ignore */ } }

let db = { users: {} };
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); if (!db.users) db.users = {}; } catch (e) { /* пустая база */ }
let dirty = false, writing = false;
function persist() {
  dirty = true; if (writing) return; writing = true;
  setTimeout(function () {
    dirty = false;
    const tmp = DB_FILE + '.tmp';
    fs.writeFile(tmp, JSON.stringify(db), function (err) {
      if (!err) fs.rename(tmp, DB_FILE, function () { writing = false; if (dirty) persist(); }); else writing = false;
    });
  }, 400);
}

const norm = (s) => String(s || '').trim().toLowerCase();
const hashPw = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString('hex');
function sign(user) {
  const body = Buffer.from(JSON.stringify({ u: user, e: Date.now() + TOKEN_DAYS * 864e5 })).toString('base64url');
  return body + '.' + crypto.createHmac('sha256', secret).update(body).digest('base64url');
}
function verify(tok) {
  if (!tok) return null; const p = String(tok).split('.'); if (p.length !== 2) return null;
  const want = crypto.createHmac('sha256', secret).update(p[0]).digest('base64url');
  if (want.length !== p[1].length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(p[1]))) return null;
  try { const o = JSON.parse(Buffer.from(p[0], 'base64url').toString()); return o.e > Date.now() ? o.u : null; } catch (e) { return null; }
}

/* простая защита от перебора: 10 неудачных входов за 10 минут с одного адреса */
const fails = {};
function tooMany(ip) { const f = fails[ip]; return f && f.n >= 10 && Date.now() - f.t < 600000; }
function fail(ip) { const f = fails[ip] && Date.now() - fails[ip].t < 600000 ? fails[ip] : (fails[ip] = { n: 0, t: Date.now() }); f.n++; f.t = Date.now(); }

function send(res, code, obj) {
  const b = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Cache-Control': 'no-store'
  });
  res.end(b);
}
function body(req) {
  return new Promise(function (ok, bad) {
    let n = 0; const ch = [];
    req.on('data', function (c) { n += c.length; if (n > MAX_BODY) { bad(new Error('big')); req.destroy(); } else ch.push(c); });
    req.on('end', function () { try { ok(JSON.parse(Buffer.concat(ch).toString() || '{}')); } catch (e) { bad(e); } });
    req.on('error', bad);
  });
}

const server = http.createServer(async function (req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = req.url.split('?')[0], ip = req.socket.remoteAddress || '';
  try {
    if (url === '/' || url === '/api/health') return send(res, 200, { ok: true, name: 'life-owl-sync', users: Object.keys(db.users).length });
    if (req.method === 'POST' && (url === '/api/register' || url === '/api/login')) {
      if (tooMany(ip)) return send(res, 429, { ok: false, error: 'Слишком много попыток, подожди несколько минут' });
      const b = await body(req), key = norm(b.username), pw = String(b.password || '');
      if (url === '/api/register') {
        if (key.length < 2) return send(res, 400, { ok: false, error: 'Имя должно быть не короче 2 символов' });
        if (pw.length < 4) return send(res, 400, { ok: false, error: 'Пароль должен быть не короче 4 символов' });
        if (db.users[key]) return send(res, 409, { ok: false, error: 'Такой пользователь уже есть' });
        const salt = crypto.randomBytes(16).toString('hex');
        db.users[key] = { display: String(b.username).trim().slice(0, 32), salt, hash: hashPw(pw, salt), state: null, ver: 0, updated: Date.now() };
        persist(); return send(res, 200, { ok: true, token: sign(key), username: db.users[key].display, ver: 0 });
      }
      const u = db.users[key];
      if (!u) { fail(ip); return send(res, 404, { ok: false, error: 'Аккаунт не найден', code: 'no_user' }); }
      const a = Buffer.from(hashPw(pw, u.salt), 'hex'), r = Buffer.from(u.hash, 'hex');
      if (a.length !== r.length || !crypto.timingSafeEqual(a, r)) { fail(ip); return send(res, 401, { ok: false, error: 'Неверное имя или пароль', code: 'bad_pass' }); }
      return send(res, 200, { ok: true, token: sign(key), username: u.display, ver: u.ver || 0 });
    }
    if (url === '/api/state') {
      const key = verify((req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
      const u = key && db.users[key];
      if (!u) return send(res, 401, { ok: false, error: 'Нужен вход', code: 'auth' });
      if (req.method === 'GET') return send(res, 200, { ok: true, ver: u.ver || 0, state: u.state, updated: u.updated });
      if (req.method === 'PUT') {
        const b = await body(req);
        if (!b.state || typeof b.state !== 'object') return send(res, 400, { ok: false, error: 'Нет данных' });
        if ((b.base | 0) !== (u.ver || 0) && !b.force) return send(res, 409, { ok: false, code: 'conflict', ver: u.ver || 0, state: u.state });
        u.state = b.state; u.ver = (u.ver || 0) + 1; u.updated = Date.now(); persist();
        return send(res, 200, { ok: true, ver: u.ver });
      }
    }
    return send(res, 404, { ok: false, error: 'Не найдено' });
  } catch (e) { return send(res, 400, { ok: false, error: 'Некорректный запрос' }); }
});
server.listen(PORT, function () { console.log('Life Owl sync server: http://localhost:' + PORT + ' · data: ' + DATA_DIR); });
process.on('SIGTERM', function () { try { fs.writeFileSync(DB_FILE, JSON.stringify(db)); } catch (e) { /* ignore */ } process.exit(0); });
