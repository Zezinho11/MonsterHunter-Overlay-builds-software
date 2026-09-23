const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/data/monster-catalog.v1.json'), 'utf8'));
const issues = [];
const coverage = {};
const expectedTypes = new Set(['small', 'silver', 'large']);

for (const monster of catalog.entries) {
  const data = monster.crownData;
  const hasData = Boolean(data?.crowns && Object.keys(data.crowns).length);
  coverage[monster.game] ||= { total: 0, withCrowns: 0 };
  coverage[monster.game].total += 1;
  if (hasData) coverage[monster.game].withCrowns += 1;
  if (monster.type === 'small' && hasData) issues.push(`${monster.id}: small monsters must not expose crown data`);
  if (monster.type === 'small' && monster.availability?.crowns !== false) issues.push(`${monster.id}: small monsters must have crowns unavailable`);
  if (!hasData) {
    if (monster.availability?.crowns !== false) issues.push(`${monster.id}: crown availability must be false when data is absent`);
    continue;
  }
  if (!data.source || data.unit !== 'cm') issues.push(`${monster.id}: missing crown provenance or unit`);
  for (const [type, crown] of Object.entries(data.crowns)) {
    if (!expectedTypes.has(type)) issues.push(`${monster.id}: unknown crown type ${type}`);
    if (!['<=', '>='].includes(crown.operator) || !Number.isFinite(crown.value) || crown.unit !== 'cm') issues.push(`${monster.id}: invalid ${type} crown threshold`);
  }
  if (monster.availability?.crowns !== true) issues.push(`${monster.id}: crown availability must be true when data exists`);
}

const nergigante = catalog.entries.find((monster) => monster.game === 'world' && monster.name === 'Nergigante');
const ruiner = catalog.entries.find((monster) => monster.game === 'world' && monster.name === 'Ruiner Nergigante');
if (!nergigante || JSON.stringify(nergigante.ranks) !== JSON.stringify(['high'])) issues.push('Nergigante must remain High Rank only');
if (!ruiner || JSON.stringify(ruiner.ranks) !== JSON.stringify(['master'])) issues.push('Ruiner Nergigante must remain Master Rank only');

console.log(JSON.stringify({ entries: catalog.entries.length, coverage, issues }, null, 2));
if (issues.length) process.exitCode = 1;
