const test = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('../src/data/monster-catalog.v1.json');

test('local monster catalog is versioned and isolated by game', () => {
  assert.equal(catalog.schema, 'monster-catalog.v1');
  assert.ok(catalog.entries.length >= 150);
  assert.deepEqual(new Set(catalog.entries.map((entry) => entry.game)), new Set(['world', 'rise', 'wilds', 'mhgu']));
  assert.equal(new Set(catalog.entries.map((entry) => entry.id)).size, catalog.entries.length);
});

test('catalog records preserve source-aware fields without inventing unavailable values', () => {
  for (const entry of catalog.entries) {
    assert.ok(entry.name);
    assert.ok(Array.isArray(entry.weaknesses));
    assert.ok(Array.isArray(entry.parts));
    assert.ok(entry.availability);
    if (!entry.availability.parts) assert.equal(entry.parts.length, 0);
  }
  assert.ok(catalog.entries.some((entry) => entry.game === 'wilds' && entry.availability.parts));
  assert.ok(catalog.entries.some((entry) => entry.game === 'mhgu' && entry.availability.parts));
});

test('World catalog includes Iceborne records', () => {
  const worldNames = new Set(catalog.entries.filter((entry) => entry.game === 'world').map((entry) => entry.name));
  for (const name of ['Velkhana', 'Shara Ishvalda', 'Fatalis', 'Ruiner Nergigante', 'Raging Brachydios', 'Banbaro', 'Beotodus']) {
    assert.ok(worldNames.has(name), `Missing World/Iceborne monster: ${name}`);
  }
});

test('catalog associates validated render references without replacing missing art with icons', () => {
  assert.ok(catalog.entries.filter((entry) => entry.render && entry.availability.render).length >= 150);
  for (const name of ['Velkhana', 'Magnamalo', 'Zoh Shia']) {
    const entry = catalog.entries.find((monster) => monster.name === name);
    assert.match(entry.render, /^https:\/\/monsterhunter\.tools\/.*\/render\.(?:png|jpe?g)(?:\?.*)?$/);
  }
  for (const entry of catalog.entries.filter((monster) => !monster.availability.render)) {
    assert.equal(entry.render, null);
  }
});

test('every monster has an icon or an explicit unavailable state, and missing renders get a PNG fallback image', () => {
  assert.ok(catalog.entries.filter((entry) => !entry.icon).every((entry) => entry.availability.icon === false), 'Missing icons must be explicit, never silently inferred');
  for (const entry of catalog.entries.filter((monster) => !monster.render)) {
    if (entry.icon) assert.match(entry.imageFallback || entry.icon, /\.png(?:\?.*)?$/i, `Missing PNG fallback: ${entry.game}/${entry.name}`);
  }
});

test('Fandom render fallback uses exact game/variant assets when available', () => {
  for (const name of ['Guardian Doshaguma', 'Guardian Arkveld', 'Guardian Fulgur Anjanath', 'Guardian Rathalos', 'Guardian Ebony Odogaron', 'Gogmazios']) {
    const entry = catalog.entries.find((monster) => monster.game === 'wilds' && monster.name === name);
    assert.equal(entry.renderSource, 'monster-hunter-fandom');
    assert.match(entry.render, /images\.wikia\.com\/monsterhunter\/.*format=png/);
  }
  assert.ok(catalog.entries.filter((monster) => monster.game === 'mhgu' && monster.renderSource === 'monster-hunter-fandom-cross-game').length >= 50);
  const gore = catalog.entries.find((monster) => monster.game === 'mhgu' && monster.name === 'Gore Magala');
  const chaoticGore = catalog.entries.find((monster) => monster.game === 'mhgu' && monster.name === 'Chaotic Gore Magala');
  assert.ok(gore.render && chaoticGore.render);
  assert.notEqual(gore.render, chaoticGore.render, 'Gore Magala não pode reutilizar o render de Chaotic Gore Magala');
  assert.doesNotMatch(gore.render, /Chaotic/i);
  assert.equal(catalog.entries.filter((monster) => monster.game === 'mhgu' && monster.render).length, 130);
});

