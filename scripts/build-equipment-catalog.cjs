const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const output = path.join(root, 'src', 'data', 'build-equipment-catalog.v1.json');
const jsOutput = path.join(root, 'src', 'data', 'build-equipment-catalog.v1.js');
const sources = [
  { id: 'mhw-db', game: 'world', url: 'https://docs.mhw-db.com/', license: 'API source; verify redistribution terms before release' },
  { id: 'wilds-mhdb', game: 'wilds', url: 'https://docs.wilds.mhdb.io/', license: 'Game-file-derived API; verify redistribution terms before release' },
  { id: 'mhrice', game: 'rise', url: 'https://github.com/wwylele/mhrice', license: 'MIT/Apache-2.0; attribution requested; data snapshot 14.0.0 (2024-02-28)' },
  { id: 'mhgu-database', game: 'mhgu', url: 'https://github.com/gatheringhallstudios/MHGenDatabase', license: 'MIT; Gathering Hall Studios; bundled app database snapshot' },
];
const api = { world: 'https://mhw-db.com', wilds: 'https://wilds.mhdb.io/pt-br' };
const weaponTypeLabels = {
  'great-sword': 'Grande Espada', greatsword: 'Grande Espada',
  longsword: 'Espada Longa', 'long-sword': 'Espada Longa',
  'sword-and-shield': 'Espada e Escudo', 'sword-shield': 'Espada e Escudo',
  'dual-blades': 'Lâminas Duplas', dualblades: 'Lâminas Duplas',
  hammer: 'Martelo', 'hunting-horn': 'Berrante de Caça', huntinghorn: 'Berrante de Caça',
  lance: 'Lança', gunlance: 'Lançarma', 'switch-axe': 'Transmachado', switchaxe: 'Transmachado',
  'charge-blade': 'Lâmina Energizada', chargeblade: 'Lâmina Energizada',
  'insect-glaive': 'Glaive Inseto', insectglaive: 'Glaive Inseto',
  bow: 'Arco', 'light-bowgun': 'Balestra Leve', lightbowgun: 'Balestra Leve',
  'heavy-bowgun': 'Balestra Pesada', heavybowgun: 'Balestra Pesada',
};
const typeMap = { head: 'head', chest: 'chest', arms: 'arms', gloves: 'arms', waist: 'waist', legs: 'legs' };
async function get(url) { const response = await fetch(url); if (!response.ok) throw new Error(`${response.status} ${url}`); return response.json(); }
function normalizeCrafting(crafting) {
  const materials = crafting?.materials || crafting?.craftingMaterials || [];
  return materials.map((entry) => ({ name: entry.item?.name || entry.name || 'Material indisponível', quantity: entry.quantity || entry.amount || 1 }));
}
function normalizeArmor(game, item) {
  const skills = (item.skills || []).map((skill) => ({ name: skill.skillName || skill.name || skill.skill?.name || 'Skill indisponível', level: skill.level || 0, description: skill.description || '' }));
  return { id: `${game}-armor-${item.id}`, sourceId: game === 'world' ? 'mhw-db' : 'wilds-mhdb', sourceRecordId: item.id, game, expansion: game === 'world' ? (item.rank === 'master' ? 'iceborne' : 'world') : game, slot: typeMap[item.type || item.kind], name: item.name, rank: item.rank || null, rarity: item.rarity || null, defense: item.defense || null, resistances: item.resistances || null, slots: item.slots || [], skills, craftingMaterials: normalizeCrafting(item.crafting), craftingCost: item.crafting?.zennyCost || null, assets: item.assets || {}, icon: item.icon?.url || item.iconUrl || item.assets?.icon || item.assets?.imageMale || null };
}
function normalizeWeapon(game, item) { const kind = item.type || item.kind || null; const weaponType = weaponTypeLabels[kind] || kind || 'Tipo indisponível'; return { id: `${game}-weapon-${item.id}`, sourceId: game === 'world' ? 'mhw-db' : 'wilds-mhdb', sourceLocale: game === 'wilds' ? 'pt-br' : 'en', sourceRecordId: item.id, game, name: item.name, displayName: `${item.name} (${weaponType})`, class: kind, classPt: weaponType, rarity: item.rarity || null, attack: item.attack || item.damage || null, elements: item.elements || item.attributes || item.specials || [], skills: (item.skills || []).map((skill) => ({ name: skill.skill?.name || skill.skillName || skill.name || 'Skill indisponível', level: skill.level || 0 })), slots: item.slots || [], craftingMaterials: normalizeCrafting(item.crafting), craftingCost: item.crafting?.craftingZennyCost || item.crafting?.upgradeZennyCost || null, assets: item.assets || {}, icon: item.assets?.icon || item.assets?.image || item.icon?.url || item.iconUrl || null }; }
function normalizeItem(game, item) { return { id: `${game}-item-${item.id}`, sourceId: game === 'world' ? 'mhw-db' : 'wilds-mhdb', sourceRecordId: item.id, game, name: item.name, description: item.description || '', rarity: item.rarity || null, kind: item.kind || 'item' }; }
function normalizeDecoration(game, item) {
  const skills = (item.skills || []).map((entry) => ({ name: entry.skill?.name || entry.skillName || entry.name || 'Habilidade indisponível', level: entry.level || 0 }));
  return { id: `${game}-decoration-${item.id}`, sourceId: game === 'world' ? 'mhw-db' : 'wilds-mhdb', sourceRecordId: item.gameId ?? item.id, game, name: item.name, rarity: item.rarity || null, slot: Number(item.slot || 1), kind: item.kind || null, skills, icon: item.icon?.url || null, iconColor: item.icon?.color || item.icon_color || null, craftingMaterials: normalizeCrafting(item.crafting), craftingCost: item.crafting?.zennyCost || null };
}
function normalizeCharm(game, charm) {
  return (charm.ranks || []).map((rank) => {
    const charmId = rank.charm?.id ?? charm.id ?? rank.id;
    return { id: `${game}-charm-${charmId}-${rank.level || rank.id}`, sourceId: game === 'world' ? 'mhw-db' : 'wilds-mhdb', sourceRecordId: rank.id, game, name: rank.name || charm.name || 'Talismã', rarity: rank.rarity || charm.rarity || null, rank: rank.level || null, skills: (rank.skills || []).map((entry) => ({ name: entry.skill?.name || entry.skillName || entry.name || 'Habilidade indisponível', level: entry.level || 0 })), slots: rank.slots || rank.decorationSlots || [], icon: rank.icon?.url || charm.icon?.url || null, craftingMaterials: normalizeCrafting(rank.crafting || charm.crafting) };
  });
}

