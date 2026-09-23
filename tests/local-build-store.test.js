const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'builds', 'local-store.js'), 'utf8');
function getStore() {
  const storage = new Map();
  const context = { window: { localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) } } };
  vm.runInNewContext(source, context);
  return context.window.localBuildStore;
}

test('normalizes a complete local build without losing equipment fields', () => {
  const store = getStore();
  const build = store.normalizeBuild({ title: 'Set teste', game: 'Monster Hunter: World', weapon: 'Arco', armor: { head: 'Alpha Helm' }, skills: ['Weakness Exploit'], decorations: ['Tenderizer Jewel'], notes: 'Teste' });
  assert.equal(build.title, 'Set teste');
  assert.equal(build.armor.head, 'Alpha Helm');
  assert.deepEqual(build.skills, ['Weakness Exploit']);
  assert.deepEqual(build.decorations, ['Tenderizer Jewel']);
  assert.equal(build.notes, 'Teste');
  assert.equal(build.weaponId, '');
  assert.equal(JSON.stringify(build.armorIds), JSON.stringify({ head: '', chest: '', arms: '', waist: '', legs: '' }));
});

test('preserves equipment ids and skills linked to each armor slot', () => {
  const store = getStore();
  const build = store.normalizeBuild({ game: 'Monster Hunter: Wilds', weaponId: 'wilds-weapon-12', armorIds: { head: 'wilds-armor-1' }, armorSkills: { head: [{ name: 'Critical Eye', level: 2 }] } });
  assert.equal(build.weaponId, 'wilds-weapon-12');
  assert.equal(build.armorIds.head, 'wilds-armor-1');
  assert.equal(JSON.stringify(build.armorSkills.head), JSON.stringify([{ name: 'Critical Eye', level: 2 }]));
});

test('persists talisman configuration and exact decoration socket positions', () => {
  const store = getStore();
  const build = store.normalizeBuild({ talismanId: 'charm-2', talismanSkills: [{ name: 'Evade Window', level: 2 }], talismanSlots: [2, 1], decorationSlots: { head: [{ id: 'deco-1', name: 'Jewel', requiredSlot: 1, slotIndex: 2 }] } });
  assert.equal(build.talismanId, 'charm-2');
  assert.deepEqual(JSON.parse(JSON.stringify(build.talismanSlots)), [2, 1]);
  assert.equal(build.decorationSlots.head[0].slotIndex, 2);
});

test('exports and imports the versioned build format', () => {
  const store = getStore();
  const original = store.normalizeBuild({ title: 'Exportada', weapon: 'Martelo' });
  const imported = store.importData(store.exportData([original]));
  assert.equal(imported.length, 1);
  assert.equal(imported[0].title, 'Exportada');
  assert.equal(imported[0].weapon, 'Martelo');
});
