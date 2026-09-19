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
const monsters = monsterCatalog.entries.map((monster) => ({
  ...monster,
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
function monsterCards(list) { return list.length ? list.map((monster) => { const art = monster.icon || monster.iconFallbackAsset ? `<img src="${escapeHtml(monster.icon || monster.iconFallbackAsset)}" alt="${monster.icon ? 'Ícone' : 'Imagem de fallback'} de ${escapeHtml(monster.name)}" loading="lazy" />` : `<span>${monster.iconFallback}</span>`; return `<article class="monster-card" data-monster-id="${escapeHtml(monster.id)}"><div class="monster-art">${art}</div><div class="card-body"><div class="card-title"><strong>${escapeHtml(monster.name)}</strong><span class="tag">${escapeHtml(monster.threat)}</span></div><div class="card-meta"><span>${escapeHtml(monster.threat)}</span><span>${escapeHtml(monster.game.replace('Monster Hunter: ', ''))}</span></div></div></article>`; }).join('') : '<div class="empty-state">Nenhum monstro encontrado para este filtro.</div>'; }
function normalizeSearch(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function materialResults(list, query, rankKey) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return [];
  const results = [];
  for (const monster of list) {
    const rankRewards = rankKey && monster.rankData?.[rankKey]?.rewards?.length ? monster.rankData[rankKey].rewards : monster.rewards || [];
    for (const reward of rankRewards) {
      if (!normalizeSearch(reward.item).includes(normalizedQuery)) continue;
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
  return results.slice(0, 80).map((result) => `<article class="material-result" data-monster-id="${escapeHtml(result.monster.id)}"><div><strong>${escapeHtml(result.item)}</strong><span>${escapeHtml(result.monster.name)} · ${escapeHtml(result.monster.game.replace('Monster Hunter: ', ''))}</span></div><small>${escapeHtml(pt(result.method))}${result.part ? ` · ${escapeHtml(pt(result.part))}` : ''}${result.rank ? ` · ${result.rank === 'low' ? 'Baixo' : result.rank === 'high' ? 'Alto' : 'Mestre/G'}` : ''}${result.chance != null ? ` · ${result.chance}%` : ''}</small></article>`).join('');
}
function renderBestiary() {
  viewRoot.innerHTML = `<div class="toolbar"><label class="field">Jogo${selectHtml('monster-game', ['Todos os jogos', ...games], 'Todos os jogos')}</label><label class="field">Porte${selectHtml('monster-size', ['Todos os portes', 'Grandes', 'Pequenos'], 'Todos os portes')}</label><label class="field">Rank${selectHtml('monster-rank', ['Todos os ranks', 'Baixo', 'Alto', 'Mestre/G'], 'Todos os ranks')}</label><label class="field">Pesquisar monstro<input class="text-input" id="monster-search" placeholder="Nome do monstro" /></label><label class="field">Pesquisar material<input class="text-input" id="material-search" placeholder="Ex.: Rathalos Ruby" /></label></div><div class="info-banner" id="monster-count">Catálogo carregado: World/Iceborne ${monsters.filter((monster) => monster.game === 'Monster Hunter: World').length} · Rise/Sunbreak ${monsters.filter((monster) => monster.game === 'Monster Hunter: Rise').length} · Wilds ${monsters.filter((monster) => monster.game === 'Monster Hunter: Wilds').length} · Generations Ultimate ${monsters.filter((monster) => monster.game === 'Monster Hunter: Generations Ultimate').length}</div><section class="material-search-card"><div class="section-heading"><h2>Busca reversa por material</h2><span>Resultados do catálogo local</span></div><p class="muted-inline">Digite um material para descobrir quais monstros o fornecem e em qual método ou rank.</p><div id="material-results" class="material-results"><div class="empty-state">Digite um material para começar.</div></div></section><div id="monster-grid" class="card-grid">${monsterCards(monsters)}</div>`;
  const applyFilters = () => {
    const game = document.querySelector('#monster-game').value;
    const size = document.querySelector('#monster-size').value;
    const rank = document.querySelector('#monster-rank').value;
    const query = document.querySelector('#monster-search').value.toLowerCase().trim();
    const filtered = monsters.filter((monster) => (game === 'Todos os jogos' || monster.game === game) && (size === 'Todos os portes' || (size === 'Grandes' ? monster.type === 'large' : monster.type === 'small')) && monster.name.toLowerCase().includes(query));
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
  document.querySelector('#material-search').addEventListener('input', applyFilters);
  document.querySelector('#monster-grid').addEventListener('click', (event) => { const card = event.target.closest('[data-monster-id]'); if (card) { const selectedRank = { Baixo: 'low', Alto: 'high', 'Mestre/G': 'master' }[document.querySelector('#monster-rank').value] || null; renderMonsterDetail(monsters.find((monster) => monster.id === card.dataset.monsterId), selectedRank); } });
  document.querySelector('#material-results').addEventListener('click', (event) => { const card = event.target.closest('[data-monster-id]'); if (card) { const selectedRank = { Baixo: 'low', Alto: 'high', 'Mestre/G': 'master' }[document.querySelector('#monster-rank').value] || null; renderMonsterDetail(monsters.find((monster) => monster.id === card.dataset.monsterId), selectedRank); } });
}
function renderMonsterDetail(monster, selectedRank = null) {
  const rankData = selectedRank ? monster.rankData?.[selectedRank] : null;
  const rankedRewards = rankData?.rewards?.length ? rankData.rewards : monster.rewards;
  const rankedHealth = rankData?.healthProfiles?.length ? rankData.healthProfiles : monster.healthProfiles;
  const weaknesses = weaknessSummary(monster);
  const parts = monster.parts?.length
    ? monster.parts.map((part) => `<li><strong>${escapeHtml(pt(part.name))}${part.breakable ? ' · quebra' : ''}</strong><span>${part.health ? `Vida ${part.health}` : part.weakPointStars ? `Corte ${weaknessStars(part.weakPointStars.cut)}` : 'Hitzone disponível'}${part.breakThresholds?.length ? ` · limiar ${part.breakThresholds.join('/')}` : ''}</span></li>`).join('')
    : '<li>Partes/hitzones não publicados pela fonte selecionada.</li>';
  const rewards = rankedRewards?.length
    ? rankedRewards.map((reward) => `<li><strong>${escapeHtml(reward.item)}</strong><span>${(reward.conditions || []).map((condition) => `${pt(condition.type)}${condition.chance != null ? ` ${condition.chance}%` : ''}`).join(', ')}</span></li>`).join('')
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
  viewRoot.innerHTML = `<button class="ghost-button" id="back-bestiary">← Voltar ao bestiário</button><div class="monster-detail-shell" style="margin-top:16px"><aside class="detail-side detail-left"><section class="detail-card"><h3>Identificação</h3><div class="stat-grid"><div class="stat-box"><small>Espécie</small><strong>${escapeHtml(pt(monster.species))}</strong></div><div class="stat-box"><small>Habitat</small><strong>${escapeHtml(monster.habitat)}</strong></div><div class="stat-box"><small>${healthLabel}</small><strong>${healthValue}</strong></div><div class="stat-box"><small>Fraquezas</small><strong>${weaknesses}</strong></div></div></section><section class="detail-card compact-card"><h3>Descrição</h3><p class="detail-description">${escapeHtml(monster.descriptionPt || 'Descrição indisponível.')}</p></section><section class="detail-card compact-card"><h3>Informações úteis</h3><p class="detail-description">${escapeHtml(monster.ecologyPt?.usefulInfo || monster.ecologyPt?.characteristics || 'Informações úteis indisponíveis.')}</p></section></aside><section class="monster-render-panel"><div class="render-heading"><span>${escapeHtml(monster.game)}</span><span>${escapeHtml(monster.threat)}${selectedRank ? ` · ${selectedRank === 'low' ? 'BAIXO' : selectedRank === 'high' ? 'ALTO' : 'MESTRE/G'}` : ''}</span></div><div class="monster-detail-art">${render}</div><h1>${escapeHtml(monster.name)}</h1><p class="render-status">${renderStatus}</p></section><aside class="detail-side detail-right"><section class="detail-card detail-data-card"><h3>Partes, hitzones e limiares</h3><ul class="detail-list compact-list">${parts}</ul></section><section class="detail-card detail-data-card"><h3>Recompensas e drops${selectedRank ? ` · ${selectedRank === 'low' ? 'Baixo' : selectedRank === 'high' ? 'Alto' : 'Mestre/G'}` : ''}</h3><ul class="detail-list compact-list">${rewards}</ul></section><section class="detail-card detail-data-card weakness-detail-card" data-section="weaknesses"><h3>Fraquezas e pontos fracos</h3>${weaknessVisual(monster)}</section></aside></div><div class="info-banner detail-provenance">A ficha prioriza o render do monstro quando disponível. Quando a fonte ainda não publica um render, a imagem PNG de fallback é identificada claramente; vida, recompensas e contexto seguem o rank selecionado quando a fonte publica essa separação.</div>`;
  document.querySelector('#back-bestiary').addEventListener('click', renderBestiary);
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
