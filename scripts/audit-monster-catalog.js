const fs = require('node:fs');
const path = require('node:path');

const catalogPath = path.join(__dirname, '..', 'src', 'data', 'monster-catalog.v1.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const entries = catalog.entries || [];

const games = {
  world: 'Monster Hunter: World',
  rise: 'Monster Hunter: Rise',
  wilds: 'Monster Hunter: Wilds',
  mhgu: 'Monster Hunter: Generations Ultimate',
};

const hasHealth = (entry) => entry.baseHealth != null || Boolean(entry.healthProfiles?.length);
const hasVisibleImage = (entry) => Boolean(entry.icon || entry.iconFallbackAsset);
const hasAnyPartData = (entry) => Boolean(entry.parts?.length);
const hasNumericHitzone = (entry) => Boolean(entry.parts?.some((part) => part.hitzones && Object.values(part.hitzones).some((value) => Number.isFinite(value))));

const report = Object.entries(games).map(([game, label]) => {
  const records = entries.filter((entry) => entry.game === game);
  const missing = (predicate) => records.filter((entry) => !predicate(entry)).map((entry) => entry.name);
  const ranks = Object.fromEntries(['low', 'high', 'master'].map((rank) => [rank, records.filter((entry) => entry.ranks?.includes(rank)).length]));
  return {
    game,
    label,
    total: records.length,
    coverage: {
      descriptionsPt: records.filter((entry) => Boolean(entry.descriptionPt)).length,
      rewards: records.filter((entry) => Boolean(entry.rewards?.length)).length,
      health: records.filter(hasHealth).length,
      parts: records.filter(hasAnyPartData).length,
      numericHitzones: records.filter(hasNumericHitzone).length,
      images: records.filter(hasVisibleImage).length,
      renders: records.filter((entry) => Boolean(entry.render)).length,
    },
    ranks,
    missing: {
      health: missing(hasHealth),
      parts: missing(hasAnyPartData),
      numericHitzones: missing(hasNumericHitzone),
      images: missing(hasVisibleImage),
      renders: missing((entry) => Boolean(entry.render)),
    },
  };
});

const structuralErrors = entries.flatMap((entry) => {
  const errors = [];
  if (!entry.id || !entry.game || !entry.name) errors.push('missing identity');
  if (!entry.availability || typeof entry.availability !== 'object') errors.push('missing availability');
  if (!Array.isArray(entry.rewards)) errors.push('rewards is not an array');
  if (!Array.isArray(entry.ranks)) errors.push('ranks is not an array');
  if (errors.length) return [`${entry.game}/${entry.name}: ${errors.join(', ')}`];
  return [];
});

console.log(`Monster catalog audit · ${catalog.schema} · ${entries.length} entries`);
for (const result of report) {
  const c = result.coverage;
  console.log(`${result.game}: ${result.total} | pt ${c.descriptionsPt}/${result.total} | rewards ${c.rewards}/${result.total} | health ${c.health}/${result.total} | parts ${c.parts}/${result.total} | hitzones ${c.numericHitzones}/${result.total} | images ${c.images}/${result.total} | renders ${c.renders}/${result.total}`);
  console.log(`  ranks: low ${result.ranks.low}, high ${result.ranks.high}, master/G ${result.ranks.master}`);
  for (const [field, names] of Object.entries(result.missing)) {
    if (names.length) console.log(`  missing ${field} (${names.length}): ${names.join(', ')}`);
  }
}

if (structuralErrors.length) {
  console.error(`Structural errors (${structuralErrors.length}):`);
  structuralErrors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
}
