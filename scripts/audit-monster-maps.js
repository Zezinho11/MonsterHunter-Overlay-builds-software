const fs = require('node:fs');
const path = require('node:path');

const catalogPath = path.join(__dirname, '..', 'src', 'data', 'monster-catalog.v1.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const entries = catalog.entries || [];
const ranks = ['low', 'high', 'master'];
const legacyValidatedMapIds = new Set(['world-42', 'world-1', 'world-2', 'world-3', 'world-4', 'world-5', 'world-6', 'world-7', 'world-8', 'world-9', 'world-10', 'world-11', 'world-12', 'world-13', 'world-14', 'world-15', 'world-16', 'world-17', 'world-18', 'world-19', 'world-20', 'world-21', 'world-22', 'world-23', 'world-24', 'world-25', 'world-26', 'world-27', 'world-28', 'world-29', 'world-30', 'world-31', 'world-32', 'world-33', 'world-34', 'world-35', 'world-36', 'world-37', 'world-38', 'world-39', 'world-40', 'world-41', 'world-43', 'world-44', 'world-45', 'world-48', 'world-49', 'world-50', 'world-51', 'world-52', 'world-53', 'world-54', 'world-55', 'world-56', 'world-57', 'world-58', 'world-59', 'world-60', 'world-61', 'world-62', 'world-63', 'world-64', 'world-65', 'world-66', 'world-67', 'world-68', 'world-69', 'world-70', 'world-71', 'world-72', 'world-73', 'world-75', 'world-76', 'world-77', 'world-78', 'world-79', 'world-80', 'world-81', 'world-82', 'world-83', 'world-84', 'world-85', 'world-88', 'world-89', 'world-90', 'world-91', 'world-92', 'rise-1', 'rise-2', 'rise-3', 'rise-4', 'rise-5', 'rise-6', 'rise-7', 'rise-8', 'rise-9', 'rise-10', 'rise-11', 'rise-12', 'rise-13', 'rise-14', 'rise-15', 'rise-16', 'rise-17', 'rise-18', 'rise-19', 'rise-20', 'rise-21', 'rise-22', 'rise-23', 'rise-24', 'rise-25', 'rise-26', 'rise-27', 'rise-28', 'rise-29', 'rise-30', 'rise-31', 'rise-32', 'rise-33', 'rise-34', 'rise-35', 'rise-36', 'rise-37', 'rise-38', 'rise-39', 'rise-40', 'rise-41', 'rise-42', 'rise-43', 'rise-44', 'rise-45', 'rise-46', 'rise-47', 'rise-48', 'rise-49', 'rise-50', 'rise-51', 'rise-52', 'rise-53', 'rise-54', 'rise-55', 'rise-56', 'rise-57', 'rise-58', 'rise-59', 'rise-60', 'rise-61', 'rise-62', 'rise-63', 'rise-64', 'rise-65', 'rise-66', 'rise-67', 'rise-68', 'rise-69', 'rise-70', 'wilds-1', 'wilds-2', 'wilds-3', 'wilds-4', 'wilds-5', 'wilds-6', 'wilds-7', 'wilds-8', 'wilds-9']);

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
