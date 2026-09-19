const viewRoot = document.querySelector('#view-root');
const viewTitle = document.querySelector('#view-title');
const profileName = document.querySelector('#profile-name');
const headerProfileName = document.querySelector('#header-profile-name');
const avatarButton = document.querySelector('#avatar-button');
const avatarInput = document.querySelector('#avatar-input');
const connectionLabel = document.querySelector('#connection-label');

const viewNames = { 'online-builds': 'Builds online', 'saved-builds': 'Builds registradas', bestiary: 'Monsterpedia', 'overlay-settings': 'Configurar overlay', 'app-settings': 'Configurações' };
const games = ['Monster Hunter: Wilds', 'Monster Hunter: World', 'Monster Hunter: Rise', 'Monster Hunter: Generations Ultimate'];
const weapons = ['Grande Espada', 'Espada Longa', 'Arco', 'Lâminas Duplas', 'Martelo', 'Insect Glaive'];
const buildCards = [
  { title: 'DPS crítico — Artian', game: 'Monster Hunter: Wilds', type: 'DPS', weapon: 'Espada Longa', source: 'Game8', icon: '⚔️' },
  { title: 'Elemental gelo', game: 'Monster Hunter: World', type: 'ELEMENTAL', weapon: 'Arco', source: 'Mobalytics', icon: '❄️' },
  { title: 'Conforto e sobrevivência', game: 'Monster Hunter: Rise', type: 'CONFORTO', weapon: 'Grande Espada', source: 'Icy Veins', icon: '🛡️' },
  { title: 'Dano bruto endgame', game: 'Monster Hunter: Wilds', type: 'DPS', weapon: 'Martelo', source: 'MH Wilds Hub', icon: '🔨' },
  { title: 'Status — paralisia', game: 'Monster Hunter: Rise', type: 'STATUS', weapon: 'Lâminas Duplas', source: 'Game8', icon: '⚡' },
  { title: 'Progressão Alto Rank', game: 'Monster Hunter: World', type: 'PROGRESSÃO', weapon: 'Arco', source: 'Mobalytics', icon: '🏹' },
];
const savedCards = [
  { title: 'Meu set principal', game: 'Monster Hunter: Wilds', weapon: 'Espada Longa', type: 'DPS', icon: '⚔️' },
  { title: 'Caçada elemental', game: 'Monster Hunter: World', weapon: 'Arco', type: 'ELEMENTAL', icon: '❄️' },
  { title: 'Build confortável', game: 'Monster Hunter: Rise', weapon: 'Lâminas Duplas', type: 'CONFORTO', icon: '🛡️' },
];
const monsterGameNames = { world: 'Monster Hunter: World', rise: 'Monster Hunter: Rise', wilds: 'Monster Hunter: Wilds', mhgu: 'Monster Hunter: Generations Ultimate' };
const ptTerms = {
  large: 'Grande', small: 'Pequeno', unknown: 'Indisponível', construct: 'Construto', 'elder dragon': 'Dragão ancião', 'fanged beast': 'Fera com presas', 'fanged wyvern': 'Wyvern com presas', 'flying wyvern': 'Wyvern voador', 'brute wyvern': 'Wyvern bruto', 'bird wyvern': 'Wyvern pássaro', amphibian: 'Anfíbio', leviathan: 'Leviatã', piscine: 'Pisciano', 'piscine wyvern': 'Wyvern pisciano', 'carapaceon': 'Carapaça', 'temnoceran': 'Temnocera', insect: 'Inseto', herbivore: 'Herbívoro', lynian: 'Lynian', neopteron: 'Neóptero', fish: 'Peixe', dragon: 'Dragão', fire: 'Fogo', water: 'Água', thunder: 'Trovão', ice: 'Gelo', poison: 'Veneno', paralysis: 'Paralisia', sleep: 'Sono', blast: 'Explosão', blastblight: 'Praga de explosão', stun: 'Atordoamento', fireblight: 'Praga de fogo', waterblight: 'Praga de água', thunderblight: 'Praga de trovão', iceblight: 'Praga de gelo', dragonblight: 'Praga de dragão', bleed: 'Sangramento', bleeding: 'Sangramento', exhaust: 'Exaustão', 'target-reward': 'recompensa do alvo', carve: 'esculpir', 'carve-rotten': 'esculpir carcaça', 'carve-rotten-severed': 'esculpir cauda', 'wound-destroyed': 'ferida destruída', 'broken-part': 'parte quebrada', 'left-front-leg': 'pata dianteira esquerda', 'right-front-leg': 'pata dianteira direita', 'left-hind-leg': 'pata traseira esquerda', 'right-hind-leg': 'pata traseira direita', foreleg: 'pata dianteira', hindleg: 'pata traseira', head: 'cabeça', neck: 'pescoço', chest: 'peito', torso: 'tronco', back: 'costas', tail: 'cauda', wing: 'asa', wings: 'asas', horn: 'chifre', body: 'corpo', leg: 'pata', hide: 'couro', throat: 'garganta', 'front legs': 'patas dianteiras', 'armblade': 'lâmina do braço', armblade: 'lâmina do braço', 'chain blade': 'lâmina da corrente', 'tail tip': 'ponta da cauda', 'weak point': 'ponto fraco', unknown: 'Indisponível'
};

function pt(value) {
  if (value == null || value === '') return 'Indisponível';
  const key = String(value).trim().toLowerCase();
  return ptTerms[key] || value;
}

function ptList(values = [], separator = ' · ') {
  return values.map((value) => pt(value)).join(separator) || 'Indisponível';
}

const dataLabelTerms = {
  body: 'corpo', head: 'cabeça', forelegs: 'patas dianteiras', foreleg: 'pata dianteira', forearms: 'antebraços', hindlegs: 'patas traseiras', hindleg: 'pata traseira', legs: 'patas', leg: 'pata', lower: 'inferior', upper: 'superior', lowerbody: 'parte inferior', chest: 'peito', neck: 'pescoço', back: 'costas', tail: 'cauda', 'tail tip': 'ponta da cauda', horn: 'chifre', horns: 'chifres', wing: 'asa', wings: 'asas', arm: 'braço', arms: 'braços', jaw: 'mandíbula', tongue: 'língua', stomach: 'estômago', scalp: 'couro cabeludo', rock: 'rocha', shell: 'carapaça', hide: 'couro', scale: 'escama', scales: 'escamas', claw: 'garra', claws: 'garras', fang: 'presa', fangs: 'presas', bone: 'osso', bones: 'ossos', wing: 'asa', webbing: 'membrana', talon: 'garra', mane: 'juba', sac: 'bolsa', fluid: 'fluido', essence: 'essência', carapace: 'carapaça', thickhide: 'couro espesso', hardclaw: 'garra resistente', shard: 'fragmento', cortex: 'córtex', plate: 'placa', mantle: 'manto', ruby: 'rubi', gem: 'gema', blood: 'sangue', tear: 'lágrima', pelt: 'pele', meat: 'carne', liver: 'fígado', ore: 'minério', crystal: 'cristal', husk: 'casca', whisker: 'bigode', crest: 'crista', beak: 'bico', beaks: 'bicos', stinger: 'ferrão', antennae: 'antenas', antenna: 'antena', mud: 'lama', wounded: 'ferido', enraged: 'enfurecido', heated: 'aquecido', white: 'branco', black: 'negro', 'gloss black': 'preto brilhante', electricity: 'eletricidade', 'magma armor': 'armadura de magma', 'critical state': 'estado crítico', 'before wounded': 'antes de ferir', 'after wounded': 'depois de ferir', 'raw meat': 'carne crua', potion: 'poção', 'monster fluid': 'fluido de monstro', 'monster essence': 'essência de monstro', 'monster bone': 'osso de monstro', 'iron ore': 'minério de ferro', 'machalite ore': 'minério de machalita', 'dragonite ore': 'minério de dragonita', 'wyvern tear': 'lágrima de wyvern', 'large wyvern tear': 'lágrima grande de wyvern', 'nulberry': 'nobora', 'first-aid med': 'medicamento de primeiros socorros', 'ancient potion': 'poção antiga', 'mega potion': 'mega poção'
};
function translateDataLabel(value) {
  let result = String(value || '');
  const phrases = Object.keys(dataLabelTerms).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) result = result.replace(new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi'), dataLabelTerms[phrase]);
  return result;
}
function ptMaterial(value) { return translateDataLabel(value); }
function ptPart(value) { return translateDataLabel(pt(value)); }

