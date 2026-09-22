const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'work/shell-audit');
fs.mkdirSync(out, { recursive: true });
app.setPath('userData', path.join(out, 'profile'));
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1680, height: 943, useContentSize: true, show: false, webPreferences: { preload: path.join(root, 'src/preload.js') } });
  const results = [];
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
      results.push({ view, ...result, sidebar: await sidebarSnapshot() });
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
    console.log(JSON.stringify({views:results.map(({sidebar,...result})=>result),sidebarMismatches}, null, 2));
    app.exit(sidebarMismatches.length || results.some(r => r.overflow || r.sidebarWidth && r.sidebarWidth !== 190 || r.headerHeight && r.headerHeight !== 118) || results.find(r => r.view === 'online-builds').buildColumns < 2 || rewardIcons.some(i => !i.loaded) ? 1 : 0);
  } catch (error) { console.error(error); app.exit(1); }
});
