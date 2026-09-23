(function exposeLocalBuildStore(global) {
  const STORAGE_KEY = 'savedBuilds';
  const VERSION = 2;

  function normalizeBuild(input) {
    const source = input && typeof input === 'object' ? input : {};
    return {
      id: source.id || `build-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: String(source.title || 'Minha build').trim() || 'Minha build',
      game: String(source.game || 'Monster Hunter: Wilds'),
      weapon: String(source.weapon || 'Espada Longa'),
      weaponId: String(source.weaponId || ''),
      type: String(source.type || 'DPS'),
      armor: {
        head: String(source.armor?.head || ''),
        chest: String(source.armor?.chest || ''),
        arms: String(source.armor?.arms || ''),
        waist: String(source.armor?.waist || ''),
        legs: String(source.armor?.legs || ''),
      },
      armorIds: {
        head: String(source.armorIds?.head || ''),
        chest: String(source.armorIds?.chest || ''),
        arms: String(source.armorIds?.arms || ''),
        waist: String(source.armorIds?.waist || ''),
        legs: String(source.armorIds?.legs || ''),
      },
      armorSkills: Object.fromEntries(['head', 'chest', 'arms', 'waist', 'legs'].map((slot) => [slot, Array.isArray(source.armorSkills?.[slot]) ? source.armorSkills[slot].map((skill) => ({ name: String(skill.name || ''), level: Number(skill.level || 0) })) : []])),
      talisman: String(source.talisman || ''),
      talismanId: String(source.talismanId || ''),
      talismanSkills: Array.isArray(source.talismanSkills) ? source.talismanSkills.map((skill) => ({ name: String(skill.name || ''), level: Number(skill.level || 0), unit: skill.unit === 'points' ? 'points' : 'level' })).filter((skill) => skill.name) : [],
      talismanSlots: Array.isArray(source.talismanSlots) ? source.talismanSlots.map(Number).filter((slot) => Number.isInteger(slot) && slot > 0 && slot <= 4).slice(0, 4) : [],
      skills: Array.isArray(source.skills) ? source.skills.map(String).filter(Boolean) : [],
      decorations: Array.isArray(source.decorations) ? source.decorations.map(String).filter(Boolean) : [],
      decorationSlots: Object.fromEntries(['weapon', 'head', 'chest', 'arms', 'waist', 'legs', 'talisman'].map((part) => [part, Array.isArray(source.decorationSlots?.[part]) ? source.decorationSlots[part].map((entry) => ({ id: String(entry?.id || ''), name: String(entry?.name || ''), requiredSlot: Number(entry?.requiredSlot || 0), slotIndex: Number.isInteger(Number(entry?.slotIndex)) ? Number(entry.slotIndex) : null })).slice(0, 4) : []])),
      notes: String(source.notes || ''),
      icon: String(source.icon || '⚔️'),
      createdAt: source.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function load() {
    try {
      const parsed = JSON.parse(global.localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.map(normalizeBuild) : [];
    } catch {
      return [];
    }
  }

  function save(builds) {
    const normalized = (Array.isArray(builds) ? builds : []).map(normalizeBuild);
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function exportData(builds) {
    return JSON.stringify({ schema: 'local-builds.v1', version: VERSION, exportedAt: new Date().toISOString(), builds: (builds || load()).map(normalizeBuild) }, null, 2);
  }

  function importData(text) {
    const parsed = JSON.parse(text);
    const builds = Array.isArray(parsed) ? parsed : parsed.builds;
    if (!Array.isArray(builds)) throw new Error('Formato de builds inválido.');
    return builds.map(normalizeBuild);
  }

  global.localBuildStore = { STORAGE_KEY, VERSION, normalizeBuild, load, save, exportData, importData };
})(window);
