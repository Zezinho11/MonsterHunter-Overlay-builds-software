const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'work/catalog-audit');
fs.mkdirSync(out, { recursive: true });
app.setPath('userData', path.join(out, 'profile'));
app.whenReady().then(async () => {
  const win = new BrowserWindow({width:1680,height:943,useContentSize:true,show:false,webPreferences:{preload:path.join(root,'src/preload.js'),backgroundThrottling:false}});
  try {
    await win.loadFile(path.join(root,'src/control.html'));
    await win.webContents.executeJavaScript("renderView('bestiary')");
    await win.webContents.executeJavaScript("Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,10000))])");
    const results=[];
    for(const [width,height] of [[1680,943],[1920,1080],[900,900],[390,844]]) {
      win.setContentSize(width,height);
      await new Promise(r=>setTimeout(r,600));
      results.push(await win.webContents.executeJavaScript(`({viewport:[innerWidth,innerHeight],overflow:document.documentElement.scrollWidth>innerWidth,columns:getComputedStyle(document.querySelector('#monster-grid')).gridTemplateColumns,regions:[...document.querySelectorAll('.toolbar,.material-search-card,.monster-card')].slice(0,3).map(e=>({name:e.className,rect:e.getBoundingClientRect().toJSON()}))})`));
      fs.writeFileSync(path.join(out,`catalog-${width}.png`),(await win.webContents.capturePage()).toPNG());
    }
    const interactions=await win.webContents.executeJavaScript(`(()=>{const checks=[];const search=document.querySelector('#monster-search');search.value='Bazelgeuse';search.dispatchEvent(new Event('input'));checks.push({name:'search',pass:[...document.querySelectorAll('.monster-card')].every(e=>e.textContent.includes('Bazelgeuse'))});document.querySelector('.monster-card').click();document.querySelector('#detail-back-bestiary').click();checks.push({name:'return title',pass:viewTitle.textContent==='Monsterpedia'});const mat=document.querySelector('#material-search');mat.value='scale';mat.dispatchEvent(new Event('input'));checks.push({name:'material results',pass:!!document.querySelector('.material-result')});return checks})()`);
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,interactions},null,2));
    console.log(JSON.stringify({results,interactions},null,2));
    app.exit(results.some(r=>r.overflow)||interactions.some(r=>!r.pass)?1:0);
  }catch(error){console.error(error);app.exit(1);}
});
