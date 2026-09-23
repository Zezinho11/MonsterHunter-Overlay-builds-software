const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'builds', 'equipment-catalog.js'), 'utf8');
const productionCatalog = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'build-equipment-catalog.v1.json'), 'utf8'));
function getCatalog() {
  const context = { window: { buildEquipmentCatalog: { games: {
    world: { available: true, armor: [{ id: 'w-head', slot: 'head', name: 'World Helm', skills: [{ name: 'Critical Eye', level: 1 }] }, { id: 'w-chest', slot: 'chest', name: 'World Mail', skills: [] }], weapons: [{ id: 'w-gs', name: 'World Great Sword', displayName: 'World Great Sword (Grande Espada)', class: 'great-sword' }], decorations: [{ id: 'w-deco-1', name: 'Attack Jewel', slot: 1, kind: 'armor' }], items: [] },
    wilds: { available: true, armor: [{ id: 'x-head', slot: 'head', name: 'Wilds Helm', skills: [] }], weapons: [], items: [] },
    mhgu: { available: true, weapons: [], armor: [], items: [], decorations: [{ id: 'mhgu-deco-2', name: 'Large Jewel', slot: 2 }], charms: [] },
  }, sources: [] } } };
  vm.runInNewContext(source, context);
  return context.window.equipmentCatalog;
}

test('filters armor by selected game and exact slot', () => {
  const catalog = getCatalog();
  assert.deepEqual(catalog.armor('Monster Hunter: World', 'head').map((item) => item.id), ['w-head']);
  assert.deepEqual(catalog.armor('Monster Hunter: World', 'chest').map((item) => item.id), ['w-chest']);
  assert.deepEqual(catalog.armor('Monster Hunter: Wilds', 'head').map((item) => item.id), ['x-head']);
  assert.equal(catalog.findArmor('Monster Hunter: World', 'x-head'), undefined);
});

test('weapon records expose a localized display label with the weapon class', () => {
  const catalog = getCatalog();
  const weapon = catalog.findWeapon('Monster Hunter: World', 'w-gs');
  assert.equal(weapon.displayName, 'World Great Sword (Grande Espada)');
  assert.equal(weapon.class, 'great-sword');
});

test('decoration legality checks level slots and MHGU multi-slot decorations', () => {
  const catalog = getCatalog();
  const worldJewel = catalog.findDecoration('world', 'w-deco-1');
  const mhguJewel = catalog.findDecoration('mhgu', 'mhgu-deco-2');
  assert.equal(catalog.decorationFits('world', [1, 2], 0, worldJewel), true);
  assert.equal(catalog.decorationFits('world', [1, 2], 0, { slot: 2 }), false);
  assert.equal(catalog.decorationFits('world', [1, 2], 1, { slot: 3 }), false);
  assert.equal(catalog.decorationFits('mhgu', [1, 1, 1], 0, mhguJewel), true);
  assert.equal(catalog.decorationFits('mhgu', [1, 1, 1], 2, mhguJewel), false);
  assert.equal(catalog.decorationFits('mhgu', [1, 1, 1], 0, mhguJewel, [1]), true);
  assert.equal(catalog.decorationFits('mhgu', [1, 1, 1], 0, mhguJewel, [1, 2]), false);
});

test('generated catalogs include game-scoped decorations, published charms and World arm pieces', () => {
  for (const key of ['world', 'rise', 'wilds', 'mhgu']) {
    const game = productionCatalog.games[key];
    assert.ok(game.decorations.length > 0, `${key} decorations`);
    assert.ok(game.decorations.every((item) => item.game === key && item.sourceId && item.slot > 0));
  }
  assert.ok(productionCatalog.games.world.charms.length > 0);
  assert.ok(productionCatalog.games.wilds.charms.length > 0);
  assert.ok(productionCatalog.games.world.armor.some((item) => item.slot === 'arms'));
});