test('catalog contains Portuguese descriptive fields for every monster', () => {
  assert.equal(catalog.entries.filter((entry) => entry.descriptionPt).length, catalog.entries.length);
  assert.equal(catalog.entries.filter((entry) => entry.description && entry.descriptionPt === entry.description).length, 0, 'A descrição visível não pode continuar igual ao texto inglês de origem');
  for (const entry of catalog.entries) {
    assert.ok(!/[\uFFFD]/.test(entry.descriptionPt), `Texto inválido em português: ${entry.name}`);
  }
  assert.ok(catalog.entries.filter((entry) => entry.ecologyPt?.characteristics || entry.ecologyPt?.usefulInfo).length >= 160);
});

test('catalog contains qualitative weak-point stars and breakable part metadata', () => {
  const enriched = catalog.entries.filter((entry) => entry.parts.some((part) => part.weakPointStars));
  assert.ok(enriched.length >= 100, `Expected weak-point metadata for most catalog records, got ${enriched.length}`);
  assert.ok(catalog.entries.some((entry) => entry.parts.some((part) => part.breakable)));
});

test('catalog has reward coverage for every supported monster and health coverage by source capability', () => {
  for (const game of ['world', 'rise', 'wilds', 'mhgu']) {
    assert.ok(catalog.entries.filter((entry) => entry.game === game).every((entry) => entry.rewards.length > 0), `Missing rewards in ${game}`);
  }
  assert.ok(catalog.entries.filter((entry) => entry.game === 'rise').every((entry) => entry.baseHealth != null));
  assert.ok(catalog.entries.filter((entry) => entry.game === 'wilds').every((entry) => entry.baseHealth != null));
  assert.ok(catalog.entries.filter((entry) => entry.game === 'world').filter((entry) => entry.healthProfiles?.length).length >= 70);
  assert.ok(catalog.entries.filter((entry) => entry.game === 'mhgu' && entry.type === 'large').filter((entry) => entry.healthProfiles?.length).length >= 90);
});

test('catalog audit fields are structurally present for every monster', () => {
  for (const monster of catalog.entries) {
    assert.ok(monster.id && monster.game && monster.name);
    assert.ok(monster.availability && typeof monster.availability === 'object');
    assert.ok(Array.isArray(monster.rewards));
    assert.ok(Array.isArray(monster.ranks));
  }
});

test('Rise and World large-monster records preserve numeric hitzones when the source publishes them', () => {
  const riseWithHitzones = catalog.entries.filter((monster) => monster.game === 'rise' && monster.parts?.some((part) => Number.isFinite(part.hitzones?.cut)));
  const worldWithHitzones = catalog.entries.filter((monster) => monster.game === 'world' && monster.parts?.some((part) => Number.isFinite(part.hitzones?.cut)));
  assert.equal(riseWithHitzones.length, 70);
  assert.ok(worldWithHitzones.length >= 60);
});

test('all published numeric hitzone tables are present for the modern game catalogs', () => {
  for (const [game, expected] of [['world', 87], ['rise', 70], ['wilds', 34]]) {
    const records = catalog.entries.filter((monster) => monster.game === game);
    const withHitzones = records.filter((monster) => monster.parts?.some((part) => Number.isFinite(part.hitzones?.cut) || Number.isFinite(part.hitzones?.slash)));
    assert.equal(withHitzones.length, expected);
  }
});

test('catalog exposes rank availability without inventing Wilds Master Rank', () => {
  for (const entry of catalog.entries) assert.ok(Array.isArray(entry.ranks), `Missing rank metadata: ${entry.name}`);
  assert.ok(catalog.entries.filter((entry) => entry.game === 'rise').every((entry) => entry.ranks.includes('master')));
  assert.ok(catalog.entries.filter((entry) => entry.game === 'wilds').every((entry) => !entry.ranks.includes('master')));
  assert.ok(catalog.entries.some((entry) => entry.game === 'world' && entry.name === 'Great Jagras' && entry.ranks.includes('low') && entry.ranks.includes('high') && entry.ranks.includes('master')));
  assert.ok(catalog.entries.filter((entry) => entry.game === 'mhgu').every((entry) => entry.ranks.includes('low') && entry.ranks.includes('high') && entry.ranks.includes('master')));
});
