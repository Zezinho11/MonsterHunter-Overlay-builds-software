const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createSupabaseProfileStore } = require('../src/infrastructure/supabase-profile-store');

const root = path.resolve(__dirname, '..');
const defaultUserData = app.getPath('userData');
const appData = process.env.APPDATA || path.dirname(defaultUserData);
const candidateConfigPaths = [
  process.env.SUPABASE_CONFIG_PATH,
  path.join(defaultUserData, 'supabase.config.json'),
  path.join(appData, 'monster-hunter-overlay-builds', 'supabase.config.json'),
  path.join(appData, 'hunter-companion', 'supabase.config.json'),
  ...fs.readdirSync(appData, { withFileTypes: true }).filter((entry) => entry.isDirectory() && /hunter|monster/i.test(entry.name)).map((entry) => path.join(appData, entry.name, 'supabase.config.json')),
].filter(Boolean);
const configPath = candidateConfigPaths.find((candidate) => fs.existsSync(candidate));
const output = path.join(root, 'work/community-gallery-audit');
const gameNames = ['Monster Hunter: World', 'Monster Hunter: Rise', 'Monster Hunter: Wilds', 'Monster Hunter: Generations Ultimate'];

function privacyKeys(value, parent = '') {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, entry]) => {
    const fullKey = parent ? `${parent}.${key}` : key;
    const matches = /^(email|notes|privateNotes)$/i.test(key) ? [fullKey] : [];
    return [...matches, ...privacyKeys(entry, fullKey)];
  });
}

app.setPath('userData', path.join(output, 'isolated-user-data'));
app.whenReady().then(async () => {
  let win;
  try {
    if (!configPath) throw new Error(`Configuração Supabase não encontrada. Configure SUPABASE_CONFIG_PATH ou o arquivo supabase.config.json na pasta de dados do aplicativo.`);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const store = createSupabaseProfileStore({
      url: process.env.SUPABASE_URL || config.url,
      anonKey: process.env.SUPABASE_ANON_KEY || config.anonKey,
      sessionPath: path.join(output, 'isolated-user-data', 'no-session'),
    });
    if (!store) throw new Error('Configuração Supabase incompleta.');

    ipcMain.handle('profile:state', () => ({ authenticated: false, profile: null, mode: 'online' }));
    ipcMain.handle('builds:online-search', (_event, filters) => store.searchBuilds(filters || {}));
    ipcMain.handle('builds:online-mine', () => []);

    const [allRows, ...gameRows] = await Promise.all([
      store.searchBuilds({ limit: 60 }),
      ...gameNames.map((game) => store.searchBuilds({ game, limit: 60 })),
    ]);
    const allowedRowKeys = new Set(['id', 'title', 'game', 'weapon_type', 'build_type', 'game_version', 'author_name', 'payload', 'published_at']);
    const invalidFields = allRows.flatMap((row) => Object.keys(row).filter((key) => !allowedRowKeys.has(key)).map((key) => `${row.id}.${key}`));
    const privatePayloadKeys = allRows.flatMap((row) => privacyKeys(row.payload).map((key) => `${row.id}.payload.${key}`));
    const gameFilterMismatches = gameRows.flatMap((rows, index) => rows.filter((row) => row.game !== gameNames[index]).map((row) => `${gameNames[index]} -> ${row.game}`));

    const directTableResponse = await fetch(`${String(process.env.SUPABASE_URL || config.url).replace(/\/$/, '')}/rest/v1/community_builds?select=id&limit=1`, {
      headers: { apikey: process.env.SUPABASE_ANON_KEY || config.anonKey, Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY || config.anonKey}` },
    });
    const directTableDenied = [401, 403].includes(directTableResponse.status);

    win = new BrowserWindow({
      width: 1680,
      height: 943,
      useContentSize: true,
      show: false,
      webPreferences: { preload: path.join(root, 'src', 'preload.js') },
    });
    await win.loadFile(path.join(root, 'src', 'control.html'));
    await win.webContents.executeJavaScript("document.querySelector('#search-builds').click()");
    await win.webContents.executeJavaScript(`new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const text = document.querySelector('#builds-info')?.textContent || '';
        if (text.includes('build(s) pública(s)') || text.includes('Não foi possível consultar')) {
          clearInterval(timer); resolve(text);
        } else if (Date.now() - start > 30000) {
          clearInterval(timer); reject(new Error('Timeout aguardando resposta da galeria na tela.'));
        }
      }, 100);
    })`);
    const ui = await win.webContents.executeJavaScript(`(() => ({
      info: document.querySelector('#builds-info')?.textContent || '',
      cards: document.querySelectorAll('#online-build-grid .build-card').length,
      emptyMessage: document.querySelector('#online-build-grid .empty-state')?.textContent || '',
      sidebarWidth: document.querySelector('.sidebar')?.getBoundingClientRect().width || 0,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }))()`);
    win.showInactive();
    await new Promise((resolve) => setTimeout(resolve, 100));
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, 'online-gallery.png'), (await win.webContents.capturePage()).toPNG());

    const report = {
      anonymousRead: { success: true, total: allRows.length, perGame: Object.fromEntries(gameNames.map((game, index) => [game, gameRows[index].length])) },
      privacy: { unexpectedRowFields: invalidFields, privatePayloadKeys },
      rls: { directAnonymousTableStatus: directTableResponse.status, directTableDenied },
      ui: { ...ui, matchesRpcCount: ui.cards === allRows.length, expectedEmptyState: allRows.length > 0 || ui.emptyMessage.includes('Nenhuma build pública') },
      writesPerformed: false,
    };
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    const passed = allRows.length <= 60 && !invalidFields.length && !privatePayloadKeys.length && gameRows.length === gameNames.length && !gameFilterMismatches.length && directTableDenied && ui.info.includes(`${allRows.length} build(s) pública(s)`) && ui.cards === allRows.length && report.ui.expectedEmptyState && ui.sidebarWidth === 286 && !ui.overflow;
    app.exit(passed ? 0 : 1);
  } catch (error) {
    console.error(error?.message || error);
    if (win && !win.isDestroyed()) win.destroy();
    app.exit(1);
  }
});
