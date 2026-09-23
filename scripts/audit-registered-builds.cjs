const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'work', 'registered-build-audit');
fs.mkdirSync(output, { recursive: true });
app.setPath('userData', path.join(output, 'profile'));

ipcMain.handle('profile:state', () => ({ authenticated: false, profile: null, mode: 'local' }));
ipcMain.handle('builds:online-mine', () => []);
ipcMain.handle('builds:online-search', () => []);

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1680,
    height: 943,
    useContentSize: true,
    show: false,
    webPreferences: { preload: path.join(root, 'src', 'preload.js') },
  });

  try {
    await win.loadFile(path.join(root, 'src', 'control.html'));
    const prepared = await win.webContents.executeJavaScript(`(() => {
      const cases = [];
      for (const game of ['Monster Hunter: Wilds', 'Monster Hunter: World', 'Monster Hunter: Rise', 'Monster Hunter: Generations Ultimate']) {
        const data = equipmentCatalog.gameData(game);
        const weapon = data.weapons.find((item) => equipmentCatalog.slotCapacities(game, item).length) || data.weapons[0];
        if (!weapon) { cases.push({ game, unavailable: true }); continue; }
        const armorIds = {}, armor = {}, armorSkills = {};
        for (const slot of ['head', 'chest', 'arms', 'waist', 'legs']) {
          const piece = equipmentCatalog.armor(game, slot).find((item) => item.skills?.length) || equipmentCatalog.armor(game, slot)[0];
          if (!piece) continue;
          armorIds[slot] = piece.id; armor[slot] = piece.name; armorSkills[slot] = piece.skills || [];
        }
        const charm = data.charms[0];
        const capacities = equipmentCatalog.slotCapacities(game, weapon);
        const decoration = data.decorations.find((item) => capacities.some((capacity, index) => equipmentCatalog.decorationFits(game, capacities, index, item)));
        const decorationSlots = { weapon: decoration ? [{ id: decoration.id, name: decoration.name, requiredSlot: decoration.slot, slotIndex: capacities.findIndex((capacity, index) => equipmentCatalog.decorationFits(game, capacities, index, decoration)) }] : [] };
        const build = window.localBuildStore.normalizeBuild({
          id: 'registered-build-audit-' + equipmentCatalog.gameKey(game), title: 'Build de validação ' + equipmentCatalog.gameKey(game), game,
          weapon: weapon.displayName || weapon.name, weaponId: weapon.id, type: 'DPS', armor, armorIds, armorSkills,
          talisman: charm?.name || 'Talismã personalizado', talismanId: charm?.id || '',
          talismanSkills: charm?.skills || [{ name: 'Skill de validação', level: 1 }],
          talismanSlots: equipmentCatalog.slotCapacities(game, charm), skills: ['Habilidade adicional de validação'],
          decorationSlots, decorations: decoration ? [decoration.name] : [], notes: 'Notas da fixture de auditoria.',
          createdAt: '2026-09-23T12:00:00.000Z',
        });
        cases.push({ game, key: equipmentCatalog.gameKey(game), weapon: build.weapon, armor, charm: build.talisman,
          decoration: decoration?.name || '', skill: Object.values(armorSkills).flat()[0]?.name || '', hasSlotDecoration: Boolean(decoration) });
      }
      localBuildStore.save(cases.filter((entry) => !entry.unavailable).map((entry) => {
        const game = entry.game, data = equipmentCatalog.gameData(game);
        const weapon = data.weapons.find((item) => (item.displayName || item.name) === entry.weapon);
        const armorIds = {}, armor = {}, armorSkills = {};
        for (const slot of ['head', 'chest', 'arms', 'waist', 'legs']) {
          const piece = equipmentCatalog.armor(game, slot).find((item) => item.name === entry.armor[slot]);
          if (piece) { armorIds[slot] = piece.id; armor[slot] = piece.name; armorSkills[slot] = piece.skills || []; }
        }
        const charm = data.charms.find((item) => item.name === entry.charm);
        const decoration = data.decorations.find((item) => item.name === entry.decoration);
        const capacities = equipmentCatalog.slotCapacities(game, weapon);
        const decorationSlots = { weapon: decoration ? [{ id: decoration.id, name: decoration.name, requiredSlot: decoration.slot, slotIndex: capacities.findIndex((capacity, index) => equipmentCatalog.decorationFits(game, capacities, index, decoration)) }] : [] };
        return window.localBuildStore.normalizeBuild({ id: 'registered-build-audit-' + entry.key, title: 'Build de validação ' + entry.key, game,
          weapon: entry.weapon, weaponId: weapon?.id || '', type: 'DPS', armor, armorIds, armorSkills,
          talisman: entry.charm, talismanId: charm?.id || '', talismanSkills: charm?.skills || [{ name: 'Skill de validação', level: 1 }],
          talismanSlots: equipmentCatalog.slotCapacities(game, charm), skills: ['Habilidade adicional de validação'],
          decorationSlots, decorations: decoration ? [decoration.name] : [], notes: 'Notas da fixture de auditoria.', createdAt: '2026-09-23T12:00:00.000Z' });
      }));
      return cases;
    })()`);

    const cases = [];
    for (const fixture of prepared.filter((entry) => !entry.unavailable)) {
      await win.webContents.executeJavaScript("renderView('saved-builds')");
      await win.webContents.executeJavaScript(`document.querySelector('[data-saved-build-id=\\\"registered-build-audit-${fixture.key}\\\"]')?.click()`);
      const detail = await win.webContents.executeJavaScript(`(() => {
        const text = document.querySelector('#view-root')?.innerText || '';
        const title = ${JSON.stringify(`Build de validação ${fixture.key}`)};
        return {
          title: text.includes(title), weapon: text.includes(${JSON.stringify(fixture.weapon)}),
          armorCount: document.querySelectorAll('.build-equipment-card').length,
          armorSkill: ${JSON.stringify(fixture.skill)} ? text.includes(${JSON.stringify(fixture.skill)}) : false,
          talisman: text.includes(${JSON.stringify(fixture.charm)}),
          decoration: ${JSON.stringify(fixture.decoration)} ? text.includes(${JSON.stringify(fixture.decoration)}) : !${JSON.stringify(fixture.hasSlotDecoration)},
          notes: text.includes('Notas da fixture de auditoria.'), backButton: Boolean(document.querySelector('#back-to-saved-builds')),
          sidebarWidth: document.querySelector('.sidebar')?.getBoundingClientRect().width || 0,
          overflow: document.documentElement.scrollWidth > innerWidth,
          fallbackIcons: document.querySelectorAll('.build-equipment-fallback').length,
        };
      })()`);
      if (fixture.key === 'world') {
        win.showInactive();
        await new Promise((resolve) => setTimeout(resolve, 300));
        fs.writeFileSync(path.join(output, 'saved-build-detail.png'), (await win.webContents.capturePage()).toPNG());
      }
      await win.webContents.executeJavaScript("document.querySelector('#back-to-saved-builds')?.click()");
      const returned = await win.webContents.executeJavaScript(`({
        listVisible: Boolean(document.querySelector('.saved-build-grid [data-saved-build-id]')),
        title: document.querySelector('#view-title')?.textContent,
        sidebarWidth: document.querySelector('.sidebar')?.getBoundingClientRect().width,
        overflow: document.documentElement.scrollWidth > innerWidth,
      })`);
      cases.push({ fixture, detail, returned });
    }
    const report = { cases };
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    const passed = cases.length === 4 && cases.every(({ detail, returned }) => detail.title && detail.weapon && detail.armorCount >= 6 && detail.armorSkill && detail.talisman && detail.decoration && detail.notes && detail.backButton && detail.sidebarWidth === 286 && !detail.overflow && returned.listVisible && returned.title === 'Builds registradas' && returned.sidebarWidth === 286 && !returned.overflow);
    app.exit(passed ? 0 : 1);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
