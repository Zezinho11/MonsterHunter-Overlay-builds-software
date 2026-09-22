const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'work', 'detail-audit');
fs.mkdirSync(out, { recursive: true });
app.setPath('userData', path.join(out, 'profile'));
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1680, height: 943, useContentSize: true, show: false, webPreferences: { preload: path.join(root, 'src/preload.js'), backgroundThrottling: false } });
  await win.loadFile(path.join(root, 'src/control.html'));
  async function resize(width, height) {
    win.setContentSize(width, height);
    for (let attempt=0;attempt<30;attempt++) {
      await new Promise(resolve=>setTimeout(resolve,100));
      const size=await win.webContents.executeJavaScript('[innerWidth,innerHeight]');
      if(size[0]===width&&size[1]===height)return;
    }
    throw new Error('Viewport did not settle at '+width+'x'+height);
  }
  const results = { layouts: [], sidebarTransitions: [], interactions: [], screenshots: [] };
  async function sidebarSnapshot() {
    return win.webContents.executeJavaScript(`(() => {
      const selectors=['.sidebar','.app-brand','.profile-card','.avatar','.main-nav','.nav-item.active','.sidebar-legend','.settings-button'];
      return Object.fromEntries(selectors.map(selector=>{
        const element=document.querySelector(selector),rect=element.getBoundingClientRect(),style=getComputedStyle(element);
        const round=value=>Math.round(value*10)/10;
        return [selector,{x:round(rect.x),y:round(rect.y),width:round(rect.width),height:round(rect.height),display:style.display,visibility:style.visibility}];
      }));
    })()`);
  }
  let geometryOnly = false;
  win.webContents.session.webRequest.onBeforeRequest({ urls: ['https://*/*', 'http://*/*'] }, (_details, callback) => callback({ cancel: geometryOnly }));
  await win.webContents.executeJavaScript("window.auditErrors=[];addEventListener('error',e=>auditErrors.push(e.message));");
  for (const [width, height] of [[1680,943],[1920,1080],[1366,768],[900,900],[390,844]]) {
    geometryOnly = false;
    await resize(width, height);
    await win.webContents.executeJavaScript("renderView('bestiary')");
    const catalogSidebar = await sidebarSnapshot();
    await win.webContents.executeJavaScript("renderMonsterDetail(monsters.find(m=>m.id==='world-25'));");
    const detailSidebar = await sidebarSnapshot();
    const mismatches = Object.keys(catalogSidebar).filter(selector => JSON.stringify(catalogSidebar[selector]) !== JSON.stringify(detailSidebar[selector]));
    results.sidebarTransitions.push({ width, height, mismatches, catalogSidebar, detailSidebar });
    await win.webContents.executeJavaScript("Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,8000))])");
    await new Promise(resolve => setTimeout(resolve, 1200));
    const screenshot = path.join(out, 'bazelgeuse-' + width + '.png');
    fs.writeFileSync(screenshot, (await win.webContents.capturePage()).toPNG());
    results.screenshots.push(screenshot);
  }
  await resize(1680,943);
  for(const name of ['Blood Orange Bishaten','Alatreon']){
    await win.webContents.executeJavaScript('renderMonsterDetail(monsters.find(m=>m.name==='+JSON.stringify(name)+'));');
    await win.webContents.executeJavaScript("Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,8000))])");
    await new Promise(resolve=>setTimeout(resolve,1200));
    fs.writeFileSync(path.join(out,name.replaceAll(' ','-')+'.png'),(await win.webContents.capturePage()).toPNG());
  }
  geometryOnly = true;
  for (const [width, height] of [[1680,943],[1920,1080],[1366,768],[900,900],[390,844]]) {
    await resize(width, height);
    const layout = await win.webContents.executeJavaScript(`(async()=>{
      const failures=[];
      for(const monster of monsters){
        renderMonsterDetail(monster);
        const cards=[...document.querySelectorAll('.detail-card,.monster-render-panel')];
        if(document.documentElement.scrollWidth>innerWidth+1)failures.push({id:monster.id,issue:'horizontal page overflow'});
        if(innerWidth>1100){
          if(document.documentElement.scrollHeight>innerHeight+1)failures.push({id:monster.id,issue:'vertical page overflow'});
          const map=document.querySelector('.center-part-map-card').getBoundingClientRect();
          for(const selector of ['.provenance-card','.rewards-card']){
            const r=document.querySelector(selector).getBoundingClientRect();
            if(Math.abs(r.bottom-map.bottom)>1)failures.push({id:monster.id,issue:selector+' bottom misaligned'});
          }
        }
        for(const card of cards){
          if(card.scrollHeight>card.clientHeight+2)failures.push({id:monster.id,issue:'card content escapes '+card.className});
          if(card.scrollWidth>card.clientWidth+2)failures.push({id:monster.id,issue:'card horizontal overflow '+card.className});
        }
      }
      return {width:innerWidth,height:innerHeight,monsters:monsters.length,failures};
    })()`);
    results.layouts.push(layout);
  }
  await resize(1680,943);
  results.interactions = await win.webContents.executeJavaScript(`(()=>{
    const results=[];
    const check=(name,pass)=>results.push({name,pass:!!pass});
    const monster=monsters.find(m=>m.id==='world-25');
    renderMonsterDetail(monster);
    const favorite=favoriteMonsterIds.has(monster.id);
    document.querySelector('#detail-toggle-favorite').click();
    check('favorite toggles',favoriteMonsterIds.has(monster.id)!==favorite);
    document.querySelector('#detail-toggle-favorite').click();
    check('favorite restored',favoriteMonsterIds.has(monster.id)===favorite);
    for(const button of [...document.querySelectorAll('[data-reward-rank]')]){
      const rank=button.dataset.rewardRank;
      document.querySelector('[data-reward-rank="'+rank+'"]').click();
      check('rank '+rank,document.querySelector('[data-reward-rank="'+rank+'"]').getAttribute('aria-pressed')==='true');
    }
    renderMonsterDetail(monster,'high');
    document.querySelector('.reward-row summary').click();
    check('reward expands',document.querySelector('.reward-row').open);
    document.querySelector('#detail-back-bestiary').click();
    check('catalog header restored',viewTitle.textContent==='Monsterpedia'&&!viewRoot.classList.contains('detail-view-root'));
    check('catalog grade remains',!!document.querySelector('#monster-grid'));
    renderMonsterDetail(monster);
    spoilerMode=true;revealedSpoilerIds.delete(monster.id);renderMonsterDetail(monster);
    check('spoilers protected',!document.querySelector('.reward-row')&&!!document.querySelector('.reveal-spoilers'));
    document.querySelector('.reveal-spoilers').click();
    check('spoilers reveal',!!document.querySelector('.reward-row'));
    spoilerMode=false;revealedSpoilerIds.clear();
    const sample={rewards:[{item:'Low item',conditions:[{rank:'Low Rank',type:'reward',chance:12}]},{item:'High item',conditions:[{rank:'High Rank',type:'reward',chance:23}]}]};
    const markup=detailRewardsMarkup(sample,'high');
    check('Rise ranks normalized',markup.includes('High item')&&!markup.includes('Low item'));
    check('errors',auditErrors.length===0);
    renderMonsterDetail(monster);
    return results;
  })()`);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({layouts:results.layouts.map(r=>({...r,failures:r.failures.slice(0,5),failureCount:r.failures.length})),sidebarTransitions:results.sidebarTransitions.map(({width,height,mismatches})=>({width,height,mismatches})),interactions:results.interactions,screenshots:results.screenshots},null,2));
  app.exit(results.layouts.some(r=>r.failures.length)||results.sidebarTransitions.some(r=>r.mismatches.length)||results.interactions.some(r=>!r.pass)?1:0);
}).catch(error=>{console.error(error);app.exit(1);});
