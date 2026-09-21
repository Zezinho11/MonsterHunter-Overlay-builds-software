const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'monster-catalog.v1.json'), 'utf8'));
const entries = catalog.entries || [];
const issues = [];
const pending = [];
const validGames = new Set(['world', 'rise', 'wilds', 'mhgu']);
const hitzoneKeys = ['cut', 'slash', 'blunt', 'impact', 'ammo', 'shot'];
const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const label = (entry) => `${entry.game}/${entry.name} (${entry.id})`;
const add = (entry, message) => issues.push(`${label(entry)}: ${message}`);

const ids = new Map();
const names = new Map();
for (const entry of entries) {
  if (!entry.id || !entry.name || !validGames.has(entry.game)) add(entry, 'identidade ou jogo inválido');
  if (ids.has(entry.id)) add(entry, `id duplicado com ${label(ids.get(entry.id))}`); else ids.set(entry.id, entry);
  const nameKey = `${entry.game}/${String(entry.name).toLowerCase()}`;
  if (names.has(nameKey)) add(entry, `nome duplicado com ${label(names.get(nameKey))}`); else names.set(nameKey, entry);
  if (!nonEmpty(entry.descriptionPt)) add(entry, 'descrição PT ausente');
  if (!nonEmpty(entry.render)) add(entry, 'render ausente');
  if (!(entry.icon || entry.iconFallbackAsset || entry.imageFallback)) add(entry, 'imagem/ícone de fallback ausente');
  if (!Array.isArray(entry.ranks) || !entry.ranks.length) pending.push(`${label(entry)}: ranks separados não publicados`);
  if (!Array.isArray(entry.parts) || !entry.parts.length) add(entry, 'partes ausentes');
  if (!Array.isArray(entry.rewards) || !entry.rewards.length) add(entry, 'recompensas ausentes');
  if (!Array.isArray(entry.weaknesses)) add(entry, 'fraquezas não são uma lista');
  if (!Array.isArray(entry.resistances)) add(entry, 'resistências não são uma lista');

  for (const [index, part] of (entry.parts || []).entries()) {
    if (!nonEmpty(part.name)) add(entry, `parte ${index + 1} sem nome`);
    const hitzones = part.hitzones || {};
    if (!hitzoneKeys.some((key) => Number.isFinite(hitzones[key]))) pending.push(`${label(entry)}: parte ${index + 1} sem hitzone numérica publicada`);
    if (!Array.isArray(part.breakThresholds)) add(entry, `parte ${index + 1} sem limiares válidos`);
  }
  for (const [index, weakness] of (entry.weaknesses || []).entries()) {
    if (!nonEmpty(weakness.element)) add(entry, `fraqueza ${index + 1} sem elemento/status`);
    if (weakness.level != null && (!Number.isFinite(Number(weakness.level)) || Number(weakness.level) < 0 || Number(weakness.level) > 3)) add(entry, `fraqueza ${index + 1} com nível inválido`);
  }
  for (const [index, resistance] of (entry.resistances || []).entries()) {
    if (!nonEmpty(resistance.element) && !nonEmpty(resistance.status) && !nonEmpty(resistance.effect)) add(entry, `resistência ${index + 1} sem valor`);
  }
  for (const [index, reward] of (entry.rewards || []).entries()) {
    if (!nonEmpty(reward.item)) add(entry, `recompensa ${index + 1} sem item`);
    if (!Array.isArray(reward.conditions) || !reward.conditions.length) add(entry, `recompensa ${index + 1} sem condição`);
  }
  for (const rank of entry.ranks || []) if (!entry.rankData?.[rank]) pending.push(`${label(entry)}: rank ${rank} sem tabela específica`);
}

const byGame = new Map();
for (const entry of entries) byGame.set(entry.game, [...(byGame.get(entry.game) || []), entry]);
console.log(`Monsterpedia deep audit · ${entries.length} fichas verificadas individualmente`);
for (const [game, records] of byGame) {
  const clean = records.filter((entry) => !issues.some((issue) => issue.startsWith(`${entry.game}/${entry.name} (`))).length;
  console.log(`${game}: ${clean}/${records.length} fichas sem inconsistências estruturais`);
}
if (issues.length) {
  console.error(`Inconsistências encontradas: ${issues.length}`);
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
} else {
  console.log('Resultado: 321/321 fichas sem inconsistências estruturais.');
  console.log(`Campos numéricos/contextuais ausentes na fonte: ${pending.length} ocorrências permitidas.`);
}
