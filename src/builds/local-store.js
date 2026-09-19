(function exposeLocalBuildStore(global) {
  const STORAGE_KEY = 'savedBuilds';
  const VERSION = 1;

  function normalizeBuild(input) {
    const source = input && typeof input === 'object' ? input : {};
    return {
      id: source.id || `build-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: String(source.title || 'Minha build').trim() || 'Minha build',
      game: String(source.game || 'Monster Hunter: Wilds'),
      weapon: String(source.weapon || 'Espada Longa'),
      type: String(source.type || 'DPS'),
      armor: {
        head: String(source.armor?.head || ''),
        chest: String(source.armor?.chest || ''),
        arms: String(source.armor?.arms || ''),
        waist: String(source.armor?.waist || ''),
        legs: String(source.armor?.legs || ''),
      },
      talisman: String(source.talisman || ''),
      skills: Array.isArray(source.skills) ? source.skills.map(String).filter(Boolean) : [],
      decorations: Array.isArray(source.decorations) ? source.decorations.map(String).filter(Boolean) : [],
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
