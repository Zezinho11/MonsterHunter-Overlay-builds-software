const { app, BrowserWindow, ipcMain, screen, safeStorage, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { findSupportedGames, parseTasklistCsv } = require('./integration/process-detector');
const { getIntegrationStatus } = require('./integration/adapter-registry');
const { loadOverlaySettings, saveOverlaySettings } = require('./infrastructure/overlay-settings-store');
const { createProfileStore } = require('./infrastructure/profile-store');
const { createSupabaseProfileStore } = require('./infrastructure/supabase-profile-store');
const execFileAsync = promisify(execFile);

const fixturePath = path.join(__dirname, 'fixtures', 'simulated-overlay-v1.json');
const appIconPath = path.join(__dirname, 'assets', 'app-icon.png');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

let overlayWindow;
let controlWindow;
let simulationTimer;
let simulationTick = 0;
let overlayState = createInitialState();
let settings = {
  editMode: true,
  clickThrough: false,
  opacity: 0.94,
  scale: 1,
  widgets: { monster: true, damage: true },
};
let settingsFilePath;
let profileStore;
let supabaseProfileStore;
let savedOverlayBounds;
let connectionStatus = { state: 'simulation', label: 'Modo de simulação · nenhum jogo detectado', game: null };
const overlayEnabled = !process.argv.includes('--no-overlay');

function createInitialState() {
  return structuredClone(fixture.initialState);
}

function createControlWindow() {
  const area = screen.getPrimaryDisplay().workArea;
  controlWindow = new BrowserWindow({
    width: Math.min(1680, area.width),
    height: Math.min(990, area.height),
    minWidth: 380,
    minHeight: 520,
    title: 'Hunter Companion — Configuração',
    icon: appIconPath,
    backgroundColor: '#101217',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  const monsterId = process.argv.find((arg) => arg.startsWith('--monster='))?.slice('--monster='.length);
  controlWindow.webContents.setWindowOpenHandler(({ url }) => {
    try { const link = new URL(url); if (link.protocol === 'https:' && ['steamcommunity.com', 'www.google.com'].includes(link.hostname)) shell.openExternal(url); } catch {}
    return { action: 'deny' };
  });
  const startView = process.argv.includes('--profile') ? 'app-settings' : process.argv.includes('--bestiary') ? 'bestiary' : undefined;
  controlWindow.loadFile(path.join(__dirname, 'control.html'), { query: { ...(monsterId ? { monster: monsterId } : {}), ...(startView ? { view: startView } : {}) } });
  controlWindow.on('closed', () => { controlWindow = null; });
}

function createOverlayWindow() {
  const display = screen.getPrimaryDisplay();
  const area = display.workArea;
  const defaultBounds = { width: 650, height: 680, x: area.x + area.width - 690, y: area.y + 24 };
  overlayWindow = new BrowserWindow({
    ...(savedOverlayBounds || defaultBounds),
    frame: false,
    transparent: true,
    resizable: true,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  overlayWindow.setAlwaysOnTop(true, 'floating');
  overlayWindow.on('moved', persistOverlaySettings);
  overlayWindow.on('resized', persistOverlaySettings);
  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));
  overlayWindow.on('closed', () => { overlayWindow = null; });
}

function persistOverlaySettings() {
  if (!settingsFilePath) return;
  const bounds = overlayWindow && !overlayWindow.isDestroyed() ? overlayWindow.getBounds() : savedOverlayBounds;
  saveOverlaySettings(settingsFilePath, settings, bounds);
}

function broadcastState() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('overlay:state', { state: overlayState, settings, connectionStatus });
  }
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send('control:state', { state: overlayState, settings, connectionStatus });
  }
}

async function detectSupportedProcesses() {
  if (process.platform !== 'win32') return;
  try {
    const result = await execFileAsync('tasklist.exe', ['/FO', 'CSV', '/NH'], { windowsHide: true, maxBuffer: 1024 * 1024 });
    const detectedGames = findSupportedGames(parseTasklistCsv(result.stdout));
    const nextStatus = getIntegrationStatus(detectedGames);
    if (JSON.stringify(nextStatus) !== JSON.stringify(connectionStatus)) {
      connectionStatus = nextStatus;
      overlayState.connectedGame = nextStatus.game?.id || 'SIMULATION';
      broadcastState();
    }
  } catch {
    connectionStatus = { state: 'detector-error', label: 'Detector indisponível · modo de simulação', game: null };
    broadcastState();
  }
}

function simulateCombat() {
  simulationTick += 1;
  const damagePulse = [12, 24, 7, 16];
  overlayState.elapsedSeconds += 1;
  overlayState.hunters.forEach((hunter, index) => {
    const pulse = damagePulse[(simulationTick + index) % damagePulse.length];
    hunter.totalDamage += pulse;
    hunter.dps = Math.max(0, hunter.dps + (pulse - 13) * 0.18);
  });
  overlayState.monster.currentHealth = Math.max(0, overlayState.monster.currentHealth - 59);
  overlayState.monster.parts[0].bars[0].current = Math.min(100, overlayState.monster.parts[0].bars[0].current + (simulationTick % 4 === 0 ? 1 : 0));
  overlayState.monster.parts[1].bars[0].current = Math.min(100, overlayState.monster.parts[1].bars[0].current + (simulationTick % 6 === 0 ? 1 : 0));
  const previous = overlayState.chart.at(-1);
  overlayState.chart.push({
    time: overlayState.elapsedSeconds,
    values: overlayState.hunters.map((hunter, index) => Math.max(0, hunter.dps + Math.sin(simulationTick / 2 + index) * 8)),
  });
  if (overlayState.chart.length > 36) overlayState.chart.shift();
  broadcastState();
}

