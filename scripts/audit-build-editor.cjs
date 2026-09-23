const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'work', 'build-editor-audit');
fs.mkdirSync(output, { recursive: true });
app.setPath('userData', path.join(output, 'profile'));

ipcMain.handle('profile:state', () => ({ authenticated: false, profile: null, mode: 'local' }));
ipcMain.handle('builds:online-mine', () => []);

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1680, height: 943, useContentSize: true, show: false,
    webPreferences: { preload: path.join(root, 'src', 'preload.js') } });
  try {
    await win.loadFile(path.join(root, 'src', 'control.html'));
    const report = await win.webContents.executeJavaScript(`(async () => {
      const games = [
        ['Monster Hunter: Wilds', 'wilds'],
        ['Monster Hunter: World', 'world'],
        ['Monster Hunter: Rise', 'rise'],
        ['Monster Hunter: Generations Ultimate', 'mhgu'],
      ];
      const slots = ['head', 'chest', 'arms', 'waist', 'legs'];
      const results = [];
      renderView('saved-builds');
      for (const [game, key] of games) {
        const data = equipmentCatalog.gameData(game);
        const gameSelect = document.querySelector('#editor-game');
        gameSelect.value = game;
        gameSelect.dispatchEvent(new Event('change', { bubbles: true }));
        const weapon = data.weapons.find((item) => equipmentCatalog.slotCapacities(game, item).length) || data.weapons[0];
        if (!weapon) { results.push({ game, available: false }); continue; }

        const weaponFilter = document.querySelector('#filter-weapon');
        weaponFilter.value = weapon.displayName || weapon.name;
        weaponFilter.dispatchEvent(new Event('input', { bubbles: true }));
        const weaponSelect = document.querySelector('#editor-weapon');
        const weaponOptions = [...weaponSelect.options].map((option) => option.value).filter(Boolean);
        weaponSelect.value = weapon.id;
        weaponSelect.dispatchEvent(new Event('change', { bubbles: true }));

        const armorIds = {}, armorSkills = {}, armorOptionChecks = {};
        for (const slot of slots) {
          const records = equipmentCatalog.armor(game, slot);
          const piece = records.find((item) => item.skills?.length) || records[0];
          if (!piece) { armorOptionChecks[slot] = false; continue; }
          const filter = document.querySelector('#filter-' + slot);
          filter.value = piece.displayName || piece.name;
          filter.dispatchEvent(new Event('input', { bubbles: true }));
          const select = document.querySelector('#editor-' + slot);
          const optionIds = [...select.options].map((option) => option.value).filter(Boolean);
          armorOptionChecks[slot] = optionIds.length > 0 && optionIds.every((id) => records.some((record) => record.id === id)) && optionIds.includes(piece.id);
          select.value = piece.id;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          armorIds[slot] = piece.id;
          armorSkills[slot] = piece.skills || [];
        }

        const capacities = equipmentCatalog.slotCapacities(game, weapon);
        const compatibleDecoration = data.decorations.find((item) => capacities.some((capacity, index) => equipmentCatalog.decorationFits(game, capacities, index, item)));
        weaponSelect.dispatchEvent(new Event('change', { bubbles: true }));
        const decorationSelect = document.querySelector('#decoration-slots-weapon .decoration-slot-select');
        const decorationOptions = decorationSelect ? [...decorationSelect.options].map((option) => option.value).filter(Boolean) : [];
        const decorationIndex = Number(decorationSelect?.dataset.slotIndex ?? 0);
        const invalidDecorationOptions = decorationOptions.flatMap((id) => {
          const item = equipmentCatalog.findDecoration(game, id);
          return !item || !equipmentCatalog.decorationFits(game, capacities, decorationIndex, item) ? [{ id, name: item?.name || '', slot: item?.slot || null }] : [];
        });
        const decorationOptionsLegal = invalidDecorationOptions.length === 0;
        if (compatibleDecoration && decorationSelect) {
          decorationSelect.value = compatibleDecoration.id;
          decorationSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const charm = data.charms[0];
        const charmSelect = document.querySelector('#editor-charm-catalog');
        if (charm) {
          charmSelect.value = charm.id;
          charmSelect.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          document.querySelector('#editor-talisman').value = 'Talismã personalizado de auditoria';
          document.querySelector('#editor-talisman-skill-1').value = 'Skill de teste';
          document.querySelector('#editor-talisman-level-1').value = '1';
          document.querySelector('#editor-talisman-slots').value = '1';
          document.querySelector('#editor-talisman-slots').dispatchEvent(new Event('change', { bubbles: true }));
        }

        for (const [slot, skills] of Object.entries(armorSkills)) {
          if (!skills.length) continue;
          const preview = document.querySelector('#skills-' + slot).innerText;
          if (!skills.every((skill) => preview.includes(skill.name))) armorOptionChecks[slot] = false;
        }

        const title = 'Auditoria editor ' + key;
        document.querySelector('#editor-name').value = title;
        document.querySelector('#editor-skills').value = 'Skill adicional';
        document.querySelector('#editor-notes').value = 'Fixture isolada.';
        document.querySelector('#save-build').click();
        const saved = localBuildStore.load().find((build) => build.title === title);
        const savedSlots = saved ? Object.keys(saved.armorIds).filter((slot) => saved.armorIds[slot]).length : 0;
        const socketed = saved?.decorationSlots?.weapon || [];
        const result = {
          game, available: data.available === true,
          weapon: Boolean(saved?.weaponId === weapon.id && weaponOptions.includes(weapon.id)),
          armorSlots: savedSlots,
          armorOptionsStayInSlot: Object.values(armorOptionChecks).length === 5 && Object.values(armorOptionChecks).every(Boolean),
          armorSkillsPersist: slots.every((slot) => !armorSkills[slot]?.length || saved?.armorSkills?.[slot]?.some((skill) => skill.name === armorSkills[slot][0].name)),
          decorationOptionsLegal, invalidDecorationOptions: invalidDecorationOptions.slice(0, 8), decorationSlotCapacity: capacities[decorationIndex],
          decorationSlotIndex: decorationIndex, decorationSelectCapacity: Number(decorationSelect?.dataset.capacity), decorationSelectPart: decorationSelect?.dataset.part,
          decorationOptionSample: decorationOptions.slice(0, 8).map((id) => { const item = equipmentCatalog.findDecoration(game, id); return { id, slot: item?.slot, fits: equipmentCatalog.decorationFits(game, capacities, decorationIndex, item) }; }),
          selectedWeaponId: weaponSelect.value,
          decorationSaved: compatibleDecoration ? socketed.some((entry) => entry.id === compatibleDecoration.id) : socketed.length === 0,
          charmOrCustomTalismanSaved: Boolean(saved?.talisman && (charm ? saved.talismanId === charm.id : saved.talismanSkills?.some((skill) => skill.name === 'Skill de teste'))),
          isolatedFixture: title,
        };
        results.push(result);
      }
      return { results, sidebarWidth: document.querySelector('.sidebar')?.getBoundingClientRect().width,
        overflow: document.documentElement.scrollWidth > innerWidth };
    })()`);
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    const passed = report.results.length === 4 && report.results.every((entry) => entry.available && entry.weapon && entry.armorSlots === 5 && entry.armorOptionsStayInSlot && entry.armorSkillsPersist && entry.decorationOptionsLegal && entry.decorationSaved && entry.charmOrCustomTalismanSaved) && report.sidebarWidth === 286 && !report.overflow;
    app.exit(passed ? 0 : 1);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
