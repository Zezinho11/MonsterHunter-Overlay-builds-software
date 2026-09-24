const viewRoot = document.querySelector('#view-root');
const viewTitle = document.querySelector('#view-title');
const profileName = document.querySelector('#profile-name');
const headerProfileName = document.querySelector('#header-profile-name');
const avatarButton = document.querySelector('#avatar-button');
const avatarInput = document.querySelector('#avatar-input');
const connectionLabel = document.querySelector('#connection-label');
const detailHeaderActions = document.querySelector('#detail-header-actions');
let profileState = { authenticated: false, profile: null, mode: 'local' };
let profileReady = false;
let onlineBuildResults = [];
let myPublishedBuildIds = new Set();

const viewNames = { 'online-builds': 'Builds online', 'saved-builds': 'Builds registradas', bestiary: 'Monsterpedia', 'overlay-settings': 'Configurar overlay', 'app-settings': 'Configurações' };
const games = ['Monster Hunter: Wilds', 'Monster Hunter: World', 'Monster Hunter: Rise', 'Monster Hunter: Generations Ultimate'];
const weapons = ['Grande Espada', 'Espada Longa', 'Espada e Escudo', 'Lâminas Duplas', 'Martelo', 'Berrante de Caça', 'Lança', 'Lançarma', 'Transmachado', 'Lâmina Energizada', 'Glaive Inseto', 'Arco', 'Balestra Leve', 'Balestra Pesada'];
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
const locationTerms = {
  'ancient forest': 'Floresta Antiga', 'wildspire waste': 'Ermo Selvático', 'coral highlands': 'Planalto Coralino',
  'rotten vale': 'Vale Putrefato', "elder's recess": 'Recesso dos Anciões', 'hoarfrost reach': 'Fronteira Glacial',
  'guiding lands': 'Terras dos Guiadores', 'arena': 'Arena', 'caverns of el dorado': 'Cavernas de El Dorado',
  'everstream': 'Corrente Eterna', 'castle schrade': 'Castelo Schrade', 'volcanic hollow': 'Cavidade Vulcânica',
  'frost islands': 'Ilhas Gélidas', 'flooded forest': 'Floresta Alagada', 'sandy plains': 'Planícies Arenosas',
  'shrine ruins': 'Ruínas do Santuário', 'lava caverns': 'Cavernas de Lava', 'jungle': 'Selva', 'citadel': 'Cidadela', 'the infernal springs': 'Fontes Infernais',
  'windward plains': 'Planícies Zéfiras', 'scarlet forest': 'Floresta Escarlate', 'oilwell basin': 'Bacia Oleídea',
  'windsong village': 'Vila de Kamura', 'ruins of wyveria': 'Ruínas de Wyveria', 'serperian ruins': 'Ruínas de Serperia',
  'iceshard cliffs': 'Escarpas Frígidas', 'forbidden lands': 'Terras Proibidas'
};
function ptLocation(value) {
  const raw = String(value || '').trim();
  return locationTerms[raw.toLowerCase()] || pt(raw);
}
function ptLocationList(values = [], separator = ' · ') {
  return values.map((value) => ptLocation(value)).join(separator) || 'Indisponível';
}

const dataLabelTerms = {
  body: 'corpo', head: 'cabeça', forelegs: 'patas dianteiras', foreleg: 'pata dianteira', forearms: 'antebraços', hindlegs: 'patas traseiras', hindleg: 'pata traseira', legs: 'patas', leg: 'pata', lower: 'inferior', upper: 'superior', lowerbody: 'parte inferior', chest: 'peito', neck: 'pescoço', back: 'costas', tail: 'cauda', 'tail tip': 'ponta da cauda', horn: 'chifre', horns: 'chifres', wing: 'asa', wings: 'asas', arm: 'braço', arms: 'braços', jaw: 'mandíbula', tongue: 'língua', stomach: 'estômago', scalp: 'couro cabeludo', rock: 'rocha', shell: 'carapaça', hide: 'couro', scale: 'escama', scales: 'escamas', claw: 'garra', claws: 'garras', fang: 'presa', fangs: 'presas', bone: 'osso', bones: 'ossos', wing: 'asa', webbing: 'membrana', talon: 'garra', mane: 'juba', sac: 'bolsa', fluid: 'fluido', essence: 'essência', carapace: 'carapaça', thickhide: 'couro espesso', hardclaw: 'garra resistente', hardfang: 'presa resistente', hardhorn: 'chifre resistente', hardbone: 'osso resistente', shard: 'fragmento', fragment: 'fragmento', cortex: 'córtex', plate: 'placa', mantle: 'manto', ruby: 'rubi', gem: 'gema', jewel: 'joia', blood: 'sangue', tear: 'lágrima', pelt: 'pele', fur: 'pelo', feather: 'pena', feathers: 'penas', membrane: 'membrana', webbing: 'membrana', web: 'membrana', talon: 'garra', beak: 'bico', fin: 'barbatana', fins: 'barbatanas', sting: 'ferrão', stinger: 'ferrão', antennae: 'antenas', antenna: 'antena', mud: 'lama', wounded: 'ferido', broken: 'quebrado', enraged: 'enfurecido', heated: 'aquecido', white: 'branco', black: 'negro', 'gloss black': 'preto brilhante', electricity: 'eletricidade', 'magma armor': 'armadura de magma', 'critical state': 'estado crítico', 'before wounded': 'antes de ferir', 'after wounded': 'depois de ferir', 'raw meat': 'carne crua', potion: 'poção', 'monster fluid': 'fluido de monstro', 'monster essence': 'essência de monstro', 'monster bone': 'osso de monstro', 'iron ore': 'minério de ferro', 'machalite ore': 'minério de machalita', 'dragonite ore': 'minério de dragonita', 'wyvern tear': 'lágrima de wyvern', 'large wyvern tear': 'lágrima grande de wyvern', 'nulberry': 'nobora', 'first-aid med': 'medicamento de primeiros socorros', 'ancient potion': 'poção antiga', 'mega potion': 'mega poção'
};
const partExactTerms = {
  'no data': 'Sem dados', 'left arm': 'Braço esquerdo', 'right arm': 'Braço direito',
  'left leg': 'Pata esquerda', 'right leg': 'Pata direita', 'left claw': 'Garra esquerda', 'right claw': 'Garra direita',
  'front legs': 'Patas dianteiras', 'front leg': 'Pata dianteira', 'hind legs': 'Patas traseiras', 'hind leg': 'Pata traseira',
  'forelegs': 'Patas dianteiras', 'foreleg': 'Pata dianteira', 'hindlegs': 'Patas traseiras', 'hindleg': 'Pata traseira',
  'forefeet': 'Patas dianteiras', 'hindfeet': 'Patas traseiras', 'wing arms': 'Braços das asas', 'wingarm': 'Braço da asa',
  'wingarms': 'Braços das asas', 'wing claws': 'Garras das asas', 'wing legs': 'Patas das asas', 'wing tips': 'Pontas das asas',
  'front part of wings': 'Parte dianteira das asas', 'back membrane': 'Membrana das costas', 'tail base': 'Base da cauda',
  'tail end': 'Extremidade da cauda', 'tail main part': 'Parte principal da cauda', 'lower tail': 'Parte inferior da cauda',
  'upper head': 'Parte superior da cabeça', 'upper neck': 'Parte superior do pescoço', 'lower neck': 'Parte inferior do pescoço',
  'rock head casing (bottom)': 'Cobertura rochosa da cabeça (inferior)', 'rock head casing (face)': 'Cobertura rochosa da cabeça (face)',
  'rock head casing (top)': 'Cobertura rochosa da cabeça (superior)', 'rear power unit': 'Unidade de força traseira',
  'big ice plate (open)': 'Grande placa de gelo (aberta)', 'rump ice plate': 'Placa de gelo da garupa', 'tail ice plate': 'Placa de gelo da cauda'
};
const materialExactTerms = {
  'rathalos scale': 'Escama de Rathalos', 'rathalos scale+': 'Escama de Rathalos+',
  'rathalos shell': 'Carapaça de Rathalos', 'rathalos shell+': 'Carapaça de Rathalos+',
  'rathalos webbing': 'Membrana de Rathalos', 'rathalos tail': 'Cauda de Rathalos',
  'rathalos wing': 'Asa de Rathalos', 'rathalos plate': 'Placa de Rathalos',
  'rathalos ruby': 'Rubi de Rathalos', 'rathalos mantle': 'Manto de Rathalos',
  'rathalos cortex': 'Córtex de Rathalos', 'rathalos shard': 'Fragmento de Rathalos',
  'rathalos fellwing': 'Asa Descarnada de Rathalos', 'rathalos lash': 'Açoite de Rathalos',
  'rath marrow': 'Medula de Rath', 'rath medulla': 'Medula de Rath', 'flame sac': 'Bolsa de Chama',
  'large wyvern tear': 'Lágrima Grande de Wyvern', 'wyvern tear': 'Lágrima de Wyvern',
  'immortal dragonscale': 'Escama de Dragão Imortal', 'nergigante carapace': 'Carapaça de Nergigante',
  'nergigante talon': 'Garra de Nergigante', 'nergigante regrowth plate': 'Placa de Regeneração de Nergigante',
  'eternal regrowth plate': 'Placa de Regeneração Eterna', 'nergigante horn+': 'Chifre de Nergigante+',
  'nergigante gem': 'Gema de Nergigante', 'nergigante tail': 'Cauda de Nergigante',
  'nergigante cortex': 'Córtex de Nergigante', 'nergigante hardclaw': 'Garra Resistente de Nergigante',
  'nergigante fellwing': 'Asa Descarnada de Nergigante', 'annihilating greathorn': 'Grande Chifre Aniquilador',
  'escama rathalos': 'Escama de Rathalos', 'casco rathalos': 'Carapaça de Rathalos',
  'memb. rathalos': 'Membrana de Rathalos', 'glân. de chama': 'Bolsa de Chama',
  'tutano rath': 'Medula de Rath', 'medula rath': 'Medula de Rath', 'rubi de rathalos': 'Rubi de Rathalos'
};
const materialSuffixTerms = {
  scale: 'escama', shell: 'carapaça', webbing: 'membrana', tail: 'cauda', wing: 'asa',
  fang: 'presa', fangs: 'presas', claw: 'garra', claws: 'garras', hide: 'couro', fur: 'pelo',
  pelt: 'pele', plate: 'placa', ruby: 'rubi', gem: 'gema', mantle: 'manto', cortex: 'córtex',
  shard: 'fragmento', marrow: 'medula', medulla: 'medula', sac: 'bolsa', beak: 'bico',
  horn: 'chifre', horns: 'chifres', feather: 'pena', feathers: 'penas', talon: 'garra',
  talons: 'garras', blood: 'sangue', tear: 'lágrima', bone: 'osso', hardbone: 'osso resistente',
  hardclaw: 'garra resistente', hardfang: 'presa resistente', hardhorn: 'chifre resistente'
};
function translateDataLabel(value) {
  let result = String(value || '');
  const phrases = Object.keys(dataLabelTerms).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) result = result.replace(new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi'), dataLabelTerms[phrase]);
  return result;
}
function canonicalMaterial(value) {
  const raw = String(value || '').trim();
  const exact = materialExactTerms[raw.toLowerCase()];
  if (exact) return exact;
  const suffix = Object.keys(materialSuffixTerms).sort((a, b) => b.length - a.length)
    .find((term) => new RegExp(`(?:^|\\s)${term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(?:\\+)?$`, 'i').test(raw));
  if (!suffix) return translateDataLabel(raw).replace(/\\bNO DATA\\b/gi, 'Sem dados');
  const prefix = raw.replace(new RegExp(`\\s*${suffix}(?:\\+)?$`, 'i'), '').trim();
  const plus = /\\+$/.test(raw) ? '+' : '';
  const translated = materialSuffixTerms[suffix];
  return prefix ? `${translated} de ${prefix}${plus}` : `${translated}${plus}`;
}
function ptMaterial(value, monster = null) {
  const raw = String(value || '').trim();
  const sourceTranslation = monster?.itemTranslations?.[raw];
  return canonicalMaterial(sourceTranslation || raw);
}
function ptPart(value, monster = null) {
  const raw = String(value || '').trim();
  if (!raw) return 'Indisponível';
  const bodyPart = raw.match(/^BodyPart\s+(\d+)$/i);
  if (bodyPart && monster?.parts?.[Number(bodyPart[1]) - 1]?.name) return ptPart(monster.parts[Number(bodyPart[1]) - 1].name, monster);
  const exact = partExactTerms[raw.toLowerCase()];
  return exact || translateDataLabel(raw).replace(/\bNO DATA\b/gi, 'Sem dados');
}