function setClickThrough(value) {
  settings.clickThrough = Boolean(value);
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.setIgnoreMouseEvents(settings.clickThrough, { forward: true });
  }
  persistOverlaySettings();
  broadcastState();
}

function setEditMode(value) {
  settings.editMode = Boolean(value);
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.setFocusable(settings.editMode);
  }
  persistOverlaySettings();
  broadcastState();
}

function adjustOverlay(delta) {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const bounds = overlayWindow.getBounds();
  overlayWindow.setBounds({
    x: bounds.x + (delta.x || 0),
    y: bounds.y + (delta.y || 0),
    width: Math.max(420, bounds.width + (delta.width || 0)),
    height: Math.max(420, bounds.height + (delta.height || 0)),
  });
  persistOverlaySettings();
}

ipcMain.on('overlay:set-click-through', (_event, value) => setClickThrough(value));
ipcMain.on('overlay:set-edit-mode', (_event, value) => setEditMode(value));
ipcMain.on('overlay:set-opacity', (_event, value) => {
  settings.opacity = Math.min(1, Math.max(0.25, Number(value) || 0.94));
  persistOverlaySettings();
  broadcastState();
});
ipcMain.on('overlay:set-widget-visibility', (_event, { widget, visible } = {}) => {
  if (!['monster', 'damage'].includes(widget)) return;
  settings.widgets = { ...settings.widgets, [widget]: Boolean(visible) };
  persistOverlaySettings();
  broadcastState();
});
ipcMain.on('overlay:adjust-bounds', (_event, delta) => adjustOverlay(delta));
ipcMain.on('overlay:reset-simulation', () => {
  simulationTick = 0;
  overlayState = createInitialState();
  broadcastState();
});

function activeProfileProvider() { return supabaseProfileStore || profileStore; }
ipcMain.handle('profile:state', async () => activeProfileProvider()?.state() || { authenticated: false, profile: null, mode: 'local' });
ipcMain.handle('profile:create', (_event, input) => activeProfileProvider().create(input));
ipcMain.handle('profile:login', (_event, input) => activeProfileProvider().login(input));
ipcMain.handle('profile:logout', () => activeProfileProvider().logout());
ipcMain.handle('profile:update', (_event, input) => activeProfileProvider().update(input));
ipcMain.handle('builds:online-search', async (_event, filters) => {
  if (!supabaseProfileStore?.searchBuilds) throw new Error('A busca online de builds ainda não está configurada. Configure o Supabase do aplicativo.');
  return supabaseProfileStore.searchBuilds(filters || {});
});
ipcMain.handle('builds:online-mine', async () => {
  if (!supabaseProfileStore?.getMyPublishedBuilds) throw new Error('O compartilhamento de builds exige um perfil Supabase configurado.');
  return supabaseProfileStore.getMyPublishedBuilds();
});
ipcMain.handle('builds:online-publish', async (_event, build) => {
  if (!supabaseProfileStore?.publishBuild) throw new Error('A publicação de builds exige um perfil Supabase configurado.');
  return supabaseProfileStore.publishBuild(build || {});
});
ipcMain.handle('builds:online-unpublish', async (_event, buildId) => {
  if (!supabaseProfileStore?.unpublishBuild) throw new Error('A remoção de builds exige um perfil Supabase configurado.');
  return supabaseProfileStore.unpublishBuild(buildId);
});

app.whenReady().then(() => {
  settingsFilePath = path.join(app.getPath('userData'), 'overlay-settings.v1.json');
  profileStore = createProfileStore(path.join(app.getPath('userData'), 'profiles.v1.json'));
  let supabaseConfig = {};
  try { supabaseConfig = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'supabase.config.json'), 'utf8')); } catch {}
  supabaseProfileStore = createSupabaseProfileStore({
    url: process.env.SUPABASE_URL || supabaseConfig.url,
    anonKey: process.env.SUPABASE_ANON_KEY || supabaseConfig.anonKey,
    sessionPath: path.join(app.getPath('userData'), 'supabase-session.v1'),
    secureStorage: safeStorage,
  });
  const persisted = loadOverlaySettings(settingsFilePath);
  settings = persisted.settings;
  savedOverlayBounds = persisted.bounds;
  createControlWindow();
  if (overlayEnabled) createOverlayWindow();
  simulationTimer = setInterval(simulateCombat, 1000);
  setInterval(detectSupportedProcesses, 1500);
  detectSupportedProcesses();
  setTimeout(broadcastState, 400);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createControlWindow();
  });
});

app.on('window-all-closed', () => {
  persistOverlaySettings();
  if (simulationTimer) clearInterval(simulationTimer);
  if (process.platform !== 'darwin') app.quit();
});
