const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'work/profile-audit');
fs.mkdirSync(output, { recursive:true });
app.setPath('userData', path.join(output,'session'));
let profile = {id:'audit-profile',displayName:'NomeCaçador',email:'audit@example.test'};
ipcMain.handle('profile:state', () => ({authenticated:true,profile,mode:'local'}));
ipcMain.handle('profile:update', (_, input) => {profile={...profile,...input};return {authenticated:true,profile,mode:'local'};});
app.whenReady().then(async () => {
 const win = new BrowserWindow({width:1680,height:943,useContentSize:true,show:false,webPreferences:{offscreen:true,backgroundThrottling:false,preload:path.join(root,'src/preload.js')}});
 try {
 await win.loadFile(path.join(root,'src/control.html'));
 await win.webContents.executeJavaScript(`new Promise(resolve=>{const check=()=>profileReady?resolve():setTimeout(check,20);check();})`);
 await win.webContents.executeJavaScript(`profileReady=true; applyProfileState({authenticated:true,profile:${JSON.stringify(profile)},mode:'local'}); localStorage.removeItem(activityKey()); renderView('bestiary'); renderMonsterDetail(monsters[0]); renderView('saved-builds'); document.querySelector('#editor-name').value='Build de auditoria'; document.querySelector('#save-build').click(); renderView('app-settings');`);
 assert.equal(await win.webContents.executeJavaScript(`!!document.querySelector('#edit-profile') && readActivity().some(e=>e.kind==='monster') && readActivity().some(e=>e.kind==='build')`),true);
 await win.webContents.executeJavaScript(`document.querySelector('#edit-profile').click(); document.querySelector('#steam-url').value='https://steamcommunity.com/id/audit';document.querySelector('#wilds-code').value='ABC123';document.querySelector('#hunter-title').value='Explorador';document.querySelector('#profile-edit-form').requestSubmit(document.querySelector('#profile-edit-form button[type=submit]'));`);
 await new Promise(r=>setTimeout(r,300));
 assert.equal(profile.wildsCode,'ABC123');
 assert.equal(profile.steamUrl,'https://steamcommunity.com/id/audit');
 assert.equal(await win.webContents.executeJavaScript(`document.querySelector('#copy-wilds').disabled`),false);
 console.log('Saved social fields verified.');
 assert.equal(await win.webContents.executeJavaScript(`(()=>{const rows=readActivity().length;applyProfileState({authenticated:true,profile:{id:'other',displayName:'Outro'},mode:'local'}); const isolated=readActivity().length===0; applyProfileState({authenticated:true,profile:${JSON.stringify(profile)},mode:'local'});renderSettings();return rows>0&&isolated;})()`),true);
 const snapshots=[];
 for(const view of ['bestiary','online-builds','saved-builds','overlay-settings','app-settings']) {
 await win.webContents.executeJavaScript(`clearDetailHeader();renderView('${view}')`);
 snapshots.push(await win.webContents.executeJavaScript(`JSON.stringify(['.sidebar','.app-brand','.profile-card','.main-nav','.settings-button'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.x,r.y,r.width,r.height]}))`));
 }
 assert.equal(new Set(snapshots).size,1);
 for(const size of [[1680,943],[1920,1080],[900,900],[390,844]]) {
 win.setContentSize(...size);
 await win.webContents.executeJavaScript(`applyProfileState({authenticated:true,profile:${JSON.stringify(profile)},mode:'local'}); clearDetailHeader();renderView('app-settings');new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);
 await new Promise(r=>setTimeout(r,500));
 assert.equal(await win.webContents.executeJavaScript(`document.querySelector('#view-title').textContent`),'PERFIL DO CAÇADOR');
 console.log(await win.webContents.executeJavaScript(`JSON.stringify({name:profileState.profile.displayName,steam:profileState.profile.steamUrl,code:profileState.profile.wildsCode,frame:getComputedStyle(document.querySelector('.profile-hero-card'),'::before').cssText,frameDisplay:getComputedStyle(document.querySelector('.profile-hero-card'),'::before').display})`));
 assert.equal(await win.webContents.executeJavaScript('document.documentElement.scrollWidth>innerWidth'),false,`overflow ${size}`);
 fs.writeFileSync(path.join(output,`profile-${size[0]}.png`),(await win.webContents.capturePage()).toPNG());
 }
 console.log('PASS: edits, history, account isolation, shared sidebar, four viewports.');app.exit(0);
 } catch(e) {console.error(e);app.exit(1);}
});