const iconPaths = {
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 10c0 4 16 4 16 0M4 15c0 4 16 4 16 0"/>',
  scale: '<path d="M12 2C7 4 3 8 4 15c1 7 15 9 16 0 1-7-3-11-8-13Z"/><path d="M12 5c-7 5-7 12 0 13 7-1 7-8 0-13Z"/>',
  shell: '<path d="m4 20-1-8 5-6 4-4 4 4 5 6-1 8Z"/><path d="m3 12 9 3 9-3M8 6l4 9 4-9"/>',
  wing: '<path d="M3 21 5 7l16-4-5 5 4 1-6 3 3 2-7 2-7 5Z"/><path d="m5 7 5 9m-5-5 12-5"/>',
  tail: '<path d="M4 3c7 2 3 12 8 14 4 2 6-3 8-4-1 8-5 9-9 8C2 19 7 9 4 3Z"/>',
  gem: '<path d="m4 8 4-5h8l4 5-8 14L4 8Zm0 0h16M8 3l4 19 4-19"/>',
  compass: '<circle cx="12" cy="12" r="8"/><path d="m15 9-2.5 5L7 16l2.5-5L15 9Z"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>',
  material: '<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z"/><path d="M8 9v9m8-9v9"/>',
  game: '<path d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.2 4a2.4 2.4 0 0 1-4.3.6L14 16h-4l-1.3 1.8a2.4 2.4 0 0 1-4.3-.6l-1.2-4A4 4 0 0 1 7 8Z"/><path d="M7 11v4m-2-2h4m8-1h.01m2 2h.01"/>',
  rank: '<path d="m12 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 3Z"/>',
  size: '<path d="M4 19 19 4m-9 0h9v9M20 20h-9v-9"/>',
  favorite: '<path d="m12 4 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 4Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  fire: '<path d="M12 2c1 4-2 5-2 8 0 1.8 1.1 3 2.5 3 1.2 0 2.1-.8 2.3-2.1 1.3 1.2 2.2 2.7 2.2 4.5A5 5 0 0 1 12 20a5 5 0 0 1-5-5c0-3.5 2.8-5.7 5-8.3C12.4 5.6 12.4 3.8 12 2Z"/>',
  water: '<path d="M12 2S5 9.2 5 13.3a7 7 0 0 0 14 0C19 9.2 12 2 12 2Z"/>',
  thunder: '<path d="m14 2-8 11h6l-1 9 8-12h-6l1-8Z"/>',
  ice: '<path d="M12 2v20M4.1 6.5l15.8 11M4.1 17.5l15.8-11M2 12h20"/><circle cx="12" cy="12" r="2"/>',
  dragon: '<path d="M4 16c3-7 8-9 16-8-2 2-3 4-3 7-3-1-5 0-7 3-1-2-3-2-6-2Z"/><path d="M7 16 4 21m9-4 2 4"/>',
  poison: '<path d="M9 3h6m-5 0v4L5 17a3 3 0 0 0 2.6 4h8.8A3 3 0 0 0 19 17l-5-10V3"/><path d="M8 16h8"/>',
  paralysis: '<path d="m14 2-5 8h4l-3 12 7-10h-4l1-10Z"/>',
  sleep: '<path d="M5 18h14M7 15h4l-4-5h4M14 9h4l-4-5h4"/>',
  blast: '<path d="m13 2-2 7 4-1-2 6 5-2-6 8 1-7-4 1 2-6-4 2 6-8Z"/>',
  stun: '<circle cx="12" cy="12" r="8"/><path d="m12 7-2 5h3l-1 5 3-6h-3l1-4Z"/>',
  noise: '<path d="M4 10v4h3l4 3V7l-4 3H4Zm11-1c2 1 2 5 0 6m2-9c4 3 4 7 0 10"/>',
  flash: '<path d="M13 2 4 13h6l-1 9 9-12h-6l1-8Z"/>',
  exhaust: '<path d="M5 18c3-3 5 3 8 0s5 3 6 0M5 12c3-3 5 3 8 0s5 3 6 0M5 6c3-3 5 3 8 0s5 3 6 0"/>',
  cut: '<path d="m5 5 14 14M19 5 5 19"/><path d="M7 7 4 4m13 13 3 3"/>',
  blunt: '<path d="M8 4h8v5H8zM10 9v11m4-11v11M7 20h10"/>',
  ammo: '<path d="M8 3h8v5l-1 2v8a3 3 0 0 1-6 0v-8L8 8V3Z"/><path d="M8 6h8"/>',
  weapon: '<path d="m5 19 11-11m-5-5 10 10M4 4l5 5m7 7 4 4M3 7l4-4m10 17 4-4"/>',
  helmet: '<path d="M4 15a8 8 0 0 1 16 0v3H4v-3Z"/><path d="M4 14h12l4 4M8 10l2-2m4 2 2 2"/>',
  'chest-armor': '<path d="m8 3 4 2 4-2 4 3-2 6v9H6v-9L4 6l4-3Z"/><path d="M8 3v5l4 3 4-3V3M12 11v10"/>',
  'arms-armor': '<path d="m7 4 4 2-2 5-3 1-2 7-3-1 2-9 4-5Zm10 0-4 2 2 5 3 1 2 7 3-1-2-9-4-5Z"/><path d="m7 12 3 1m7-1-3 1"/>',
  'waist-armor': '<path d="M5 5h14l-1 5H6L5 5Zm1 5-2 11h16l-2-11M10 10v11m4-11v11"/><path d="M10 7h4v2h-4z"/>',
  'leg-armor': '<path d="m6 3 12 0 1 9-2 9h-5l-1-8-1 8H5l-1-9 2-9Z"/><path d="M6 8h12M7 12h4m2 0h4"/>',
  talisman: '<path d="M12 3 20 8v8l-8 5-8-5V8l8-5Z"/><circle cx="12" cy="12" r="3"/>',
  decoration: '<path d="m12 2 2.8 6.2L21 11l-6.2 2.8L12 20l-2.8-6.2L3 11l6.2-2.8L12 2Z"/><circle cx="12" cy="11" r="2"/>'
};
const iconAssetFiles = { fire: 'fire.png', water: 'water.png', thunder: 'thunder.png', ice: 'ice.png', dragon: 'dragon.png', poison: 'poison.png', paralysis: 'paralysis.png', sleep: 'sleep.png', blast: 'blast.png', stun: 'stun.png', exhaust: 'fatigue.png' };
function mhIcon(name, label = '') {
  const key = String(name || '').toLowerCase();
  const asset = iconAssetFiles[key];
  const visual = asset
    ? `<img class="mh-icon mh-icon-${escapeHtml(key)}" src="assets/ui-icons/${asset}" alt="" aria-hidden="true" draggable="false" />`
    : `<svg class="mh-icon mh-icon-${escapeHtml(key)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${iconPaths[key] || '<circle cx="12" cy="12" r="7"/>'}</svg>`;
  return `${visual}${label ? `<span class="sr-only">${escapeHtml(label)}</span>` : ''}`;
}
document.addEventListener('error', (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.classList.contains('build-equipment-source-icon')) return;
  if (image.dataset.fallbackSrc && image.dataset.fallbackUsed !== 'true') {
    image.dataset.fallbackUsed = 'true';
    image.alt = `Ícone de categoria para ${image.dataset.itemLabel || 'equipamento'}`;
    image.src = image.dataset.fallbackSrc;
    return;
  }
  const fallback = document.createElement('span');
  fallback.className = 'build-equipment-fallback';
  fallback.setAttribute('aria-label', `Imagem indisponível: ${image.alt.replace(/^Ícone de /, '')}`);
  fallback.innerHTML = mhIcon(image.dataset.iconKind || 'weapon');
  image.replaceWith(fallback);
}, true);
function weaknessIcon(element) { return mhIcon(element); }
const resistanceIcons = { noise: 'noise', flash: 'flash', exhaust: 'exhaust', poison: 'poison', sleep: 'sleep', paralysis: 'paralysis', fire: 'fire', water: 'water', thunder: 'thunder', ice: 'ice', dragon: 'dragon', fireblight: 'fire', waterblight: 'water', thunderblight: 'thunder', iceblight: 'ice', dragonblight: 'dragon' };
const resistanceLabels = { noise: 'Ruído', flash: 'Flash', exhaust: 'Exaustão', poison: 'Veneno', sleep: 'Sono', paralysis: 'Paralisia', fire: 'Fogo', water: 'Água', thunder: 'Trovão', ice: 'Gelo', dragon: 'Dragão' };
function resistanceValue(resistance) { return resistance?.element || resistance?.effect || resistance?.status || ''; }
function resistanceIcon(resistance) { return mhIcon(resistanceIcons[String(resistanceValue(resistance)).toLowerCase()] || 'unknown'); }
function resistanceLabel(resistance) { const value = String(resistanceValue(resistance)).toLowerCase(); return resistanceLabels[value] || pt(value); }
function weaknessLevel(level) {
  const count = Math.max(0, Math.min(3, Number(level) || 0));
  return count;
}
function weaknessStars(level) {
  const count = weaknessLevel(level);
  return `<span class="weakness-stars weakness-level-${count}" aria-label="${count} de 3 estrelas">${'★'.repeat(count)}<span class="star-empty">${'☆'.repeat(3 - count)}</span></span>`;
}
function weaknessSummary(monster) {
  return monster.weaknesses?.map((weakness) => {
    const level = weaknessLevel(weakness.level);
    return `${escapeHtml(pt(weakness.element))} <span class="weakness-summary-level weakness-level-${level}">(${level})</span>`;
  }).join(' · ') || 'Indisponível';
}
function crownSummary(monster) {
  const crowns = monster.crownData?.crowns || {};
  const labels = { small: 'Mini', silver: 'Prata', large: 'Ouro' };
  const entries = Object.entries(labels).filter(([key]) => crowns[key]);
  if (!entries.length) return '<span class="crown-unavailable">Indisponível na fonte catalogada</span>';
  const note = monster.crownData?.method || 'Limiar publicado pela fonte';
  return `<div class="crown-summary">${entries.map(([key, label]) => {
    const crown = crowns[key];
    const value = Number(crown.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `<span class="crown-summary-row"><span>${label}</span><strong>${crown.operator === '<=' ? '≤' : '≥'} ${value} cm</strong></span>`;
  }).join('')}</div><small class="crown-source-note">${escapeHtml(note)}</small>`;
}
function weaknessVisual(monster) {
  const weaknesses = monster.weaknesses || [];
  const badges = weaknesses.length
    ? weaknesses.map((weakness) => `<span class="weakness-badge"><span class="weakness-icon weakness-${escapeHtml(String(weakness.element).toLowerCase())}">${weaknessIcon(weakness.element)}</span><span><strong>${weaknessStars(weakness.level)}</strong><small>${escapeHtml(pt(weakness.element))}</small></span></span>`).join('')
    : '<span class="muted-inline">Indisponível</span>';
  const resistances = (monster.resistances || []).filter((resistance) => resistanceValue(resistance));
  const resistanceBadges = resistances.length
    ? resistances.map((resistance) => `<span class="weakness-badge resistance-badge"><span class="weakness-icon">${resistanceIcon(resistance)}</span><span><strong>${escapeHtml(resistanceLabel(resistance))}</strong>${resistance.condition ? `<small>${escapeHtml(pt(resistance.condition))}</small>` : `<small>${resistance.kind === 'effect' ? 'efeito' : resistance.kind === 'status' ? 'status' : 'resistência'}</small>`}</span></span>`).join('')
    : '<span class="muted-inline">Indisponível</span>';
  const parts = (monster.parts || []).filter((part) => part.weakPointStars).slice(0, 8);
  const table = parts.length ? `<div class="weakness-table"><div class="weakness-table-head">Parte</div><div class="weakness-table-head">${mhIcon('cut', 'Corte')}<span>Corte</span></div><div class="weakness-table-head">${mhIcon('blunt', 'Impacto')}<span>Impacto</span></div><div class="weakness-table-head">${mhIcon('ammo', 'Munição')}<span>Munição</span></div>${parts.map((part) => `<div class="weakness-part-name">${escapeHtml(ptPart(part.name, monster))}${part.breakable ? ' <em>· quebra</em>' : ''}</div><div>${weaknessStars(part.weakPointStars.cut)}</div><div>${weaknessStars(part.weakPointStars.blunt)}</div><div>${weaknessStars(part.weakPointStars.ammo)}</div>`).join('')}</div>` : '';
  return `<div class="weakness-elements">${badges}</div>${table}<small class="weakness-note">Estrelas indicam a classificação do ponto fraco publicada pela fonte; valores numéricos de hitzone aparecem separadamente quando disponíveis.</small><div class="weakness-divider" aria-hidden="true"></div><section class="resistance-section"><h4>Resistências</h4><div class="resistance-elements">${resistanceBadges}</div></section>`;
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
function catalogSyncLabel() {
  if (!monsterCatalog.generatedAt) return 'sincronização indisponível';
  const date = new Date(monsterCatalog.generatedAt);
  return Number.isNaN(date.getTime()) ? 'sincronização indisponível' : `sincronizado em ${new Intl.DateTimeFormat('pt-BR').format(date)}`;
}
const monsters = monsterCatalog.entries.map((monster) => ({
  ...monster,
  gameKey: monster.game,
  game: monsterGameNames[monster.game] || monster.game,
  iconFallback: monster.type === 'large' ? '🐉' : '🐾',
  threat: pt(monster.type),
  weakness: monster.weaknesses?.slice(0, 4).map((weakness) => `${pt(weakness.element)}${weakness.level ? ` · ${weakness.level}` : ''}`).join(' / ') || 'Indisponível',
  habitat: ptLocationList(monster.locationsPt?.length ? monster.locationsPt : monster.locations),
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
function cardGrid(cards, saved = false, online = false) { return `<div class="card-grid ${saved ? 'saved-build-grid' : ''}">${cards.map((card) => `<article class="build-card ${saved ? 'saved-build-card' : ''}" ${saved ? `data-saved-build-id="${escapeHtml(card.id)}" role="button" tabindex="0" aria-label="Abrir build ${escapeHtml(card.title)}"` : ''}><div class="card-art">${card.icon}</div><div class="card-body"><div class="card-title"><strong>${escapeHtml(card.title)}</strong><span class="tag">${escapeHtml(card.type)}</span></div><div class="card-meta"><span>${escapeHtml(card.weapon)}</span><span>${saved ? escapeHtml(card.game.replace('Monster Hunter: ', '')) : 'Atualizada hoje'}</span></div><div class="card-source">${online ? `Build pública · ${escapeHtml(card.source)} · Abrir ficha` : saved ? 'Build salva localmente · Abrir ficha' : `Fonte: ${escapeHtml(card.source)}`}</div></div></article>`).join('')}</div>`; }

function renderOnlineBuilds() {
  const weaponOptions = ['Todos os tipos', ...weapons];
  viewRoot.innerHTML = `<div class="toolbar"><label class="field">Jogo${selectHtml('build-game', ['Todos os jogos', ...games], 'Todos os jogos')}</label><label class="field">Arma${selectHtml('build-weapon', weaponOptions, 'Todos os tipos')}</label><label class="field">Tipo${selectHtml('build-type', ['Todos os tipos', 'DPS', 'ELEMENTAL', 'STATUS', 'CONFORTO', 'SUPORTE', 'PROGRESSÃO'])}</label><label class="field">Buscar na galeria<input class="text-input" id="build-query" placeholder="Nome da build, arma ou equipamento" /></label><button class="primary-button" id="search-builds">Buscar builds</button></div><div id="builds-info" class="info-banner">As builds publicadas aparecem em cartões e abrem uma ficha completa dentro do aplicativo. A busca editorial só pode exibir conteúdo integrado quando a fonte autorizar uma API ou exportação pública.</div><section class="build-sources-panel"><div class="section-heading"><h2>Fontes editoriais</h2><span>CONSULTA EXTERNA · NÃO INTEGRADA</span></div><div id="online-build-sources" class="build-source-links"></div></section><div id="online-build-grid" class="online-build-empty"><div class="empty-state">Use Buscar builds para consultar a galeria. As builds encontradas aparecem aqui e podem ser abertas sem sair do sistema.</div></div>`;
  let fetchedRows = [];
  const renderSources = () => {
    const game = document.querySelector('#build-game').value;
    const weapon = document.querySelector('#build-weapon').value;
    const type = document.querySelector('#build-type').value;
    const query = [game === 'Todos os jogos' ? 'Monster Hunter' : game.replace('Monster Hunter: ', ''), weapon === 'Todos os tipos' ? '' : weapon, type === 'Todos os tipos' ? 'build' : type.toLowerCase()].filter(Boolean).join(' ');
    const sources = [
      ['Game8', `https://www.google.com/search?q=${encodeURIComponent(`site:game8.co/games/Monster-Hunter-${game.includes('Wilds') ? 'Wilds' : game.includes('Rise') ? 'Rise' : game.includes('World') ? 'World' : 'Generations-Ultimate'} ${query}`)}`],
      ['Icy Veins', `https://www.google.com/search?q=${encodeURIComponent(`site:icy-veins.com ${query}`)}`],
      ['Mobalytics', `https://www.google.com/search?q=${encodeURIComponent(`site:mobalytics.gg ${query}`)}`],
      ['MH Wilds Hub', `https://www.google.com/search?q=${encodeURIComponent(`site:mhwildshub.com ${query}`)}`],
    ];
    document.querySelector('#online-build-sources').innerHTML = sources.map(([name, url]) => `<a class="build-source-link" href="${url}" target="_blank" rel="noreferrer">Pesquisar ${escapeHtml(query)} em ${name} ↗</a>`).join('');
  };
  const showResults = (rows) => {
    onlineBuildResults = rows;
    const grid = document.querySelector('#online-build-grid');
    const query = normalizeSearch(document.querySelector('#build-query').value);
    const visibleRows = rows.filter((row) => !query || normalizeSearch([row.title, row.weapon_type, row.build_type, row.game, row.author_name, JSON.stringify(row.payload || {})].join(' ')).includes(query));
    if (!visibleRows.length) { grid.className = 'online-build-empty'; grid.innerHTML = `<div class="empty-state">${rows.length ? 'Nenhuma build carregada corresponde a essa busca.' : 'Nenhuma build pública corresponde aos filtros. Seja o primeiro a compartilhar uma.'}</div>`; return; }
    grid.className = '';
    onlineBuildResults = visibleRows;
    grid.innerHTML = cardGrid(visibleRows.map((row) => ({ id: row.id, title: row.title, type: row.build_type, weapon: row.weapon_type, game: row.game, icon: '⚔️', source: row.author_name || 'Caçador da comunidade' })), true, true);
    grid.querySelectorAll('[data-saved-build-id]').forEach((card, index) => { card.dataset.onlineBuildIndex = String(index); card.setAttribute('aria-label', `Abrir build pública ${escapeHtml(visibleRows[index].title)}`); });
    grid.querySelectorAll('[data-saved-build-id]').forEach((card) => card.removeAttribute('data-saved-build-id'));
    grid.querySelectorAll('.build-card').forEach((card) => { card.setAttribute('role', 'button'); card.setAttribute('tabindex', '0'); });
    grid.onclick = (event) => { const card = event.target.closest('[data-online-build-index]'); if (card) renderOnlineBuildDetail(Number(card.dataset.onlineBuildIndex)); };
    grid.onkeydown = (event) => { if (event.key !== 'Enter' && event.key !== ' ') return; const card = event.target.closest('[data-online-build-index]'); if (card) { event.preventDefault(); renderOnlineBuildDetail(Number(card.dataset.onlineBuildIndex)); } };
  };
  const search = async () => {
    const button = document.querySelector('#search-builds');
    const info = document.querySelector('#builds-info');
    button.disabled = true; button.textContent = 'Buscando…';
    try {
      const game = document.querySelector('#build-game').value;
      const weaponType = document.querySelector('#build-weapon').value;
      const buildType = document.querySelector('#build-type').value;
      fetchedRows = await window.hunterOverlay.onlineBuilds.search({ game: game === 'Todos os jogos' ? '' : game, weaponType: weaponType === 'Todos os tipos' ? '' : weaponType, buildType: buildType === 'Todos os tipos' ? '' : buildType });
      showResults(fetchedRows);
      info.textContent = `${fetchedRows.length} build(s) pública(s) · resultados da API comunitária Hunter Companion.`;
    } catch (error) {
      showResults([]);
      info.textContent = `Não foi possível consultar a galeria: ${error?.message || 'verifique a conexão e a configuração do Supabase.'} A busca editorial por links continua disponível abaixo.`;
    } finally { button.disabled = false; button.textContent = 'Buscar builds'; }
  };
  ['#build-game', '#build-weapon', '#build-type'].forEach((selector) => document.querySelector(selector).addEventListener('change', renderSources));
  document.querySelector('#search-builds').addEventListener('click', search);
  document.querySelector('#build-query').addEventListener('keydown', (event) => { if (event.key === 'Enter') search(); });
  document.querySelector('#build-query').addEventListener('input', () => { if (fetchedRows.length) showResults(fetchedRows); });
  renderSources();
}

function renderOnlineBuildDetail(index) {
  const row = onlineBuildResults[index];
  if (!row?.payload) return renderOnlineBuilds();
  const build = window.localBuildStore.normalizeBuild(row.payload);
  const gameKey = equipmentCatalog.gameKey(build.game);
  const weapon = equipmentCatalog.findWeapon(gameKey, build.weaponId) || equipmentCatalog.weapons(gameKey).find((item) => normalizeSearch(item.displayName || item.name) === normalizeSearch(build.weapon));
  const slots = [['head', 'Capacete', 'helmet'], ['chest', 'Peitoral', 'chest-armor'], ['arms', 'Braçadeiras', 'arms-armor'], ['waist', 'Cintura', 'waist-armor'], ['legs', 'Grevas', 'leg-armor']];
  const recipe = (record) => {
    const materials = record?.craftingMaterials || [];
    if (!materials.length && record?.craftingCost == null) return '<small class="build-crafting-missing">Receita não publicada pela fonte.</small>';
    const rows = materials.map((item) => `<li>${escapeHtml(item.name || 'Material indisponível')} <b>×${escapeHtml(item.quantity ?? 1)}</b></li>`).join('');
    return `<div class="online-crafting"><small>Materiais para criação</small>${rows ? `<ul>${rows}</ul>` : '<small>Sem materiais publicados.</small>'}${record.craftingCost != null ? `<small>Custo: ${escapeHtml(record.craftingCost)} zenny</small>` : ''}</div>`;
  };
  const cards = [weapon && `<article class="build-equipment-card online-equipment-card"><div class="build-equipment-icon">${equipmentImage(weapon, 'weapon', weapon.displayName || weapon.name, gameKey)}</div><div class="build-equipment-copy"><small>Arma · ${escapeHtml(weapon.classPt || row.weapon_type)}</small><strong>${escapeHtml(weapon.displayName || weapon.name)}</strong><div class="build-detail-skills">${(weapon.skills || []).map((skill) => `<span>${escapeHtml(skill.name)}${skill.level ? ` +${escapeHtml(skill.level)}` : ''}</span>`).join('')}</div>${recipe(weapon)}</div></article>`, ...slots.map(([slot, label, icon]) => { const record = equipmentCatalog.findArmor(gameKey, build.armorIds?.[slot]); const name = record?.displayName || record?.name || build.armor?.[slot]; if (!name) return ''; return `<article class="build-equipment-card online-equipment-card"><div class="build-equipment-icon">${equipmentImage(record, icon, name, gameKey)}</div><div class="build-equipment-copy"><small>${label}</small><strong>${escapeHtml(name)}</strong><div class="build-detail-skills">${(record?.skills || build.armorSkills?.[slot] || []).map((skill) => `<span>${escapeHtml(skill.name)}${skill.level ? ` +${escapeHtml(skill.level)}` : ''}</span>`).join('')}</div>${recipe(record)}</div></article>`; })];
  const socketedNames = new Set(Object.values(build.decorationSlots || {}).flat().map((entry) => entry.name));
  const deco = [...(build.decorations || []).filter((item) => !socketedNames.has(item)).map((item) => `Decoração não posicionada: ${item}`), ...(build.skills || [])];
  const decorationCards = Object.entries(build.decorationSlots || {}).flatMap(([part, entries]) => (entries || []).map((entry) => {
    const jewel = equipmentCatalog.findDecoration(gameKey, entry.id);
    const partName = part === 'weapon' ? 'Arma' : part === 'talisman' ? 'Talismã' : equipmentCatalog.slotLabels[part] || part;
    return `<span class="build-decoration-chip" title="${escapeHtml(jewel?.name || entry.name)} · nível ${escapeHtml(jewel?.slot || entry.requiredSlot || '?')}">${decorationIconMarkup(gameKey, jewel, jewel?.name || entry.name)}${escapeHtml(jewel?.name || entry.name)} <small>· ${escapeHtml(partName)}${entry.slotIndex == null ? '' : ` · espaço ${entry.slotIndex + 1}`}</small></span>`;
  }));
  const charm = equipmentCatalog.findCharm(gameKey, build.talismanId);
  const charmSkills = build.talismanSkills || charm?.skills || [];
  viewRoot.classList.add('saved-build-detail-root');
  viewTitle.textContent = 'Builds online';
  const charmCard = build.talisman ? `<article class="build-equipment-card online-equipment-card"><div class="build-equipment-icon">${equipmentImage(charm, 'talisman', build.talisman, gameKey)}</div><div class="build-equipment-copy"><small>Talismã · slots ${escapeHtml((build.talismanSlots || equipmentCatalog.slotCapacities(gameKey, charm)).join(', ') || 'não informados')}</small><strong>${escapeHtml(charm?.name || build.talisman)}</strong><div class="build-detail-skills">${charmSkills.map((skill) => `<span>${escapeHtml(skill.name)}${skill.level ? ` ${skill.unit === 'points' ? `${skill.level} pts` : `+${skill.level}`}` : ''}</span>`).join('')}</div>${recipe(charm)}</div></article>` : '';
  viewRoot.innerHTML = `<div class="saved-build-detail"><button class="ghost-button build-detail-back" id="back-to-online-builds">← Voltar à galeria</button><section class="build-detail-banner"><span class="build-detail-emblem">⚔️</span><div><span class="section-kicker">${escapeHtml(row.game)} · ${escapeHtml(row.game_version || 'Versão não informada')}</span><h2>${escapeHtml(row.title)}</h2><p>${escapeHtml(row.build_type)} · ${escapeHtml(row.weapon_type)} · por ${escapeHtml(row.author_name || 'Caçador da comunidade')}</p></div></section><section class="build-detail-section"><div class="section-heading"><h2>Equipamento e criação</h2><span>RECEITAS POR PEÇA · CATÁLOGO LOCALIZADO</span></div><div class="build-equipment-grid">${cards.filter(Boolean).join('')}${charmCard}${decorationCards.length ? `<article class="build-equipment-card online-equipment-card"><div class="build-equipment-icon">${mhIcon('decoration')}</div><div class="build-equipment-copy"><small>Decorações instaladas por peça</small><div class="build-detail-socketed">${decorationCards.join('')}</div></div></article>` : ''}${cards.filter(Boolean).length || charmCard || decorationCards.length ? '' : '<div class="build-detail-empty">A build não contém equipamentos reconhecidos pelo catálogo selecionado.</div>'}</div></section>${deco.length ? `<section class="build-detail-section"><div class="section-heading"><h2>Habilidades e decorações adicionais</h2></div><div class="build-detail-skills build-detail-skill-list">${deco.map((entry) => `<span>${escapeHtml(entry)}</span>`).join('')}</div></section>` : ''}${build.notes ? `<section class="build-detail-section"><div class="section-heading"><h2>Notas do autor</h2></div><p class="build-detail-notes">${escapeHtml(build.notes)}</p></section>` : ''}<p class="build-detail-provenance">Compartilhada na comunidade Hunter Companion · ${escapeHtml(row.published_at ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(row.published_at)) : 'data não informada')}. Receitas obtidas do catálogo do jogo; custos ausentes são indicados, não estimados.</p></div>`;
  document.querySelector('#back-to-online-builds').addEventListener('click', () => renderOnlineBuilds());
}
function renderSavedBuilds(filterGame = 'Todos os jogos') {
  viewRoot.classList.remove('saved-build-detail-root');
  const builds = loadSavedBuilds();
  const visibleBuilds = filterGame === 'Todos os jogos' ? builds : builds.filter((build) => build.game === filterGame);
  const armorSlots = [['head', 'Capacete'], ['chest', 'Peitoral'], ['arms', 'Braçadeiras'], ['waist', 'Cintura'], ['legs', 'Grevas']];
  const option = (item, selected) => `<option value="${escapeHtml(item.id)}" ${item.id === selected ? 'selected' : ''}>${escapeHtml(item.displayName || item.name)}${item.rank ? ` · ${escapeHtml(item.rank)}` : ''}</option>`;
  const armorSelect = (slot) => `<input class="text-input equipment-filter" id="filter-${slot}" placeholder="Buscar ${equipmentCatalog.slotLabels[slot].toLowerCase()}" autocomplete="off" /><select id="editor-${slot}" data-armor-slot="${slot}"><option value="">Digite para filtrar o catálogo</option></select><div class="armor-skill-preview" id="skills-${slot}">Escolha uma peça para ver as skills.</div>`;
  viewRoot.innerHTML = `<div class="saved-layout"><div><div class="toolbar"><label class="field">Filtrar por jogo${selectHtml('saved-game', ['Todos os jogos', ...games], filterGame)}</label><button class="primary-button" id="new-build">＋ Nova build</button><button class="ghost-button" id="export-builds">Exportar JSON</button><button class="ghost-button" id="import-builds">Importar JSON</button><input id="import-file" type="file" accept="application/json" hidden /></div>${visibleBuilds.length ? cardGrid(visibleBuilds, true) : '<div class="empty-state">Nenhuma build registrada para este jogo.</div>'}</div><aside class="editor-card"><h2>Montar build</h2><div class="editor-row"><label>Nome</label><input class="text-input" id="editor-name" value="Minha build" /></div><div class="editor-row"><label>Jogo</label>${selectHtml('editor-game', games, games[0])}<small id="catalog-status" class="catalog-status"></small></div><div class="editor-row"><label>Arma</label><input class="text-input equipment-filter" id="filter-weapon" placeholder="Buscar arma pelo nome" autocomplete="off" /><select id="editor-weapon"><option value="">Digite para filtrar o catálogo</option></select></div>${armorSlots.map(([slot, label]) => `<div class="editor-row armor-editor-row"><label>${label}</label>${armorSelect(slot)}</div>`).join('')}<div class="editor-row"><label>Talismã</label><input class="text-input" id="editor-talisman" placeholder="Nome do talismã" /></div><div class="editor-row"><label>Habilidades adicionais, separadas por vírgula</label><input class="text-input" id="editor-skills" placeholder="Fraqueza Explorada, Olho Crítico" /></div><div class="editor-row"><label>Decorações, separadas por vírgula</label><input class="text-input" id="editor-decorations" placeholder="Joia do Algoz, Joia de Ataque" /></div><div class="editor-row"><label>Tipo da build</label>${selectHtml('editor-type', ['DPS', 'ELEMENTAL', 'STATUS', 'CONFORTO', 'SUPORTE', 'PROGRESSÃO'])}</div><div class="editor-row"><label>Notas</label><textarea class="text-input editor-notes" id="editor-notes" placeholder="Objetivo e observações da build"></textarea></div><button class="primary-button" id="save-build">Salvar build local</button></aside></div>`;
  document.querySelector('#saved-game').addEventListener('change', (event) => renderSavedBuilds(event.target.value));
  document.querySelector('.saved-build-grid')?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-saved-build-id]');
    if (card) renderSavedBuildDetail(card.dataset.savedBuildId, filterGame);
  });
  document.querySelector('.saved-build-grid')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[data-saved-build-id]');
    if (card) { event.preventDefault(); renderSavedBuildDetail(card.dataset.savedBuildId, filterGame); }
  });
  document.querySelector('#new-build').addEventListener('click', () => document.querySelector('#editor-name').focus());
  const gameSelect = document.querySelector('#editor-game');
  const editorParts = ['weapon', ...armorSlots.map(([slot]) => slot), 'talisman'];
  const socketState = Object.fromEntries(editorParts.map((part) => [part, []]));
  const socketPanels = {};
  editorParts.forEach((part) => {
    const anchor = document.querySelector(part === 'weapon' ? '#editor-weapon' : part === 'talisman' ? '#editor-talisman' : `#editor-${part}`);
    const panel = document.createElement('div');
    panel.className = 'build-decoration-slots';
    panel.id = `decoration-slots-${part}`;
    panel.hidden = true;
    anchor?.parentElement?.appendChild(panel);
    socketPanels[part] = panel;
  });
  const charmSelect = document.createElement('select');
  charmSelect.id = 'editor-charm-catalog';
  charmSelect.setAttribute('aria-label', 'Talismã do catálogo');
  document.querySelector('#editor-talisman')?.insertAdjacentElement('afterend', charmSelect);
  const talismanExtra = document.createElement('div');
  talismanExtra.className = 'talisman-custom-fields';
  talismanExtra.innerHTML = '<label>Skill 1 <input class="text-input" id="editor-talisman-skill-1" /></label><label>Nível/pontos <input class="text-input" id="editor-talisman-level-1" type="number" min="0" max="99" value="0" /></label><label>Skill 2 <input class="text-input" id="editor-talisman-skill-2" /></label><label>Nível/pontos <input class="text-input" id="editor-talisman-level-2" type="number" min="0" max="99" value="0" /></label><label>Slots do talismã (ex.: 2,1) <input class="text-input" id="editor-talisman-slots" placeholder="0" /></label>';
  charmSelect.parentElement?.appendChild(talismanExtra);
  const createDecorationOptions = (select, game, part, capacities, index, occupied) => {
    select.innerHTML = '';
    const empty = document.createElement('option'); empty.value = ''; empty.textContent = '— Vazio —'; select.appendChild(empty);
    const kind = part === 'weapon' ? 'weapon' : part === 'talisman' ? null : 'armor';
    for (const decoration of equipmentCatalog.decorations(game, kind)) {
      const fits = equipmentCatalog.decorationFits(game, capacities, index, decoration, occupied);
      if (!fits) continue;
      const option = document.createElement('option'); option.value = decoration.id;
      option.textContent = `${decoration.name} · ${decoration.slot} espaço(s)`;
      select.appendChild(option);
    }
  };
  const renderDecorationSlots = (part, record, game) => {
    const panel = socketPanels[part];
    const capacities = equipmentCatalog.slotCapacities(game, record);
    panel.replaceChildren(); panel.hidden = capacities.length === 0;
    if (!capacities.length) return;
    const prior = socketState[part];
    const used = new Set();
    capacities.forEach((capacity, index) => {
      if (used.has(index)) {
        const occupied = document.createElement('span'); occupied.className = 'decoration-slot-occupied'; occupied.textContent = `Espaço ${index + 1} ocupado pelo adorno anterior`; panel.appendChild(occupied); return;
      }
      const select = document.createElement('select'); select.className = 'decoration-slot-select';
      select.dataset.part = part; select.dataset.slotIndex = String(index); select.dataset.capacity = String(capacity);
      createDecorationOptions(select, game, part, capacities, index, used);
      const existing = prior[index];
      if (existing?.id && [...select.options].some((option) => option.value === existing.id)) select.value = existing.id;
      const selected = equipmentCatalog.findDecoration(game, select.value);
      if (selected && equipmentCatalog.gameKey(game) === 'mhgu') for (let n = 1; n < selected.slot; n += 1) used.add(index + n);
      select.addEventListener('change', () => {
        const values = [...panel.querySelectorAll('.decoration-slot-select')].map((entry) => ({ index: Number(entry.dataset.slotIndex), value: entry.value }));
        socketState[part] = capacities.map((_, slotIndex) => {
          const entry = values.find((value) => value.index === slotIndex);
          if (!entry) return null;
          const item = equipmentCatalog.findDecoration(game, entry.value);
          return item ? { id: item.id, name: item.name, requiredSlot: item.slot, slotIndex } : null;
        });
        renderDecorationSlots(part, record, game);
      });
      const row = document.createElement('label'); row.className = 'decoration-slot-row';
      const icon = document.createElement('span'); icon.className = 'decoration-slot-icon'; icon.textContent = '✦'; icon.setAttribute('aria-hidden', 'true');
      const number = document.createElement('small'); number.textContent = `Espaço ${index + 1} · nível ${capacity}`;
      row.append(icon, number, select); panel.appendChild(row);
    });
  };
  const renderEquipmentOptions = (select, filter, records, emptyLabel) => {
    const query = normalizeSearch(filter.value);
    const matches = records.filter((item) => !query || normalizeSearch(`${item.displayName || item.name} ${item.classPt || ''} ${item.rank || ''}`).includes(query)).slice(0, 100);
    select.innerHTML = `<option value="">${matches.length ? emptyLabel : 'Nenhum item corresponde à busca'}</option>${matches.map((item) => option(item)).join('')}`;
  };
  const updateCatalog = () => {
    const game = gameSelect.value;
    const data = equipmentCatalog.gameData(game);
    document.querySelector('#catalog-status').textContent = data.available ? `${data.armor.length} armaduras · ${data.weapons.length} armas · ${data.items.length} itens` : 'Catálogo desta fonte ainda não sincronizado';
    const weaponSelect = document.querySelector('#editor-weapon');
    renderEquipmentOptions(weaponSelect, document.querySelector('#filter-weapon'), equipmentCatalog.weapons(game), 'Selecionar arma');
    armorSlots.forEach(([slot]) => {
      const select = document.querySelector(`#editor-${slot}`);
      renderEquipmentOptions(select, document.querySelector(`#filter-${slot}`), equipmentCatalog.armor(game, slot), `Selecionar ${equipmentCatalog.slotLabels[slot].toLowerCase()}`);
      document.querySelector(`#skills-${slot}`).textContent = 'Escolha uma peça para ver as skills.';
    });
    charmSelect.replaceChildren();
    const customCharm = document.createElement('option'); customCharm.value = ''; customCharm.textContent = 'Talismã personalizado / não listado'; charmSelect.appendChild(customCharm);
    equipmentCatalog.charms(game).forEach((charm) => { const entry = document.createElement('option'); entry.value = charm.id; entry.textContent = `${charm.name}${charm.rank ? ` · nível ${charm.rank}` : ''}`; charmSelect.appendChild(entry); });
    updateSocketPanels();
  };
  const updateSocketPanels = () => {
    const game = gameSelect.value;
    const weapon = equipmentCatalog.findWeapon(game, document.querySelector('#editor-weapon').value);
    renderDecorationSlots('weapon', weapon, game);
    armorSlots.forEach(([slot]) => renderDecorationSlots(slot, equipmentCatalog.findArmor(game, document.querySelector(`#editor-${slot}`).value), game));
    const charm = equipmentCatalog.findCharm(game, charmSelect.value);
    const customSlots = document.querySelector('#editor-talisman-slots').value.split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0 && value <= 4);
    const talismanRecord = charm || { slots: customSlots };
    renderDecorationSlots('talisman', talismanRecord, game);
  };
  charmSelect.addEventListener('change', () => {
    const charm = equipmentCatalog.findCharm(gameSelect.value, charmSelect.value);
    if (charm) {
      document.querySelector('#editor-talisman').value = charm.name;
      document.querySelector('#editor-talisman-skill-1').value = charm.skills?.[0]?.name || '';
      document.querySelector('#editor-talisman-level-1').value = charm.skills?.[0]?.level || 0;
      document.querySelector('#editor-talisman-skill-2').value = charm.skills?.[1]?.name || '';
      document.querySelector('#editor-talisman-level-2').value = charm.skills?.[1]?.level || 0;
      document.querySelector('#editor-talisman-slots').value = equipmentCatalog.slotCapacities(gameSelect.value, charm).join(',');
    }
    updateSocketPanels();
  });
  gameSelect.addEventListener('change', updateCatalog);
  document.querySelector('#editor-weapon').addEventListener('change', updateSocketPanels);
  ['weapon', ...armorSlots.map(([slot]) => slot)].forEach((slot) => document.querySelector(`#filter-${slot}`).addEventListener('input', (event) => {
    const select = document.querySelector(`#editor-${slot}`);
    select.value = '';
    const records = slot === 'weapon' ? equipmentCatalog.weapons(gameSelect.value) : equipmentCatalog.armor(gameSelect.value, slot);
    renderEquipmentOptions(select, event.target, records, slot === 'weapon' ? 'Selecionar arma' : `Selecionar ${equipmentCatalog.slotLabels[slot].toLowerCase()}`);
  }));
  armorSlots.forEach(([slot]) => document.querySelector(`#editor-${slot}`).addEventListener('change', (event) => {
    const piece = equipmentCatalog.findArmor(gameSelect.value, event.target.value);
    document.querySelector(`#skills-${slot}`).innerHTML = piece?.skills?.length ? piece.skills.map((skill) => `<span>${escapeHtml(skill.name)}${skill.level ? ` ${skill.unit === 'points' ? `${skill.level} pts` : `+${skill.level}`}` : ''}</span>`).join('') : 'Sem skills publicadas para esta peça.';
    updateSocketPanels();
  }));
  document.querySelector('#editor-talisman-slots').addEventListener('change', updateSocketPanels);
  updateCatalog();
  document.querySelector('#save-build').addEventListener('click', () => {
    const split = (id) => document.querySelector(id).value.split(',').map((item) => item.trim()).filter(Boolean);
    const game = gameSelect.value;
    const selectedArmor = Object.fromEntries(armorSlots.map(([slot]) => [slot, document.querySelector(`#editor-${slot}`).value]));
    const armorParts = Object.fromEntries(armorSlots.map(([slot]) => [slot, equipmentCatalog.findArmor(game, selectedArmor[slot])]));
    const selectedWeapon = equipmentCatalog.findWeapon(game, document.querySelector('#editor-weapon').value);
    const charm = equipmentCatalog.findCharm(game, charmSelect.value);
    const talismanSkills = charm?.skills || [1, 2].map((index) => ({ name: document.querySelector(`#editor-talisman-skill-${index}`).value.trim(), level: Number(document.querySelector(`#editor-talisman-level-${index}`).value || 0), unit: game === 'Monster Hunter: Generations Ultimate' ? 'points' : 'level' })).filter((skill) => skill.name && skill.level > 0);
    const decorationSlots = Object.fromEntries(editorParts.map((part) => [part, socketState[part].filter(Boolean)]));
    const socketDecorations = Object.values(decorationSlots).flat().map((entry) => entry.name);
    const talismanSlots = charm ? equipmentCatalog.slotCapacities(game, charm) : split('#editor-talisman-slots').map(Number).filter((value) => value > 0);
    const build = window.localBuildStore.normalizeBuild({ title: document.querySelector('#editor-name').value.trim() || 'Minha build', game, weapon: selectedWeapon?.displayName || selectedWeapon?.name || '', weaponId: selectedWeapon?.id || '', type: document.querySelector('#editor-type').value, armor: Object.fromEntries(armorSlots.map(([slot]) => [slot, armorParts[slot]?.name || ''])), armorIds: selectedArmor, armorSkills: Object.fromEntries(armorSlots.map(([slot]) => [slot, armorParts[slot]?.skills || []])), talisman: document.querySelector('#editor-talisman').value, talismanId: charm?.id || '', talismanSkills, talismanSlots, skills: split('#editor-skills'), decorations: [...split('#editor-decorations'), ...socketDecorations], decorationSlots, notes: document.querySelector('#editor-notes').value, icon: '⚔️' });
    saveBuilds([build, ...builds]);
    recordActivity('build', build.title, build.id, build.game);
    renderSavedBuilds(filterGame);
  });
  document.querySelector('#export-builds').addEventListener('click', () => { const blob = new Blob([window.localBuildStore.exportData(builds)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'monster-hunter-builds.json'; link.click(); URL.revokeObjectURL(link.href); });
  document.querySelector('#import-builds').addEventListener('click', () => document.querySelector('#import-file').click());
  document.querySelector('#import-file').addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { saveBuilds(window.localBuildStore.importData(reader.result)); renderSavedBuilds(filterGame); } catch { document.querySelector('.info-banner')?.remove(); alert('Não foi possível importar o arquivo de builds.'); } }; reader.readAsText(file); });
}
function equipmentCategoryIcon(record, iconKind, gameKey = record?.game) {
  const kind = String(iconKind || '').toLowerCase();
  const slot = ({ helmet: 'head', 'chest-armor': 'chest', 'arms-armor': 'arms', 'waist-armor': 'waist', 'leg-armor': 'legs' })[kind];
  const weaponClass = String(record?.class || '').toLowerCase().replaceAll('_', '-');
  const weaponAliases = { 'charge-axe': 'charge-blade', 'gun-lance': 'gunlance', horn: 'hunting-horn', 'short-sword': 'sword-and-shield', 'sword-shield': 'sword-and-shield', 'slash-axe': 'switch-axe' };
  const weaponKey = `weapon-${weaponAliases[weaponClass] || weaponClass}`;
  if (['rise', 'wilds'].includes(gameKey)) {
    const armorPart = slot && ({ head: 'armor-head', chest: 'armor-chest', arms: 'armor-arms', waist: 'armor-waist', legs: 'armor-legs' })[slot];
    if (armorPart) return `assets/build-icons/rise/${armorPart}.svg`;
    if (kind === 'weapon' && /^weapon-[a-z-]+$/.test(weaponKey)) return `assets/build-icons/world/${weaponKey}.svg`;
    if (kind === 'talisman') return 'assets/build-icons/rise/talisman.svg';
  }
  if (gameKey === 'world') {
    const armorPart = slot && ({ head: 'armor-head', chest: 'armor-chest', arms: 'armor-arms', legs: 'armor-legs' })[slot];
    const key = armorPart || (kind === 'weapon' ? weaponKey : kind === 'talisman' ? 'talisman' : null);
    return key ? `assets/build-icons/world/${key}.svg` : '';
  }
  if (gameKey === 'rise') {
    const armorPart = slot && ({ head: 'armor-head', chest: 'armor-chest', arms: 'armor-arms', waist: 'armor-waist', legs: 'armor-legs' })[slot];
    const key = armorPart || (kind === 'talisman' ? 'talisman' : null);
    return key ? `assets/build-icons/rise/${key}.svg` : '';
  }
  if (gameKey === 'mhgu') {
    const armorPart = slot && ({ head: 'armor_head', chest: 'armor_body', arms: 'armor_arms', waist: 'armor_waist', legs: 'armor_legs' })[slot];
    const weaponClass = String(record?.class || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const weaponAliases = { 'sword_and_shield': 'sword_and_shield', 'switch_axe': 'switch_axe', 'charge_blade': 'charge_blade', 'hunting_horn': 'hunting_horn', 'insect_glaive': 'insect_glaive', 'great_sword': 'great_sword', 'long_sword': 'long_sword', 'dual_blades': 'dual_blades', 'gunlance': 'gunlance', 'light_bowgun': 'light_bowgun', 'heavy_bowgun': 'heavy_bowgun', bow: 'bow', hammer: 'hammer', lance: 'lance' };
    const key = armorPart || (kind === 'weapon' ? weaponAliases[weaponClass] : null);
    return key ? `assets/build-icons/mhgu/${key}.png` : '';
  }
  return '';
}
function decorationCategoryIcon(gameKey, decoration) {
  if (!['world', 'rise', 'wilds'].includes(gameKey)) return '';
  const rank = Math.max(1, Math.min(4, Number(decoration?.slot) || 1));
  return `assets/build-icons/shared-5gen/decoration-rank-${rank}.svg`;
}
function decorationIconMarkup(gameKey, decoration, label) {
  const src = decorationCategoryIcon(gameKey, decoration);
  return src ? `<img class="build-equipment-source-icon build-decoration-source-icon" data-icon-kind="decoration" src="${src}" alt="Ícone de categoria de decoração para ${escapeHtml(label)}" loading="lazy" />` : '<i>✦</i>';
}
function equipmentImage(record, iconKind, label, gameKey = record?.game) {
  const image = record?.icon;
  const categoryIcon = iconKind === 'decoration' ? decorationCategoryIcon(gameKey, record) : equipmentCategoryIcon(record, iconKind, gameKey);
  if (typeof image === 'string' && /^https:\/\//i.test(image)) return `<img class="build-equipment-source-icon" data-icon-kind="${escapeHtml(iconKind)}" data-item-label="${escapeHtml(label)}" ${categoryIcon ? `data-fallback-src="${escapeHtml(categoryIcon)}"` : ''} src="${escapeHtml(image)}" alt="Ícone individual de ${escapeHtml(label)}" loading="lazy" referrerpolicy="no-referrer" />`;
  if (categoryIcon) return `<img class="build-equipment-source-icon" data-icon-kind="${escapeHtml(iconKind)}" data-item-label="${escapeHtml(label)}" src="${escapeHtml(categoryIcon)}" alt="Ícone de categoria para ${escapeHtml(label)}" loading="lazy" />`;
  return `<span class="build-equipment-fallback" aria-label="${escapeHtml(label)}">${mhIcon(iconKind)}</span>`;
}
function buildEquipmentCard({ label, name, iconKind, record, gameKey = record?.game, meta = '', skills = [], decorations = [] }) {
  if (!name) return '';
  const pieceSkills = skills.length ? `<div class="build-detail-skills">${skills.map((skill) => `<span>${escapeHtml(skill.name)}${skill.level ? ` +${escapeHtml(skill.level)}` : ''}</span>`).join('')}</div>` : '';
  const socketed = decorations.length ? `<div class="build-detail-socketed">${decorations.map((entry) => { const jewel = equipmentCatalog.findDecoration(record?.game || gameKey, entry.id); return `<span class="build-decoration-chip" title="${escapeHtml(jewel?.name || entry.name)} · nível ${escapeHtml(jewel?.slot || entry.requiredSlot || '?')}">${decorationIconMarkup(gameKey, jewel, jewel?.name || entry.name)}${escapeHtml(jewel?.name || entry.name)}${entry.slotIndex == null ? '' : ` · espaço ${entry.slotIndex + 1}`}</span>`; }).join('')}</div>` : '';
  return `<article class="build-equipment-card"><div class="build-equipment-icon">${equipmentImage(record, iconKind, name, gameKey)}</div><div class="build-equipment-copy"><small>${escapeHtml(label)}</small><strong>${escapeHtml(name)}</strong>${meta ? `<span class="build-equipment-meta">${escapeHtml(meta)}</span>` : ''}${pieceSkills}${socketed}</div></article>`;
}
function renderSavedBuildDetail(buildId, filterGame = 'Todos os jogos') {
  const build = loadSavedBuilds().find((entry) => entry.id === buildId);
  if (!build) return renderSavedBuilds(filterGame);
  const gameKey = equipmentCatalog.gameKey(build.game);
  const weapon = equipmentCatalog.findWeapon(gameKey, build.weaponId) || equipmentCatalog.weapons(gameKey).find((item) => normalizeSearch(item.displayName || item.name) === normalizeSearch(build.weapon));
  const slotRows = [['head', 'Capacete', 'helmet'], ['chest', 'Peitoral', 'chest-armor'], ['arms', 'Braçadeiras', 'arms-armor'], ['waist', 'Cintura', 'waist-armor'], ['legs', 'Grevas', 'leg-armor']];
  const armorCards = slotRows.map(([slot, label, icon]) => {
    const piece = equipmentCatalog.findArmor(gameKey, build.armorIds?.[slot]);
    const name = piece?.name || build.armor?.[slot] || '';
    const meta = piece ? [piece.rank && `Rank ${piece.rank}`, piece.rarity && `Raridade ${piece.rarity}`, piece.defense?.base != null && `Defesa ${piece.defense.base}`, piece.slots?.length && `${piece.slots.length} espaço(s)`].filter(Boolean).join(' · ') : '';
    const skills = piece?.skills?.length ? piece.skills : build.armorSkills?.[slot] || [];
    return buildEquipmentCard({ label, name, iconKind: icon, record: piece, gameKey, meta, skills, decorations: build.decorationSlots?.[slot] || [] });
  }).join('');
  const weaponName = weapon?.displayName || build.weapon;
  const weaponMeta = weapon ? [weapon.rarity && `Raridade ${weapon.rarity}`, weapon.attack?.raw != null && `Ataque ${weapon.attack.raw}`, weapon.slots?.length && `${weapon.slots.length} espaço(s)`].filter(Boolean).join(' · ') : '';
  const weaponCard = buildEquipmentCard({ label: 'Arma equipada', name: weaponName, iconKind: 'weapon', record: weapon, gameKey, meta: weaponMeta, skills: weapon?.skills || [], decorations: build.decorationSlots?.weapon || [] });
  const genericItems = [
    build.talisman && buildEquipmentCard({ label: 'Talismã', name: build.talisman, iconKind: 'talisman', record: equipmentCatalog.findCharm(gameKey, build.talismanId), gameKey, skills: build.talismanSkills || [], decorations: build.decorationSlots?.talisman || [] }),
    ...(build.decorations || []).filter((name) => !Object.values(build.decorationSlots || {}).flat().some((entry) => entry.name === name)).map((name) => buildEquipmentCard({ label: 'Decoração não vinculada a um espaço', name, iconKind: 'decoration' })),
  ].filter(Boolean).join('');
  viewRoot.classList.add('saved-build-detail-root');
  viewTitle.textContent = viewNames['saved-builds'];
  recordActivity('build-view', build.title, build.id, build.game);
  viewRoot.innerHTML = `<div class="saved-build-detail"><button class="ghost-button build-detail-back" id="back-to-saved-builds">← Voltar às builds registradas</button><section class="build-detail-banner"><span class="build-detail-emblem">${mhIcon('compass')}</span><div><span class="section-kicker">${escapeHtml(build.game)}</span><h2>${escapeHtml(build.title)}</h2><p>${escapeHtml(build.type)} · ${weapon ? escapeHtml(weapon.classPt) : 'Equipamento registrado'}</p></div><div class="build-share-actions"><span class="tag">${escapeHtml(build.game.replace('Monster Hunter: ', ''))}</span><button class="primary-button" id="share-build-online" ${!weapon ? 'disabled' : ''}>Compartilhar publicamente</button></div></section><div id="build-share-feedback" class="form-feedback" role="status"></div><section class="build-detail-section"><div class="section-heading"><h2>Equipamento</h2><span>ITENS REGISTRADOS NESTA BUILD</span></div><div class="build-equipment-grid">${weaponCard}${armorCards}${genericItems || '<div class="build-detail-empty">Talismã e decorações não foram registrados nesta build.</div>'}</div></section>${build.skills?.length ? `<section class="build-detail-section"><div class="section-heading"><h2>Habilidades adicionais</h2><span>${build.skills.length} REGISTRADAS</span></div><div class="build-detail-skills build-detail-skill-list">${build.skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join('')}</div></section>` : ''}${build.notes ? `<section class="build-detail-section"><div class="section-heading"><h2>Notas da build</h2></div><p class="build-detail-notes">${escapeHtml(build.notes)}</p></section>` : ''}<p class="build-detail-provenance">Build local · salva em ${escapeHtml(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(build.createdAt)))}</p></div>`;
  document.querySelector('#back-to-saved-builds').addEventListener('click', () => { viewTitle.textContent = viewNames['saved-builds']; renderSavedBuilds(filterGame); });
  const shareButton = document.querySelector('#share-build-online');
  const shareFeedback = document.querySelector('#build-share-feedback');
  if (shareButton) {
    if (!profileState.authenticated) shareFeedback.textContent = 'Entre na sua conta online para compartilhar builds com a comunidade.';
    window.hunterOverlay.onlineBuilds.mine().then((rows) => {
      myPublishedBuildIds = new Set(rows.map((row) => row.local_build_id));
      if (myPublishedBuildIds.has(build.id)) { shareButton.textContent = 'Remover da galeria pública'; shareButton.disabled = false; shareButton.classList.add('danger-button'); }
    }).catch(() => {});
    shareButton.addEventListener('click', async () => {
      if (!profileState.authenticated) { shareFeedback.textContent = 'Entre na sua conta online para compartilhar builds com a comunidade.'; return; }
      if (!weapon) return;
      const published = myPublishedBuildIds.has(build.id);
      const prompt = published ? 'Remover esta build da galeria pública? Ela continuará salva localmente.' : 'Compartilhar esta build publicamente com todos os usuários? O nome, jogo e equipamento ficarão visíveis; as notas privadas serão omitidas.';
      if (!window.confirm(prompt)) return;
      shareButton.disabled = true;
      try {
        if (published) {
          await window.hunterOverlay.onlineBuilds.unpublish(build.id);
          myPublishedBuildIds.delete(build.id);
          shareButton.textContent = 'Compartilhar publicamente'; shareButton.classList.remove('danger-button');
          shareFeedback.textContent = 'Build removida da galeria pública. A cópia local foi mantida.';
        } else {
          const publicBuild = { ...build, notes: '' };
          await window.hunterOverlay.onlineBuilds.publish({ ...publicBuild, weaponType: weapon.classPt || weapon.class, gameVersion: weapon.expansion || 'Versão não informada' });
          myPublishedBuildIds.add(build.id);
          shareButton.textContent = 'Remover da galeria pública'; shareButton.classList.add('danger-button');
          shareFeedback.textContent = 'Build compartilhada. Ela já pode ser encontrada na busca online.';
        }
      } catch (error) { shareFeedback.textContent = error?.message || 'Não foi possível atualizar o compartilhamento.'; }
      finally { shareButton.disabled = false; }
    });
  }
}
function monsterCards(list) { return list.length ? list.map((monster) => { const art = monster.icon || monster.iconFallbackAsset ? `<img src="${escapeHtml(monster.icon || monster.iconFallbackAsset)}" alt="${monster.icon ? 'Ícone' : 'Imagem de fallback'} de ${escapeHtml(monster.name)}" loading="lazy" />` : `<span>${monster.iconFallback}</span>`; const favorite = favoriteMonsterIds.has(monster.id); return `<article class="monster-card" data-monster-id="${escapeHtml(monster.id)}"><div class="monster-art">${art}<button class="favorite-button ${favorite ? 'is-favorite' : ''}" data-favorite-id="${escapeHtml(monster.id)}" title="${favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}" aria-label="${favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${mhIcon('favorite')}</button></div><div class="card-body"><div class="card-title"><strong>${escapeHtml(monster.name)}</strong><span class="tag">${escapeHtml(monster.threat)}</span></div><div class="card-meta"><span>${escapeHtml(monster.threat)}</span><span>${escapeHtml(monster.game.replace('Monster Hunter: ', ''))}</span></div></div></article>`; }).join('') : '<div class="empty-state">Nenhum monstro encontrado para este filtro.</div>'; }
function normalizeSearch(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function materialResults(list, query, rankKey) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return [];
  const results = [];
  for (const monster of list) {
    const rankRewards = rankKey && monster.rankData?.[rankKey]?.rewards?.length ? monster.rankData[rankKey].rewards : monster.rewards || [];
    for (const reward of rankRewards) {
      if (!normalizeSearch(reward.item).includes(normalizedQuery) && !normalizeSearch(ptMaterial(reward.item, monster)).includes(normalizedQuery)) continue;
      for (const condition of reward.conditions || []) {
        if (rankKey && condition.rank && condition.rank !== rankKey) continue;
        results.push({ monster, item: reward.item, method: condition.type, rank: condition.rank, chance: condition.chance, part: condition.part });
      }
    }
  }
  return results.sort((a, b) => a.monster.name.localeCompare(b.monster.name) || a.item.localeCompare(b.item) || (b.chance || 0) - (a.chance || 0));
}
function materialResultCards(results, query = '') {
  if (!normalizeSearch(query)) return '<div class="empty-state material-empty-state"><span class="result-marker"></span></div>';
  if (!results.length) return '<div class="empty-state">Nenhum material encontrado para este jogo/rank.</div>';
  return results.slice(0, 80).map((result) => `<article class="material-result" data-monster-id="${escapeHtml(result.monster.id)}"><div><strong>${escapeHtml(ptMaterial(result.item, result.monster))}</strong><span>${escapeHtml(result.monster.name)} · ${escapeHtml(result.monster.game.replace('Monster Hunter: ', ''))}</span></div><small>${escapeHtml(pt(result.method))}${result.part ? ` · ${escapeHtml(ptPart(result.part, result.monster))}` : ''}${result.rank ? ` · ${result.rank === 'low' ? 'Baixo' : result.rank === 'high' ? 'Alto' : 'Mestre/G'}` : ''}${result.chance != null ? ` · ${result.chance}%` : ''}</small></article>`).join('');
}
function partValueSummary(part) {
  const hitzones = part.hitzones || {};
  const values = [['Corte', hitzones.cut ?? hitzones.slash], ['Impacto', hitzones.blunt ?? hitzones.impact], ['Munição', hitzones.ammo ?? hitzones.shot]]
    .filter(([, value]) => value != null)
    .map(([label, value]) => `${label} ${value}`);
  return values.join(' · ') || 'Hitzone indisponível';
}
const partMapAssets = {
  'world-1': {
    image: 'assets/part-maps/aptonoth-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 61, y: 18, labelX: 20, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 0, x: 52, y: 52, labelX: 80, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'world-2': {
    image: 'assets/part-maps/jagras-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 84, y: 57, labelX: 80, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 1, x: 52, y: 46, labelX: 20, labelY: 15, side: 'left', kind: 'neutral' },
    ],
  },
  'world-3': {
    image: 'assets/part-maps/mernos-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 53, y: 32, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 0, x: 53, y: 54, labelX: 50, labelY: 88, kind: 'neutral' },
    ],
  },
  'world-4': {
    image: 'assets/part-maps/vespoid-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 57, y: 55, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'world-5': {
    image: 'assets/part-maps/mosswine-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 51, y: 49, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'world-6': {
    image: 'assets/part-maps/apceros-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 18, y: 60, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 0, x: 54, y: 43, labelX: 80, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'world-7': {
    image: 'assets/part-maps/kestodon-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 19, y: 58, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 0, x: 53, y: 45, labelX: 80, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'world-8': {
    image: 'assets/part-maps/noios-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 50, y: 32, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 0, x: 51, y: 52, labelX: 50, labelY: 88, kind: 'neutral' },
    ],
  },
  'world-9': {
    image: 'assets/part-maps/gajau-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 14, y: 55, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 56, y: 51, labelX: 80, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'world-10': {
    image: 'assets/part-maps/kelbi-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 78, y: 20, labelX: 80, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 1, x: 57, y: 53, labelX: 20, labelY: 15, side: 'left', kind: 'neutral' },
    ],
  },
  'world-11': {
    image: 'assets/part-maps/raphinos-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 49, y: 55, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 1, x: 51, y: 65, labelX: 50, labelY: 88, kind: 'neutral' },
    ],
  },
  'world-12': {
    image: 'assets/part-maps/shamos-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 12, y: 55, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 51, y: 46, labelX: 80, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'world-13': {
    image: 'assets/part-maps/girros-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 72, y: 67, labelX: 80, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 1, x: 51, y: 44, labelX: 20, labelY: 15, side: 'left', kind: 'neutral' },
    ],
  },
  'world-14': {
    image: 'assets/part-maps/hornetaur-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 55, y: 50, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'world-15': {
    image: 'assets/part-maps/gastodon-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 17, y: 45, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 57, y: 52, labelX: 80, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'world-16': {
    image: 'assets/part-maps/barnos-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 31, y: 54, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 53, y: 62, labelX: 80, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
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
  'world-71': {
    image: 'assets/part-maps/fulgur-anjanath-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, x: 92, y: 35, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 97, y: 42, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 80, y: 39, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 6, x: 53, y: 35, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 7, x: 70, y: 63, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 67, y: 83, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 26, y: 69, labelX: 63, labelY: 88, kind: 'severable' },
      { partIndex: 0, x: 7, y: 66, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-72': {
    image: 'assets/part-maps/acidic-glavenus-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 61, y: 67, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 57, y: 58, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 38, y: 27, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 6, x: 41, y: 57, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 4, x: 48, y: 78, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 8, x: 17, y: 80, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, x: 57, y: 47, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 11, x: 79, y: 31, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-73': {
    image: 'assets/part-maps/ruiner-nergigante-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 10, y: 53, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 19, y: 39, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 11, x: 65, y: 24, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 8, x: 57, y: 47, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, x: 30, y: 64, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, x: 45, y: 65, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 10, x: 34, y: 82, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 3, x: 84, y: 73, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-75': {
    image: 'assets/part-maps/coral-pukei-pukei-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 62, y: 45, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 24, y: 34, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 80, y: 36, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 55, y: 59, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, x: 56, y: 68, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 68, y: 70, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 48, y: 82, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-76': {
    image: 'assets/part-maps/nightshade-paolumu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 32, y: 55, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 42, y: 43, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 47, y: 31, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, x: 75, y: 33, labelX: 87, labelY: 15, side: 'right', kind: 'severable' },
      { partIndex: 0, x: 49, y: 57, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 53, y: 59, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 58, y: 68, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 5, x: 83, y: 74, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-77': {
    image: 'assets/part-maps/yian-garuga-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 77, y: 76, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 83, y: 82, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 75, y: 63, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 7, x: 66, y: 67, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 9, x: 57, y: 56, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 61, y: 72, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 10, x: 48, y: 83, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 1, x: 40, y: 40, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-78': {
    image: 'assets/part-maps/shara-ishvalda-hunter-notes-v1.png',
    anchors: [
      { partIndex: 5, x: 50, y: 35, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 50, y: 42, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 50, y: 54, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 0, x: 50, y: 45, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, x: 25, y: 51, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 43, y: 68, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 15, x: 50, y: 64, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 17, x: 62, y: 79, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-79': {
    image: 'assets/part-maps/savage-deviljho-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 85, y: 58, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 72, y: 45, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 58, y: 46, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 72, y: 57, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 1, x: 47, y: 59, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 73, y: 73, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 34, y: 82, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 8, x: 16, y: 45, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
      { partIndex: 2, x: 7, y: 25, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
    ],
  },
  'world-80': {
    image: 'assets/part-maps/blackveil-vaal-hazak-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 77, y: 38, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 68, y: 53, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 60, y: 40, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 14, x: 73, y: 28, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, x: 48, y: 68, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 54, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 11, x: 67, y: 82, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 2, x: 19, y: 55, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
    ],
  },
  'world-81': {
    image: 'assets/part-maps/seething-bazelgeuse-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 74, y: 79, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 75, y: 61, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 65, y: 61, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 7, x: 35, y: 31, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, x: 68, y: 68, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 71, y: 84, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 35, y: 81, labelX: 63, labelY: 88, kind: 'severable' },
      { partIndex: 4, x: 60, y: 52, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-82': {
    image: 'assets/part-maps/scarred-yian-garuga-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 78, y: 75, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 84, y: 81, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 77, y: 65, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 7, x: 68, y: 66, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 9, x: 57, y: 55, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 62, y: 70, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 10, x: 47, y: 83, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 13, x: 28, y: 73, labelX: 87, labelY: 88, side: 'right', kind: 'severable' },
      { partIndex: 1, x: 8, y: 73, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
    ],
  },
  'world-83': {
    image: 'assets/part-maps/gold-rathian-hunter-notes-v1.png',
    anchors: [
      { partIndex: 4, x: 75, y: 60, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 68, y: 51, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 57, y: 61, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 51, y: 49, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, x: 24, y: 29, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, x: 60, y: 83, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 21, y: 68, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 1, x: 6, y: 62, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-84': {
    image: 'assets/part-maps/silver-rathalos-hunter-notes-v1.png',
    anchors: [
      { partIndex: 4, x: 17, y: 53, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 31, y: 48, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 43, y: 63, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 53, y: 42, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, x: 70, y: 34, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, x: 40, y: 82, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 67, y: 74, labelX: 63, labelY: 88, kind: 'neutral' },
      { partIndex: 1, x: 93, y: 74, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'world-85': {
    image: 'assets/part-maps/brute-tigrex-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 47, y: 30, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 58, y: 43, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 56, y: 66, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 0, x: 77, y: 76, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 5, x: 43, y: 83, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 18, y: 62, labelX: 37, labelY: 88, side: 'left', kind: 'severable' },
      { partIndex: 6, x: 7, y: 31, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-88': {
    image: 'assets/part-maps/raging-brachydios-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 17, y: 28, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 10, x: 24, y: 19, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 52, y: 43, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 11, x: 37, y: 55, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, x: 24, y: 76, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 8, valuePartIndex: 2, x: 68, y: 62, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 12, x: 88, y: 54, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-89': {
    image: 'assets/part-maps/furious-rajang-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 9, x: 56, y: 17, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 65, y: 8, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 55, y: 54, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 5, x: 30, y: 48, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, x: 78, y: 48, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 58, y: 84, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 8, x: 55, y: 67, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-90': {
    image: 'assets/part-maps/alatreon-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 5, x: 35, y: 47, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 43, y: 34, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 76, y: 26, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 9, x: 36, y: 80, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 11, x: 84, y: 68, labelX: 13, labelY: 88, side: 'left', kind: 'severable' },
      { partIndex: 4, x: 14, y: 27, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 10, x: 62, y: 83, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-91': {
    image: 'assets/part-maps/frostfang-barioth-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 78, y: 48, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 58, y: 27, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 57, y: 43, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 9, x: 54, y: 61, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 6, x: 67, y: 67, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 11, valuePartIndex: 12, x: 17, y: 43, labelX: 37, labelY: 88, side: 'left', kind: 'severable' },
      { partIndex: 10, x: 38, y: 72, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'world-92': {
    image: 'assets/part-maps/fatalis-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 32, y: 29, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 40, y: 42, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 9, x: 53, y: 58, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, x: 82, y: 34, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 56, y: 83, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 28, y: 83, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 84, y: 72, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-1': {
    image: 'assets/part-maps/bishaten-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 64, y: 28, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 19, y: 38, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 57, y: 56, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 7, x: 74, y: 42, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, x: 48, y: 76, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 43, y: 81, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 88, y: 60, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-2': {
    image: 'assets/part-maps/great-wroggi-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 67, y: 16, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 52, y: 49, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 59, y: 61, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 22, y: 48, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-3': {
    image: 'assets/part-maps/magnamalo-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 11, x: 77, y: 51, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, x: 58, y: 28, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 57, y: 55, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 7, x: 78, y: 72, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 8, x: 18, y: 55, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 73, y: 82, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 28, y: 82, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-4': {
    image: 'assets/part-maps/royal-ludroth-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 14, y: 50, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 43, y: 27, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 57, y: 31, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 87, y: 70, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 6, x: 39, y: 70, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 57, y: 55, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 70, y: 74, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-5': {
    image: 'assets/part-maps/somnacanth-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 23, y: 19, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 34, y: 36, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 65, y: 31, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 80, y: 87, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, x: 37, y: 47, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 48, y: 57, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 42, y: 66, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-6': {
    image: 'assets/part-maps/goss-harag-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 56, y: 18, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 66, y: 34, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 14, x: 66, y: 51, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 8, x: 29, y: 67, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 10, x: 65, y: 87, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 12, x: 55, y: 61, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 14, x: 69, y: 48, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-7': {
    image: 'assets/part-maps/lagombi-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 53, y: 34, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 52, y: 55, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 28, y: 35, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 6, x: 76, y: 43, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 8, x: 52, y: 80, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 41, y: 74, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-8': {
    image: 'assets/part-maps/khezu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 78, y: 34, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, x: 52, y: 37, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 19, y: 56, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 4, x: 38, y: 62, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, x: 58, y: 57, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 48, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 86, y: 76, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-9': {
    image: 'assets/part-maps/great-baggi-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 28, y: 22, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 51, y: 50, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 0, x: 43, y: 62, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 82, y: 63, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-10': {
    image: 'assets/part-maps/barioth-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 9, y: 54, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 45, y: 35, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 63, y: 39, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 34, y: 60, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 6, x: 51, y: 56, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 10, x: 54, y: 70, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 12, x: 78, y: 73, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-11': {
    image: 'assets/part-maps/mizutsune-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 24, y: 43, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 55, y: 35, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 36, y: 50, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 33, x: 82, y: 53, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 13, x: 23, y: 67, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 18, valuePartIndex: 21, x: 37, y: 66, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 23, valuePartIndex: 26, x: 58, y: 70, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-12': {
    image: 'assets/part-maps/rathalos-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 22, y: 53, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 50, y: 43, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 6, x: 70, y: 35, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 1, x: 72, y: 77, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 45, y: 69, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 9, x: 32, y: 72, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 57, y: 65, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-13': {
    image: 'assets/part-maps/tigrex-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 80, y: 17, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 45, y: 38, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 11, x: 56, y: 64, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 58, y: 53, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 65, y: 56, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 13, x: 81, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 9, x: 17, y: 55, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-14': {
    image: 'assets/part-maps/great-izuchi-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 86, y: 28, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 60, y: 54, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 70, y: 70, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 4, x: 37, y: 49, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, x: 8, y: 16, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
    ],
  },
  'rise-15': {
    image: 'assets/part-maps/arzuros-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 24, y: 39, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 51, y: 44, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 5, x: 34, y: 65, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 6, x: 73, y: 69, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-16': {
    image: 'assets/part-maps/tetranadon-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 48, y: 32, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 24, y: 40, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 53, y: 20, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 14, x: 66, y: 58, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 8, x: 51, y: 70, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 12, valuePartIndex: 16, x: 76, y: 84, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 10, x: 58, y: 48, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-17': {
    image: 'assets/part-maps/aknosom-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 52, y: 34, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 56, y: 19, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 6, x: 31, y: 51, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, x: 47, y: 35, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 55, y: 44, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 55, y: 80, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 9, x: 74, y: 68, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-18': {
    image: 'assets/part-maps/rathian-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 22, y: 63, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 55, y: 54, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 7, x: 46, y: 34, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, x: 82, y: 54, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 32, y: 55, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 49, y: 80, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 59, y: 68, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-19': {
    image: 'assets/part-maps/rakna-kadaki-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 52, y: 36, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 68, y: 24, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 50, y: 70, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, x: 24, y: 60, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 51, y: 49, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, x: 51, y: 63, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 12, x: 83, y: 61, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-20': {
    image: 'assets/part-maps/basarios-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 4, x: 17, y: 52, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 12, x: 48, y: 28, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 30, y: 59, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 21, x: 73, y: 45, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 15, x: 54, y: 66, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 24, x: 67, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 27, x: 83, y: 57, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-21': {
    image: 'assets/part-maps/volvidon-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 23, y: 36, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 62, y: 28, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 54, y: 53, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 36, y: 61, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 4, x: 78, y: 61, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 69, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-22': {
    image: 'assets/part-maps/almudron-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 34, y: 48, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 51, y: 27, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 6, x: 53, y: 64, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 9, x: 86, y: 32, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, x: 55, y: 63, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 70, y: 69, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 78, y: 57, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-23': {
    image: 'assets/part-maps/diablos-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 84, y: 30, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 86, y: 15, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 7, x: 35, y: 30, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 4, x: 57, y: 45, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, x: 67, y: 64, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 11, x: 62, y: 80, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 9, x: 22, y: 57, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-24': {
    image: 'assets/part-maps/rajang-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 51, y: 20, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 51, y: 7, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 37, y: 54, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 5, x: 51, y: 47, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 9, x: 77, y: 65, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 8, x: 67, y: 80, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-25': {
    image: 'assets/part-maps/apex-arzuros-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 27, y: 22, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 4, x: 34, y: 56, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 57, y: 54, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, x: 78, y: 57, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 9, x: 55, y: 69, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 72, y: 81, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-26': {
    image: 'assets/part-maps/kulu-yaku-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 3, x: 83, y: 23, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 4, x: 58, y: 70, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 7, x: 68, y: 55, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 8, x: 18, y: 55, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 10, x: 77, y: 77, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 79, y: 82, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-27': {
    image: 'assets/part-maps/barroth-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 4, valuePartIndex: 3, x: 88, y: 34, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 79, y: 12, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 12, x: 48, y: 63, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 8, valuePartIndex: 23, x: 62, y: 50, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 16, x: 27, y: 74, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 20, x: 16, y: 49, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 21, x: 16, y: 49, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-28': {
    image: 'assets/part-maps/pukei-pukei-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 68, y: 68, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 7, x: 71, y: 35, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 53, y: 43, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 1, x: 18, y: 70, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 6, x: 53, y: 60, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 8, valuePartIndex: 9, x: 63, y: 76, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, x: 48, y: 83, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-29': {
    image: 'assets/part-maps/jyuratodus-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 4, x: 23, y: 46, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 9, x: 66, y: 25, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 10, valuePartIndex: 11, x: 76, y: 14, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 13, x: 92, y: 47, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 8, x: 51, y: 53, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 14, x: 69, y: 72, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
    ],
  },
  'rise-30': {
    image: 'assets/part-maps/tobi-kadachi-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 51, y: 68, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 55, y: 38, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 43, y: 72, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 5, x: 67, y: 60, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, x: 30, y: 11, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 79, y: 76, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-31': {
    image: 'assets/part-maps/anjanath-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 73, y: 71, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, x: 55, y: 24, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 5, x: 70, y: 62, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 18, y: 58, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 9, valuePartIndex: 10, x: 68, y: 55, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 11, x: 54, y: 80, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 8, x: 82, y: 82, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-32': {
    image: 'assets/part-maps/nargacuga-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 5, x: 72, y: 68, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 38, y: 50, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 12, x: 55, y: 49, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 9, x: 17, y: 30, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, x: 54, y: 60, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 7, x: 67, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 38, y: 80, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-33': {
    image: 'assets/part-maps/zinogre-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 7, x: 88, y: 70, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 90, y: 61, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 10, x: 58, y: 46, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 16, x: 15, y: 40, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 19, x: 70, y: 78, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 14, x: 37, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 12, x: 62, y: 64, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-34': {
    image: 'assets/part-maps/wind-serpent-ibushi-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, x: 79, y: 37, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 82, y: 26, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 8, x: 57, y: 26, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 11, x: 75, y: 67, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 16, x: 62, y: 51, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 14, x: 21, y: 23, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 70, y: 58, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-35': {
    image: 'assets/part-maps/apex-rathian-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 5, x: 39, y: 24, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 8, x: 20, y: 47, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 7, x: 56, y: 37, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 10, x: 86, y: 53, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 6, x: 52, y: 52, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, x: 45, y: 82, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-36': {
    image: 'assets/part-maps/thunder-serpent-narwa-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 7, x: 30, y: 24, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 39, y: 12, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 9, x: 34, y: 38, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 12, x: 37, y: 52, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 19, x: 56, y: 54, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 16, x: 87, y: 63, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 11, x: 57, y: 40, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-37': {
    image: 'assets/part-maps/chameleos-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 5, x: 83, y: 78, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 83, y: 63, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 6, x: 65, y: 31, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 15, x: 20, y: 36, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 8, x: 61, y: 48, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 10, x: 67, y: 58, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 11, x: 62, y: 76, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-38': {
    image: 'assets/part-maps/apex-rathalos-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 4, x: 47, y: 25, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 11, x: 20, y: 50, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 7, x: 57, y: 23, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 10, x: 29, y: 78, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 8, valuePartIndex: 9, x: 53, y: 56, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 13, valuePartIndex: 16, x: 48, y: 83, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 15, x: 52, y: 65, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-39': {
    image: 'assets/part-maps/apex-mizutsune-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 5, x: 86, y: 52, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 93, y: 59, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 37, x: 57, y: 40, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 33, x: 15, y: 48, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 28, valuePartIndex: 29, x: 61, y: 62, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 18, valuePartIndex: 19, x: 70, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 23, valuePartIndex: 24, x: 34, y: 80, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-40': {
    image: 'assets/part-maps/teostra-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 4, x: 32, y: 31, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 21, x: 73, y: 37, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 23, x: 11, y: 54, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 12, valuePartIndex: 13, x: 54, y: 45, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 10, x: 54, y: 65, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 15, x: 42, y: 77, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-41': {
    image: 'assets/part-maps/kushala-daora-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, x: 45, y: 43, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 68, y: 39, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 57, y: 34, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 81, y: 79, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, x: 56, y: 65, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 7, x: 51, y: 75, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 9, x: 61, y: 82, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-42': {
    image: 'assets/part-maps/apex-diablos-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 8, x: 21, y: 40, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 6, x: 17, y: 34, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 11, x: 60, y: 53, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 12, valuePartIndex: 13, x: 71, y: 37, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 10, x: 47, y: 64, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 16, x: 86, y: 77, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 14, valuePartIndex: 20, x: 51, y: 84, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-43': {
    image: 'assets/part-maps/bazelgeuse-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 5, x: 22, y: 42, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 10, x: 54, y: 25, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 7, x: 50, y: 43, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 12, x: 79, y: 67, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 6, x: 53, y: 60, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 9, x: 42, y: 77, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-44': {
    image: 'assets/part-maps/narwa-allmother-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 7, x: 20, y: 78, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 18, y: 68, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 9, x: 54, y: 43, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 12, x: 22, y: 52, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 19, x: 38, y: 62, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 16, x: 48, y: 17, labelX: 37, labelY: 88, side: 'right', kind: 'breakable' },
      { partIndex: 11, x: 39, y: 52, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-45': {
    image: 'assets/part-maps/apex-zinogre-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 7, x: 87, y: 75, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 86, y: 68, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 12, x: 52, y: 40, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 22, x: 76, y: 32, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 27, x: 68, y: 75, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 19, x: 34, y: 77, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 15, x: 55, y: 62, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-46': {
    image: 'assets/part-maps/crimson-glow-valstrax-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 7, x: 13, y: 66, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 28, x: 49, y: 24, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 13, x: 56, y: 49, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 32, x: 83, y: 31, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 35, x: 43, y: 57, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 21, x: 53, y: 70, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 13, valuePartIndex: 14, x: 60, y: 60, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-47': {
    image: 'assets/part-maps/malzeno-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 5, x: 53, y: 16, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 55, y: 8, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 73, y: 43, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 10, x: 35, y: 75, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 7, x: 61, y: 34, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 54, y: 56, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-48': {
    image: 'assets/part-maps/lunagaron-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 4, x: 16, y: 37, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 9, x: 44, y: 72, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 15, x: 83, y: 60, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 7, x: 55, y: 62, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 8, x: 58, y: 49, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 19, valuePartIndex: 20, x: 57, y: 34, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-49': {
    image: 'assets/part-maps/garangolm-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 3, x: 84, y: 31, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 7, x: 86, y: 62, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 8, x: 23, y: 65, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 14, x: 13, y: 67, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 5, x: 54, y: 57, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 11, valuePartIndex: 12, x: 44, y: 79, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-50': {
    image: 'assets/part-maps/shogun-ceanataur-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 52, y: 53, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 52, y: 43, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 9, x: 19, y: 20, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 10, x: 86, y: 62, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 3, x: 51, y: 64, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 34, y: 70, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-51': {
    image: 'assets/part-maps/astalos-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 4, valuePartIndex: 6, x: 76, y: 38, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 10, x: 34, y: 25, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 9, x: 57, y: 46, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 13, x: 79, y: 78, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, x: 70, y: 54, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 16, x: 55, y: 62, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 12, valuePartIndex: 17, x: 56, y: 75, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-52': {
    image: 'assets/part-maps/blood-orange-bishaten-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 25, y: 32, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 73, y: 27, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 17, y: 54, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 7, x: 67, y: 30, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, x: 32, y: 76, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 5, x: 51, y: 49, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 62, y: 76, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-53': {
    image: 'assets/part-maps/seregios-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 59, y: 44, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 7, x: 29, y: 28, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 51, y: 51, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 29, y: 76, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 7, x: 81, y: 69, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 9, x: 57, y: 63, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 10, x: 80, y: 77, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-54': {
    image: 'assets/part-maps/aurora-somnacanth-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 66, y: 34, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 8, x: 68, y: 24, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, x: 49, y: 25, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, x: 18, y: 76, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 10, x: 72, y: 59, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 9, x: 67, y: 59, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 12, x: 78, y: 77, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-55': {
    image: 'assets/part-maps/magma-almudron-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 5, x: 78, y: 17, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 15, x: 18, y: 55, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 14, x: 44, y: 74, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 18, x: 55, y: 44, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 17, x: 70, y: 55, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 17, x: 62, y: 65, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 12, valuePartIndex: 13, x: 76, y: 86, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-56': {
    image: 'assets/part-maps/gore-magala-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 61, y: 67, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 61, y: 53, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 7, x: 48, y: 22, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, x: 20, y: 70, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 10, x: 57, y: 58, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 8, x: 57, y: 80, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 76, y: 53, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-57': {
    image: 'assets/part-maps/espinas-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 7, x: 18, y: 57, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 16, y: 50, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 13, x: 67, y: 29, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 11, x: 47, y: 43, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 17, x: 84, y: 81, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 9, x: 45, y: 65, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 15, x: 49, y: 80, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-58': {
    image: 'assets/part-maps/daimyo-hermitaur-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 4, x: 51, y: 70, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 7, x: 51, y: 31, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 14, x: 19, y: 61, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 11, valuePartIndex: 12, x: 84, y: 61, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 5, x: 51, y: 60, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 10, x: 72, y: 80, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 17, valuePartIndex: 18, x: 27, y: 80, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-59': {
    image: 'assets/part-maps/pyre-rakna-kadaki-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 57, y: 28, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 80, y: 21, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 24, y: 57, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 6, x: 44, y: 39, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 7, x: 57, y: 53, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 8, x: 47, y: 67, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, x: 58, y: 49, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-60': {
    image: 'assets/part-maps/lucent-nargacuga-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 5, x: 50, y: 76, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 21, y: 55, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 6, x: 62, y: 47, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 8, x: 86, y: 19, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 11, x: 48, y: 63, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 1, x: 61, y: 71, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, x: 75, y: 75, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-61': {
    image: 'assets/part-maps/furious-rajang-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 19, y: 23, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 47, y: 17, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 5, x: 22, y: 56, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 4, x: 51, y: 51, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 7, x: 43, y: 80, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 9, x: 77, y: 58, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-62': {
    image: 'assets/part-maps/shagaru-magala-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, x: 69, y: 55, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 70, y: 43, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 7, x: 31, y: 33, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, x: 38, y: 80, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 11, x: 60, y: 57, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 9, x: 65, y: 68, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 8, x: 59, y: 31, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-63': {
    image: 'assets/part-maps/gaismagorm-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, x: 51, y: 53, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, x: 48, y: 40, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 7, x: 24, y: 29, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 10, x: 84, y: 80, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, x: 59, y: 28, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 11, x: 53, y: 65, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, x: 36, y: 80, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-64': {
    image: 'assets/part-maps/scorned-magnamalo-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 5, x: 82, y: 60, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 14, x: 64, y: 34, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 20, x: 54, y: 55, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 16, x: 21, y: 45, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 19, valuePartIndex: 6, x: 67, y: 61, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 12, valuePartIndex: 13, x: 60, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 16, valuePartIndex: 17, x: 31, y: 44, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-65': {
    image: 'assets/part-maps/seething-bazelgeuse-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 5, x: 18, y: 72, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 10, x: 62, y: 28, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 7, x: 57, y: 65, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 12, x: 87, y: 80, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 6, x: 42, y: 69, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 9, x: 51, y: 84, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
    ],
  },
  'rise-66': {
    image: 'assets/part-maps/silver-rathalos-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 4, valuePartIndex: 5, x: 80, y: 70, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 13, x: 28, y: 21, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 54, y: 58, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 15, x: 29, y: 68, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 12, valuePartIndex: 8, x: 66, y: 63, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 14, x: 58, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 13, valuePartIndex: 13, x: 76, y: 31, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'rise-67': {
    image: 'assets/part-maps/gold-rathian-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 4, valuePartIndex: 5, x: 78, y: 68, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 13, x: 34, y: 25, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 58, y: 48, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 15, x: 24, y: 68, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 12, valuePartIndex: 8, x: 62, y: 60, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 14, x: 57, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 13, valuePartIndex: 13, x: 72, y: 31, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-68': {
    image: 'assets/part-maps/flaming-espinas-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 7, x: 18, y: 57, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, x: 16, y: 50, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 25, x: 67, y: 29, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 19, x: 47, y: 43, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 37, x: 84, y: 81, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 13, x: 45, y: 65, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 31, x: 49, y: 80, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-69': {
    image: 'assets/part-maps/violet-mizutsune-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 5, x: 14, y: 55, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 37, x: 45, y: 24, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 13, x: 61, y: 57, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 33, x: 91, y: 63, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 18, valuePartIndex: 19, x: 70, y: 75, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 28, valuePartIndex: 29, x: 52, y: 58, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 23, valuePartIndex: 24, x: 75, y: 78, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'rise-70': {
    image: 'assets/part-maps/risen-chameleos-rise-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 5, x: 38, y: 31, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, x: 45, y: 19, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 6, x: 75, y: 33, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 8, x: 56, y: 43, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 15, x: 84, y: 70, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 11, valuePartIndex: 12, x: 48, y: 73, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 13, valuePartIndex: 14, x: 28, y: 76, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-1': {
    image: 'assets/part-maps/zoh-shia-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 8, x: 50, y: 51, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 6, x: 20, y: 37, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, x: 37, y: 69, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 46, y: 85, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 51, y: 61, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 17, x: 41, y: 79, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 16, valuePartIndex: 16, x: 60, y: 69, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-2': {
    image: 'assets/part-maps/guardian-doshaguma-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 84, y: 29, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 0, x: 59, y: 45, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 61, y: 43, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 15, y: 57, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 55, y: 62, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 36, y: 76, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 6, x: 71, y: 80, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-3': {
    image: 'assets/part-maps/rey-dau-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 83, y: 62, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 8, x: 35, y: 35, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 31, y: 72, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 66, y: 56, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 10, valuePartIndex: 10, x: 70, y: 73, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 4, x: 58, y: 86, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 9, x: 79, y: 86, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-4': {
    image: 'assets/part-maps/lala-barina-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 50, y: 58, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 8, x: 50, y: 25, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 50, y: 59, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 50, y: 70, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 9, valuePartIndex: 9, x: 50, y: 63, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 11, x: 23, y: 76, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 7, x: 30, y: 88, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-5': {
    image: 'assets/part-maps/congalala-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 17, y: 38, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 34, y: 68, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 83, y: 29, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 54, y: 62, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 7, x: 31, y: 82, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 5, x: 56, y: 88, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 82, y: 81, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-6': {
    image: 'assets/part-maps/nerscylla-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 50, y: 58, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 5, x: 50, y: 27, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 7, x: 50, y: 40, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 50, y: 65, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 14, x: 50, y: 71, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 16, x: 23, y: 78, labelX: 37, labelY: 88, side: 'neutral', kind: 'neutral' },
      { partIndex: 10, valuePartIndex: 12, x: 79, y: 78, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-7': {
    image: 'assets/part-maps/gore-magala-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 20, y: 56, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 24, y: 40, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 9, x: 60, y: 29, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 31, y: 53, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 80, y: 73, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 14, valuePartIndex: 14, x: 54, y: 56, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 15, x: 24, y: 77, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-8': {
    image: 'assets/part-maps/gravios-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 8, x: 72, y: 43, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 7, x: 28, y: 30, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 10, x: 48, y: 50, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 14, x: 20, y: 70, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 13, x: 52, y: 70, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 9, x: 70, y: 80, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 69, y: 55, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-9': {
    image: 'assets/part-maps/guardian-arkveld-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 72, y: 54, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 0, x: 31, y: 32, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 58, y: 36, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 25, y: 72, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 11, valuePartIndex: 11, x: 51, y: 56, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 9, x: 72, y: 82, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 87, y: 40, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-10': {
    image: 'assets/part-maps/quematrice-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 86, y: 66, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 24, y: 39, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 61, y: 62, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 69, y: 78, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 53, y: 82, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 70, y: 84, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 77, y: 73, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-11': {
    image: 'assets/part-maps/doshaguma-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 2, x: 50, y: 57, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 31, y: 71, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 0, x: 53, y: 67, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 81, y: 79, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 72, y: 77, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 69, y: 87, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 9, x: 35, y: 84, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-12': {
    image: 'assets/part-maps/balahara-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 82, y: 77, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 70, y: 57, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 28, y: 72, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 57, y: 48, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 77, y: 63, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 42, y: 37, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 24, y: 53, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-13': {
    image: 'assets/part-maps/rathian-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 23, y: 75, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 31, y: 30, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 79, y: 61, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 8, valuePartIndex: 8, x: 55, y: 62, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 45, y: 84, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 58, y: 84, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 72, y: 37, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-14': {
    image: 'assets/part-maps/chatacabra-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 67, y: 40, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 84, y: 61, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 0, x: 24, y: 70, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 83, y: 77, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 53, y: 60, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 39, y: 86, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 8, x: 73, y: 86, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-15': {
    image: 'assets/part-maps/mizutsune-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 56, y: 25, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 0, x: 46, y: 55, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 31, y: 58, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 9, valuePartIndex: 9, x: 67, y: 60, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 74, y: 69, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 54, y: 83, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 8, x: 77, y: 84, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-16': {
    image: 'assets/part-maps/guardian-fulgur-anjanath-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 17, y: 48, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 20, y: 56, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 67, y: 27, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 87, y: 61, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 11, valuePartIndex: 11, x: 52, y: 60, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 7, x: 73, y: 83, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 38, y: 54, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-17': {
    image: 'assets/part-maps/hirabami-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 44, y: 35, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 50, y: 45, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 23, y: 52, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 65, y: 65, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 68, y: 53, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 66, y: 75, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 78, y: 47, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-18': {
    image: 'assets/part-maps/yian-kut-ku-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 36, y: 29, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 27, y: 19, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 83, y: 80, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 43, y: 56, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 38, y: 42, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 56, y: 83, labelX: 37, labelY: 88, side: 'right', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 37, y: 66, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-19': {
    image: 'assets/part-maps/rompopolo-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 18, y: 66, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 47, y: 30, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 86, y: 17, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 59, y: 57, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 44, y: 59, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 35, y: 82, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 64, y: 83, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-20': {
    image: 'assets/part-maps/arkveld-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 51, y: 34, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 0, x: 20, y: 45, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 51, y: 24, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 83, y: 72, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 11, valuePartIndex: 11, x: 57, y: 59, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 9, x: 39, y: 83, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 20, y: 68, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-21': {
    image: 'assets/part-maps/ajarakan-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 71, y: 39, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 69, y: 20, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 22, y: 72, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 9, valuePartIndex: 9, x: 59, y: 63, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 0, valuePartIndex: 0, x: 84, y: 70, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 52, y: 83, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 8, x: 69, y: 84, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-22': {
    image: 'assets/part-maps/gypceros-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 70, y: 43, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 74, y: 18, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 65, y: 52, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 43, y: 61, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 52, y: 66, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 32, y: 84, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 54, y: 83, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-23': {
    image: 'assets/part-maps/xu-wu-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 50, y: 29, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 50, y: 42, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 17, y: 47, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 55, y: 73, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 66, y: 46, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 11, valuePartIndex: 11, x: 51, y: 61, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 9, x: 89, y: 57, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-24': {
    image: 'assets/part-maps/guardian-rathalos-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 43, y: 34, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 22, y: 40, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 70, y: 82, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 9, valuePartIndex: 9, x: 56, y: 58, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 50, y: 78, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 56, y: 74, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 76, y: 43, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-25': {
    image: 'assets/part-maps/uth-duna-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 84, y: 36, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 0, x: 77, y: 62, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 18, y: 57, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 12, valuePartIndex: 12, x: 57, y: 55, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 76, y: 78, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 47, y: 72, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 29, y: 82, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-26': {
    image: 'assets/part-maps/jin-dahaad-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 61, y: 34, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 0, x: 59, y: 18, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 23, y: 61, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 84, y: 63, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 13, valuePartIndex: 13, x: 51, y: 65, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 43, y: 73, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 34, y: 84, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'wilds-27': {
    image: 'assets/part-maps/nu-udra-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 51, y: 28, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 51, y: 39, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 16, y: 50, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 69, y: 34, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 50, y: 62, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 9, x: 87, y: 60, labelX: 37, labelY: 88, side: 'right', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 18, y: 66, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-28': {
    image: 'assets/part-maps/guardian-ebony-odogaron-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 15, y: 57, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 0, x: 38, y: 65, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 82, y: 19, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 56, y: 42, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 9, valuePartIndex: 9, x: 57, y: 61, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 35, y: 84, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 8, valuePartIndex: 8, x: 73, y: 82, labelX: 87, labelY: 88, side: 'right', kind: 'breakable' },
    ],
  },
  'wilds-29': {
    image: 'assets/part-maps/rathalos-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 66, y: 40, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 20, y: 39, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 76, y: 82, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 10, valuePartIndex: 10, x: 66, y: 62, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 54, y: 74, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 63, y: 72, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 8, valuePartIndex: 8, x: 88, y: 38, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-30': {
    image: 'assets/part-maps/blangonga-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 20, y: 44, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 0, x: 43, y: 69, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 86, y: 56, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 61, y: 61, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 78, y: 82, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 58, y: 83, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 43, y: 82, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-31': {
    image: 'assets/part-maps/lagiacrus-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 2, valuePartIndex: 2, x: 16, y: 34, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 0, valuePartIndex: 0, x: 49, y: 33, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 34, y: 51, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 82, y: 50, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 55, y: 68, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 15, valuePartIndex: 15, x: 72, y: 72, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 14, valuePartIndex: 14, x: 48, y: 56, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-32': {
    image: 'assets/part-maps/seregios-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 58, y: 68, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 60, y: 29, labelX: 37, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 24, y: 66, labelX: 63, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 54, y: 57, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 55, y: 84, labelX: 13, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 9, valuePartIndex: 9, x: 83, y: 76, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 10, valuePartIndex: 10, x: 56, y: 60, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-33': {
    image: 'assets/part-maps/omega-planetes-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 1, valuePartIndex: 1, x: 55, y: 50, labelX: 13, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 49, y: 28, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 66, y: 29, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 78, y: 48, labelX: 87, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 25, y: 68, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 83, y: 69, labelX: 37, labelY: 88, side: 'left', kind: 'breakable' },
      { partIndex: 9, valuePartIndex: 9, x: 55, y: 61, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'wilds-34': {
    image: 'assets/part-maps/gogmazios-wilds-hunter-notes-v1.png',
    anchors: [
      { partIndex: 3, valuePartIndex: 3, x: 77, y: 47, labelX: 13, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 10, valuePartIndex: 10, x: 52, y: 34, labelX: 37, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 27, y: 58, labelX: 63, labelY: 15, kind: 'neutral' },
      { partIndex: 17, valuePartIndex: 17, x: 17, y: 53, labelX: 87, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 68, y: 73, labelX: 13, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 11, valuePartIndex: 11, x: 52, y: 78, labelX: 37, labelY: 88, side: 'left', kind: 'neutral' },
      { partIndex: 14, valuePartIndex: 14, x: 76, y: 59, labelX: 87, labelY: 88, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-68446': {
    image: 'assets/part-maps/aptonoth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 50, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 22, y: 33, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-6d986': {
    image: 'assets/part-maps/apceros-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 54, y: 42, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 16, y: 52, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-67ab6': {
    image: 'assets/part-maps/kelbi-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 61, y: 45, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-6b496': {
    image: 'assets/part-maps/mosswine-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 55, y: 49, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-6a356': {
    image: 'assets/part-maps/hornetaur-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 53, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-63806': {
    image: 'assets/part-maps/vespoid-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 55, y: 51, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-643d6': {
    image: 'assets/part-maps/felyne-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 55, y: 51, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-6e3b6': {
    image: 'assets/part-maps/melynx-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 43, y: 43, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-69046': {
    image: 'assets/part-maps/velociprey-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 57, y: 54, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-65476': {
    image: 'assets/part-maps/genprey-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 50, y: 49, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-60936': {
    image: 'assets/part-maps/ioprey-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 49, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-68546': {
    image: 'assets/part-maps/cephalos-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 29, y: 61, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 64, y: 43, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 75, y: 62, labelX: 50, labelY: 88, kind: 'neutral' },
    ],
  },
  'mhgu-6d886': {
    image: 'assets/part-maps/bullfango-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 54, y: 52, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-679b6': {
    image: 'assets/part-maps/popo-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 54, y: 50, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 87, y: 45, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-6b596': {
    image: 'assets/part-maps/giaprey-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 55, y: 53, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-6a956': {
    image: 'assets/part-maps/anteka-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 56, y: 53, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-63b06': {
    image: 'assets/part-maps/remobra-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 54, y: 55, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 61, y: 36, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 75, y: 65, labelX: 50, labelY: 88, kind: 'neutral' },
    ],
  },
  'mhgu-64bd6': {
    image: 'assets/part-maps/hermitaur-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 55, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-6e9b6': {
    image: 'assets/part-maps/ceanataur-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 53, y: 52, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-69b46': {
    image: 'assets/part-maps/blango-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 51, y: 53, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-65b76': {
    image: 'assets/part-maps/rhenoplos-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 56, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 30, y: 55, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-60a36': {
    image: 'assets/part-maps/bnahabra-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 57, y: 59, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-68b46': {
    image: 'assets/part-maps/altaroth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 48, y: 55, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-6de86': {
    image: 'assets/part-maps/jaggi-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 55, y: 53, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-67bb6': {
    image: 'assets/part-maps/jaggia-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 53, y: 52, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-6b396': {
    image: 'assets/part-maps/ludroth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 54, y: 51, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 77, y: 41, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-6ad56': {
    image: 'assets/part-maps/uroktor-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 54, y: 48, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 80, y: 49, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-63406': {
    image: 'assets/part-maps/slagtoth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 50, y: 50, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 78, y: 46, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-634d6': {
    image: 'assets/part-maps/gargwa-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 53, y: 51, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-64e46': {
    image: 'assets/part-maps/zamite-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 50, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 77, y: 54, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-6e8d6': {
    image: 'assets/part-maps/konchu-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 55, y: 54, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-69d96': {
    image: 'assets/part-maps/maccao-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 51, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-65936': {
    image: 'assets/part-maps/larinoth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 48, y: 48, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 80, y: 62, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-60d06': {
    image: 'assets/part-maps/moofah-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 53, y: 52, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-69889': {
    image: 'assets/part-maps/great-thunderbug-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 54, y: 53, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-65ee3': {
    image: 'assets/part-maps/conga-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 52, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-60036': {
    image: 'assets/part-maps/great-maccao-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 13, y: 27, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 52, y: 49, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 86, y: 55, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-64dd6': {
    image: 'assets/part-maps/velocidrome-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 85, y: 18, labelX: 78, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 49, y: 50, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
    ],
  },
  'mhgu-60b36': {
    image: 'assets/part-maps/bulldrome-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 46, labelX: 22, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 38, y: 66, labelX: 78, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-6d786': {
    image: 'assets/part-maps/seltas-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 53, y: 50, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 76, y: 29, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 38, y: 62, labelX: 18, labelY: 78, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 52, y: 73, labelX: 82, labelY: 78, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 57, y: 55, labelX: 50, labelY: 15, kind: 'neutral' },
    ],
  },
  'mhgu-65376': {
    image: 'assets/part-maps/seltas-queen-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 52, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 58, y: 58, labelX: 50, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 53, y: 68, labelX: 50, labelY: 84, kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 20, y: 25, labelX: 82, labelY: 84, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 35, y: 65, labelX: 15, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 70, y: 65, labelX: 85, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 39, y: 78, labelX: 20, labelY: 84, side: 'left', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 72, y: 78, labelX: 80, labelY: 84, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-65776': {
    image: 'assets/part-maps/arzuros-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 16, y: 50, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 55, y: 45, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 38, y: 69, labelX: 15, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 82, y: 52, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 66, y: 73, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-60e36': {
    image: 'assets/part-maps/redhelm-arzuros-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 76, y: 39, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 48, y: 47, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 70, y: 69, labelX: 85, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 22, y: 66, labelX: 15, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 48, y: 76, labelX: 20, labelY: 82, side: 'left', kind: 'breakable' },
    ],
  },
  'mhgu-64d84': {
    image: 'assets/part-maps/giadrome-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 35, y: 40, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 67, y: 57, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-6eab6': {
    image: 'assets/part-maps/gendrome-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 76, y: 29, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 51, y: 57, labelX: 20, labelY: 15, side: 'left', kind: 'neutral' },
    ],
  },
  'mhgu-65e76': {
    image: 'assets/part-maps/cephadrome-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 68, y: 55, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 58, y: 57, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 54, y: 38, labelX: 20, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 60, y: 60, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 22, y: 40, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 43, y: 73, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 88, y: 65, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
    ],
  },
  'mhgu-a67b6': {
    image: 'assets/part-maps/yian-kut-ku-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 14, y: 59, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 29, y: 51, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 50, y: 38, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 46, y: 61, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 78, y: 66, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 67, y: 31, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 42, y: 75, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
    ],
  },
  'mhgu-69846': {
    image: 'assets/part-maps/iodrome-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 9, y: 47, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 54, y: 50, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-6a756': {
    image: 'assets/part-maps/kecha-wacha-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 67, y: 42, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 53, y: 57, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 26, y: 61, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 25, y: 72, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 76, y: 68, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 82, y: 84, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-68a46': {
    image: 'assets/part-maps/lagombi-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 26, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 51, y: 56, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 31, y: 27, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 28, y: 69, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 65, y: 70, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-6db86': {
    image: 'assets/part-maps/snowbaron-lagombi-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 73, y: 57, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 67, y: 65, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 75, y: 43, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 36, y: 49, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 74, y: 86, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-a6b96': {
    image: 'assets/part-maps/gypceros-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 51, y: 23, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 51, y: 38, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 49, y: 56, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 53, y: 67, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 20, y: 62, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 80, y: 30, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 53, y: 84, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-63906': {
    image: 'assets/part-maps/tetsucabra-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 29, y: 25, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 39, y: 36, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 64, y: 48, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 25, y: 82, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 77, y: 83, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 80, y: 57, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 19, y: 58, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
    ],
  },
  'mhgu-64ad6': {
    image: 'assets/part-maps/drilltusk-tetsucabra-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 27, y: 27, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 39, y: 40, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 65, y: 49, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 26, y: 83, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 84, y: 84, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 82, y: 62, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 18, y: 57, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
    ],
  },
  'mhgu-6da86': {
    image: 'assets/part-maps/daimyo-hermitaur-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 52, y: 52, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 61, y: 59, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 78, y: 31, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 82, y: 70, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 27, y: 68, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 68, y: 58, labelX: 50, labelY: 82, kind: 'breakable' },
    ],
  },
  'mhgu-67db6': {
    image: 'assets/part-maps/stonefist-hermitaur-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 50, y: 56, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 61, y: 65, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 52, y: 28, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 22, y: 82, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 83, y: 56, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 38, y: 72, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 45, y: 64, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 85, y: 82, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-674b6': {
    image: 'assets/part-maps/volvidon-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 15, y: 38, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 1, valuePartIndex: 1, x: 55, y: 47, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 48, y: 76, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 85, y: 66, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 67, y: 78, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 50, y: 58, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 57, y: 27, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-63d0d': {
    image: 'assets/part-maps/congalala-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 80, y: 49, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 74, y: 56, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 36, y: 80, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 54, y: 59, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 28, y: 28, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-6d586': {
    image: 'assets/part-maps/royal-ludroth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 83, y: 37, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 62, y: 69, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 54, y: 31, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 58, y: 48, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 78, y: 72, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 35, y: 78, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 15, y: 61, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
    ],
  },
  'mhgu-69879': {
    image: 'assets/part-maps/barroth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 28, y: 38, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 55, y: 55, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 49, y: 66, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 34, y: 83, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 73, y: 84, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 78, y: 58, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-6eed6': {
    image: 'assets/part-maps/basarios-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 17, y: 29, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 22, y: 45, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 48, y: 36, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 52, y: 63, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 78, y: 68, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 37, y: 48, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 51, y: 85, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 92, y: 66, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-6b796': {
    image: 'assets/part-maps/malfestio-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 50, y: 20, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 50, y: 53, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 72, y: 55, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 34, y: 70, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 50, y: 86, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 83, y: 77, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-6dade': {
    image: 'assets/part-maps/nightcloak-malfestio-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 51, y: 28, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 55, y: 55, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 69, y: 54, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 35, y: 65, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 52, y: 86, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 87, y: 73, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-6e7b6': {
    image: 'assets/part-maps/zamtrios-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 45, y: 65, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 61, y: 58, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 61, y: 43, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 48, y: 70, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 77, y: 72, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 27, y: 70, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 86, y: 58, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 58, y: 75, labelX: 50, labelY: 82, kind: 'neutral' },
    ],
  },
  'mhgu-d6d86': {
    image: 'assets/part-maps/khezu-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 20, y: 58, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 45, y: 50, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 56, y: 42, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 75, y: 77, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 20, y: 30, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 78, y: 57, labelX: 50, labelY: 82, kind: 'neutral' },
    ],
  },
  'mhgu-60750': {
    image: 'assets/part-maps/nerscylla-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 56, y: 47, labelX: 50, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 45, y: 40, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 64, y: 53, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 64, y: 67, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 29, y: 35, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 83, y: 69, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 39, y: 76, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
    ],
  },
  'mhgu-464d6': {
    image: 'assets/part-maps/rathian-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 57, y: 67, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 59, y: 48, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 51, y: 54, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 58, y: 68, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 87, y: 35, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 24, y: 35, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 68, y: 84, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-06eb6': {
    image: 'assets/part-maps/gold-rathian-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 38, y: 33, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 45, y: 48, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 62, y: 45, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 54, y: 63, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 83, y: 70, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 72, y: 35, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 71, y: 84, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 91, y: 68, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-76946': {
    image: 'assets/part-maps/dreadqueen-rathian-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 24, y: 65, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 78, y: 37, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 57, y: 52, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 58, y: 69, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 88, y: 55, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 25, y: 28, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 68, y: 87, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 95, y: 27, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-d6576': {
    image: 'assets/part-maps/rathalos-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 53, y: 55, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 58, y: 52, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 58, y: 41, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 59, y: 63, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 30, y: 68, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 78, y: 50, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 52, y: 70, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
    ],
  },
  'mhgu-06036': {
    image: 'assets/part-maps/silver-rathalos-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 62, y: 56, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 58, y: 50, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 57, y: 38, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 59, y: 64, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 73, y: 76, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 27, y: 37, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 64, y: 70, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 88, y: 79, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-d6846': {
    image: 'assets/part-maps/dreadking-rathalos-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 58, y: 65, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 54, y: 59, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 58, y: 47, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 62, y: 68, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 25, y: 73, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 75, y: 31, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 56, y: 77, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 12, y: 82, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
    ],
  },
  'mhgu-63706': {
    image: 'assets/part-maps/nibelsnarf-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 82, y: 45, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 45, y: 55, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 52, y: 28, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 54, y: 65, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 86, y: 43, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 68, y: 62, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 77, y: 57, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 88, y: 60, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-76a56': {
    image: 'assets/part-maps/plesioth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 78, y: 48, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 66, y: 45, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 50, y: 27, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 59, y: 56, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 28, y: 22, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 51, y: 65, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 82, y: 83, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-6a056': {
    image: 'assets/part-maps/blangonga-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 31, y: 31, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 32, y: 70, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 70, y: 78, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 55, y: 52, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 85, y: 64, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-6ba96': {
    image: 'assets/part-maps/lavasioth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 15, y: 49, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 28, y: 48, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 45, y: 30, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 52, y: 56, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 89, y: 55, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 63, y: 54, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 72, y: 55, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-6bb96': {
    image: 'assets/part-maps/shogun-ceanataur-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 76, y: 48, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 61, y: 55, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 73, y: 35, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 82, y: 70, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 55, y: 65, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 51, y: 50, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 73, y: 37, labelX: 50, labelY: 82, kind: 'breakable' },
    ],
  },
  'mhgu-6a044': {
    image: 'assets/part-maps/rustrazor-ceanataur-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 84, y: 54, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 62, y: 58, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 73, y: 35, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 48, y: 76, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 50, y: 68, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 48, y: 54, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 75, y: 45, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 59, y: 78, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-69a46': {
    image: 'assets/part-maps/najarala-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 66, y: 28, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 54, y: 44, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 54, y: 63, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 48, y: 43, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 24, y: 56, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 84, y: 69, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 89, y: 77, labelX: 50, labelY: 82, kind: 'neutral' },
    ],
  },
  'mhgu-6a856': {
    image: 'assets/part-maps/nargacuga-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 25, y: 69, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 47, y: 63, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 58, y: 71, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 42, y: 54, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 72, y: 73, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 50, y: 78, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 85, y: 35, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 91, y: 12, labelX: 50, labelY: 82, kind: 'breakable' },
    ],
  },
  'mhgu-63506': {
    image: 'assets/part-maps/silverwind-nargacuga-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 55, y: 52, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 45, y: 55, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 56, y: 70, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 24, y: 31, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 62, y: 70, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 42, y: 70, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 17, y: 70, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 8, y: 83, labelX: 50, labelY: 82, kind: 'breakable' },
    ],
  },
  'mhgu-60736': {
    image: 'assets/part-maps/yian-garuga-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 86, y: 52, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 75, y: 45, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 54, y: 31, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 68, y: 59, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 17, y: 25, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 43, y: 18, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 48, y: 75, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
    ],
  },
  'mhgu-68046': {
    image: 'assets/part-maps/deadeye-yian-garuga-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 23, y: 68, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 52, y: 47, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 62, y: 23, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 55, y: 55, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 87, y: 50, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 30, y: 25, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 49, y: 76, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
    ],
  },
  'mhgu-65076': {
    image: 'assets/part-maps/uragaan-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 15, y: 39, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 28, y: 48, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 55, y: 34, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 46, y: 60, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 39, y: 73, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 58, y: 80, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 83, y: 58, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 95, y: 58, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
    ],
  },
  'mhgu-60436': {
    image: 'assets/part-maps/crystalbeard-uragaan-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 16, y: 38, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 29, y: 51, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 55, y: 39, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 49, y: 63, labelX: 50, labelY: 82, kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 36, y: 74, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 59, y: 81, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 84, y: 56, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 95, y: 46, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
    ],
  },
  'mhgu-68346': {
    image: 'assets/part-maps/lagiacrus-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 79, y: 16, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 70, y: 45, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 62, y: 60, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 52, y: 40, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 72, y: 78, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 19, y: 55, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 44, y: 78, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
    ],
  },
  'mhgu-647d6': {
    image: 'assets/part-maps/zinogre-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 37, y: 20, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 56, y: 49, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 65, y: 58, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 78, y: 75, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 35, y: 76, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 63, y: 40, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 24, y: 60, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 13, y: 62, labelX: 50, labelY: 82, kind: 'breakable' },
    ],
  },
  'mhgu-6e0b6': {
    image: 'assets/part-maps/thunderlord-zinogre-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 17, y: 61, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 54, y: 53, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 55, y: 34, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 78, y: 75, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 38, y: 76, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 64, y: 44, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 80, y: 23, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 94, y: 16, labelX: 50, labelY: 82, kind: 'breakable' },
    ],
  },
  'mhgu-6ea4d': {
    image: 'assets/part-maps/barioth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 55, y: 37, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 50, y: 30, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 60, y: 57, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 26, y: 35, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 38, y: 60, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 52, y: 78, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 87, y: 75, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-6e5b6': {
    image: 'assets/part-maps/mizutsune-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 82, y: 27, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 72, y: 64, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 58, y: 78, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 56, y: 55, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 16, y: 51, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 75, y: 68, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 73, y: 41, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 54, y: 43, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
    ],
  },
  'mhgu-6bbe8': {
    image: 'assets/part-maps/soulseer-mizutsune-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 28, y: 18, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 33, y: 56, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 55, y: 63, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 48, y: 45, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 77, y: 65, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 52, y: 56, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 31, y: 31, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 54, y: 38, labelX: 50, labelY: 82, kind: 'breakable' },
    ],
  },
  'mhgu-649d6': {
    image: 'assets/part-maps/astalos-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 78, y: 48, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 66, y: 62, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 55, y: 45, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 30, y: 40, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 63, y: 75, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 45, y: 66, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 27, y: 65, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 86, y: 31, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
    ],
  },
  'mhgu-67d50': {
    image: 'assets/part-maps/boltreaver-astalos-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 47, y: 42, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 49, y: 57, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 50, y: 35, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 27, y: 35, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 46, y: 75, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 50, y: 80, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 39, y: 89, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-69e46': {
    image: 'assets/part-maps/gammoth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 70, y: 43, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 73, y: 54, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 63, y: 80, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 79, y: 80, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 27, y: 80, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 45, y: 80, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 18, y: 60, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 51, y: 56, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
    ],
  },
  'mhgu-6a004': {
    image: 'assets/part-maps/elderfrost-gammoth-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 54, y: 37, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 30, y: 60, labelX: 50, labelY: 15, kind: 'breakable' },
      { partIndex: 2, valuePartIndex: 2, x: 46, y: 77, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 72, y: 80, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 23, y: 70, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 39, y: 80, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 12, y: 55, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 55, y: 54, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
    ],
  },
  'mhgu-6aa56': {
    image: 'assets/part-maps/glavenus-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 15, y: 69, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 25, y: 60, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 55, y: 54, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 58, y: 65, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 45, y: 80, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 78, y: 80, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 88, y: 60, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 88, y: 27, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      { partIndex: 8, valuePartIndex: 8, x: 83, y: 25, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 9, valuePartIndex: 9, x: 77, y: 33, labelX: 62, labelY: 82, kind: 'breakable' },
      { partIndex: 10, valuePartIndex: 10, x: 72, y: 40, labelX: 38, labelY: 82, kind: 'breakable' },
    ],
  },
  'mhgu-63a06': {
    image: 'assets/part-maps/hellblade-glavenus-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 72, y: 27, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 65, y: 45, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 70, y: 35, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 3, valuePartIndex: 3, x: 55, y: 55, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 4, valuePartIndex: 4, x: 53, y: 80, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 82, y: 80, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 24, y: 55, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 7, valuePartIndex: 7, x: 18, y: 45, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
  'mhgu-677b6': {
    image: 'assets/part-maps/agnaktor-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 16, y: 62, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 28, y: 50, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 42, y: 57, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 55, y: 62, labelX: 50, labelY: 82, kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 60, y: 35, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
      { partIndex: 5, valuePartIndex: 5, x: 45, y: 75, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
      { partIndex: 6, valuePartIndex: 6, x: 73, y: 75, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
      { partIndex: 7, valuePartIndex: 7, x: 90, y: 45, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
    ],
  },
    'mhgu-60336': {
      image: 'assets/part-maps/gore-magala-mhgu-hunter-notes-v1.png',
    anchors: [
      { partIndex: 0, valuePartIndex: 0, x: 72, y: 78, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
      { partIndex: 1, valuePartIndex: 1, x: 64, y: 68, labelX: 50, labelY: 15, kind: 'neutral' },
      { partIndex: 2, valuePartIndex: 2, x: 60, y: 60, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
      { partIndex: 3, valuePartIndex: 3, x: 60, y: 74, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
      { partIndex: 4, valuePartIndex: 4, x: 78, y: 84, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
      { partIndex: 5, valuePartIndex: 5, x: 45, y: 88, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
      { partIndex: 6, valuePartIndex: 6, x: 37, y: 35, labelX: 50, labelY: 82, kind: 'breakable' },
        { partIndex: 7, valuePartIndex: 7, x: 24, y: 82, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-680d5': {
      image: 'assets/part-maps/chaotic-gore-magala-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 49, y: 34, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 67, y: 46, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 63, y: 61, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 57, y: 69, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 72, y: 72, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 60, y: 84, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 78, y: 38, labelX: 50, labelY: 82, kind: 'breakable' },
        { partIndex: 7, valuePartIndex: 7, x: 35, y: 81, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-67eb6': {
      image: 'assets/part-maps/seregios-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 37, y: 54, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 45, y: 53, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 66, y: 43, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 57, y: 63, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 20, y: 80, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 17, y: 58, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 48, y: 67, labelX: 50, labelY: 82, kind: 'neutral' },
        { partIndex: 7, valuePartIndex: 7, x: 84, y: 44, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      ],
    },
    'mhgu-6ab56': {
      image: 'assets/part-maps/duramboros-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 13, y: 54, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
        { partIndex: 1, valuePartIndex: 1, x: 21, y: 59, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 49, y: 57, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 36, y: 29, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 44, y: 76, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 66, y: 73, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 82, y: 58, labelX: 50, labelY: 82, kind: 'breakable' },
        { partIndex: 7, valuePartIndex: 7, x: 93, y: 66, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-68746': {
      image: 'assets/part-maps/tigrex-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 52, y: 20, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 64, y: 35, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 64, y: 62, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 71, y: 44, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 26, y: 73, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 53, y: 78, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 82, y: 69, labelX: 50, labelY: 82, kind: 'neutral' },
      ],
    },
    'mhgu-6d486': {
      image: 'assets/part-maps/grimclaw-tigrex-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 10, y: 30, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 28, y: 40, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 44, y: 56, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 50, y: 35, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 83, y: 60, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 50, y: 83, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 64, y: 77, labelX: 50, labelY: 82, kind: 'neutral' },
        { partIndex: 7, valuePartIndex: 7, x: 32, y: 78, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-69596': {
      image: 'assets/part-maps/gravios-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 47, y: 22, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 49, y: 63, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 70, y: 43, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 57, y: 58, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 84, y: 40, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 27, y: 40, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 32, y: 84, labelX: 50, labelY: 82, kind: 'neutral' },
        { partIndex: 7, valuePartIndex: 7, x: 73, y: 84, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      ],
    },
    'mhgu-65836': {
      image: 'assets/part-maps/diablos-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 42, y: 70, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 48, y: 55, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 61, y: 42, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 57, y: 61, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 77, y: 45, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 61, y: 82, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 29, y: 38, labelX: 50, labelY: 82, kind: 'breakable' },
        { partIndex: 7, valuePartIndex: 7, x: 79, y: 28, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-60806': {
      image: 'assets/part-maps/bloodbath-diablos-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 37, y: 48, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
        { partIndex: 1, valuePartIndex: 1, x: 44, y: 46, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 61, y: 41, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 55, y: 64, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 79, y: 35, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 52, y: 83, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 18, y: 37, labelX: 50, labelY: 82, kind: 'breakable' },
        { partIndex: 7, valuePartIndex: 7, x: 86, y: 73, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-63d06': {
      image: 'assets/part-maps/kirin-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 28, y: 42, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 53, y: 55, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 67, y: 64, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 45, y: 79, labelX: 50, labelY: 82, kind: 'neutral' },
      ],
    },
    'mhgu-6b096': {
      image: 'assets/part-maps/brachydios-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 48, y: 33, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
        { partIndex: 1, valuePartIndex: 1, x: 45, y: 30, labelX: 50, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 56, y: 53, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 73, y: 70, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 40, y: 78, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 25, y: 68, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 14, y: 45, labelX: 50, labelY: 82, kind: 'breakable' },
      ],
    },
    'mhgu-65ed3': {
      image: 'assets/part-maps/raging-brachydios-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 57, y: 42, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
        { partIndex: 1, valuePartIndex: 1, x: 60, y: 43, labelX: 50, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 51, y: 58, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 74, y: 70, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 39, y: 77, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 24, y: 71, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 16, y: 42, labelX: 50, labelY: 82, kind: 'neutral' },
        { partIndex: 7, valuePartIndex: 7, x: 84, y: 50, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      ],
    },
    'mhgu-68946': {
      image: 'assets/part-maps/shagaru-magala-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 40, y: 52, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 45, y: 57, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 49, y: 66, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 61, y: 42, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 47, y: 76, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 30, y: 81, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 73, y: 34, labelX: 50, labelY: 82, kind: 'breakable' },
        { partIndex: 7, valuePartIndex: 7, x: 38, y: 86, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-63ddd': {
      image: 'assets/part-maps/valstrax-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 76, y: 55, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 67, y: 55, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 60, y: 64, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 47, y: 48, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 74, y: 76, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 51, y: 78, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 38, y: 34, labelX: 50, labelY: 82, kind: 'neutral' },
        { partIndex: 7, valuePartIndex: 7, x: 28, y: 67, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-63306': {
      image: 'assets/part-maps/rajang-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 50, y: 64, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 26, y: 53, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 54, y: 80, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 50, y: 49, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 70, y: 60, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-644d6': {
      image: 'assets/part-maps/furious-rajang-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 87, y: 48, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 73, y: 69, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 61, y: 80, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 70, y: 59, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 39, y: 49, labelX: 50, labelY: 82, kind: 'breakable' },
      ],
    },
    'mhgu-6edb6': {
      image: 'assets/part-maps/deviljho-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 81, y: 24, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 68, y: 50, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 57, y: 58, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 73, y: 70, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 50, y: 81, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 20, y: 49, labelX: 50, labelY: 82, kind: 'breakable' },
      ],
    },
    'mhgu-69446': {
      image: 'assets/part-maps/savage-deviljho-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 18, y: 52, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 49, y: 61, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 62, y: 55, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 42, y: 72, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 75, y: 74, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 88, y: 62, labelX: 50, labelY: 82, kind: 'breakable' },
      ],
    },
    'mhgu-6ebb6': {
      image: 'assets/part-maps/kushala-daora-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 79, y: 30, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 73, y: 38, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 61, y: 58, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 55, y: 46, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 28, y: 76, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 67, y: 75, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 52, y: 74, labelX: 50, labelY: 82, kind: 'neutral' },
        { partIndex: 7, valuePartIndex: 7, x: 30, y: 34, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-69346': {
      image: 'assets/part-maps/chameleos-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 91, y: 53, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 69, y: 62, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 61, y: 43, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 74, y: 75, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 51, y: 81, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 54, y: 38, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 23, y: 63, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-65a76': {
      image: 'assets/part-maps/teostra-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 48, y: 34, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 51, y: 52, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 62, y: 54, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 83, y: 63, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 44, y: 78, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 65, y: 79, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 25, y: 42, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-68e56': {
      image: 'assets/part-maps/lao-shan-lung-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 12, y: 22, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 24, y: 42, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 34, y: 48, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 53, y: 38, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 64, y: 53, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 47, y: 63, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 77, y: 60, labelX: 50, labelY: 82, kind: 'neutral' },
        { partIndex: 7, valuePartIndex: 7, x: 28, y: 78, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      ],
    },
    'mhgu-678b6': {
      image: 'assets/part-maps/akantor-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 70, y: 54, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 60, y: 48, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 59, y: 64, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 52, y: 37, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 28, y: 46, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 72, y: 78, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 47, y: 83, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      ],
    },
    'mhgu-640d6': {
      image: 'assets/part-maps/ukanlos-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 76, y: 49, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 58, y: 48, labelX: 50, labelY: 15, kind: 'neutral' },
        { partIndex: 2, valuePartIndex: 2, x: 47, y: 62, labelX: 18, labelY: 15, side: 'left', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 31, y: 73, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 67, y: 78, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 53, y: 66, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 19, y: 66, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-69946': {
      image: 'assets/part-maps/amatsu-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 34, y: 51, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 43, y: 48, labelX: 50, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 62, y: 47, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 61, y: 35, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 53, y: 62, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 48, y: 57, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 73, y: 58, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-65576': {
      image: 'assets/part-maps/nakarkos-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 59, y: 49, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 75, y: 66, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 31, y: 47, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 80, y: 30, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 56, y: 70, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 44, y: 60, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 41, y: 32, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-64dd4': {
      image: 'assets/part-maps/ahtal-neset-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 50, y: 44, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 25, y: 61, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 76, y: 56, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 48, y: 35, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 38, y: 78, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 64, y: 78, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 87, y: 41, labelX: 50, labelY: 82, kind: 'breakable' },
        { partIndex: 7, valuePartIndex: 7, x: 72, y: 82, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-6eaad': {
      image: 'assets/part-maps/ahtal-ka-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 45, y: 49, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 30, y: 62, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 58, y: 53, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 69, y: 34, labelX: 18, labelY: 50, side: 'left', kind: 'breakable' },
        { partIndex: 4, valuePartIndex: 4, x: 50, y: 59, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 67, y: 78, labelX: 18, labelY: 82, side: 'left', kind: 'neutral' },
        { partIndex: 6, valuePartIndex: 6, x: 84, y: 69, labelX: 82, labelY: 82, side: 'right', kind: 'breakable' },
      ],
    },
    'mhgu-6bd96': {
      image: 'assets/part-maps/alatreon-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 49, y: 33, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 50, y: 45, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 51, y: 58, labelX: 82, labelY: 15, side: 'right', kind: 'neutral' },
        { partIndex: 3, valuePartIndex: 3, x: 30, y: 43, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 51, y: 76, labelX: 82, labelY: 50, side: 'right', kind: 'neutral' },
        { partIndex: 5, valuePartIndex: 5, x: 69, y: 74, labelX: 50, labelY: 82, kind: 'breakable' },
      ],
    },
    'mhgu-6d3e6': {
      image: 'assets/part-maps/fatalis-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 50, y: 26, labelX: 50, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 50, y: 30, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 50, y: 40, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 50, y: 58, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 24, y: 74, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 72, y: 44, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 50, y: 70, labelX: 50, labelY: 82, kind: 'neutral' },
        { partIndex: 7, valuePartIndex: 7, x: 82, y: 78, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      ],
    },
    'mhgu-67306': {
      image: 'assets/part-maps/crimson-fatalis-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 50, y: 39, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 50, y: 41, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 50, y: 49, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 50, y: 61, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 31, y: 71, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 68, y: 46, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 50, y: 72, labelX: 50, labelY: 82, kind: 'neutral' },
        { partIndex: 7, valuePartIndex: 7, x: 82, y: 72, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
      ],
    },
    'mhgu-6b886': {
      image: 'assets/part-maps/old-fatalis-mhgu-hunter-notes-v1.png',
      anchors: [
        { partIndex: 0, valuePartIndex: 0, x: 50, y: 37, labelX: 50, labelY: 15, kind: 'breakable' },
        { partIndex: 1, valuePartIndex: 1, x: 50, y: 39, labelX: 18, labelY: 15, side: 'left', kind: 'breakable' },
        { partIndex: 2, valuePartIndex: 2, x: 50, y: 47, labelX: 82, labelY: 15, side: 'right', kind: 'breakable' },
        { partIndex: 3, valuePartIndex: 3, x: 50, y: 58, labelX: 18, labelY: 50, side: 'left', kind: 'neutral' },
        { partIndex: 4, valuePartIndex: 4, x: 26, y: 76, labelX: 82, labelY: 50, side: 'right', kind: 'breakable' },
        { partIndex: 5, valuePartIndex: 5, x: 73, y: 45, labelX: 18, labelY: 82, side: 'left', kind: 'breakable' },
        { partIndex: 6, valuePartIndex: 6, x: 50, y: 72, labelX: 50, labelY: 82, kind: 'neutral' },
        { partIndex: 7, valuePartIndex: 7, x: 82, y: 75, labelX: 82, labelY: 82, side: 'right', kind: 'neutral' },
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
    return `<button class="part-callout ${side} is-${kind}" style="--part-x:${anchor.x}%;--part-y:${anchor.y}%;--callout-x:${anchor.labelX ?? anchor.x}%;--callout-y:${anchor.labelY ?? anchor.y}%" data-part-index="${anchor.partIndex}"><strong>${escapeHtml(ptPart(part.name, monster))}</strong><small>${escapeHtml(flags || 'parte')}</small><em>${escapeHtml(partValueSummary(valuePart || part))}</em>${part.breakThresholds?.length ? `<span>Limiar ${part.breakThresholds.join('/')}</span>` : ''}</button>`;
  }).join('');
  const connectors = anchors.map((anchor) => `<line x1="${anchor.x}" y1="${anchor.y}" x2="${anchor.labelX ?? anchor.x}" y2="${anchor.labelY ?? anchor.y}" /><circle cx="${anchor.x}" cy="${anchor.y}" r=".8" />`).join('');
  const legend = '<div class="part-map-legend"><span>Linhas indicam a parte correspondente</span><span>Valores: Corte · Impacto · Munição</span></div>';
  const status = partMapImage && anchors.length ? '' : '<div class="part-map-pending"><strong>Mapa anatômico individual em validação</strong><small>As caixas só aparecem quando a arte e as coordenadas das partes deste monstro forem conferidas. Nenhum mapa de outra espécie é reutilizado.</small></div>';
  return `<div class="part-map"><div class="part-map-stage">${partMapImage ? `<img src="${escapeHtml(partMapImage)}" alt="Mapa ilustrado de partes de ${escapeHtml(monster.name)}" />` : ''}${status}<svg class="part-map-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${connectors}</svg>${labels}</div>${legend}</div>`;
}
function renderBestiary() {
  clearDetailHeader();
  viewRoot.classList.add('bestiary-view-root');
  document.querySelector('.section-kicker').textContent = "HUNTER'S FIELD GUIDE";
  viewTitle.textContent = 'Monsterpedia';
  viewRoot.innerHTML = `<div class="toolbar"><label class="field"><span class="field-label">${mhIcon('game')}Jogo</span>${selectHtml('monster-game', ['Todos os jogos', ...games], 'Todos os jogos')}</label><label class="field"><span class="field-label">${mhIcon('size')}Porte</span>${selectHtml('monster-size', ['Todos os portes', 'Grandes', 'Pequenos'], 'Todos os portes')}</label><label class="field"><span class="field-label">${mhIcon('rank')}Rank</span>${selectHtml('monster-rank', ['Todos os ranks', 'Baixo', 'Alto', 'Mestre/G'], 'Todos os ranks')}</label><label class="field"><span class="field-label">${mhIcon('favorite')}Favoritos</span>${selectHtml('monster-favorites', ['Todos os monstros', 'Somente favoritos'], 'Todos os monstros')}</label><label class="field search-field"><span class="field-label">${mhIcon('search')}Pesquisar monstro</span><span class="input-with-icon">${mhIcon('search')}<input class="text-input" id="monster-search" placeholder="Nome do monstro" /></span></label><label class="spoiler-toggle">${mhIcon('compass')}<input type="checkbox" id="monster-spoilers" ${spoilerMode ? 'checked' : ''} /> Modo sem spoilers</label></div><div class="info-banner" id="monster-count">Catálogo carregado: World/Iceborne ${monsters.filter((monster) => monster.game === 'Monster Hunter: World').length} · Rise/Sunbreak ${monsters.filter((monster) => monster.game === 'Monster Hunter: Rise').length} · Wilds ${monsters.filter((monster) => monster.game === 'Monster Hunter: Wilds').length} · Generations Ultimate ${monsters.filter((monster) => monster.game === 'Monster Hunter: Generations Ultimate').length}</div><section class="material-search-card"><div class="section-heading"><h2><span class="section-icon">${mhIcon('material')}</span>BUSCA POR MATERIAL</h2><span>RESULTADOS DO CATÁLOGO LOCAL</span></div><div class="material-search-copy"><p class="muted-inline">Digite um material para descobrir quais monstros o fornecem.</p><span class="input-with-icon material-input-wrap">${mhIcon('search')}<input class="text-input material-search-input" id="material-search" placeholder="Digite um material para começar" autocomplete="off" /></span></div><div id="material-results" class="material-results"><div class="empty-state material-empty-state"><span class="result-marker"></span></div></div></section><div id="monster-grid" class="card-grid">${monsterCards(monsters)}</div>`;
  const materialHeading = viewRoot.querySelector('.material-search-card .section-heading');
  materialHeading.append(viewRoot.querySelector('.material-search-copy p'));
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
    document.querySelector('#material-results').innerHTML = materialResultCards(materialResults(filtered, document.querySelector('#material-search').value, rankKey), document.querySelector('#material-search').value);
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
function rewardRank(value) {
  const key = String(value || '').toLowerCase().replace(/[ _-]/g, '');
  return ({ low: 'low', lowrank: 'low', lr: 'low', high: 'high', highrank: 'high', hr: 'high', master: 'master', masterrank: 'master', mr: 'master', g: 'master', grank: 'master' })[key] || key;
}
function rewardItemIcon(reward) {
  if (reward.iconAsset) return `<img src="${escapeHtml(reward.iconAsset)}" alt="" loading="lazy" />`;
  const name = String(reward.item).toLowerCase();
  const icon = /scale|shard/.test(name) ? 'scale' : /carapace|shell|cortex/.test(name) ? 'shell' : /wing|talon|claw/.test(name) ? 'wing' : /tail/.test(name) ? 'tail' : /gem|ruby|crystal|plate/.test(name) ? 'gem' : 'material';
  return mhIcon(icon);
}
function detailRewardsMarkup(monster, rank) {
  const explicit = monster.rankData?.[rank]?.rewards;
  const rewards = explicit || (monster.rewards || []).filter((reward) => reward.conditions?.some((condition) => rewardRank(condition.rank) === rank));
  return rewards.map((reward) => {
    const conditions = (reward.conditions || []).filter((c) => !c.rank || rewardRank(c.rank) === rank);
    if (reward.conditions?.length && !conditions.length) return '';
    const primary = conditions.find((c) => /carve|reward|target/.test(c.type)) || conditions[0];
    const labels = { reward: 'Recompensa', 'target rewards': 'Alvo', 'target-reward': 'Alvo', carve: 'Entalhe', carves: 'Entalhe', 'broken-part': 'Quebra', 'broken part rewards': 'Quebra', 'capture rewards': 'Captura', wound: 'Ferimento', shiny: 'Coleta', track: 'Rastro', palico: 'Amigato', plunderblade: 'Lâmina de pilhagem', investigation: 'Investigação' };
    const method = (c) => c ? `${labels[c.type] || pt(c.type)}${c.part ? ` (${ptPart(c.part, monster)})` : ''}` : 'Indisponível';
    return `<details class="reward-row"><summary><span class="reward-item"><span class="reward-symbol" aria-hidden="true">${rewardItemIcon(reward)}</span><span>${escapeHtml(ptMaterial(reward.item, monster))}</span></span><span>${primary?.chance != null ? `${primary.chance}%` : '—'}</span><span class="reward-origin">${escapeHtml(method(primary))}</span><span class="reward-chevron" aria-hidden="true">⌄</span></summary><div class="reward-conditions">${conditions.length ? conditions.map((c) => `<div><span>${escapeHtml(method(c))}${c.quantity != null ? ` · ×${c.quantity}` : ''}</span><strong>${c.chance != null ? `${c.chance}%` : 'Chance indisponível'}</strong></div>`).join('') : 'Condições não publicadas pela fonte.'}</div></details>`;
  }).join('') || '<p class="reward-empty">Recompensas não publicadas para este rank.</p>';
}
function renderMonsterDetail(monster, selectedRank = null) {
  viewRoot.classList.remove('hunter-profile-page');
  if (monster) recordActivity('monster', monster.name, monster.id, monster.game);
  window.__detailProvenanceResize?.disconnect?.();
  currentView = 'bestiary';
  document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === 'bestiary'));
  viewRoot.classList.remove('bestiary-view-root');
  viewRoot.classList.add('detail-view-root');
  const rankKeys = ['low', 'high', 'master'].filter((rank) => monster.ranks?.includes(rank));
  const hasRewards = (rank) => monster.rankData?.[rank]?.rewards?.length || monster.rewards?.some((reward) => reward.conditions?.some((c) => rewardRank(c.rank) === rank));
  const activeRank = rankKeys.includes(selectedRank) ? selectedRank : rankKeys.find(hasRewards) || rankKeys[0] || 'high';
  const rankData = monster.rankData?.[activeRank];
  const rankedHealth = rankData?.healthProfiles?.length ? rankData.healthProfiles : monster.healthProfiles;
  const healthLabel = monster.baseHealth != null ? 'Vida base' : 'Vida de referência';
  const healthValue = monster.baseHealth != null ? Number(monster.baseHealth).toLocaleString('pt-BR')
    : rankedHealth?.length ? `${Number(rankedHealth[0].health).toLocaleString('pt-BR')} · ${escapeHtml([rankedHealth[0].rank, rankedHealth[0].location].filter(Boolean).join(' · '))}` : 'Indisponível';
  const renderImage = monster.render || monster.imageFallback || monster.iconFallbackAsset;
  const renderStatus = monster.renderSource === 'monster-hunter-fandom-cross-game' ? `Render de outra edição (${monster.renderVariant || 'Fandom'})` : monster.render ? 'Render da edição selecionada' : 'Imagem de fallback';
  const render = renderImage ? `<img src="${escapeHtml(renderImage)}" alt="${escapeHtml(renderStatus)} de ${escapeHtml(monster.name)}" />` : '<div class="render-pending">Imagem indisponível</div>';
  const spoilerLocked = spoilerMode && !revealedSpoilerIds.has(monster.id);
  const spoilerBlock = '<div class="spoiler-locked"><strong>Conteúdo protegido pelo modo sem spoilers</strong><small>Revele para consultar estratégia e recompensas.</small><button class="primary-button reveal-spoilers">Revelar informações</button></div>';
  const sources = provenanceFor(monster).map((source) => `<a class="source-card" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer"><span class="source-emblem" aria-hidden="true">${mhIcon('database')}</span><div><strong>${escapeHtml(sourceLabel(source))}</strong><small>${escapeHtml(source.note || 'Fonte catalogada')}</small><small class="source-meta">${escapeHtml(monsterCatalog.schema)} · ${escapeHtml(catalogSyncLabel())} · licença: ${escapeHtml(source.license || 'não registrada')}</small></div><span class="source-game">${escapeHtml(monster.game.replace('Monster Hunter: ', ''))}</span></a>`).join('');
  const rankLabels = { low: 'Baixo', high: 'Alto', master: monster.gameKey === 'mhgu' ? 'G' : 'Mestre' };
  viewRoot.innerHTML = `<div class="monster-detail-shell">
    <aside class="detail-side detail-left">
      <section class="detail-card identification-card"><h3>Identificação</h3><div class="stat-grid">
        <div class="stat-box"><small>Espécie</small><strong>${escapeHtml(pt(monster.species))}</strong></div>
        <div class="stat-box"><small>Habitat</small><strong>${escapeHtml(monster.habitat)}</strong></div>
        <div class="stat-box"><small>${healthLabel}</small><strong>${healthValue}</strong></div>
        <div class="stat-box"><small>Tamanho e coroas</small><div class="stat-value crown-stat-value">${crownSummary(monster)}</div></div>
      </div></section>
      <section class="detail-card compact-card description-card"><h3>Descrição</h3><div class="detail-scroll"><p class="detail-description">${escapeHtml(monster.descriptionPt || 'Descrição indisponível.')}</p></div></section>
      <section class="detail-card compact-card useful-card"><h3>Informações úteis</h3><div class="detail-scroll">${spoilerLocked ? spoilerBlock : `<p class="detail-description">${escapeHtml(monster.ecologyPt?.usefulInfo || monster.ecologyPt?.characteristics || 'Informações úteis indisponíveis.')}</p>`}</div></section>
      <section class="detail-card provenance-card"><div class="section-heading"><h2>Procedência dos dados</h2><span>Fonte por domínio</span></div><div class="source-grid">${sources || '<p>Fontes não registradas.</p>'}<p class="provenance-note">Render: ${escapeHtml(renderStatus)}. Informações ausentes permanecem identificadas como indisponíveis.</p></div></section>
    </aside>
    <section class="detail-center">
      <section class="monster-render-panel"><div class="render-heading"><span>${escapeHtml(monster.game)}</span><span>${escapeHtml(monster.threat)}</span></div><div class="monster-detail-art" title="${escapeHtml(renderStatus)}">${render}</div><h1>${escapeHtml(monster.name)}</h1><p class="render-species">${escapeHtml(pt(monster.species))}</p><span class="render-flourish" aria-hidden="true">──── ◈ ────</span>${!monster.render || monster.renderSource === 'monster-hunter-fandom-cross-game' ? `<small class="render-status">${escapeHtml(renderStatus)}</small>` : ''}</section>
      <section class="detail-card center-part-map-card"><h3>Mapa de partes, hitzones e limiares</h3>${partMapMarkup(monster)}</section>
    </section>
    <aside class="detail-side detail-right">
      <section class="detail-card weakness-detail-card"><div class="weakness-heading"><h3>Fraquezas e pontos fracos</h3><button id="detail-toggle-favorite" class="ghost-button ${favoriteMonsterIds.has(monster.id) ? 'is-favorite' : ''}" aria-pressed="${favoriteMonsterIds.has(monster.id)}"><span aria-hidden="true">${favoriteMonsterIds.has(monster.id) ? '★' : '☆'}</span> ${favoriteMonsterIds.has(monster.id) ? 'Favorito' : 'Favoritar'}</button></div><div class="weakness-scroll">${weaknessVisual(monster)}</div></section>
      <section class="detail-card rewards-card"><h3>Recompensas e drops</h3><div class="reward-ranks" aria-label="Rank das recompensas">${rankKeys.map((rank) => `<button data-reward-rank="${rank}" aria-pressed="${rank === activeRank}">${rankLabels[rank]}</button>`).join('')}</div><div class="reward-table"><div class="reward-table-head"><span>Item</span><span>Chance</span><span>Origem</span><span></span></div><div class="reward-list">${spoilerLocked ? spoilerBlock : detailRewardsMarkup(monster, activeRank)}</div></div></section>
    </aside>
  </div>`;
  setDetailHeader(monster, activeRank);
  document.querySelector('#detail-toggle-favorite').addEventListener('click', (event) => {
    toggleMonsterFavorite(monster.id);
    const active = favoriteMonsterIds.has(monster.id);
    event.currentTarget.classList.toggle('is-favorite', active);
    event.currentTarget.setAttribute('aria-pressed', String(active));
    event.currentTarget.innerHTML = `<span aria-hidden="true">${active ? '★' : '☆'}</span> ${active ? 'Favorito' : 'Favoritar'}`;
  });
  viewRoot.querySelectorAll('[data-reward-rank]').forEach((button) => button.addEventListener('click', () => renderMonsterDetail(monster, button.dataset.rewardRank)));
  viewRoot.querySelectorAll('.reveal-spoilers').forEach((button) => button.addEventListener('click', () => { revealedSpoilerIds.add(monster.id); renderMonsterDetail(monster, activeRank); }));
  window.scrollTo(0, 0);
}
function renderOverlaySettings() { viewRoot.innerHTML = `<section class="settings-card"><h2>Overlay e widgets</h2><label class="switch-row"><span><strong>Modo de edição</strong><small>Permite ajustar a janela sobre o jogo</small></span><input id="edit-mode" type="checkbox" checked /></label><label class="switch-row"><span><strong>Clique-pass-through</strong><small>Deixa os cliques atravessarem o overlay</small></span><input id="click-through" type="checkbox" /></label><label class="range-row"><span><strong>Opacidade</strong></span><input id="opacity" type="range" min="25" max="100" value="94" /></label><div class="widget-toggles"><strong>Widgets visíveis</strong><label class="switch-row"><span><strong>Vida do monstro</strong><small>Vida, stamina, partes e anormalidades</small></span><input id="show-monster" type="checkbox" checked /></label><label class="switch-row"><span><strong>Medidor de dano</strong><small>DPS, participação, totais e gráfico</small></span><input id="show-damage" type="checkbox" checked /></label></div><div class="toolbar" style="margin-top:16px"><button data-delta="up" class="ghost-button">↑ Mover</button><button data-delta="down" class="ghost-button">↓ Mover</button><button data-delta="left" class="ghost-button">← Mover</button><button data-delta="right" class="ghost-button">Mover →</button><button data-delta="larger" class="ghost-button">＋ Aumentar</button><button data-delta="smaller" class="ghost-button">− Reduzir</button></div><div class="info-banner">O overlay real só será conectado após um adaptador de jogo validado. Esta tela controla a POC com dados simulados.</div></section>`; wireOverlayControls(); }
function wireOverlayControls() { document.querySelector('#edit-mode').addEventListener('change', (event) => window.hunterOverlay.setEditMode(event.target.checked)); document.querySelector('#click-through').addEventListener('change', (event) => window.hunterOverlay.setClickThrough(event.target.checked)); document.querySelector('#opacity').addEventListener('input', (event) => window.hunterOverlay.setOpacity(Number(event.target.value) / 100)); document.querySelector('#show-monster').addEventListener('change', (event) => window.hunterOverlay.setWidgetVisibility('monster', event.target.checked)); document.querySelector('#show-damage').addEventListener('change', (event) => window.hunterOverlay.setWidgetVisibility('damage', event.target.checked)); document.querySelectorAll('[data-delta]').forEach((button) => button.addEventListener('click', () => window.hunterOverlay.adjustBounds({ up: { y: -20 }, down: { y: 20 }, left: { x: -20 }, right: { x: 20 }, larger: { width: 45, height: 45 }, smaller: { width: -45, height: -45 } }[button.dataset.delta]))); }
function profileSettingsMarkup() {
  const online = profileState.mode === 'online';
  const accountLabel = online ? 'Conta online' : 'Conta local';
  if (profileState.authenticated && profileState.profile) {
    const profile = profileState.profile;
    return `<div class="profile-view-root"><section class="profile-hero-card"><div class="profile-hero-avatar">${escapeHtml(profile.displayName.charAt(0).toUpperCase())}</div><div class="profile-hero-copy"><span class="profile-eyebrow">HUNTER'S FIELD GUIDE</span><h2>${escapeHtml(profile.displayName)}</h2><p>${accountLabel} · ${escapeHtml(profile.email)}</p></div><div class="profile-hero-actions"><button id="logout-profile" class="ghost-button">Sair da conta</button></div></section><div class="profile-panels"><section class="settings-card profile-settings-card"><div class="section-heading"><h2>Identidade de caça</h2><span>${online ? 'Sincronizado' : 'Neste computador'}</span></div><label class="field">Nome do caçador<input class="text-input" id="name-input" value="${escapeHtml(profile.displayName)}" maxlength="32" /></label><div class="profile-connection-list"><div><strong>Perfil da Steam</strong><span>Adicionar link</span></div><div><strong>Código de amizade — Monster Hunter Wilds</strong><span>Não informado</span></div><div><strong>Jogos acompanhados</strong><span>World / Iceborne · Rise / Sunbreak · Wilds</span></div><div><strong>Título do caçador</strong><span>Rastreador de monstros</span></div></div><div class="profile-actions"><button id="save-profile" class="primary-button">Salvar alterações</button></div><div id="profile-feedback" class="form-feedback" role="status"></div></section><section class="settings-card profile-activity-card"><div class="section-heading"><h2>Atividade recente</h2><span>Em breve</span></div><div class="profile-empty-activity"><span>✥</span><strong>Suas caçadas aparecerão aqui</strong><small>Favoritos, builds e coroas poderão ser sincronizados com a conta.</small></div><div class="info-banner">${online ? 'Perfil sincronizado pelo Supabase. Favoritos e builds poderão ser sincronizados na próxima etapa.' : 'Este perfil fica armazenado localmente. Configure o Supabase para sincronizar a conta entre computadores.'}</div></section></div></div>`;
  }
  return `<section class="settings-card profile-settings-card"><div class="section-heading"><h2>Entrar no perfil</h2><span>${accountLabel}</span></div><p class="settings-intro">Crie um perfil para preservar seu nome, avatar e futuras builds entre sessões.</p><form id="login-form" class="profile-form"><label class="field">E-mail<input class="text-input" id="auth-email" type="email" autocomplete="email" required /></label><label class="field">Senha<input class="text-input" id="auth-password" type="password" autocomplete="current-password" minlength="8" required /></label><button class="primary-button" type="submit">Entrar</button></form><div class="profile-form-divider"><span>ou</span></div><button id="show-create-profile" class="ghost-button">Criar novo perfil</button><div id="profile-feedback" class="form-feedback" role="status"></div><div class="info-banner">${online ? 'Conta online Supabase: o perfil será sincronizado entre computadores.' : 'Modo offline: o perfil será salvo apenas neste computador. Configure o Supabase para ativar contas online.'}</div></section>`;
}
function renderAccountSettings() {
  viewRoot.innerHTML = profileSettingsMarkup();
  const feedback = document.querySelector('#profile-feedback');
  const showError = (error) => { if (feedback) { feedback.textContent = error?.code === 'email_not_confirmed' ? 'Este e-mail ainda não foi confirmado no Supabase.' : error?.message || 'Não foi possível concluir a operação.'; } };
  if (profileState.authenticated) {
    document.querySelector('#save-profile').addEventListener('click', async () => { try { applyProfileState(await window.hunterOverlay.profile.update({ displayName: document.querySelector('#name-input').value })); if (feedback) feedback.textContent = 'Perfil atualizado.'; } catch (error) { showError(error); } });
    document.querySelector('#logout-profile').addEventListener('click', async () => { try { applyProfileState(await window.hunterOverlay.profile.logout()); renderSettings(); } catch (error) { showError(error); } });
    return;
  }
  document.querySelector('#login-form').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.submitter || document.querySelector('#login-form button[type="submit"]'); if (button) button.disabled = true; try { applyProfileState(await window.hunterOverlay.profile.login({ email: document.querySelector('#auth-email').value, password: document.querySelector('#auth-password').value })); renderSettings(); } catch (error) { showError(error); if (button) button.disabled = false; } });
  document.querySelector('#show-create-profile').addEventListener('click', () => {
    viewRoot.innerHTML = `<section class="settings-card profile-settings-card"><div class="section-heading"><h2>Criar perfil</h2><span>${profileState.mode === 'online' ? 'Conta online' : 'Conta local'}</span></div><form id="create-form" class="profile-form"><label class="field">Nome do caçador<input class="text-input" id="create-name" value="NomeCaçador" maxlength="32" /></label><label class="field">E-mail<input class="text-input" id="create-email" type="email" autocomplete="email" required /></label><label class="field">Senha<input class="text-input" id="create-password" type="password" minlength="8" autocomplete="new-password" required /></label><label class="field">Confirmar senha<input class="text-input" id="create-password-confirm" type="password" minlength="8" autocomplete="new-password" required /></label><div class="profile-actions"><button class="primary-button" type="submit">Criar perfil</button><button id="cancel-create-profile" class="ghost-button" type="button">Voltar</button></div></form><div id="profile-feedback" class="form-feedback" role="status"></div></section>`;
    document.querySelector('#create-form').addEventListener('submit', async (event) => { event.preventDefault(); const feedback = document.querySelector('#profile-feedback'); const password = document.querySelector('#create-password').value; if (password !== document.querySelector('#create-password-confirm').value) { feedback.textContent = 'As senhas não coincidem.'; return; } try { applyProfileState(await window.hunterOverlay.profile.create({ displayName: document.querySelector('#create-name').value || 'NomeCaçador', email: document.querySelector('#create-email').value, password, avatar: localStorage.getItem('hunterAvatar') || null })); renderSettings(); } catch (error) { feedback.textContent = error?.message || 'Não foi possível criar o perfil.'; } });
    document.querySelector('#cancel-create-profile').addEventListener('click', renderSettings);
  });
}
function applyProfileState(state) {
  profileState = state || { authenticated: false, profile: null, mode: 'local' };
  const name = profileState.authenticated ? profileState.profile?.displayName || 'NomeCaçador' : 'NomeCaçador';
  profileName.textContent = name;
  headerProfileName.textContent = name;
  avatarButton.textContent = name.charAt(0).toUpperCase();
  const status = document.querySelector('#profile-status');
  if (status) status.textContent = profileState.authenticated ? 'Perfil conectado' : 'Caçador offline';
  const avatar = profileState.authenticated ? profileState.profile?.avatar : null;
  avatarButton.style.backgroundImage = '';
  avatarButton.style.removeProperty('--profile-avatar');
  if (avatar) { avatarButton.style.backgroundImage = `url(${avatar})`; avatarButton.style.setProperty('--profile-avatar', `url("${avatar}")`); avatarButton.style.backgroundSize = 'cover'; avatarButton.textContent = ''; }
  return profileState;
}
function clearDetailHeader() { detailHeaderActions.hidden = true; detailHeaderActions.innerHTML = ''; viewRoot.classList.remove('detail-view-root', 'bestiary-view-root'); document.querySelector('.section-kicker').textContent = 'HUNTER COMPANION'; }
function setDetailHeader(monster) {
  detailHeaderActions.hidden = false;
  document.querySelector('.section-kicker').textContent = '';
  viewTitle.textContent = 'MONSTERPEDIA';
  detailHeaderActions.innerHTML = `<button class="detail-breadcrumb" id="detail-back-bestiary" title="Voltar à Monsterpedia"><span>/</span> ${escapeHtml(monster.game.replace('Monster Hunter: ', ''))} <span>/</span> <strong>${escapeHtml(monster.name)}</strong></button>`;
  document.querySelector('#detail-back-bestiary').addEventListener('click', renderBestiary);
}
function renderView(view) { currentView = view; viewRoot.classList.remove('hunter-profile-page', 'saved-build-detail-root'); viewTitle.textContent = viewNames[view]; if (view !== 'app-settings') recordActivity('view', viewNames[view], view); document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === view)); ({ 'online-builds': renderOnlineBuilds, 'saved-builds': renderSavedBuilds, bestiary: renderBestiary, 'overlay-settings': renderOverlaySettings, 'app-settings': renderSettings }[view] || renderOnlineBuilds)(); }

document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => { clearDetailHeader(); renderView(button.dataset.view); }));
avatarButton.addEventListener('click', () => { clearDetailHeader(); renderView('app-settings'); });
avatarInput.addEventListener('change', async (event) => {
  const file = event.target.files[0]; event.target.value = '';
  if (!file) return;
  const showError = message => { const feedback = document.querySelector('#profile-feedback'); if (feedback) feedback.textContent = message; else alert(message); };
  if (!profileState.authenticated) { clearDetailHeader(); renderView('app-settings'); return; }
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 1_000_000) { showError('Escolha uma imagem PNG, JPG, WebP ou GIF de até 1 MB.'); return; }
  const accountId = profileState.profile.id;
  const reader = new FileReader();
  reader.onload = async () => { if (profileState.profile?.id !== accountId) return; try {
    applyProfileState(await window.hunterOverlay.profile.update({ avatar: reader.result }));
    const portrait = document.querySelector('.profile-hero-avatar');
    if (portrait) portrait.innerHTML = `<img src="${escapeHtml(reader.result)}" alt="Foto do caçador">`;
  } catch (error) { showError(error.message || 'Não foi possível salvar a foto.'); } };
  reader.readAsDataURL(file);
});
document.querySelector('#profile-header').addEventListener('click', () => { clearDetailHeader(); renderView('app-settings'); });
applyProfileState(profileState);
if (window.hunterOverlay.profile?.state) window.hunterOverlay.profile.state().then(state => { applyProfileState(state); profileReady = true; if (currentView === 'app-settings') renderSettings(); }).catch(() => { profileReady = true; });
window.hunterOverlay.onState(({ connectionStatus }) => {
  if (connectionStatus) {
    connectionLabel.innerHTML = `<i></i> ${escapeHtml(connectionStatus.label)}`;
    connectionLabel.title = connectionStatus.reason || 'Estado da integração';
    connectionLabel.dataset.state = connectionStatus.state || 'unknown';
  }
});
const requestedStartView = new URLSearchParams(window.location.search).get('view');
renderView(['bestiary', 'app-settings'].includes(requestedStartView) ? requestedStartView : currentView);
const initialMonsterId = new URLSearchParams(window.location.search).get('monster');
const initialMonster = initialMonsterId && monsters.find((monster) => monster.id === initialMonsterId);
if (initialMonster) renderMonsterDetail(initialMonster);