const weaknessIcons = { fire: '🔥', water: '💧', thunder: '⚡', ice: '❄️', dragon: '🐉', poison: '☠️', paralysis: '⚡', sleep: '💤', blast: '💥', stun: '💫' };
function weaknessIcon(element) { return weaknessIcons[String(element).toLowerCase()] || '✦'; }
function weaknessLevel(level) {
  const count = Math.max(0, Math.min(3, Number(level) || 0));
  return count;
}
function weaknessStars(level) {
  const count = weaknessLevel(level);
  return `<span class="weakness-stars weakness-level-${count}">${'★'.repeat(count)}${'☆'.repeat(3 - count)}</span>`;
}
function weaknessSummary(monster) {
  return monster.weaknesses?.map((weakness) => {
    const level = weaknessLevel(weakness.level);
    return `${escapeHtml(pt(weakness.element))} <span class="weakness-summary-level weakness-level-${level}">(${level})</span>`;
  }).join(' · ') || 'Indisponível';
}
function weaknessVisual(monster) {
  const weaknesses = monster.weaknesses || [];
  const badges = weaknesses.length
    ? weaknesses.map((weakness) => `<span class="weakness-badge"><span class="weakness-icon weakness-${escapeHtml(String(weakness.element).toLowerCase())}">${weaknessIcon(weakness.element)}</span><span><strong>${weaknessStars(weakness.level)}</strong><small>${escapeHtml(pt(weakness.element))}</small></span></span>`).join('')
    : '<span class="muted-inline">Indisponível</span>';
  const parts = (monster.parts || []).filter((part) => part.weakPointStars).slice(0, 8);
  const table = parts.length ? `<div class="weakness-table"><div class="weakness-table-head">Parte</div><div class="weakness-table-head">Corte</div><div class="weakness-table-head">Impacto</div><div class="weakness-table-head">Munição</div>${parts.map((part) => `<div class="weakness-part-name">${escapeHtml(pt(part.name))}${part.breakable ? ' <em>· quebra</em>' : ''}</div><div>${weaknessStars(part.weakPointStars.cut)}</div><div>${weaknessStars(part.weakPointStars.blunt)}</div><div>${weaknessStars(part.weakPointStars.ammo)}</div>`).join('')}</div>` : '';
  return `<div class="weakness-elements">${badges}</div>${table}<small class="weakness-note">Estrelas indicam a classificação do ponto fraco publicada pela fonte; valores numéricos de hitzone aparecem separadamente quando disponíveis.</small>`;
}

const monsterCatalog = window.monsterCatalog || { entries: [] };
const favoriteMonsterIds = new Set(JSON.parse(localStorage.getItem('monsterFavorites') || '[]'));
const revealedSpoilerIds = new Set();
let spoilerMode = localStorage.getItem('monsterSpoilerMode') === 'true';
const monsterSourceIds = {
  world: ['mhw-db', 'kiranico-world-health', 'monster-hunter-tools-ecology', 'monster-hunter-fandom-renders'],
  rise: ['mhrice', 'neryss-rise-db', 'monster-hunter-tools-ecology', 'monster-hunter-fandom-renders'],
  wilds: ['wilds-mhdb', 'monster-hunter-tools-ecology', 'monster-hunter-fandom-renders'],
  mhgu: ['mhgu-kiranico', 'mhgu-community-hitzones', 'monster-hunter-fandom-renders'],
};
function persistMonsterFavorites() { localStorage.setItem('monsterFavorites', JSON.stringify([...favoriteMonsterIds])); }
function toggleMonsterFavorite(id) { favoriteMonsterIds.has(id) ? favoriteMonsterIds.delete(id) : favoriteMonsterIds.add(id); persistMonsterFavorites(); }
function sourceLabel(source) { return source?.id === 'mhgu-community-hitzones' ? 'MHGU Monster Info · MIT' : source?.id === 'monster-hunter-fandom-renders' ? 'Monster Hunter Wiki · renders' : source?.id === 'monster-hunter-tools-ecology' ? 'Monster Hunter Tools · ecologia' : source?.id || 'Fonte catalogada'; }
function provenanceFor(monster) {
  return (monsterSourceIds[monster.gameKey] || []).map((id) => monsterCatalog.sources?.find((source) => source.id === id)).filter(Boolean);
}
const monsters = monsterCatalog.entries.map((monster) => ({
  ...monster,
  gameKey: monster.game,
  game: monsterGameNames[monster.game] || monster.game,
  iconFallback: monster.type === 'large' ? '🐉' : '🐾',
  threat: pt(monster.type),
  weakness: monster.weaknesses?.slice(0, 4).map((weakness) => `${pt(weakness.element)}${weakness.level ? ` · ${weakness.level}` : ''}`).join(' / ') || 'Indisponível',
  habitat: ptList(monster.locations),
  descriptionPt: monster.descriptionPt || monster.description,
  ecologyPt: monster.ecologyPt || { characteristics: '', usefulInfo: '' },
}));