const riseWeaponKinds = {
  great_sword: ['GreatSword', 'Grande Espada'], short_sword: ['ShortSword', 'Espada e Escudo'], dual_blades: ['DualBlades', 'Lâminas Duplas'], long_sword: ['LongSword', 'Espada Longa'], hammer: ['Hammer', 'Martelo'], horn: ['Horn', 'Berrante de Caça'], lance: ['Lance', 'Lança'], gun_lance: ['GunLance', 'Lançarma'], slash_axe: ['SlashAxe', 'Transmachado'], charge_axe: ['ChargeAxe', 'Lâmina Energizada'], insect_glaive: ['InsectGlaive', 'Glaive Inseto'], light_bowgun: ['LightBowgun', 'Balestra Leve'], heavy_bowgun: ['HeavyBowgun', 'Balestra Pesada'], bow: ['Bow', 'Arco'],
};
const riseArmorKinds = { Head: 'head', Chest: 'chest', Arm: 'arms', Waist: 'waist', Leg: 'legs' };
const riseSlotTitles = { Head: 'Capacete', Chest: 'Peitoral', Arm: 'Braçadeiras', Waist: 'Cintura', Leg: 'Grevas' };
function localizedMessage(table, regex, fallback = '') {
  const row = table?.entries?.find((entry) => regex.test(entry.name));
  const portuguese = row?.content?.[10]?.replace(/<[^>]*>/g, '').trim();
  const english = row?.content?.[1]?.replace(/<[^>]*>/g, '').trim();
  return { name: portuguese || english || fallback, locale: portuguese ? 'pt-BR' : 'en' };
}
function flattenObjects(value, output = []) {
  if (!value || typeof value !== 'object') return output;
  if (Array.isArray(value)) { value.forEach((entry) => flattenObjects(entry, output)); return output; }
  output.push(value);
  Object.values(value).forEach((entry) => { if (entry && typeof entry === 'object') flattenObjects(entry, output); });
  return output;
}
function enumId(value) { if (typeof value === 'number') return value; if (value && typeof value === 'object') return Number(Object.values(value)[0]); return null; }
function nestedEquipmentId(row, kind) { return flattenObjects(row).map((entry) => entry.id?.[kind]).find((id) => id !== undefined); }
function riseItemName(id, rise) {
  const key = `I_${String(id).padStart(4, '0')}_Name`;
  return localizedMessage(rise.items_name_msg, new RegExp(`^${key}$`), '').name || localizedMessage(rise.items_name_msg_mr, new RegExp(`^${key}$`), '').name || null;
}
function riseRecipe(rows, kind, id, rise) {
  const root = rows.find((row) => nestedEquipmentId(row, kind) === id);
  const recipe = root && flattenObjects(root).find((row) => Array.isArray(row.item) && Array.isArray(row.item_num));
  if (!recipe) return [];
  const ids = recipe.item || [];
  const amounts = recipe.item_num || [];
  return ids.flatMap((itemId, index) => {
    const value = enumId(itemId);
    const name = value === null ? null : riseItemName(value, rise);
    return name && (amounts[index] || 0) > 0 ? [{ name, quantity: amounts[index] }] : [];
  });
}
function buildRise(rise) {
  const armor = [];
  const armorProducts = rise.armor_product?.param || [];
  const armorSeries = new Map((rise.armor_series?.param || []).map((row) => [row.armor_series, row.difficulty_group]));
  const armorSeriesNames = rise.armor_series_name_msg?.entries || [];
  const armorRows = (rise.armor?.param || []).filter((row) => row.is_valid);
  const skillsById = new Map((rise.player_skill_name_msg?.entries || []).concat(rise.player_skill_name_msg_mr?.entries || []).map((entry) => [Number(entry.name.match(/PlayerSkill_(\d+)_Name/)?.[1]), entry.content?.[10] || entry.content?.[1] || 'Habilidade']));
  for (const item of armorRows) {
    const [slotKey, id] = Object.entries(item.pl_armor_id || {})[0] || [];
    const slot = riseArmorKinds[slotKey];
    if (!slot || id === undefined) continue;
    const messages = rise[`armor_${slotKey.toLowerCase()}_name_msg`];
    const masterMessages = rise[`armor_${slotKey.toLowerCase()}_name_msg_mr`];
    const messageName = `A_${slotKey}_${String(id).padStart(3, '0')}_Name`;
    const localized = localizedMessage(messages, new RegExp(`^${messageName}$`));
    const mrRow = masterMessages?.entries?.find((entry) => entry.name === messageName);
    const mrPt = mrRow?.content?.[10]?.trim();
    const mrEn = mrRow?.content?.[1]?.trim();
    const name = mrPt || mrEn || localized.name;
    if (!name || name === messageName) continue;
    const series = armorSeriesNames.find((entry) => entry.name === `ArmorSeries_Hunter_${String(item.series).padStart(3, '0')}`);
    const setPt = series?.content?.[10] || series?.content?.[1] || null;
    const recipe = armorProducts.find((row) => enumId(row.id?.[slotKey]) === id);
    const skills = (item.skill_list || []).flatMap((skill, index) => {
      const skillId = enumId(skill);
      return skillId !== null && item.skill_lv_list?.[index] > 0 ? [{ name: skillsById.get(skillId) || 'Habilidade', level: item.skill_lv_list[index] }] : [];
    });
    const rank = armorSeries.get(item.series) || null;
    const craftingMaterials = (recipe?.item || []).flatMap((materialId, index) => {
      const materialNo = enumId(materialId); const materialName = materialNo === null ? null : riseItemName(materialNo, rise);
      return materialName && recipe.item_num?.[index] > 0 ? [{ name: materialName, quantity: recipe.item_num[index] }] : [];
    });
    armor.push({ id: `rise-armor-${slot}-${id}-${item.series}`, sourceId: 'mhrice', sourceRecordId: `${slotKey}:${id}:${item.series}`, sourceLocale: localized.locale, game: 'rise', expansion: rank === 'Master' ? 'sunbreak' : 'rise', slot, name, setName: setPt, rank: rank === 'Master' ? 'master' : /Upper|High/i.test(rank || '') ? 'high' : 'low', rarity: item.rare, defense: { base: item.def_val }, resistances: { fire: item.fire_reg_val, water: item.water_reg_val, ice: item.ice_reg_val, thunder: item.thunder_reg_val, dragon: item.dragon_reg_val }, slots: (item.decorations_num_list || []).slice(0, item.decorations_num_list?.findIndex((value) => value === 0) < 0 ? 4 : Math.max(0, item.decorations_num_list.findIndex((value) => value === 0))).filter((value) => value > 0), skills, craftingMaterials, icon: null });
  }

  const weapons = [];
  for (const [tableName, [kind, classPt]] of Object.entries(riseWeaponKinds)) {
    const table = rise[tableName];
    if (!table) continue;
    const weaponRows = table.base_data?.param || [];
    const records = weaponRows.map((root) => {
      const flattened = flattenObjects(root);
      const identity = flattened.find((row) => row.id?.[kind] !== undefined);
      const stats = flattened.find((row) => row.atk !== undefined);
      return identity && stats ? { id: identity.id[kind], identity, stats } : null;
    }).filter(Boolean);
    const recipeRows = [...(table.product?.param || []), ...(table.change?.param || []), ...(table.process?.param || [])];
    for (const { id, identity, stats } of records) {
      const namePattern = new RegExp(`^W_${kind}_${String(id).padStart(3, '0')}_Name$`);
      const masterName = localizedMessage(table.name_mr, namePattern);
      const baseName = masterName.name ? masterName : localizedMessage(table.name, namePattern);
      const name = baseName.name;
      if (!name || name.startsWith('W_')) continue;
      const recipes = recipeRows.filter((row) => nestedEquipmentId(row, kind) === id);
      const craftingMaterials = recipes.flatMap((row) => riseRecipe([row], kind, id, rise)).slice(0, 12);
      weapons.push({ id: `rise-weapon-${kind}-${id}`, sourceId: 'mhrice', sourceRecordId: `${kind}:${id}`, sourceLocale: baseName.locale, game: 'rise', expansion: identity.rare_type >= 8 ? 'sunbreak' : 'rise', name, displayName: `${name} (${classPt})`, class: tableName, classPt, rarity: identity.rare_type, attack: stats.atk, elements: [{ type: stats.main_element_type, value: stats.main_element_val }].filter((value) => value.type !== 'None' && value.value), slots: (stats.slot_num_list || []).filter(Boolean), skills: [], craftingMaterials, icon: null });
    }
  }
  const items = (rise.items?.param || []).flatMap((item) => {
    const id = enumId(item.id);
    const name = id === null ? null : riseItemName(id, rise);
    return name ? [{ id: `rise-item-${id}`, sourceId: 'mhrice', sourceRecordId: id, game: 'rise', name, rarity: item.rare || null, kind: item.type_ || 'item' }] : [];
  });
  const decorations = (rise.decorations?.param || []).flatMap((item) => {
    const id = enumId(item.id); if (id === null) return [];
    const pattern = new RegExp(`^Decorations_${String(id).padStart(3, '0')}_Name$`);
    const name = localizedMessage(rise.decorations_name_msg_mr, pattern).name || localizedMessage(rise.decorations_name_msg, pattern).name;
    if (!name || name.startsWith('Decorations_')) return [];
    const skills = (item.skill_id_list || []).flatMap((value, index) => {
      const skillId = enumId(value); const level = item.skill_lv_list?.[index] || 0;
      if (skillId === null || level <= 0) return [];
      const skillName = skillsById.get(skillId);
      return skillName ? [{ name: skillName, level }] : [];
    });
    const product = (rise.decorations_product?.param || []).find((row) => enumId(row.id?.Deco) === id);
    const craftingMaterials = (product?.item_id_list || []).flatMap((value, index) => {
      const itemId = enumId(value); const materialName = itemId === null ? null : riseItemName(itemId, rise);
      return materialName && product.item_num_list?.[index] > 0 ? [{ name: materialName, quantity: product.item_num_list[index] }] : [];
    });
    return [{ id: `rise-decoration-${id}`, sourceId: 'mhrice', sourceRecordId: id, game: 'rise', name, rarity: item.rare || null, slot: item.decoration_lv || 1, skills, icon: null, iconColor: item.icon_color ?? null, craftingMaterials }];
  });
  const skills = (rise.player_skill_name_msg?.entries || []).flatMap((entry) => {
    const match = entry.name.match(/^PlayerSkill_(\d+)_Name$/); const id = Number(match?.[1]);
    const name = entry.content?.[10]?.replace(/<[^>]*>/g, '').trim() || entry.content?.[1]?.replace(/<[^>]*>/g, '').trim();
    return id && name && !name.startsWith('PlayerSkill_') ? [{ id: `rise-skill-${id}`, sourceRecordId: id, name, sourceId: 'mhrice' }] : [];
  });
  return { available: true, sourceVersion: '14.0.0', weapons, armor, items, decorations, charms: [], skills };
}

