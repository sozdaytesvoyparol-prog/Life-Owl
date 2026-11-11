'use strict';
const { app, BrowserWindow, ipcMain, Menu, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let win = null;
let currentUser = null;

// снимаем ограничение 60 кадров/с (на мониторе с высокой частотой — до 240) и включаем GPU-ускорение
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

if (!app.requestSingleInstanceLock()) {
  app.quit();
}
app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

/* ---------- data.json (app.getPath('userData')) ---------- */
function dataFile() {
  return path.join(app.getPath('userData'), 'data.json');
}

function readDb() {
  const f = dataFile();
  try {
    const db = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!db || typeof db !== 'object') throw new Error('bad');
    if (!db.users || typeof db.users !== 'object') db.users = {};
    if (typeof db.lastUser !== 'string') db.lastUser = '';
    return db;
  } catch (e) {
    if (fs.existsSync(f)) {
      try { fs.copyFileSync(f, f + '.broken-' + Date.now()); } catch (_) { /* ignore */ }
    }
    return { users: {}, lastUser: '' };
  }
}

function writeDb(db) {
  const f = dataFile();
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, f);
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function normName(name) {
  return String(name || '').trim().toLowerCase();
}

/* ---------- window ---------- */
function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1000,
    minHeight: 600,
    frame: false,
    resizable: true,
    maximizable: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    show: false,
    backgroundColor: '#05071a',
    title: 'Life Owl',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  win.webContents.on('context-menu', (e) => e.preventDefault());
  // Alt+Enter — полноэкранный режим, Escape — выход из него
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.alt && input.key === 'Enter') { e.preventDefault(); toggleFullscreen(); }
    else if (input.key === 'Escape' && win.isFullScreen()) { e.preventDefault(); win.setFullScreen(false); }
  });
  win.once('ready-to-show', () => {
    // окно не должно быть больше рабочей области экрана
    const wa = screen.getDisplayMatching(win.getBounds()).workArea, bd = win.getBounds();
    if (bd.width > wa.width || bd.height > wa.height) {
      win.setBounds({ x: wa.x, y: wa.y, width: Math.min(bd.width, wa.width), height: Math.min(bd.height, wa.height) });
    }
    win.show();
  });
  win.on('maximize', notifyState);
  win.on('unmaximize', notifyState);
  win.on('enter-full-screen', notifyState);
  win.on('leave-full-screen', notifyState);
  // если пользователь сам двигает/растягивает окно — «ручной» режим разворота сбрасывается
  win.on('will-resize', () => { if (fallbackMax) { fallbackMax = null; notifyState(); } });
  win.on('will-move', () => { if (fallbackMax) { fallbackMax = null; notifyState(); } });
  win.on('closed', () => { win = null; });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

/* ---------- window buttons ---------- */
// Разворот окна. Обычно хватает maximize(); если у frameless-окна он не сработал,
// растягиваем окно вручную на рабочую область экрана и запоминаем прежние границы.
let fallbackMax = null;

function isWinMax() {
  return !!win && !win.isDestroyed() && (win.isMaximized() || win.isFullScreen() || !!fallbackMax);
}
function notifyState() {
  if (win && !win.isDestroyed()) win.webContents.send('win:state', isWinMax());
}

function toggleMaximize() {
  if (!win || win.isDestroyed()) return false;
  if (win.isFullScreen()) {
    win.setFullScreen(false);
  } else if (fallbackMax) {
    win.setBounds(fallbackMax);
    fallbackMax = null;
  } else if (win.isMaximized()) {
    win.unmaximize();
  } else {
    const before = win.getBounds();
    win.maximize();
    setTimeout(() => {
      if (!win || win.isDestroyed() || win.isMaximized() || win.isFullScreen()) return;
      fallbackMax = before;
      win.setBounds(screen.getDisplayMatching(before).workArea);
      notifyState();
    }, 200);
  }
  notifyState();
  return isWinMax();
}

ipcMain.handle('win:minimize', () => { if (win) win.minimize(); });
ipcMain.handle('win:toggleMaximize', () => toggleMaximize());
ipcMain.handle('win:isMax', () => isWinMax());
function toggleFullscreen() {
  if (!win || win.isDestroyed()) return false;
  win.setFullScreen(!win.isFullScreen()); return true;
}
ipcMain.handle('win:fullscreen', () => toggleFullscreen());
ipcMain.handle('win:close', () => { if (win) win.close(); });
// Масштаб интерфейса (Маленький / Средний / Крупный)
ipcMain.handle('win:zoom', (_e, f) => {
  if (!win || win.isDestroyed()) return false;
  const z = Math.min(1.5, Math.max(0.7, Number(f) || 1));
  win.webContents.setZoomFactor(z);
  return true;
});

/* ---------- auth ---------- */
ipcMain.handle('auth:last', () => readDb().lastUser || '');

ipcMain.handle('auth:register', (_e, username, password) => {
  const key = normName(username);
  const pass = String(password || '');
  if (key.length < 2) return { ok: false, error: 'Имя должно быть не короче 2 символов' };
  if (pass.length < 4) return { ok: false, error: 'Пароль должен быть не короче 4 символов' };
  const db = readDb();
  if (db.users[key]) return { ok: false, error: 'Такой пользователь уже есть' };
  const salt = crypto.randomBytes(16).toString('hex');
  db.users[key] = {
    display: String(username).trim(),
    salt,
    hash: hashPassword(pass, salt),
    state: null
  };
  db.lastUser = db.users[key].display;
  writeDb(db);
  currentUser = key;
  return { ok: true, username: db.users[key].display, state: null };
});

ipcMain.handle('auth:login', (_e, username, password) => {
  const key = normName(username);
  const db = readDb();
  const u = db.users[key];
  if (!u) return { ok: false, error: 'Неверное имя или пароль' };
  const given = Buffer.from(hashPassword(String(password || ''), u.salt), 'hex');
  const real = Buffer.from(u.hash, 'hex');
  if (given.length !== real.length || !crypto.timingSafeEqual(given, real)) {
    return { ok: false, error: 'Неверное имя или пароль' };
  }
  currentUser = key;
  db.lastUser = u.display;
  writeDb(db);
  return { ok: true, username: u.display, state: u.state };
});

ipcMain.handle('auth:logout', () => { currentUser = null; return true; });

/* ---------- state ---------- */
function persistState(state) {
  if (!currentUser) return false;
  const db = readDb();
  if (!db.users[currentUser]) return false;
  db.users[currentUser].state = state;
  writeDb(db);
  return true;
}

ipcMain.handle('state:save', (_e, state) => {
  try { return persistState(state); } catch (e) { return false; }
});

ipcMain.on('state:saveSync', (e, state) => {
  try { e.returnValue = persistState(state); } catch (err) { e.returnValue = false; }
});