let currentView = 'online-builds';
function loadSavedBuilds() {
  const stored = window.localBuildStore.load();
  if (stored.length) return stored;
  const initial = savedCards.map((build) => window.localBuildStore.normalizeBuild(build));
  window.localBuildStore.save(initial);
  return initial;
}
function saveBuilds(builds) { return window.localBuildStore.save(builds); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function selectHtml(id, values, selected = values[0]) { return `<select id="${id}">${values.map((value) => `<option ${value === selected ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}</select>`; }
function cardGrid(cards, saved = false) { return `<div class="card-grid">${cards.map((card) => `<article class="build-card"><div class="card-art">${card.icon}</div><div class="card-body"><div class="card-title"><strong>${escapeHtml(card.title)}</strong><span class="tag">${escapeHtml(card.type)}</span></div><div class="card-meta"><span>${escapeHtml(card.weapon)}</span><span>${saved ? escapeHtml(card.game.replace('Monster Hunter: ', '')) : 'Atualizada hoje'}</span></div><div class="card-source">${saved ? 'Build salva localmente' : `Fonte: ${escapeHtml(card.source)}`}</div></div></article>`).join('')}</div>`; }

function renderOnlineBuilds() {
  viewRoot.innerHTML = `<div class="toolbar"><label class="field">Jogo${selectHtml('build-game', games)}</label><label class="field">Arma${selectHtml('build-weapon', weapons, 'Espada Longa')}</label><label class="field">Tipo${selectHtml('build-type', ['Todos os tipos', 'DPS', 'ELEMENTAL', 'STATUS', 'CONFORTO', 'PROGRESSÃO'])}</label><button class="primary-button" id="search-builds">Buscar builds</button></div><div id="builds-info" class="info-banner">Resultados consultados online nas fontes aprovadas. Cada card preserva origem, tipo e jogo; nesta POC os resultados são simulados.</div><div id="online-build-grid" class="card-grid">${cardGrid(buildCards)}</div>`;
  const updateResults = () => {
    const game = document.querySelector('#build-game').value;
    const weapon = document.querySelector('#build-weapon').value;
    const type = document.querySelector('#build-type').value;
    const results = buildCards.filter((card) => card.game === game && card.weapon === weapon || card.game === game && type !== 'Todos os tipos' && card.type === type);
    document.querySelector('#online-build-grid').innerHTML = results.length ? cardGrid(results) : '<div class="empty-state">Nenhuma build simulada para esta combinação. Na versão online, a API consultará outras fontes aprovadas.</div>';
  };
  ['#build-game', '#build-weapon', '#build-type'].forEach((selector) => document.querySelector(selector).addEventListener('change', updateResults));
  document.querySelector('#search-builds').addEventListener('click', () => { updateResults(); document.querySelector('#builds-info').textContent = 'Consulta simulada concluída. A versão conectada usará a API agregadora sob demanda e exibirá a origem de cada resultado.'; });
}
function renderSavedBuilds(filterGame = 'Todos os jogos') {
  const builds = loadSavedBuilds();
  const visibleBuilds = filterGame === 'Todos os jogos' ? builds : builds.filter((build) => build.game === filterGame);
  const armorNames = ['Alpha Helm', 'Alpha Mail', 'Alpha Vambraces', 'Alpha Coil', 'Alpha Greaves'];
  const equipmentSelect = (id, label) => `<div class="editor-row"><label>${label}</label>${selectHtml(id, ['', ...armorNames], armorNames[0])}</div>`;
  viewRoot.innerHTML = `<div class="saved-layout"><div><div class="toolbar"><label class="field">Filtrar por jogo${selectHtml('saved-game', ['Todos os jogos', ...games], filterGame)}</label><button class="primary-button" id="new-build">＋ Nova build</button><button class="ghost-button" id="export-builds">Exportar JSON</button><button class="ghost-button" id="import-builds">Importar JSON</button><input id="import-file" type="file" accept="application/json" hidden /></div>${visibleBuilds.length ? cardGrid(visibleBuilds, true) : '<div class="empty-state">Nenhuma build registrada para este jogo.</div>'}</div><aside class="editor-card"><h2>Montar build</h2><div class="editor-row"><label>Nome</label><input class="text-input" id="editor-name" value="Minha build" /></div><div class="editor-row"><label>Jogo</label>${selectHtml('editor-game', games, games[0])}</div><div class="editor-row"><label>Arma</label>${selectHtml('editor-weapon', weapons, weapons[1])}</div>${equipmentSelect('editor-head', 'Capacete')}${equipmentSelect('editor-chest', 'Peitoral')}${equipmentSelect('editor-arms', 'Braçadeiras')}${equipmentSelect('editor-waist', 'Cintura')}${equipmentSelect('editor-legs', 'Grevas')}<div class="editor-row"><label>Talismã</label><input class="text-input" id="editor-talisman" placeholder="Nome do talismã" /></div><div class="editor-row"><label>Habilidades, separadas por vírgula</label><input class="text-input" id="editor-skills" placeholder="Weakness Exploit, Critical Eye" /></div><div class="editor-row"><label>Decorações, separadas por vírgula</label><input class="text-input" id="editor-decorations" placeholder="Tenderizer Jewel, Attack Jewel" /></div><div class="editor-row"><label>Tipo da build</label>${selectHtml('editor-type', ['DPS', 'ELEMENTAL', 'STATUS', 'CONFORTO', 'SUPORTE', 'PROGRESSÃO'])}</div><div class="editor-row"><label>Notas</label><textarea class="text-input editor-notes" id="editor-notes" placeholder="Objetivo e observações da build"></textarea></div><button class="primary-button" id="save-build">Salvar build local</button></aside></div>`;
  document.querySelector('#saved-game').addEventListener('change', (event) => renderSavedBuilds(event.target.value));
  document.querySelector('#new-build').addEventListener('click', () => document.querySelector('#editor-name').focus());
  document.querySelector('#save-build').addEventListener('click', () => {
    const split = (id) => document.querySelector(id).value.split(',').map((item) => item.trim()).filter(Boolean);
    const build = window.localBuildStore.normalizeBuild({ title: document.querySelector('#editor-name').value.trim() || 'Minha build', game: document.querySelector('#editor-game').value, weapon: document.querySelector('#editor-weapon').value, type: document.querySelector('#editor-type').value, armor: { head: document.querySelector('#editor-head').value, chest: document.querySelector('#editor-chest').value, arms: document.querySelector('#editor-arms').value, waist: document.querySelector('#editor-waist').value, legs: document.querySelector('#editor-legs').value }, talisman: document.querySelector('#editor-talisman').value, skills: split('#editor-skills'), decorations: split('#editor-decorations'), notes: document.querySelector('#editor-notes').value, icon: '⚔️' });
    saveBuilds([build, ...builds]);
    renderSavedBuilds(filterGame);
  });
  document.querySelector('#export-builds').addEventListener('click', () => { const blob = new Blob([window.localBuildStore.exportData(builds)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'monster-hunter-builds.json'; link.click(); URL.revokeObjectURL(link.href); });
  document.querySelector('#import-builds').addEventListener('click', () => document.querySelector('#import-file').click());
  document.querySelector('#import-file').addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { saveBuilds(window.localBuildStore.importData(reader.result)); renderSavedBuilds(filterGame); } catch { document.querySelector('.info-banner')?.remove(); alert('Não foi possível importar o arquivo de builds.'); } }; reader.readAsText(file); });
}
function monsterCards(list) { return list.length ? list.map((monster) => { const art = monster.icon || monster.iconFallbackAsset ? `<img src="${escapeHtml(monster.icon || monster.iconFallbackAsset)}" alt="${monster.icon ? 'Ícone' : 'Imagem de fallback'} de ${escapeHtml(monster.name)}" loading="lazy" />` : `<span>${monster.iconFallback}</span>`; return `<article class="monster-card" data-monster-id="${escapeHtml(monster.id)}"><div class="monster-art">${art}<button class="favorite-button ${favoriteMonsterIds.has(monster.id) ? 'is-favorite' : ''}" data-favorite-id="${escapeHtml(monster.id)}" title="${favoriteMonsterIds.has(monster.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${favoriteMonsterIds.has(monster.id) ? '★' : '☆'}</button></div><div class="card-body"><div class="card-title"><strong>${escapeHtml(monster.name)}</strong><span class="tag">${escapeHtml(monster.threat)}</span></div><div class="card-meta"><span>${escapeHtml(monster.threat)}</span><span>${escapeHtml(monster.game.replace('Monster Hunter: ', ''))}</span></div></div></article>`; }).join('') : '<div class="empty-state">Nenhum monstro encontrado para este filtro.</div>'; }
function normalizeSearch(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function materialResults(list, query, rankKey) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return [];
  const results = [];
  for (const monster of list) {
    const rankRewards = rankKey && monster.rankData?.[rankKey]?.rewards?.length ? monster.rankData[rankKey].rewards : monster.rewards || [];
    for (const reward of rankRewards) {
      if (!normalizeSearch(reward.item).includes(normalizedQuery) && !normalizeSearch(ptMaterial(reward.item)).includes(normalizedQuery)) continue;
      for (const condition of reward.conditions || []) {
        if (rankKey && condition.rank && condition.rank !== rankKey) continue;
        results.push({ monster, item: reward.item, method: condition.type, rank: condition.rank, chance: condition.chance, part: condition.part });
      }
    }
  }
  return results.sort((a, b) => a.monster.name.localeCompare(b.monster.name) || a.item.localeCompare(b.item) || (b.chance || 0) - (a.chance || 0));
}
function materialResultCards(results) {
  if (!results.length) return '<div class="empty-state">Nenhum material encontrado para este jogo/rank.</div>';
  return results.slice(0, 80).map((result) => `<article class="material-result" data-monster-id="${escapeHtml(result.monster.id)}"><div><strong>${escapeHtml(ptMaterial(result.item))}</strong><span>${escapeHtml(result.monster.name)} · ${escapeHtml(result.monster.game.replace('Monster Hunter: ', ''))}</span></div><small>${escapeHtml(pt(result.method))}${result.part ? ` · ${escapeHtml(ptPart(result.part))}` : ''}${result.rank ? ` · ${result.rank === 'low' ? 'Baixo' : result.rank === 'high' ? 'Alto' : 'Mestre/G'}` : ''}${result.chance != null ? ` · ${result.chance}%` : ''}</small></article>`).join('');
}
function partValueSummary(part) {
  const hitzones = part.hitzones || {};
  const values = [['Corte', hitzones.cut ?? hitzones.slash], ['Impacto', hitzones.blunt ?? hitzones.impact], ['Munição', hitzones.ammo ?? hitzones.shot]]
    .filter(([, value]) => value != null)
    .map(([label, value]) => `${label} ${value}`);
  return values.join(' · ') || 'Hitzone indisponível';
}
const partMapAssets = {
  'world-42': {
    image: 'assets/part-maps/rathalos-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 31, y: 77, labelX: 14, labelY: 17, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 69, y: 31, labelX: 84, labelY: 17, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 50, y: 67, labelX: 48, labelY: 17, kind: 'neutral' },
      { partIndex: 6, x: 50, y: 88, labelX: 22, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 72, y: 80, labelX: 82, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-17': {
    image: 'assets/part-maps/great-jagras-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 88, y: 16, labelX: 84, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 4, x: 79, y: 35, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 9, x: 61, y: 63, labelX: 17, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 75, y: 71, labelX: 84, labelY: 88, side: 'right', kind: 'neutral' },
      { partIndex: 7, x: 35, y: 79, labelX: 51, labelY: 88, kind: 'neutral' },
      { partIndex: 8, x: 17, y: 62, labelX: 17, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'world-18': {
    image: 'assets/part-maps/kulu-ya-ku-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 34, y: 27, labelX: 16, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 27, y: 66, labelX: 48, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 48, y: 55, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 2, x: 25, y: 67, labelX: 20, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 78, y: 52, labelX: 81, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-19': {
    image: 'assets/part-maps/pukei-pukei-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 49, y: 13, labelX: 16, labelY: 15, side: 'left', kind: 'severable' },
      { partIndex: 2, x: 76, y: 31, labelX: 49, labelY: 15, kind: 'breakable' },
      { partIndex: 3, x: 51, y: 45, labelX: 83, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 6, x: 50, y: 59, labelX: 84, labelY: 48, side: 'right', kind: 'neutral' },
      { partIndex: 7, x: 55, y: 82, labelX: 80, labelY: 88, side: 'right', kind: 'neutral' },
      { partIndex: 0, x: 31, y: 77, labelX: 16, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 39, y: 86, labelX: 48, labelY: 88, kind: 'neutral' },
    ],
  },
  'world-20': {
    image: 'assets/part-maps/barroth-hunter-notes-v1.png',
    anchors: [
      { partIndex: 3, x: 88, y: 42, labelX: 82, labelY: 14, side: 'right', kind: 'breakable' },
      { partIndex: 4, x: 92, y: 52, labelX: 82, labelY: 30, side: 'right', kind: 'neutral' },
      { partIndex: 6, x: 53, y: 46, labelX: 45, labelY: 14, side: 'left', kind: 'neutral' },
      { partIndex: 0, x: 61, y: 76, labelX: 65, labelY: 90, side: 'right', kind: 'breakable' },
      { partIndex: 2, x: 25, y: 77, labelX: 17, labelY: 90, side: 'left', kind: 'breakable' },
      { partIndex: 1, x: 8, y: 55, labelX: 14, labelY: 70, side: 'left', kind: 'neutral' },
    ],
  },
  'world-21': {
    image: 'assets/part-maps/jyuratodus-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 9, y: 18, labelX: 14, labelY: 14, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 29, y: 42, labelX: 30, labelY: 14, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 55, y: 22, labelX: 52, labelY: 14, kind: 'neutral' },
      { partIndex: 7, x: 24, y: 49, labelX: 14, labelY: 58, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 52, y: 59, labelX: 48, labelY: 90, kind: 'breakable' },
      { partIndex: 3, x: 35, y: 82, labelX: 18, labelY: 90, side: 'left', kind: 'breakable' },
      { partIndex: 8, x: 69, y: 82, labelX: 68, labelY: 90, side: 'right', kind: 'neutral' },
      { partIndex: 1, x: 91, y: 34, labelX: 84, labelY: 58, side: 'right', kind: 'neutral' },
    ],
  },
  'world-22': {
    image: 'assets/part-maps/tobi-kadachi-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 40, y: 42, labelX: 14, labelY: 16, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 48, y: 30, labelX: 31, labelY: 16, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 66, y: 14, labelX: 51, labelY: 16, kind: 'breakable' },
      { partIndex: 1, x: 47, y: 64, labelX: 85, labelY: 16, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 6, x: 33, y: 38, labelX: 18, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 58, y: 22, labelX: 44, labelY: 88, kind: 'neutral' },
      { partIndex: 7, x: 51, y: 35, labelX: 70, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-23': {
    image: 'assets/part-maps/anjanath-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 2, x: 14, y: 15, labelX: 14, labelY: 16, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 9, y: 11, labelX: 36, labelY: 16, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 39, y: 25, labelX: 59, labelY: 16, kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 9, x: 94, y: 55, labelX: 84, labelY: 16, side: 'right', kind: 'breakable' },
      { partIndex: 7, x: 52, y: 48, labelX: 47, labelY: 88, kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 8, x: 67, y: 78, labelX: 72, labelY: 88, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 27, y: 35, labelX: 20, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'world-24': {
    image: 'assets/part-maps/azure-rathalos-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 72, y: 78, labelX: 15, labelY: 16, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 21, y: 42, labelX: 39, labelY: 16, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 64, y: 55, labelX: 61, labelY: 16, kind: 'breakable' },
      { partIndex: 5, x: 65, y: 64, labelX: 84, labelY: 16, side: 'right', kind: 'neutral' },
      { partIndex: 6, x: 63, y: 86, labelX: 18, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 7, x: 47, y: 76, labelX: 49, labelY: 88, kind: 'severable' },
      { partIndex: 4, x: 69, y: 70, labelX: 80, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-25': {
    image: 'assets/part-maps/bazelgeuse-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 59, y: 11, labelX: 16, labelY: 16, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 25, y: 39, labelX: 49, labelY: 16, kind: 'breakable' },
      { partIndex: 3, x: 56, y: 45, labelX: 83, labelY: 16, side: 'right', kind: 'breakable' },
      { partIndex: 1, x: 18, y: 73, labelX: 18, labelY: 88, side: 'left', kind: 'severable' },
      { partIndex: 5, x: 54, y: 87, labelX: 49, labelY: 88, kind: 'neutral' },
      { partIndex: 4, x: 64, y: 61, labelX: 81, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-26': {
    image: 'assets/part-maps/behemoth-hunter-notes-v1.png',
    anchors: [
      { partIndex: 3, valuePartIndex: 4, x: 15, y: 18, labelX: 14, labelY: 16, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 20, y: 26, labelX: 37, labelY: 16, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 48, y: 28, labelX: 60, labelY: 16, kind: 'neutral' },
      { partIndex: 6, x: 42, y: 39, labelX: 83, labelY: 16, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 8, x: 21, y: 54, labelX: 18, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 10, x: 31, y: 79, labelX: 49, labelY: 88, kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 11, x: 82, y: 72, labelX: 81, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-27': {
    image: 'assets/part-maps/deviljho-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 18, y: 58, labelX: 15, labelY: 16, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 42, y: 35, labelX: 49, labelY: 16, kind: 'neutral' },
      { partIndex: 3, x: 83, y: 62, labelX: 83, labelY: 16, side: 'right', kind: 'severable' },
      { partIndex: 2, valuePartIndex: 7, x: 34, y: 47, labelX: 18, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 9, x: 31, y: 51, labelX: 49, labelY: 88, kind: 'neutral' },
      { partIndex: 11, x: 54, y: 71, labelX: 81, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-28': {
    image: 'assets/part-maps/diablos-hunter-notes-v1.png',
    anchors: [
      { partIndex: 4, valuePartIndex: 6, x: 55, y: 23, labelX: 15, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 76, y: 25, labelX: 38, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 20, y: 56, labelX: 62, labelY: 15, kind: 'neutral' },
      { partIndex: 1, x: 61, y: 58, labelX: 85, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 9, x: 70, y: 80, labelX: 18, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 8, x: 54, y: 67, labelX: 50, labelY: 88, kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 10, x: 91, y: 42, labelX: 82, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-29': {
    image: 'assets/part-maps/black-diablos-hunter-notes-v1.png',
    anchors: [
      { partIndex: 4, valuePartIndex: 6, x: 35, y: 21, labelX: 15, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, x: 30, y: 64, labelX: 38, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 55, y: 48, labelX: 62, labelY: 15, kind: 'breakable' },
      { partIndex: 2, x: 61, y: 52, labelX: 85, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 9, x: 34, y: 84, labelX: 18, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 8, x: 55, y: 68, labelX: 50, labelY: 88, kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 10, x: 86, y: 50, labelX: 82, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-30': {
    image: 'assets/part-maps/dodogama-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 20, y: 15, labelX: 15, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 30, y: 34, labelX: 38, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 9, x: 55, y: 43, labelX: 62, labelY: 15, kind: 'neutral' },
      { partIndex: 1, x: 89, y: 68, labelX: 85, labelY: 15, side: 'right', kind: 'severable' },
      { partIndex: 2, valuePartIndex: 10, x: 42, y: 84, labelX: 18, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 8, x: 47, y: 68, labelX: 50, labelY: 88, kind: 'neutral' },
      { partIndex: 11, x: 81, y: 84, labelX: 82, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-31': {
    image: 'assets/part-maps/great-girros-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 13, y: 25, labelX: 15, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 31, y: 38, labelX: 38, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 54, y: 37, labelX: 62, labelY: 15, kind: 'neutral' },
      { partIndex: 2, x: 86, y: 51, labelX: 85, labelY: 15, side: 'right', kind: 'severable' },
      { partIndex: 0, x: 43, y: 82, labelX: 18, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 57, y: 61, labelX: 50, labelY: 88, kind: 'neutral' },
      { partIndex: 6, x: 85, y: 76, labelX: 82, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-32': {
    image: 'assets/part-maps/kirin-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 0, x: 65, y: 8, labelX: 17, labelY: 16, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 68, y: 24, labelX: 83, labelY: 16, side: 'right', kind: 'neutral' },
      { partIndex: 2, x: 57, y: 55, labelX: 20, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 58, y: 75, labelX: 80, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-33': {
    image: 'assets/part-maps/kulve-taroth-hunter-notes-v1.png',
    anchors: [
      { partIndex: 3, x: 29, y: 14, labelX: 15, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 31, y: 26, labelX: 38, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 40, y: 42, labelX: 62, labelY: 15, kind: 'breakable' },
      { partIndex: 4, x: 91, y: 64, labelX: 85, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, x: 34, y: 63, labelX: 18, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 61, y: 42, labelX: 50, labelY: 88, kind: 'breakable' },
      { partIndex: 6, x: 82, y: 65, labelX: 82, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-34': {
    image: 'assets/part-maps/kushala-daora-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 30, y: 37, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 37, y: 46, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 48, y: 57, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 8, x: 73, y: 32, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, x: 31, y: 56, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 45, y: 64, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 39, y: 84, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 2, x: 62, y: 81, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-35': {
    image: 'assets/part-maps/lavasioth-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 5, x: 68, y: 34, labelX: 15, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 60, y: 39, labelX: 38, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 8, x: 48, y: 21, labelX: 62, labelY: 15, kind: 'breakable' },
      { partIndex: 9, x: 29, y: 24, labelX: 85, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 10, x: 58, y: 49, labelX: 18, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 47, y: 43, labelX: 50, labelY: 88, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 11, x: 43, y: 66, labelX: 82, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-36': {
    image: 'assets/part-maps/legiana-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 48, y: 51, labelX: 15, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 56, y: 58, labelX: 38, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 65, y: 55, labelX: 62, labelY: 15, kind: 'neutral' },
      { partIndex: 2, x: 76, y: 31, labelX: 85, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, x: 24, y: 76, labelX: 18, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 53, y: 68, labelX: 50, labelY: 88, kind: 'breakable' },
      { partIndex: 6, x: 51, y: 79, labelX: 82, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-37': {
    image: 'assets/part-maps/lunastra-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 84, y: 37, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 75, y: 45, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 59, y: 50, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, x: 34, y: 34, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 7, x: 43, y: 81, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 62, y: 64, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 65, y: 82, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 1, x: 80, y: 72, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-38': {
    image: 'assets/part-maps/nergigante-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 4, x: 29, y: 48, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, x: 34, y: 56, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 10, x: 72, y: 27, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 7, x: 47, y: 39, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 8, x: 35, y: 69, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 47, y: 59, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 9, x: 52, y: 84, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 11, x: 79, y: 76, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-39': {
    image: 'assets/part-maps/odogaron-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 59, y: 40, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 52, y: 31, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 39, y: 19, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, x: 81, y: 69, labelX: 87, labelY: 15, side: 'right', kind: 'severable' },
      { partIndex: 0, x: 26, y: 62, labelX: 18, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 40, y: 42, labelX: 50, labelY: 88, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 7, x: 38, y: 83, labelX: 82, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-40': {
    image: 'assets/part-maps/paolumu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 46, y: 56, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, x: 51, y: 44, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 37, y: 43, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 8, x: 76, y: 52, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 39, y: 51, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 47, y: 61, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 38, y: 69, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 3, x: 43, y: 84, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-41': {
    image: 'assets/part-maps/radobaan-hunter-notes-v1.png',
    anchors: [
      { partIndex: 7, x: 34, y: 42, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 15, y: 56, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 49, y: 25, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, x: 89, y: 53, labelX: 87, labelY: 15, side: 'right', kind: 'severable' },
      { partIndex: 5, x: 42, y: 49, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 55, y: 50, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 44, y: 67, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 8, x: 70, y: 68, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-43': {
    image: 'assets/part-maps/rathian-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 18, y: 64, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 28, y: 54, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 58, y: 32, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, x: 40, y: 44, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 38, y: 58, labelX: 18, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 30, y: 70, labelX: 50, labelY: 88, kind: 'breakable' },
      { partIndex: 1, x: 17, y: 84, labelX: 82, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-44': {
    image: 'assets/part-maps/pink-rathian-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 79, y: 73, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 72, y: 56, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 37, y: 27, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, x: 59, y: 28, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 57, y: 45, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 59, y: 67, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 23, y: 43, labelX: 63, labelY: 88, kind: 'severable' },
      { partIndex: 1, valuePartIndex: 8, x: 8, y: 37, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-45': {
    image: 'assets/part-maps/teostra-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 51, y: 30, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 20, y: 37, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 51, y: 45, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 5, x: 53, y: 54, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, x: 57, y: 61, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 61, y: 74, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 44, y: 80, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 1, x: 14, y: 70, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-48': {
    image: 'assets/part-maps/tzitzi-yaku-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 81, y: 53, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, x: 82, y: 25, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 67, y: 64, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, x: 68, y: 58, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, x: 29, y: 58, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
    ],
  },
  'world-49': {
    image: 'assets/part-maps/uragaan-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 83, y: 60, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 84, y: 67, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 55, y: 25, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, x: 14, y: 59, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 6, x: 84, y: 74, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 9, x: 57, y: 58, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 10, x: 48, y: 71, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 11, x: 44, y: 82, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-50': {
    image: 'assets/part-maps/vaal-hazak-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 50, y: 53, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 11, x: 24, y: 26, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 50, y: 46, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, x: 21, y: 68, labelX: 87, labelY: 15, side: 'right', kind: 'severable' },
      { partIndex: 3, x: 58, y: 63, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 10, x: 67, y: 75, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 9, x: 48, y: 87, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 6, x: 58, y: 69, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-51': {
    image: 'assets/part-maps/xeno-jiiva-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 10, x: 78, y: 69, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 8, x: 30, y: 30, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 68, y: 60, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 5, x: 59, y: 64, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 6, x: 73, y: 70, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 11, x: 72, y: 80, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 19, x: 52, y: 82, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 9, x: 20, y: 74, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-52': {
    image: 'assets/part-maps/zorah-magdaros-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 24, y: 58, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 36, y: 69, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 65, y: 37, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, x: 57, y: 61, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 6, x: 34, y: 78, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 46, y: 84, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 9, x: 65, y: 59, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 10, x: 72, y: 49, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-53': {
    image: 'assets/part-maps/leshen-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 50, y: 28, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, x: 50, y: 54, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 31, y: 65, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, x: 50, y: 82, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 32, y: 35, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'world-54': {
    image: 'assets/part-maps/ancient-leshen-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 50, y: 30, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, x: 50, y: 57, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 30, y: 67, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 4, x: 50, y: 83, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 5, x: 27, y: 43, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'world-55': {
    image: 'assets/part-maps/safi-jiiva-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, x: 19, y: 35, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 76, y: 31, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 54, y: 30, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, x: 54, y: 53, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, x: 38, y: 68, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 69, y: 73, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 37, y: 84, labelX: 63, labelY: 88, kind: 'severable' },
      { partIndex: 14, x: 79, y: 47, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-56': {
    image: 'assets/part-maps/stygian-zinogre-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, x: 86, y: 43, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 48, y: 34, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 56, y: 54, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 1, x: 73, y: 69, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 6, x: 34, y: 72, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 19, y: 65, labelX: 63, labelY: 88, kind: 'severable' },
    ],
  },
  'world-57': {
    image: 'assets/part-maps/rajang-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 50, y: 39, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 28, y: 22, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 55, y: 55, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, x: 35, y: 69, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 73, y: 72, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 66, y: 84, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 82, y: 48, labelX: 63, labelY: 88, kind: 'severable' },
    ],
  },
  'world-58': {
    image: 'assets/part-maps/viper-tobi-kadachi-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 15, y: 28, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 31, y: 39, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 51, y: 30, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 5, x: 48, y: 57, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, x: 63, y: 70, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 76, y: 83, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 19, y: 64, labelX: 63, labelY: 88, kind: 'severable' },
    ],
  },
  'world-59': {
    image: 'assets/part-maps/namielle-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 64, y: 56, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 27, y: 25, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 52, y: 40, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 5, x: 58, y: 57, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 6, x: 61, y: 72, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, x: 57, y: 80, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 76, y: 80, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 3, x: 15, y: 58, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-60': {
    image: 'assets/part-maps/zinogre-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 75, y: 47, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 52, y: 38, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 69, y: 55, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 5, x: 52, y: 56, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, x: 64, y: 75, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 25, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 10, y: 34, labelX: 63, labelY: 88, kind: 'severable' },
    ],
  },
  'world-61': {
    image: 'assets/part-maps/ebony-odogaron-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 62, y: 25, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 56, y: 33, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 62, y: 47, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 6, x: 48, y: 53, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, x: 36, y: 72, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, x: 69, y: 76, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 57, y: 68, labelX: 63, labelY: 88, kind: 'breakable' },
      { partIndex: 2, x: 82, y: 53, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-62': {
    image: 'assets/part-maps/banbaro-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 50, y: 57, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 25, y: 45, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 50, y: 49, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 6, x: 51, y: 68, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 7, x: 48, y: 83, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 53, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 84, y: 59, labelX: 63, labelY: 88, kind: 'severable' },
    ],
  },
  'world-63': {
    image: 'assets/part-maps/beotodus-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 80, y: 38, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 51, y: 40, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 50, y: 60, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 1, x: 40, y: 63, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, x: 17, y: 43, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 20, y: 52, labelX: 63, labelY: 88, kind: 'severable' },
    ],
  },
  'world-64': {
    image: 'assets/part-maps/nargacuga-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 75, y: 39, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 39, y: 34, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 48, y: 23, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 4, x: 51, y: 49, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 6, x: 45, y: 57, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 57, y: 62, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 28, y: 70, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 1, x: 82, y: 79, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-65': {
    image: 'assets/part-maps/velkhana-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 51, y: 54, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 24, y: 25, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 50, y: 62, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 6, x: 51, y: 69, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 8, x: 46, y: 75, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, x: 59, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 51, y: 84, labelX: 63, labelY: 88, kind: 'severable' },
    ],
  },
  'world-66': {
    image: 'assets/part-maps/tigrex-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 75, y: 51, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 49, y: 48, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 54, y: 68, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 0, x: 66, y: 73, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 5, x: 35, y: 80, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 15, y: 55, labelX: 63, labelY: 88, kind: 'severable' },
      { partIndex: 6, x: 6, y: 53, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-67': {
    image: 'assets/part-maps/shrieking-legiana-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 35, y: 56, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 29, y: 28, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 45, y: 59, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 5, x: 42, y: 59, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, x: 49, y: 67, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 49, y: 71, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 49, y: 82, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 4, x: 71, y: 67, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-68': {
    image: 'assets/part-maps/barioth-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 12, y: 57, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 47, y: 28, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 31, y: 45, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 8, x: 53, y: 72, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 5, x: 56, y: 54, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, x: 35, y: 72, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, x: 75, y: 70, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 10, x: 86, y: 43, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
      { partIndex: 2, x: 94, y: 40, labelX: 63, labelY: 15, kind: 'breakable' },
    ],
  },
  'world-69': {
    image: 'assets/part-maps/glavenus-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 53, y: 18, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 52, y: 30, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 70, y: 36, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 6, x: 64, y: 51, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 4, x: 55, y: 65, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 8, x: 80, y: 70, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, x: 69, y: 74, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 10, x: 31, y: 78, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
      { partIndex: 11, x: 15, y: 80, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'world-70': {
    image: 'assets/part-maps/brachydios-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 83, y: 36, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 70, y: 42, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 58, y: 54, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 0, x: 63, y: 74, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 66, y: 68, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 48, y: 82, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 21, y: 52, labelX: 63, labelY: 88, kind: 'severable' },
      { partIndex: 7, x: 10, y: 45, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
};
function partMapMarkup(monster) {
  const map = monster.partMap || {};
  const asset = partMapAssets[monster.id] || partMapAssets[monster.name] || {};
  const partMapImage = map.image || (typeof asset === 'string' ? asset : asset.image);
  const anchors = Array.isArray(map.anchors) ? map.anchors : (Array.isArray(asset.anchors) ? asset.anchors : []);
  const labels = anchors.map((anchor) => {
    const part = (monster.parts || [])[anchor.partIndex];
    const valuePart = Number.isInteger(anchor.valuePartIndex) ? (monster.parts || [])[anchor.valuePartIndex] : part;
    if (!part || !Number.isFinite(anchor.x) || !Number.isFinite(anchor.y)) return '';
    const kind = anchor.kind || (part.severable ? 'severable' : part.breakable ? 'breakable' : 'neutral');
    const flags = [part.breakable || kind === 'breakable' ? 'quebra' : '', part.severable || kind === 'severable' ? 'cortável' : ''].filter(Boolean).join(' · ');
    const side = anchor.side === 'left' ? 'is-left' : anchor.side === 'right' ? 'is-right' : '';
    return `<button class="part-callout ${side} is-${kind}" style="--part-x:${anchor.x}%;--part-y:${anchor.y}%;--callout-x:${anchor.labelX ?? anchor.x}%;--callout-y:${anchor.labelY ?? anchor.y}%" data-part-index="${anchor.partIndex}"><strong>${escapeHtml(ptPart(part.name))}</strong><small>${escapeHtml(flags || 'parte')}</small><em>${escapeHtml(partValueSummary(valuePart || part))}</em>${part.breakThresholds?.length ? `<span>Limiar ${part.breakThresholds.join('/')}</span>` : ''}</button>`;
  }).join('');
  const connectors = anchors.map((anchor) => `<line x1="${anchor.x}" y1="${anchor.y}" x2="${anchor.labelX ?? anchor.x}" y2="${anchor.labelY ?? anchor.y}" />`).join('');
  const legend = '<div class="part-map-legend"><span>Linhas indicam a parte correspondente</span><span>Valores: Corte · Impacto · Munição</span></div>';
  const status = partMapImage && anchors.length ? '' : '<div class="part-map-pending"><strong>Mapa anatômico individual em validação</strong><small>As caixas só aparecem quando a arte e as coordenadas das partes deste monstro forem conferidas. Nenhum mapa de outra espécie é reutilizado.</small></div>';
  return `<div class="part-map"><div class="part-map-stage">${partMapImage ? `<img src="${escapeHtml(partMapImage)}" alt="Mapa ilustrado de partes de ${escapeHtml(monster.name)}" />` : ''}${status}<svg class="part-map-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${connectors}</svg>${labels}</div>${legend}</div>`;
}
function renderBestiary() {
  viewRoot.innerHTML = `<div class="toolbar"><label class="field">Jogo${selectHtml('monster-game', ['Todos os jogos', ...games], 'Todos os jogos')}</label><label class="field">Porte${selectHtml('monster-size', ['Todos os portes', 'Grandes', 'Pequenos'], 'Todos os portes')}</label><label class="field">Rank${selectHtml('monster-rank', ['Todos os ranks', 'Baixo', 'Alto', 'Mestre/G'], 'Todos os ranks')}</label><label class="field">Favoritos${selectHtml('monster-favorites', ['Todos os monstros', 'Somente favoritos'], 'Todos os monstros')}</label><label class="field">Pesquisar monstro<input class="text-input" id="monster-search" placeholder="Nome do monstro" /></label><label class="field">Pesquisar material<input class="text-input" id="material-search" placeholder="Ex.: Rathalos Ruby" /></label><label class="spoiler-toggle"><input type="checkbox" id="monster-spoilers" ${spoilerMode ? 'checked' : ''} /> Modo sem spoilers</label></div><div class="info-banner" id="monster-count">Catálogo carregado: World/Iceborne ${monsters.filter((monster) => monster.game === 'Monster Hunter: World').length} · Rise/Sunbreak ${monsters.filter((monster) => monster.game === 'Monster Hunter: Rise').length} · Wilds ${monsters.filter((monster) => monster.game === 'Monster Hunter: Wilds').length} · Generations Ultimate ${monsters.filter((monster) => monster.game === 'Monster Hunter: Generations Ultimate').length}</div><section class="material-search-card"><div class="section-heading"><h2>Busca reversa por material</h2><span>Resultados do catálogo local</span></div><p class="muted-inline">Digite um material para descobrir quais monstros o fornecem e em qual método ou rank.</p><div id="material-results" class="material-results"><div class="empty-state">Digite um material para começar.</div></div></section><div id="monster-grid" class="card-grid">${monsterCards(monsters)}</div>`;
  const applyFilters = () => {
    const game = document.querySelector('#monster-game').value;
    const size = document.querySelector('#monster-size').value;
    const rank = document.querySelector('#monster-rank').value;
    const query = document.querySelector('#monster-search').value.toLowerCase().trim();
    const favorites = document.querySelector('#monster-favorites').value;
    const filtered = monsters.filter((monster) => (game === 'Todos os jogos' || monster.game === game) && (size === 'Todos os portes' || (size === 'Grandes' ? monster.type === 'large' : monster.type === 'small')) && (favorites !== 'Somente favoritos' || favoriteMonsterIds.has(monster.id)) && monster.name.toLowerCase().includes(query));
    const rankKey = { Baixo: 'low', Alto: 'high', 'Mestre/G': 'master' }[rank];
    const ranked = rankKey ? filtered.filter((monster) => monster.ranks?.includes(rankKey)) : filtered;
    document.querySelector('#monster-count').textContent = `${ranked.length} monstro(s) encontrado(s)${game !== 'Todos os jogos' ? ` em ${game}` : ''}${size !== 'Todos os portes' ? ` · ${size}` : ''}${rankKey ? ` · rank ${rank}` : ''}`;
    document.querySelector('#monster-grid').innerHTML = monsterCards(ranked);
    document.querySelector('#material-results').innerHTML = materialResultCards(materialResults(filtered, document.querySelector('#material-search').value, rankKey));
  };
  document.querySelector('#monster-search').addEventListener('input', applyFilters);
  document.querySelector('#monster-game').addEventListener('change', applyFilters);
  document.querySelector('#monster-size').addEventListener('change', applyFilters);
  document.querySelector('#monster-rank').addEventListener('change', applyFilters);
  document.querySelector('#monster-favorites').addEventListener('change', applyFilters);
  document.querySelector('#material-search').addEventListener('input', applyFilters);
  document.querySelector('#monster-spoilers').addEventListener('change', (event) => { spoilerMode = event.target.checked; localStorage.setItem('monsterSpoilerMode', String(spoilerMode)); applyFilters(); });
  document.querySelector('#monster-grid').addEventListener('click', (event) => { const favorite = event.target.closest('[data-favorite-id]'); if (favorite) { event.stopPropagation(); toggleMonsterFavorite(favorite.dataset.favoriteId); applyFilters(); return; } const card = event.target.closest('[data-monster-id]'); if (card) { const selectedRank = { Baixo: 'low', Alto: 'high', 'Mestre/G': 'master' }[document.querySelector('#monster-rank').value] || null; renderMonsterDetail(monsters.find((monster) => monster.id === card.dataset.monsterId), selectedRank); } });
  document.querySelector('#material-results').addEventListener('click', (event) => { const card = event.target.closest('[data-monster-id]'); if (card) { const selectedRank = { Baixo: 'low', Alto: 'high', 'Mestre/G': 'master' }[document.querySelector('#monster-rank').value] || null; renderMonsterDetail(monsters.find((monster) => monster.id === card.dataset.monsterId), selectedRank); } });
}
function renderMonsterDetail(monster, selectedRank = null) {
  const rankData = selectedRank ? monster.rankData?.[selectedRank] : null;
  const rankedRewards = rankData?.rewards?.length ? rankData.rewards : monster.rewards;
  const rankedHealth = rankData?.healthProfiles?.length ? rankData.healthProfiles : monster.healthProfiles;
  const weaknesses = weaknessSummary(monster);
  const parts = monster.parts?.length
    ? monster.parts.map((part) => `<li><strong>${escapeHtml(ptPart(part.name))}${part.breakable ? ' · quebra' : ''}</strong><span>${part.health ? `Vida ${part.health}` : part.weakPointStars ? `Corte ${weaknessStars(part.weakPointStars.cut)}` : 'Hitzone disponível'}${part.breakThresholds?.length ? ` · limiar ${part.breakThresholds.join('/')}` : ''}</span></li>`).join('')
    : '<li>Partes/hitzones não publicados pela fonte selecionada.</li>';
  const rewards = rankedRewards?.length
    ? rankedRewards.map((reward) => `<li><strong>${escapeHtml(ptMaterial(reward.item))}</strong><span>${(reward.conditions || []).map((condition) => `${pt(condition.type)}${condition.part ? ` · ${ptPart(condition.part)}` : ''}${condition.chance != null ? ` ${condition.chance}%` : ''}`).join(', ')}</span></li>`).join('')
    : '<li>Recompensas indisponíveis.</li>';
  const renderImage = monster.render || monster.imageFallback || monster.iconFallbackAsset;
  const render = renderImage
    ? `<img class="${monster.render ? '' : 'image-fallback'}" src="${escapeHtml(renderImage)}" alt="${monster.render ? 'Render oficial' : 'Imagem PNG de fallback'} de ${escapeHtml(monster.name)}" />`
    : '<div class="render-pending"><span class="render-mark">◈</span><strong>Imagem do monstro</strong><small>Asset ainda não publicado nas fontes validadas</small></div>';
  const healthLabel = monster.baseHealth != null ? 'Vida base' : rankedHealth?.length ? 'Vida de referência' : 'Vida base';
  const healthValue = monster.baseHealth != null
    ? Number(monster.baseHealth).toLocaleString('pt-BR')
    : rankedHealth?.length
      ? `${rankedHealth[0].health.toLocaleString('pt-BR')} · ${escapeHtml([rankedHealth[0].rank, rankedHealth[0].location].filter(Boolean).join(' · '))}`
      : 'Indisponível';
  const renderStatus = monster.renderSource === 'monster-hunter-fandom-cross-game' ? `Render de outra edição (${escapeHtml(monster.renderVariant || 'Fandom')})` : monster.render ? 'Render oficial/alta resolução disponível' : monster.imageFallback ? 'Imagem PNG do monstro · fallback visual' : monster.iconFallbackAsset ? 'Imagem PNG de fallback compartilhada' : 'Imagem do monstro ainda não publicada';
  const spoilerLocked = spoilerMode && !revealedSpoilerIds.has(monster.id);
  const spoilerBlock = '<div class="spoiler-locked"><strong>Conteúdo protegido pelo modo sem spoilers</strong><small>Recompensas e informações de estratégia ficam ocultas até você revelar.</small><button class="primary-button" id="reveal-spoilers">Revelar informações</button></div>';
  const usefulInfo = spoilerLocked ? spoilerBlock : `<p class="detail-description">${escapeHtml(monster.ecologyPt?.usefulInfo || monster.ecologyPt?.characteristics || 'Informações úteis indisponíveis.')}</p>`;
  const mapDefinition = monster.partMap || partMapAssets[monster.id] || partMapAssets[monster.name] || {};
  const hasValidatedPartMap = Boolean(mapDefinition.image && Array.isArray(mapDefinition.anchors) && mapDefinition.anchors.length);
  const partList = hasValidatedPartMap ? '' : `<ul class="detail-list compact-list">${parts}</ul>`;
  const rewardContent = spoilerLocked ? spoilerBlock : `<ul class="detail-list compact-list">${rewards}</ul>`;
  const sourceCards = provenanceFor(monster).map((source) => `<a class="source-card" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer"><strong>${escapeHtml(sourceLabel(source))}</strong><small>${escapeHtml(source.note || 'Fonte catalogada')}</small></a>`).join('');
  viewRoot.innerHTML = `<button class="ghost-button" id="back-bestiary">← Voltar ao bestiário</button><div class="monster-detail-actions"><button class="ghost-button ${favoriteMonsterIds.has(monster.id) ? 'is-favorite' : ''}" id="toggle-detail-favorite">${favoriteMonsterIds.has(monster.id) ? '★ Favorito' : '☆ Favoritar'}</button><span class="muted-inline">${spoilerMode ? 'Modo sem spoilers ativo' : 'Modo sem spoilers desativado'}</span></div><div class="monster-detail-shell" style="margin-top:16px"><aside class="detail-side detail-left"><section class="detail-card"><h3>Identificação</h3><div class="stat-grid"><div class="stat-box"><small>Espécie</small><strong>${escapeHtml(pt(monster.species))}</strong></div><div class="stat-box"><small>Habitat</small><strong>${escapeHtml(monster.habitat)}</strong></div><div class="stat-box"><small>${healthLabel}</small><strong>${healthValue}</strong></div><div class="stat-box"><small>Fraquezas</small><strong>${weaknesses}</strong></div></div></section><section class="detail-card compact-card"><h3>Descrição</h3><p class="detail-description">${escapeHtml(monster.descriptionPt || 'Descrição indisponível.')}</p></section><section class="detail-card compact-card"><h3>Informações úteis</h3>${usefulInfo}</section></aside><section class="detail-center"><section class="monster-render-panel"><div class="render-heading"><span>${escapeHtml(monster.game)}</span><span>${escapeHtml(monster.threat)}${selectedRank ? ` · ${selectedRank === 'low' ? 'BAIXO' : selectedRank === 'high' ? 'ALTO' : 'MESTRE/G'}` : ''}</span></div><div class="monster-detail-art">${render}</div><h1>${escapeHtml(monster.name)}</h1><p class="render-status">${renderStatus}</p></section><section class="detail-card center-part-map-card"><h3>Mapa de partes, hitzones e limiares</h3>${partMapMarkup(monster)}${partList}</section></section><aside class="detail-side detail-right"><section class="detail-card detail-data-card weakness-detail-card" data-section="weaknesses"><h3>Fraquezas e pontos fracos</h3>${weaknessVisual(monster)}</section><section class="detail-card detail-data-card"><h3>Recompensas e drops${selectedRank ? ` · ${selectedRank === 'low' ? 'Baixo' : selectedRank === 'high' ? 'Alto' : 'Mestre/G'}` : ''}</h3>${rewardContent}</section></aside></div><section class="detail-card provenance-card"><div class="section-heading"><h2>Procedência dos dados</h2><span>Fonte por domínio</span></div><div class="source-grid">${sourceCards || '<span class="muted-inline">Fontes não registradas.</span>'}</div></section><div class="info-banner detail-provenance">A ficha preserva a origem do dado e diferencia render da edição selecionada de render cross-game. Informações ausentes continuam identificadas como indisponíveis.</div>`;
  document.querySelector('#back-bestiary').addEventListener('click', renderBestiary);
  document.querySelector('#toggle-detail-favorite').addEventListener('click', () => { toggleMonsterFavorite(monster.id); renderMonsterDetail(monster, selectedRank); });
  document.querySelector('#reveal-spoilers')?.addEventListener('click', () => { revealedSpoilerIds.add(monster.id); renderMonsterDetail(monster, selectedRank); });
}
function renderOverlaySettings() { viewRoot.innerHTML = `<section class="settings-card"><h2>Overlay e widgets</h2><label class="switch-row"><span><strong>Modo de edição</strong><small>Permite ajustar a janela sobre o jogo</small></span><input id="edit-mode" type="checkbox" checked /></label><label class="switch-row"><span><strong>Clique-pass-through</strong><small>Deixa os cliques atravessarem o overlay</small></span><input id="click-through" type="checkbox" /></label><label class="range-row"><span><strong>Opacidade</strong></span><input id="opacity" type="range" min="25" max="100" value="94" /></label><div class="widget-toggles"><strong>Widgets visíveis</strong><label class="switch-row"><span><strong>Vida do monstro</strong><small>Vida, stamina, partes e anormalidades</small></span><input id="show-monster" type="checkbox" checked /></label><label class="switch-row"><span><strong>Medidor de dano</strong><small>DPS, participação, totais e gráfico</small></span><input id="show-damage" type="checkbox" checked /></label></div><div class="toolbar" style="margin-top:16px"><button data-delta="up" class="ghost-button">↑ Mover</button><button data-delta="down" class="ghost-button">↓ Mover</button><button data-delta="left" class="ghost-button">← Mover</button><button data-delta="right" class="ghost-button">Mover →</button><button data-delta="larger" class="ghost-button">＋ Aumentar</button><button data-delta="smaller" class="ghost-button">− Reduzir</button></div><div class="info-banner">O overlay real só será conectado após um adaptador de jogo validado. Esta tela controla a POC com dados simulados.</div></section>`; wireOverlayControls(); }
function wireOverlayControls() { document.querySelector('#edit-mode').addEventListener('change', (event) => window.hunterOverlay.setEditMode(event.target.checked)); document.querySelector('#click-through').addEventListener('change', (event) => window.hunterOverlay.setClickThrough(event.target.checked)); document.querySelector('#opacity').addEventListener('input', (event) => window.hunterOverlay.setOpacity(Number(event.target.value) / 100)); document.querySelector('#show-monster').addEventListener('change', (event) => window.hunterOverlay.setWidgetVisibility('monster', event.target.checked)); document.querySelector('#show-damage').addEventListener('change', (event) => window.hunterOverlay.setWidgetVisibility('damage', event.target.checked)); document.querySelectorAll('[data-delta]').forEach((button) => button.addEventListener('click', () => window.hunterOverlay.adjustBounds({ up: { y: -20 }, down: { y: 20 }, left: { x: -20 }, right: { x: 20 }, larger: { width: 45, height: 45 }, smaller: { width: -45, height: -45 } }[button.dataset.delta]))); }
function renderSettings() { viewRoot.innerHTML = `<section class="settings-card"><h2>Perfil do caçador</h2><label class="field">Nome do caçador<input class="text-input" id="name-input" value="${escapeHtml(localStorage.getItem('hunterName') || 'NomeCaçador')}" /></label><button id="save-profile" class="primary-button" style="margin-top:14px">Salvar perfil</button><div class="info-banner" style="margin-top:18px">As configurações do software e o perfil ficam locais nesta etapa.</div></section>`; document.querySelector('#save-profile').addEventListener('click', () => { const value = document.querySelector('#name-input').value.trim() || 'NomeCaçador'; localStorage.setItem('hunterName', value); updateProfile(value); }); }
function updateProfile(name) { profileName.textContent = name; headerProfileName.textContent = name; avatarButton.textContent = name.charAt(0).toUpperCase(); }
function renderView(view) { currentView = view; viewTitle.textContent = viewNames[view]; document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === view)); ({ 'online-builds': renderOnlineBuilds, 'saved-builds': renderSavedBuilds, bestiary: renderBestiary, 'overlay-settings': renderOverlaySettings, 'app-settings': renderSettings }[view] || renderOnlineBuilds)(); }

document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => renderView(button.dataset.view)));
avatarButton.addEventListener('click', () => avatarInput.click());
avatarInput.addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { localStorage.setItem('hunterAvatar', reader.result); avatarButton.style.backgroundImage = `url(${reader.result})`; avatarButton.style.backgroundSize = 'cover'; avatarButton.textContent = ''; }; reader.readAsDataURL(file); });
document.querySelector('#profile-header').addEventListener('click', () => renderView('app-settings'));
updateProfile(localStorage.getItem('hunterName') || 'NomeCaçador');
const storedAvatar = localStorage.getItem('hunterAvatar');
if (storedAvatar) { avatarButton.style.backgroundImage = `url(${storedAvatar})`; avatarButton.style.backgroundSize = 'cover'; avatarButton.textContent = ''; }
window.hunterOverlay.onState(({ connectionStatus }) => {
  if (connectionStatus) {
    connectionLabel.innerHTML = `<i></i> ${escapeHtml(connectionStatus.label)}`;
    connectionLabel.title = connectionStatus.reason || 'Estado da integração';
    connectionLabel.dataset.state = connectionStatus.state || 'unknown';
  }
});
renderView(currentView);