async function buildMhgu(tempDir) {
  const archivePath = path.join(tempDir, 'mhgu.db.zip');
  const outputPath = path.join(tempDir, 'mhgu-equipment.json');
  const response = await fetch('https://raw.githubusercontent.com/gatheringhallstudios/MHGenDatabase/master/app/src/main/assets/databases/mhgu.db.zip');
  if (!response.ok) throw new Error(`MHGU database download failed: ${response.status}`);
  fs.writeFileSync(archivePath, Buffer.from(await response.arrayBuffer()));
  execFileSync(process.env.PYTHON || 'python', [path.join(__dirname, 'extract-mhgu-equipment.py'), archivePath, outputPath], { stdio: 'inherit' });
  const raw = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  const armor = raw.armor.map((item) => ({ ...item, id: `mhgu-armor-${item.sourceRecordId}`, sourceId: 'mhgu-database', sourceLocale: 'en', game: 'mhgu', expansion: 'generations-ultimate', icon: null }));
  const weapons = raw.weapons.map((item) => {
    const classPt = weaponTypeLabels[item.class.toLowerCase().replaceAll(' ', '-')] || item.class;
    return { ...item, id: `mhgu-weapon-${item.sourceRecordId}`, sourceId: 'mhgu-database', sourceLocale: 'en', game: 'mhgu', expansion: 'generations-ultimate', classPt, displayName: `${item.name} (${classPt})`, icon: null };
  });
  const items = raw.items.map((item) => ({ ...item, id: `mhgu-item-${item.sourceRecordId}`, sourceId: 'mhgu-database', game: 'mhgu', kind: 'item' }));
  const decorations = (raw.decorations || []).map((item) => ({ ...item, id: `mhgu-decoration-${item.sourceRecordId}`, sourceId: 'mhgu-database', sourceLocale: 'en', game: 'mhgu', icon: null }));
  const charms = (raw.charms || []).map((item) => ({ ...item, id: `mhgu-charm-${item.sourceRecordId}`, sourceId: 'mhgu-database', sourceLocale: 'en', game: 'mhgu', icon: null }));
  const skills = (raw.skills || []).map((item) => ({ ...item, id: `mhgu-skill-${item.sourceRecordId}`, sourceId: 'mhgu-database', game: 'mhgu' }));
  return { available: true, weapons, armor, items, decorations, charms, skills };
}
async function build() {
  const games = { world: { available: true, weapons: [], armor: [], items: [], decorations: [], charms: [], skills: [] }, rise: { available: false, weapons: [], armor: [], items: [], decorations: [], charms: [], skills: [] }, wilds: { available: true, weapons: [], armor: [], items: [], decorations: [], charms: [], skills: [] }, mhgu: { available: false, weapons: [], armor: [], items: [], decorations: [], charms: [], skills: [] } };
  for (const game of ['world', 'wilds']) {
    const [armor, weapons, items, decorations, charms, skills] = await Promise.all([get(`${api[game]}/armor`), get(`${api[game]}/weapons`), get(`${api[game]}/items`), get(`${api[game]}/decorations`), get(`${api[game]}/charms`), get(`${api[game]}/skills`)]);
    games[game].armor = armor.map((item) => normalizeArmor(game, item)).filter((item) => item.slot);
    games[game].weapons = weapons.map((item) => normalizeWeapon(game, item));
    games[game].items = items.map((item) => normalizeItem(game, item));
    games[game].decorations = decorations.map((item) => normalizeDecoration(game, item));
    games[game].charms = charms.flatMap((item) => normalizeCharm(game, item));
    games[game].skills = skills.map((item) => ({ id: `${game}-skill-${item.id}`, sourceRecordId: item.gameId || item.id, sourceId: game === 'world' ? 'mhw-db' : 'wilds-mhdb', game, name: item.name }));
  }
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hunter-companion-equipment-'));
  try {
    const [rise, mhguZip] = await Promise.all([
      get('https://mhrise.mhrice.info/version/14.0.0/mhrice.json'),
      buildMhgu(tempDir),
    ]);
    games.rise = buildRise(rise);
    games.mhgu = mhguZip;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  const catalog = { schema: 'build-equipment-catalog.v1', generatedAt: new Date().toISOString(), sources, games };
  fs.writeFileSync(output, `${JSON.stringify(catalog, null, 2)}\n`);
  fs.writeFileSync(jsOutput, `window.buildEquipmentCatalog = ${JSON.stringify(catalog)};\n`);
  for (const [game, data] of Object.entries(games)) console.log(`${game}: ${data.armor.length} armor, ${data.weapons.length} weapons, ${data.items.length} items${data.available ? '' : ' (source pending)'}`);
}
build().catch((error) => { console.error(error); process.exitCode = 1; });
