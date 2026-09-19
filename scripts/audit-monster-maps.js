const fs = require('node:fs');
const path = require('node:path');

const catalogPath = path.join(__dirname, '..', 'src', 'data', 'monster-catalog.v1.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const entries = catalog.entries || [];
const ranks = ['low', 'high', 'master'];
const legacyValidatedMapIds = new Set(['world-42', 'world-17', 'world-18', 'world-19', 'world-20', 'world-21', 'world-22', 'world-23', 'world-24', 'world-25', 'world-26', 'world-27', 'world-28', 'world-29', 'world-30', 'world-31', 'world-32', 'world-33', 'world-34', 'world-35', 'world-36', 'world-37', 'world-38', 'world-39', 'world-40', 'world-41']);

const isCoordinate = (value) => Number.isFinite(value) && value >= 0 && value <= 100;
const hasValidatedMap = (entry) => {
  if (legacyValidatedMapIds.has(entry.id)) return true;
  const map = entry.partMap;
  if (!map || typeof map.image !== 'string' || !Array.isArray(map.anchors) || !map.anchors.length) return false;
  return map.anchors.every((anchor) => (
    Number.isInteger(anchor.partIndex)
    && entry.parts?.[anchor.partIndex]
    && isCoordinate(anchor.x)
    && isCoordinate(anchor.y)
    && isCoordinate(anchor.labelX)
    && isCoordinate(anchor.labelY)
  ));
};

const byGame = new Map();
for (const entry of entries) {
  if (!byGame.has(entry.game)) byGame.set(entry.game, []);
  byGame.get(entry.game).push(entry);
}

const totalRankContexts = entries.reduce((sum, entry) => sum + (entry.ranks || []).length, 0);
console.log(`Monster map audit · ${entries.length} monsters · ${totalRankContexts} rank contexts`);
for (const [game, records] of byGame) {
  const mapped = records.filter(hasValidatedMap).length;
  const contexts = records.reduce((sum, entry) => sum + (entry.ranks || []).length, 0);
  const mappedContexts = records.filter(hasValidatedMap).reduce((sum, entry) => sum + (entry.ranks || []).length, 0);
  console.log(`${game}: maps ${mapped}/${records.length} | rank contexts ${mappedContexts}/${contexts}`);
}

const pending = entries.filter((entry) => !hasValidatedMap(entry));
if (pending.length) {
  console.log(`pending maps: ${pending.length}`);
  console.log(`first pending: ${pending.slice(0, 20).map((entry) => `${entry.game}/${entry.name}`).join(', ')}`);
}

if (process.argv.includes('--strict') && pending.length) process.exitCode = 1;
