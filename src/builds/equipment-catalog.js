(function exposeEquipmentCatalog(global) {
  const raw = global.buildEquipmentCatalog || { games: {}, sources: [] };
  const slotLabels = { head: 'Capacete', chest: 'Peitoral', arms: 'Braçadeiras', waist: 'Cintura', legs: 'Grevas' };
  const gameKeys = {
    'Monster Hunter: World': 'world',
    'Monster Hunter: Rise': 'rise',
    'Monster Hunter: Wilds': 'wilds',
    'Monster Hunter: Generations Ultimate': 'mhgu',
  };
  const gameNames = Object.fromEntries(Object.entries(gameKeys).map(([name, key]) => [key, name]));
  function gameKey(value) { return gameKeys[value] || value; }
  function gameName(value) { return gameNames[value] || value; }
  function gameData(value) { return raw.games?.[gameKey(value)] || { weapons: [], armor: [], items: [], available: false }; }
  function weapons(value) { return gameData(value).weapons || []; }
  function armor(value, slot) { return (gameData(value).armor || []).filter((piece) => !slot || piece.slot === slot); }
  function items(value) { return gameData(value).items || []; }
  function decorations(value, kind) { return (gameData(value).decorations || []).filter((entry) => !kind || !entry.kind || entry.kind === kind); }
  function charms(value) { return gameData(value).charms || []; }
  function gameSkills(value) { return gameData(value).skills || []; }
  function findArmor(value, id) { return armor(value).find((piece) => String(piece.id) === String(id)); }
  function findWeapon(value, id) { return weapons(value).find((piece) => String(piece.id) === String(id)); }
  function skills(piece) { return Array.isArray(piece?.skills) ? piece.skills : []; }
  function findDecoration(value, id) { return decorations(value).find((entry) => String(entry.id) === String(id)); }
  function findCharm(value, id) { return charms(value).find((entry) => String(entry.id) === String(id)); }
  function slotCapacities(value, record) {
    const slots = record?.slots;
    if (Array.isArray(slots)) return slots.map((slot) => Number(slot?.rank ?? slot?.level ?? slot)).filter((level) => Number.isFinite(level) && level > 0);
    const count = Number(slots || 0);
    if (!Number.isFinite(count) || count <= 0) return [];
    return Array.from({ length: Math.min(4, count) }, () => 1);
  }
  function decorationFits(value, capacities, index, decoration, occupied = []) {
    const slots = Array.isArray(capacities) ? capacities.map(Number) : [];
    const required = Number(decoration?.slot || 1);
    if (!Number.isInteger(index) || index < 0 || index >= slots.length || !Number.isFinite(required) || required < 1) return false;
    const used = new Set(occupied);
    if (used.has(index)) return false;
    if (gameKey(value) !== 'mhgu') return Number.isFinite(slots[index]) && required <= slots[index];
    let free = 0;
    for (let cursor = index; cursor < slots.length; cursor += 1) if (!used.has(cursor)) free += 1;
    return required <= free;
  }
  global.equipmentCatalog = { raw, slotLabels, gameKeys, gameNames, gameKey, gameName, gameData, weapons, armor, items, decorations, charms, gameSkills, findArmor, findWeapon, findDecoration, findCharm, skills, slotCapacities, decorationFits };
})(window);
