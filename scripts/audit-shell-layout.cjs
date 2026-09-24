const { app, BrowserWindow, ipcMain } = require('electron');
ipcMain.handle('profile:state', () => ({authenticated:false,profile:null,mode:'local'}));
ipcMain.handle('builds:online-search', () => [
  { id: 'audit-build-1', title: 'Build de auditoria', game: 'Monster Hunter: Wilds', weapon_type: 'Arco', build_type: 'DPS', game_version: 'Wilds', author_name: 'Auditoria', published_at: new Date().toISOString(), payload: { game: 'Monster Hunter: Wilds', weapon: 'Arco de teste', weaponId: 'wilds-weapon-1', type: 'DPS', armorIds: { head: 'wilds-armor-1', chest: 'wilds-armor-2' }, decorationSlots: { head: [{ id: 'wilds-decoration-1', name: 'Joia Veneno 1', requiredSlot: 1, slotIndex: 0 }] }, talisman: 'Amuleto Antivento I', talismanId: 'wilds-charm-1-1', talismanSkills: [{ name: 'Antivento', level: 1 }], talismanSlots: [] } },
  { id: 'audit-build-2', title: 'Build de auditoria alternativa', game: 'Monster Hunter: Wilds', weapon_type: 'Arco', build_type: 'CONFORTO', game_version: 'Wilds', author_name: 'Auditoria', published_at: new Date().toISOString(), payload: { game: 'Monster Hunter: Wilds', weapon: 'Arco de teste', weaponId: 'wilds-weapon-1', type: 'CONFORTO' } },
]);
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'work/shell-audit');
fs.mkdirSync(out, { recursive: true });
app.setPath('userData', path.join(out, 'profile'));
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1680, height: 943, useContentSize: true, show: false, webPreferences: { preload: path.join(root, 'src/preload.js') } });
  const results = [];
  let onlineDetailAudit = false;
  let onlineCardAudit = { visibleBuildCards: 0, buildColumns: 0 };
  async function sidebarSnapshot() {
    return win.webContents.executeJavaScript(`(() => Object.fromEntries(['.sidebar','.app-brand','.profile-card','.avatar','.main-nav','.nav-item','.sidebar-legend','.settings-button'].map(selector => {
      const element=document.querySelector(selector),rect=element.getBoundingClientRect(),style=getComputedStyle(element);
      const round=value=>Math.round(value*10)/10;
      return [selector,{x:round(rect.x),y:round(rect.y),width:round(rect.width),height:round(rect.height),display:style.display,visibility:style.visibility,fontSize:style.fontSize}];
    })))()`);
  }
  try {
    await win.loadFile(path.join(root, 'src/control.html'));
    for (const view of ['bestiary', 'online-builds', 'saved-builds', 'overlay-settings', 'app-settings']) {
      await win.webContents.executeJavaScript(`clearDetailHeader(); renderView(${JSON.stringify(view)})`);
      if (view === 'online-builds') {
        await win.webContents.executeJavaScript("document.querySelector('#search-builds').click()");
        await new Promise((resolve) => setTimeout(resolve, 100));
        onlineCardAudit = await win.webContents.executeJavaScript("(() => { const cards=[...document.querySelectorAll('#online-build-grid .build-card')],xs=new Set(cards.map(e=>Math.round(e.getBoundingClientRect().x)));return {visibleBuildCards:cards.length,buildColumns:xs.size};})()");
        fs.writeFileSync(path.join(out, 'online-build-results.png'), (await win.webContents.capturePage()).toPNG());
        await win.webContents.executeJavaScript("document.querySelector('#online-build-grid .build-card')?.click()");
        await win.webContents.executeJavaScript("Promise.all([...document.querySelectorAll('.online-equipment-card img, .build-decoration-source-icon')].map(i => { i.loading='eager'; return i.decode().catch(() => {}); }))");
        onlineDetailAudit = await win.webContents.executeJavaScript("Boolean(document.querySelector('.online-equipment-card') && document.querySelector('.build-detail-socketed') && document.querySelector('#back-to-online-builds') && document.querySelector('.online-equipment-card .build-equipment-source-icon[data-icon-kind=\\\"weapon\\\"]')?.naturalWidth > 0 && [...document.querySelectorAll('.build-decoration-source-icon')].length > 0 && [...document.querySelectorAll('.build-decoration-source-icon')].every(i => i.naturalWidth > 0) && document.querySelectorAll('.online-equipment-card .build-equipment-source-icon[alt^=\\\"Ícone de categoria\\\"]').length >= 5)");
        win.showInactive();
        await new Promise((resolve) => setTimeout(resolve, 200));
        fs.writeFileSync(path.join(out, 'online-build-detail.png'), (await win.webContents.capturePage()).toPNG());
        await win.webContents.executeJavaScript("document.querySelector('#back-to-online-builds')?.click()");
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
      const result = await win.webContents.executeJavaScript(`(() => {
        const sidebar = document.querySelector('.sidebar').getBoundingClientRect();
        const header = document.querySelector('.content-header').getBoundingClientRect();
        const cards = [...document.querySelectorAll('#online-build-grid .build-card')].map(e => e.getBoundingClientRect());
        return { title: document.querySelector('#view-title').textContent, sidebarWidth: sidebar.width, headerHeight: header.height,
          overflow: document.documentElement.scrollWidth > innerWidth,
          visibleBuildCards: cards.length, buildColumns: new Set(cards.map(r => Math.round(r.x))).size,
          loadedAssets: [...document.images].filter(i => i.complete && i.naturalWidth > 0).length };
      })()`);
      results.push({ view, ...result, ...(view === 'online-builds' ? onlineCardAudit : {}), sidebar: await sidebarSnapshot() });
      fs.writeFileSync(path.join(out, `${view}.png`), (await win.webContents.capturePage()).toPNG());
    }
    await win.webContents.executeJavaScript("renderMonsterDetail(monsters.find(m => m.name === 'Bazelgeuse' && m.gameKey === 'world'))");
    await win.webContents.executeJavaScript("Promise.all([...document.querySelectorAll('.reward-symbol img')].map(i => i.decode().catch(() => {})))");
    const rewardIcons = await win.webContents.executeJavaScript("[...document.querySelectorAll('.reward-symbol img')].map(i => ({src:i.getAttribute('src'),loaded:i.naturalWidth>0,width:i.naturalWidth,renderWidth:i.getBoundingClientRect().width,display:getComputedStyle(i).display,visibility:getComputedStyle(i).visibility,opacity:getComputedStyle(i).opacity}))");
    fs.writeFileSync(path.join(out, 'detail.png'), (await win.webContents.capturePage()).toPNG());
    results.push({ view: 'detail', sidebar: await sidebarSnapshot(), rewardIcons: rewardIcons.length, loadedRewardIcons: rewardIcons.filter(i => i.loaded).length, sample: rewardIcons[0], missing: rewardIcons.filter(i => !i.loaded).slice(0, 5) });
    const reference = JSON.stringify(results[0].sidebar);
    const sidebarMismatches = results.filter(result => JSON.stringify(result.sidebar) !== reference).map(result => result.view);
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify({views:results.map(({sidebar,...result})=>result),sidebarMismatches,onlineDetailAudit}, null, 2));
    app.exit(sidebarMismatches.length || results.some(r => r.overflow || r.sidebarWidth && r.sidebarWidth !== 286 || r.headerHeight && r.headerHeight !== 118) || results.find(r => r.view === 'online-builds').buildColumns < 2 || !onlineDetailAudit || rewardIcons.some(i => !i.loaded) ? 1 : 0);
  } catch (error) { console.error(error); app.exit(1); }
});
