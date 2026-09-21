const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'monster-catalog.v1.json'), 'utf8'));
const control = fs.readFileSync(path.join(root, 'src', 'control.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src', 'control.css'), 'utf8');
const entries = catalog.entries || [];
const gameLabels = { world: 'World', rise: 'Rise', wilds: 'Wilds', mhgu: 'MHGU' };
const errors = [];

const missing = (predicate) => entries.filter((entry) => !predicate(entry)).map((entry) => `${entry.game}/${entry.name}`);
const mapRefs = [...control.matchAll(/image:\s*'assets\/part-maps\/([^']+)'/g)].map((match) => match[1]);
const mapDir = path.join(root, 'src', 'assets', 'part-maps');
const missingMapAssets = mapRefs.filter((asset) => !fs.existsSync(path.join(mapDir, asset)));
const duplicateMapRefs = [...new Set(mapRefs.filter((asset, index) => mapRefs.indexOf(asset) !== index))];

if (!entries.length) errors.push('catalog has no entries');
if (entries.some((entry) => !entry.id || !entry.game || !entry.name)) errors.push('catalog contains an entry without id/game/name');
if (missing((entry) => entry.descriptionPt).length) errors.push(`missing Portuguese descriptions: ${missing((entry) => entry.descriptionPt).length}`);
if (missing((entry) => Array.isArray(entry.parts) && entry.parts.length).length) errors.push(`missing part data: ${missing((entry) => Array.isArray(entry.parts) && entry.parts.length).length}`);
if (missing((entry) => Array.isArray(entry.rewards)).length) errors.push(`missing rewards array: ${missing((entry) => Array.isArray(entry.rewards)).length}`);
if (missingMapAssets.length) errors.push(`missing mapped image assets: ${missingMapAssets.length}`);
if (duplicateMapRefs.length) errors.push(`duplicate mapped image assets: ${duplicateMapRefs.length}`);
if ((control.match(/function renderMonsterDetail/g) || []).length !== 1) errors.push('detail renderer is not shared by all monster pages');
if ((control.match(/function weaknessVisual/g) || []).length !== 1) errors.push('weakness renderer is not shared by all monster pages');
if ((control.match(/id="material-search"/g) || []).length !== 1) errors.push('reverse material search must expose exactly one active input');
if (control.includes('id="reveal-spoilers"')) errors.push('spoiler reveal buttons must not reuse a duplicate id');
for (const required of ['.detail-view-root', '.center-part-map-card', '.provenance-card', '.source-meta', 'overflow-y: auto']) {
  if (!css.includes(required)) errors.push(`missing shared layout rule: ${required}`);
}

console.log(`Monsterpedia audit · ${catalog.schema || 'unknown schema'} · ${entries.length} monsters`);
for (const [game, label] of Object.entries(gameLabels)) {
  const records = entries.filter((entry) => entry.game === game);
  const withRender = records.filter((entry) => entry.render).length;
  const withImage = records.filter((entry) => entry.icon || entry.iconFallbackAsset || entry.imageFallback).length;
  const withSources = records.filter((entry) => catalog.sources?.some((source) => source.games?.includes(game))).length;
  const missingHealth = records.filter((entry) => !(entry.baseHealth != null || entry.healthProfiles?.length)).length;
  console.log(`${label}: ${records.length} fichas | render ${withRender}/${records.length} | imagem ${withImage}/${records.length} | fonte ${withSources}/${records.length} | saúde indisponível ${missingHealth}`);
}
console.log(`Mapas referenciados no renderer: ${new Set(mapRefs).size} únicos | assets ausentes: ${missingMapAssets.length} | duplicados: ${duplicateMapRefs.length}`);
console.log(`Campos pendentes permitidos: renders ${missing((entry) => entry.render).length}, saúde ${missing((entry) => entry.baseHealth != null || entry.healthProfiles?.length).length}, licença explícita nas fontes ${catalog.sources?.filter((source) => source.license).length || 0}/${catalog.sources?.length || 0}`);

if (errors.length) {
  console.error('Falhas estruturais:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
}
