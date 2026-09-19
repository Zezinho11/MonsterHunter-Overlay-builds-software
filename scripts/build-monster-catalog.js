const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_JSON = path.join(ROOT, 'src', 'data', 'monster-catalog.v1.json');
const OUTPUT_JS = path.join(ROOT, 'src', 'data', 'monster-catalog.v1.js');
const TRANSLATIONS_PT = path.join(ROOT, 'src', 'data', 'monster-translations.pt.json');

let localPortugueseTranslations = {};
try {
  localPortugueseTranslations = JSON.parse(fsSync.readFileSync(TRANSLATIONS_PT, 'utf8'));
} catch {
  // The generated catalog can still be inspected if the optional translation map is absent.
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function getText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function translateToPortuguese(text) {
  if (!text) return '';
  if (localPortugueseTranslations[text] && localPortugueseTranslations[text] !== text) {
    return localPortugueseTranslations[text];
  }
  try {
    const memoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-BR`;
    const memoryResponse = await fetch(memoryUrl);
    if (memoryResponse.ok) {
      const memoryData = await memoryResponse.json();
      const translated = memoryData.responseData?.translatedText;
      if (translated && translated !== text && memoryData.responseStatus === 200) return translated;
    }
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return text;
    const data = await response.json();
    return (data[0] || []).map((segment) => segment[0]).join('') || text;
  } catch {
    return text;
  }
}

function slug(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').toLowerCase();
}

function iconFor(entry, iconManifest) {
  const prefixes = entry.game === 'world' ? ['MHW-', 'MHWI-'] : entry.game === 'rise' ? ['MHRise-', 'MHRS-'] : entry.game === 'wilds' ? ['MHWilds-'] : ['MHGU-', 'MHGen-', 'MH4U-', 'MHFU-', 'MH3U-'];
  const compact = (value) => slug(value).replaceAll('_', '');
  const wanted = compact(entry.name);
  const match = iconManifest.find((asset) => prefixes.some((prefix) => compact(asset.name).includes(`${compact(prefix)}${wanted}`)));
  return match?.download_url || null;
}

function renderIndex(html, gamePath) {
  const pages = new Map();
  const pattern = new RegExp(`href="https://monsterhunter\\.tools/${gamePath}/monsters/([^"]+)/"[^>]*>([\\s\\S]*?)</a>`, 'g');
  for (const match of html.matchAll(pattern)) {
    pages.set(slug(match[1]), match[1]);
  }
  return pages;
}

function kiranicoIndex(html) {
  const pages = new Map();
  for (const match of html.matchAll(/href="https:\/\/mhworld\.kiranico\.com\/en\/monsters\/([^"/]+)\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    pages.set(slug(cleanHtml(match[3])), { id: match[1], name: cleanHtml(match[3]), path: match[2] });
  }
  return pages;
}

function kiranicoWorldPage(pages, name) {
  const aliases = {
    nightshade_paolomu: 'nightshade_paolumu',
    silver_rathian: 'silver_rathalos',
    kestodon: 'kestodon_male',
  };
  return pages.get(slug(name)) || pages.get(aliases[slug(name)]);
}

function kiranicoRiseIndex(html) {
  const pages = new Map();
  for (const match of html.matchAll(/href="https:\/\/mhrise\.kiranico\.com\/data\/monsters\/(\d+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const name = cleanHtml(match[2]);
    if (name) pages.set(slug(name), { id: match[1], name });
  }
  return pages;
}

function htmlTables(html) {
  return [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((match) => match[0]);
}

function tableRows(table) {
  return [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) => [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cleanHtml(cell[1]))).filter((row) => row.length);
}

function extractKiranicoParts(html) {
  const tables = htmlTables(html);
  const hitzoneTable = tables.find((table) => /<th[^>]*>\s*Parts\s*<\/th>/i.test(table) && /<th[^>]*>\s*State\s*<\/th>/i.test(table));
  const breakTable = tables.find((table) => /<th[^>]*>\s*Parts\s*<\/th>/i.test(table) && /<th[^>]*>\s*HP\s*<\/th>/i.test(table) && /<th[^>]*>\s*Break\s*<\/th>/i.test(table));
  const parts = new Map();
  for (const row of tableRows(hitzoneTable || '')) {
    const name = row[0];
    const state = row[1];
    const values = row.slice(2, 5).map((value) => Number(value.replace('%', ''))).filter((value) => Number.isFinite(value));
    if (!name || values.length < 3) continue;
    const key = `${slug(name)}-${state}`;
    parts.set(key, { id: `kiranico-${slug(name)}-${state}`, name: state === '0' ? name : `${name} (${state})`, health: null, hitzones: { cut: values[0], blunt: values[1], ammo: values[2] }, weakPointStars: null, breakThresholds: [] });
  }
  for (const row of tableRows(breakTable || '')) {
    const name = row[0];
    const health = Number(row[1]?.replace(/,/g, ''));
    if (!name || !Number.isFinite(health)) continue;
    const threshold = [...(row[2] || '').matchAll(/\b(\d[\d,]*)\b/g)].map((match) => Number(match[1].replace(/,/g, ''))).filter((value) => value > 0);
    const match = [...parts.values()].find((part) => slug(part.name).startsWith(slug(name)) || slug(name).startsWith(slug(part.name)));
    if (match) { match.health = health; match.breakThresholds = threshold; match.breakable = threshold.length > 0; }
    else parts.set(`kiranico-${slug(name)}`, { id: `kiranico-${slug(name)}`, name, health, hitzones: null, weakPointStars: null, breakThresholds: threshold, breakable: threshold.length > 0 });
  }
  return [...parts.values()];
}

function extractWorldHitzones(html) {
  const table = htmlTables(html).find((candidate) => /<th[^>]*>\s*Part\s*<\/th>/i.test(candidate) && /<th[^>]*>\s*Sever\s*<\/th>/i.test(candidate));
  return tableRows(table || '').map((row) => {
    const values = row.slice(1, 4).map((value) => Number(value.replace('%', '')));
    if (!row[0] || values.some((value) => !Number.isFinite(value))) return null;
    return {
      id: `kiranico-${slug(row[0])}`,
      name: row[0],
      health: null,
      hitzones: { cut: values[0], blunt: values[1], ammo: values[2] },
      weakPointStars: null,
      breakThresholds: [],
      breakable: false,
    };
  }).filter(Boolean);
}

function extractKiranicoRewards(html) {
  const byKey = new Map();
  for (const table of htmlTables(html)) {
    for (const rawRow of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const rawCells = [...rawRow[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cell[1]);
      if (!rawCells[0] || !/(?:\/data)?\/items\//i.test(rawCells[0])) continue;
      const row = rawCells.map((cell) => cleanHtml(cell));
      if (row.length < 2 || !row[0] || /^(Parts|State|Players|Quest|Item)$/i.test(row[0])) continue;
      const chance = Number((row.find((cell) => /\d+(?:\.\d+)?%/.test(cell)) || '').replace(/[^\d.]/g, ''));
      const quantity = Number((row.find((cell) => /^x\d+/i.test(cell)) || '').replace(/[^\d]/g, '')) || null;
      const rank = row.find((cell) => /^(low|high|master) rank$/i.test(cell)) || null;
      const type = row.find((cell) => /(reward|carve|capture|dropped|palico|broken|wyvern riding)/i.test(cell)) || 'reward';
      const part = row.find((cell) => /^(head|body|back|tail|wing|foreleg|hind leg|left|right)/i.test(cell)) || null;
      const item = row[0];
      if (!item || !type || !Number.isFinite(chance)) continue;
      const key = `${item}|${rank}|${type}|${part}`;
      if (!byKey.has(key)) byKey.set(key, { item, conditions: [{ type: type.toLowerCase(), rank, chance, quantity, part }] });
    }
  }
  return [...byKey.values()];
}

function extractKiranicoBaseHealth(html) {
  const match = html.match(/<dt[^>]*>baseHpVital<\/dt>[\s\S]*?<dd[^>]*>([\d,]+)<\/dd>/i);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

function kiranicoMhguIndex(html) {
  const pages = new Map();
  for (const match of html.matchAll(/href="https:\/\/mhgu\.kiranico\.com\/monster\/([^"/]+)"[^>]*>([^<]+)<\/a>/gi)) {
    const name = cleanHtml(match[2]);
    if (name) pages.set(slug(name), { id: match[1], name });
  }
  return pages;
}

function parseMhguNumber(value) {
  const match = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function extractMhguHealthProfiles(html) {
  const table = htmlTables(html).find((candidate) => /<th[^>]*>\s*HP\s*<\/th>/i.test(candidate));
  const profiles = [];
  for (const row of tableRows(table || '')) {
    if (row.length < 3 || !/HP/i.test(row[2])) continue;
    const rankText = row[1] || '';
    const rank = /G\s*\d/i.test(rankText) ? 'master' : /Hub/i.test(rankText) ? 'high' : 'low';
    const healthValues = [...String(row[2]).replace(/,/g, '').matchAll(/\d+/g)].map((match) => Number(match[0])).filter((value) => value > 0);
    if (!healthValues.length) continue;
    profiles.push({ mode: /Hub/i.test(rankText) ? 'hub' : 'village', rank, quest: rankText.split('//')[0].trim(), health: Math.max(...healthValues), healthRange: { min: Math.min(...healthValues), max: Math.max(...healthValues) }, location: row[0] || null });
  }
  return profiles;
}

function extractMhguHitzones(html) {
  const table = htmlTables(html).find((candidate) => /<th[^>]*>\s*Body Part\s*<\/th>/i.test(candidate) && /<th[^>]*>\s*Slash\s*<\/th>/i.test(candidate));
  const parts = [];
  const elementColumns = ['fire', 'water', 'thunder', 'ice', 'dragon'];
  let maxElements = Object.fromEntries(elementColumns.map((element) => [element, 0]));
  for (const row of tableRows(table || '')) {
    if (row.length < 9 || /Body Part/i.test(row[0])) continue;
    const numbers = row.slice(1).map(parseMhguNumber);
    if (numbers.slice(0, 3).filter((value) => value != null).length < 3) continue;
    const elements = Object.fromEntries(elementColumns.map((element, index) => [element, numbers[index + 3] ?? null]));
    for (const [element, value] of Object.entries(elements)) if (value != null) maxElements[element] = Math.max(maxElements[element], value);
    parts.push({ id: `kiranico-mhgu-${slug(row[0])}`, name: row[0], health: null, hitzones: { cut: numbers[0], blunt: numbers[1], ammo: numbers[2], ...elements }, weakPointStars: null, breakThresholds: [], breakable: false });
  }
  return { parts, maxElements };
}

function extractMhguBreaks(html) {
  const tables = htmlTables(html);
  const parts = [];
  const table = tables.find((candidate) => /<th[^>]*>\s*Body Part\s*<\/th>/i.test(candidate) && /<th[^>]*>\s*Stagger\s*<\/th>/i.test(candidate));
  for (const row of tableRows(table || '')) {
    if (row.length < 2 || /Body Part/i.test(row[0])) continue;
    const thresholds = row.slice(1).map(parseMhguNumber).filter((value) => value != null && value > 0);
    if (thresholds.length) parts.push({ name: row[0], threshold: thresholds[0] });
  }
  return parts;
}

function extractMhguRewards(html) {
  const rewards = [];
  const rankBlocks = [...html.matchAll(/<h6>\s*(Low Rank|High Rank|G Rank)\s*<\/h6>([\s\S]*?)(?=<h6>|<h[1-5][^>]*>|<\/main>)/gi)];
  for (const block of rankBlocks) {
    const rank = /G Rank/i.test(block[1]) ? 'master' : /High/i.test(block[1]) ? 'high' : 'low';
    for (const table of htmlTables(block[2])) {
      let section = null;
      const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      for (const rawRow of rows) {
        const cells = [...rawRow[1].matchAll(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)].map((cell) => cleanHtml(cell[1]));
        if (!cells.length) continue;
        if (cells.length === 1 && !/\d+%/.test(cells[0]) && !/\/item\//i.test(rawRow[1])) { section = cells[0]; continue; }
        const itemMatch = rawRow[1].match(/\/item\/[^"<]+"[^>]*>([\s\S]*?)<\/a>/i);
        const item = cleanHtml(itemMatch?.[1] || cells.find((cell) => cell && !/\d+%/.test(cell) && !/^x\d+$/i.test(cell)) || '');
        const chance = parseMhguNumber(cells.find((cell) => /\d+(?:\.\d+)?%/.test(cell)));
        if (!item || chance == null) continue;
        const typeText = String(section || 'Reward').toLowerCase();
        const type = typeText.includes('carve') ? 'carve' : typeText.includes('drop') || typeText.includes('shiny') ? 'dropped' : typeText.includes('wound') || typeText.includes('break') ? 'broken' : 'reward';
        const part = /(?:wound|break)\s+(.+)/i.exec(section || '')?.[1] || null;
        const key = `${item}|${rank}|${type}|${part}`;
        if (!rewards.some((reward) => reward.key === key)) rewards.push({ key, item, conditions: [{ type, rank, chance, quantity: null, part }] });
      }
    }
  }
  return rewards.map(({ key, ...reward }) => reward);
}

function extractMhguStatus(html) {
  const table = htmlTables(html).find((candidate) => /Initial/i.test(candidate) && /Maximum/i.test(candidate));
  return tableRows(table || '').slice(1).map((row) => ({ status: row[0], initial: parseMhguNumber(row[1]), increase: parseMhguNumber(row[2]), maximum: parseMhguNumber(row[3]) })).filter((row) => row.status && row.initial != null);
}

async function enrichFromMhguKiranico(entries, pages) {
  const queue = entries.filter((entry) => entry.game === 'mhgu');
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const entry = queue.shift();
      const page = pages.get(slug(entry.name));
      if (!page) continue;
      try {
        const response = await fetch(`https://mhgu.kiranico.com/monster/${page.id}`);
        if (!response.ok) continue;
        const html = await response.text();
        const profiles = extractMhguHealthProfiles(html);
        const hitzoneData = extractMhguHitzones(html);
        const breaks = extractMhguBreaks(html);
        const rewards = extractMhguRewards(html);
        entry.healthProfiles = profiles;
        entry.availability.health = profiles.length > 0;
        entry.locations = [...new Set(profiles.map((profile) => profile.location).filter(Boolean))];
        entry.availability.locations = entry.locations.length > 0;
        entry.parts = hitzoneData.parts.map((part) => {
          const breakInfo = breaks.find((candidate) => slug(candidate.name) === slug(part.name) || slug(candidate.name).includes(slug(part.name)) || slug(part.name).includes(slug(candidate.name)));
          return breakInfo ? { ...part, breakable: true, breakThresholds: [breakInfo.threshold], health: breakInfo.threshold } : part;
        });
        entry.availability.parts = entry.parts.length > 0;
        entry.rewards = rewards;
        entry.availability.rewards = rewards.length > 0;
        entry.ailments = extractMhguStatus(html);
        const weaknessOrder = Object.entries(hitzoneData.maxElements).filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]);
        entry.weaknesses = weaknessOrder.slice(0, 3).map(([element, value]) => ({ element, level: value >= 20 ? 3 : value >= 10 ? 2 : 1, value, kind: 'element', condition: null }));
        entry.description = `Monster Hunter Generations Ultimate reference data for ${entry.name}, including rank health, hitzones, break data and rewards.`;
        entry.availability.ecology = false;
      } catch {
        // Preserve explicit unavailable fields when Kiranico cannot be reached.
      }
    }
  });
  await Promise.all(workers);
}

async function enrichFromKiranico(entries, pages, game) {
  const queue = entries.filter((entry) => entry.game === game);
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const entry = queue.shift();
      const page = game === 'world' ? kiranicoWorldPage(pages, entry.name) : pages.get(slug(entry.name));
      if (!page) continue;
      const baseUrl = game === 'rise' ? `https://mhrise.kiranico.com/data/monsters/${page.id}` : `https://mhworld.kiranico.com/en/monsters/${page.id}/${page.path || slug(page.name)}`;
      try {
        const response = await fetch(baseUrl);
        if (!response.ok) continue;
        const html = await response.text();
        const health = game === 'rise' ? extractKiranicoBaseHealth(html) : null;
        const parts = game === 'world' ? extractWorldHitzones(html) : extractKiranicoParts(html);
        const rewards = extractKiranicoRewards(html);
        if (health != null) { entry.baseHealth = health; entry.availability.health = true; }
        if (parts.length) {
          const existing = new Map((entry.parts || []).map((part) => [slug(part.name), part]));
          entry.parts = parts.map((part) => ({ ...part, ...(existing.get(slug(part.name)) || {}) }));
          entry.availability.parts = true;
        }
        if (rewards.length) { entry.rewards = [...entry.rewards, ...rewards]; entry.availability.rewards = true; }
      } catch {
        // Preserve previous structured data when an external page is unavailable.
      }
    }
  });
  await Promise.all(workers);
}

function renderFor(entry, renderPages) {
  if (entry.game === 'mhgu') return null;
  const gamePath = entry.game === 'world' ? 'mhw' : entry.game === 'rise' ? 'mhr' : 'mhwilds';
  const words = String(entry.name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const guessedSlug = words.map((word, index) => index === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join('');
  const pageSlug = renderPages[gamePath].get(slug(entry.name)) || guessedSlug;
  if (!pageSlug) return null;
  const extension = entry.game === 'rise' ? 'jpeg' : 'png';
  return `https://monsterhunter.tools/img/projects/monsterhunter.tools/assets/img/images/${gamePath}-monster-${pageSlug}/render.${extension}`;
}

function extractRenderUrl(html) {
  const match = html.match(/https:\/\/monsterhunter\.tools\/img\/projects\/monsterhunter\.tools\/assets\/img\/images\/[^"'\s]+\/render\.(?:png|jpe?g)(?:\?[^"'\s]*)?/i);
  return match?.[0] || null;
}

function extractIconUrl(html) {
  const match = html.match(/https:\/\/monsterhunter\.tools\/img\/projects\/monsterhunter\.tools\/assets\/img\/images\/[^"'\s]+\/icon-[^"'\s]+\.png(?:\?[^"'\s]*)?/i);
  return match?.[0] || null;
}

const fandomRenderCandidates = {
  'world:Aptonoth': 'MHW-Aptonoth Render 001.png',
  'world:Mernos': 'MHW-Mernos Render 001.png',
  'world:Noios': 'MHW-Noios Render 001.png',
  'world:Raphinos': 'MHW-Raphinos Render 001.png',
  'world:Shamos': 'MHW-Shamos Render 001.png',
  'world:Girros': 'MHW-Girros Render 001.png',
  'world:Gastodon': 'MHW-Gastodon Render 001.png',
  'world:Barnos': 'MHW-Barnos Render 001.png',
  'wilds:Guardian Doshaguma': 'MHWilds-Guardian Doshaguma Custom Render 001.png',
  'wilds:Guardian Arkveld': 'MHWilds-Guardian Arkveld Custom Render 001.png',
  'wilds:Guardian Fulgur Anjanath': 'MHWilds-Guardian Fulgur Anjanath Custom Render 001.png',
  'wilds:Guardian Rathalos': 'MHWilds-Guardian Rathalos Custom Render 001.png',
  'wilds:Guardian Ebony Odogaron': 'MHWilds-Guardian Ebony Odogaron Custom Render 001.png',
  'wilds:Gogmazios': 'MHWilds-Gogmazios Render 001.png',
  'mhgu:Barroth': 'MHGU-Barroth Render 001.png',
  'mhgu:Barioth': 'MHGU-Barioth Render 001.png',
};

async function fandomImageUrl(fileName) {
  const apiUrl = `https://monsterhunter.fandom.com/api.php?action=query&titles=${encodeURIComponent(`File:${fileName}`)}&prop=imageinfo&iiprop=url|mime&format=json`;
  try {
    const data = await getJson(apiUrl);
    const page = Object.values(data.query?.pages || {})[0];
    const image = page?.imageinfo?.[0];
    if (image?.mime !== 'image/png' || !image.url) return null;
    return image.url.replace('https://static.wikia.nocookie.net/', 'https://images.wikia.com/') + (image.url.includes('?') ? '&format=png' : '?format=png');
  } catch {
    return null;
  }
}

async function fandomSearchFiles(prefix) {
  const files = [];
  for (let offset = 0; offset < 500; offset += 100) {
    const apiUrl = `https://monsterhunter.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(`${prefix} render`)}&srnamespace=6&srlimit=100&sroffset=${offset}&format=json`;
    try {
      const data = await getJson(apiUrl);
      const page = data.query?.search || [];
      files.push(...page.map((item) => item.title.replace(/^File:/i, '')).filter((title) => new RegExp(`^${prefix}-.*Render`, 'i').test(title)));
      if (page.length < 100) break;
    } catch {
      break;
    }
  }
  return [...new Set(files)];
}

function findCrossGameRenderFile(entry, files) {
  return findCrossGameRenderFiles(entry, files)[0] || null;
}

function findCrossGameRenderFiles(entry, files) {
  const wantedNames = [entry.name, ...(entry.game === 'mhgu' && entry.name === 'Old Fatalis' ? ['White Fatalis'] : []), ...(entry.game === 'mhgu' && entry.name === 'Ahtal-Neset' ? ['Ahtal-Nesto'] : [])].map(slug);
  const candidates = files.filter((file) => {
    return wantedNames.includes(slug(renderFileMonsterName(file))) && /render/i.test(file);
  });
  return candidates.sort((a, b) => {
    const rank = (file) => /MHGU-/i.test(file) ? 0 : /MHGen-/i.test(file) ? 1 : /MH4U?-/i.test(file) ? 2 : /MH3U?-/i.test(file) ? 3 : /MHFU-/i.test(file) ? 4 : 5;
    return rank(a) - rank(b) || a.length - b.length;
  });
  return candidates;
}

function renderFileMonsterName(file) {
  return file
    .replace(/\.(?:png|jpe?g)$/i, '')
    .replace(/^[^-]+-/, '')
    .replace(/\s+Render(?:\s+\d{3})?.*$/i, '')
    .replace(/\s+Custom$/i, '')
    .trim();
}

async function fandomSearchMonsterFiles(name) {
  const aliases = [name, ...(name === 'Old Fatalis' ? ['White Fatalis'] : []), ...(name === 'Ahtal-Neset' ? ['Ahtal-Nesto'] : [])];
  const files = [];
  for (const queryName of aliases) {
    const apiUrl = `https://monsterhunter.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(`"${queryName}" render`)}&srnamespace=6&srlimit=50&format=json`;
    try {
      const data = await getJson(apiUrl);
      files.push(...(data.query?.search || []).map((item) => item.title.replace(/^File:/i, '')).filter((file) => /render/i.test(file) && [queryName].map(slug).includes(slug(renderFileMonsterName(file)))));
    } catch {
      // Continue with the next exact alias.
    }
  }
  return [...new Set(files)];
}

async function enrichFromFandomCrossGame(entries) {
  const queue = entries.filter((entry) => entry.game === 'mhgu' && !entry.render);
  const prefixFiles = (await Promise.all(['MHGen', 'MH4U', 'MHFU', 'MH3U'].map((prefix) => fandomSearchFiles(prefix)))).flat();
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const entry = queue.shift();
      const exactFiles = await fandomSearchMonsterFiles(entry.name);
      const fileNames = findCrossGameRenderFiles(entry, [...prefixFiles, ...exactFiles]);
      for (const fileName of fileNames) {
        const url = await fandomImageUrl(fileName);
        if (!url) continue;
        entry.render = url;
        entry.renderSource = 'monster-hunter-fandom-cross-game';
        entry.renderVariant = fileName.split('-')[0];
        entry.availability.render = true;
        break;
      }
    }
  });
  await Promise.all(workers);
}

async function enrichFromFandom(entries) {
  const queue = entries.filter((entry) => fandomRenderCandidates[`${entry.game}:${entry.name}`]);
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const entry = queue.shift();
      const url = await fandomImageUrl(fandomRenderCandidates[`${entry.game}:${entry.name}`]);
      if (url) {
        entry.render = url;
        entry.renderSource = 'monster-hunter-fandom';
        entry.availability.render = true;
      }
    }
  });
  await Promise.all(workers);
}

async function isReachable(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

function cleanHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#039;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractEcology(html) {
  const characteristics = html.match(/<h4>Characteristics<\/h4><p>([\s\S]*?)<\/p>/i)?.[1];
  const usefulInfo = html.match(/<h4>Useful Info<\/h4><p>([\s\S]*?)<\/p>/i)?.[1];
  const habitatBlock = html.match(/<h4>Known Habitats<\/h4>([\s\S]*?)(?:<\/main>|<div class="Monster__block")/i)?.[1] || '';
  const locations = [...habitatBlock.matchAll(/MonsterKnownHabitats__itemValue Label__inner">([^<]+)</g)].map((match) => cleanHtml(match[1]));
  const weakPointRows = [];
  const weakPointBlock = html.match(/<h4>Weak Points<\/h4>([\s\S]*?)(?:<h4>|<\/main>)/i)?.[1] || '';
  for (const match of weakPointBlock.matchAll(/<tr[^>]*>\s*<td[^>]*>\s*<strong>([\s\S]*?)<\/strong>[\s\S]*?<\/td>([\s\S]*?)<\/tr>/gi)) {
    const name = cleanHtml(match[1]);
    const stars = [...match[2].matchAll(/_star-(\d+)/gi)].map((star) => Number(star[1]));
    if (name && stars.length) weakPointRows.push({ name, weakPointStars: { cut: stars[0] ?? null, blunt: stars[1] ?? null, ammo: stars[2] ?? null } });
  }
  const breakableBlock = html.match(/<h4>Breakable Parts<\/h4>([\s\S]*?)(?:<h4>|<\/main>)/i)?.[1] || '';
  const breakableParts = [...breakableBlock.matchAll(/MonsterBreakableParts__labelValue Label__inner">([^<]+)/gi)]
    .map((match) => cleanHtml(match[1])).filter(Boolean);
  return {
    characteristics: cleanHtml(characteristics),
    usefulInfo: cleanHtml(usefulInfo),
    locations: [...new Set(locations)],
    parts: weakPointRows,
    breakableParts: [...new Set(breakableParts)],
  };
}

function extractWorldHealthProfiles(html) {
  const profiles = [];
  for (const table of htmlTables(html)) {
    const headers = [...table.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((match) => cleanHtml(match[1]));
    const healthIndex = headers.findIndex((header) => header.toLowerCase() === 'health');
    if (healthIndex < 0) continue;
    const mode = headers.some((header) => /players|region level/i.test(header)) ? 'expedition' : 'quest';
    for (const row of tableRows(table).slice(0, mode === 'expedition' ? 6 : 1)) {
      const health = Number((row[healthIndex] || '').replace(/,/g, ''));
      if (!Number.isFinite(health)) continue;
      profiles.push({ mode, rank: row[0] || null, location: row[1] || null, health });
    }
  }
  return profiles.sort((a, b) => (a.mode === 'expedition' ? -1 : 1) - (b.mode === 'expedition' ? -1 : 1));
}

async function enrichWorldHealth(entries, pages) {
  const queue = entries.filter((entry) => entry.game === 'world');
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const entry = queue.shift();
      const page = kiranicoWorldPage(pages, entry.name);
      if (!page) continue;
      try {
        const response = await fetch(`https://mhworld.kiranico.com/en/monsters/${page.id}/${page.path || slug(page.name)}`);
        if (!response.ok) continue;
        const profiles = extractWorldHealthProfiles(await response.text());
        if (profiles.length) {
          entry.healthProfiles = profiles;
          entry.availability.health = true;
        }
      } catch {
        // Health remains unavailable when the reference page cannot be read.
      }
    }
  });
  await Promise.all(workers);
}

async function enrichFromMonsterTools(entries, renderPages) {
  const queue = [...entries];
  const workers = Array.from({ length: 10 }, async () => {
    while (queue.length) {
      const entry = queue.shift();
      if (entry.game === 'mhgu') continue;
      const gamePath = entry.game === 'world' ? 'mhw' : entry.game === 'rise' ? 'mhr' : 'mhwilds';
      const words = String(entry.name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-zA-Z0-9]+/).filter(Boolean);
      const guessedSlug = words.map((word, index) => index === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join('');
      const pageSlug = renderPages[gamePath].get(slug(entry.name)) || guessedSlug;
      try {
        const response = await fetch(`https://monsterhunter.tools/${gamePath}/monsters/${pageSlug}/`);
        if (!response.ok) continue;
        const pageHtml = await response.text();
        const iconUrl = extractIconUrl(pageHtml);
        if (!entry.icon && iconUrl) { entry.icon = iconUrl; entry.availability.icon = true; }
        const renderUrl = extractRenderUrl(pageHtml);
        if (renderUrl) { entry.render = renderUrl; entry.availability.render = true; }
        const ecology = extractEcology(pageHtml);
        entry.ecology = { characteristics: ecology.characteristics, usefulInfo: ecology.usefulInfo };
        if (!entry.description && ecology.characteristics) entry.description = ecology.characteristics;
        if (!entry.locations.length && ecology.locations.length) entry.locations = ecology.locations;
        const parsedParts = ecology.parts.map((part) => ({
          id: `tools-${slug(part.name)}`,
          name: part.name,
          health: null,
          hitzones: null,
          weakPointStars: part.weakPointStars,
          breakThresholds: [],
        }));
        for (const name of ecology.breakableParts) {
          const normalized = slug(name);
          const existing = parsedParts.find((part) => {
            const candidate = slug(part.name);
            return candidate === normalized || candidate.startsWith(normalized) || normalized.startsWith(candidate);
          });
          if (existing) existing.breakable = true;
          else parsedParts.push({ id: `tools-${normalized}`, name, health: null, hitzones: null, weakPointStars: null, breakable: true, breakThresholds: [] });
        }
        if (parsedParts.length) {
          const currentByName = new Map(entry.parts.map((part) => [slug(part.name), part]));
          // Monster Hunter Tools contributes names/qualitative stars, while
          // Kiranico/Rice can already have numeric hitzones and thresholds.
          // Keep the richer structured record instead of replacing numbers
          // with the Tools parser's intentional null placeholders. State
          // variants such as Alatreon's Fire/Ice/Dragon rows are preserved
          // even when Tools exposes only the base part name.
          const mergedNames = new Set(parsedParts.map((part) => slug(part.name)));
          const preservedParts = entry.parts.filter((part) => !mergedNames.has(slug(part.name)));
          entry.parts = [
            ...parsedParts.map((part) => ({ ...part, ...(currentByName.get(slug(part.name)) || {}) })),
            ...preservedParts,
          ];
          entry.availability.parts = true;
        }
        entry.availability.ecology = Boolean(ecology.characteristics || ecology.usefulInfo);
        entry.availability.locations = Boolean(entry.locations.length);
      } catch {
        // A missing page remains unavailable instead of receiving invented text.
      }
    }
  });
  await Promise.all(workers);
}

async function translateCatalogText(entries) {
  const values = [...new Set(entries.flatMap((entry) => [entry.description, entry.ecology?.characteristics, entry.ecology?.usefulInfo]).filter(Boolean))];
  const translations = new Map();
  const queue = [...values];
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const value = queue.shift();
      translations.set(value, await translateToPortuguese(value));
    }
  });
  await Promise.all(workers);
  for (const entry of entries) {
    entry.descriptionPt = translations.get(entry.description) || '';
    entry.ecologyPt = {
      characteristics: translations.get(entry.ecology?.characteristics) || '',
      usefulInfo: translations.get(entry.ecology?.usefulInfo) || '',
    };
    if (entry.game === 'mhgu') {
      entry.descriptionPt = `Dados de referência do Monster Hunter Generations Ultimate para ${entry.name}, com vida por rank, hitzones, partes quebráveis, estados e recompensas.`;
    }
  }
}

function normalizeWeaknesses(weaknesses = []) {
  return weaknesses.map((weakness) => ({
    element: weakness.element || weakness.status || weakness.effect || 'unknown',
    level: weakness.stars ?? weakness.level ?? null,
    condition: weakness.condition ?? null,
    kind: weakness.kind || (weakness.status ? 'status' : weakness.effect ? 'effect' : 'element'),
  }));
}

function normalizeRewards(rewards = []) {
  return rewards.map((reward) => ({
    item: reward.item?.name || 'Item indisponível',
    conditions: (reward.conditions || []).map((condition) => ({
      type: condition.type || condition.kind || 'unknown',
      rank: condition.rank || null,
      chance: condition.chance ?? null,
      quantity: condition.quantity ?? null,
      part: condition.part || condition.subtype || null,
    })),
  }));
}

function normalizeRank(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('master') || text.startsWith('m★')) return 'master';
  if (text.includes('high') || /^★(?:[6-9])\b/.test(text)) return 'high';
  if (text.includes('low') || /^★[1-5]\b/.test(text)) return 'low';
  return null;
}

function deriveRankData(entries) {
  for (const entry of entries) {
    const rankData = { low: { rewards: [], healthProfiles: [] }, high: { rewards: [], healthProfiles: [] }, master: { rewards: [], healthProfiles: [] } };
    for (const reward of entry.rewards || []) {
      const ranks = [...new Set((reward.conditions || []).map((condition) => normalizeRank(condition.rank)).filter(Boolean))];
      for (const rank of ranks) rankData[rank].rewards.push(reward);
    }
    for (const profile of entry.healthProfiles || []) {
      const rank = normalizeRank(profile.rank);
      if (rank) rankData[rank].healthProfiles.push(profile);
    }
    entry.rankData = rankData;
    entry.ranks = Object.entries(rankData).filter(([, data]) => data.rewards.length || data.healthProfiles.length).map(([rank]) => rank);
    // World/Iceborne keeps the base-roster monsters across Low, High and Master Rank.
    // Kiranico exposes the rank sections but not every section in the compact health row;
    // expand only records that have explicit Low/High evidence, while leaving Master-only
    // additions (Velkhana, Fatalis, etc.) constrained to their published context.
    if (entry.game === 'world' && entry.ranks.some((rank) => rank === 'low' || rank === 'high')) {
      entry.ranks = ['low', 'high', 'master'];
    }
  }
}

function baseEntry(game, record) {
  const type = record.type || record.kind || 'unknown';
  return {
    id: `${game}-${record.id ?? record.gameId ?? slug(record.name)}`,
    game,
    name: record.name,
    type,
    species: record.species || 'unknown',
    description: record.description || record.features || '',
    ecology: { characteristics: '', usefulInfo: '' },
    icon: null,
    iconFallbackAsset: null,
    render: null,
    renderSource: null,
    imageFallback: null,
    elements: record.elements || [],
    weaknesses: normalizeWeaknesses(record.weaknesses),
    resistances: record.resistances || [],
    ailments: record.ailments || [],
    locations: (record.locations || []).map((location) => typeof location === 'string' ? location : location.name).filter(Boolean),
    parts: [],
    rewards: normalizeRewards(record.rewards),
    baseHealth: record.baseHealth ?? null,
    healthProfiles: [],
    availability: { weaknesses: true, locations: Boolean(record.locations?.length), parts: false, rewards: Boolean(record.rewards?.length), render: false, icon: false, ecology: false, health: record.baseHealth != null },
  };
}

const riseSmallMonsterNames = new Set([
  'Altaroth', 'Anteka', 'Baggi', 'Bnahabra', 'Bombadgy', 'Bullfango', 'Cortos', 'Gajau', 'Gargwa',
  'Hornetaur', 'Izuchi', 'Jaggi', 'Jaggia', 'Kestodon', 'Kelbi', 'Melynx', 'Popo', 'Rachnoid',
  'Remobra', 'Rhenoplos', 'Slagtoth', 'Uroktor', 'Velociprey', 'Wroggi', 'Zamite'
]);

async function main() {
  const [world, worldSupplement, wilds, rise, mhguPage, mhrice, iconManifest, zukanMonsters, worldRenderPages, riseRenderPages, wildsRenderPages, worldKiranicoPages, riseKiranicoLargePages, riseKiranicoSmallPages, mhguKiranicoPages] = await Promise.all([
    getJson('https://mhw-db.com/monsters'),
    getJson('https://raw.githubusercontent.com/Neryss/monster_hunter_db/master/mhw_db.json'),
    getJson('https://wilds.mhdb.io/en/monsters'),
    getJson('https://raw.githubusercontent.com/Neryss/monster_hunter_db/master/rise_monster_db.json'),
    getText('https://mhgu.kiranico.com/monster'),
    getJson('https://d2d662ws3kt2jd.cloudfront.net/mhrice.json'),
    getJson('https://api.github.com/repos/CrimsonNynja/monster-hunter-DB/contents/icons'),
    getJson('https://raw.githubusercontent.com/lazywalker/zukan-assets/master/source/monster-hunter-DB/monsters.json'),
    getText('https://monsterhunter.tools/mhw/monsters/'),
    getText('https://monsterhunter.tools/mhr/monsters/'),
    getText('https://monsterhunter.tools/mhwilds/monsters/'),
    getText('https://mhworld.kiranico.com/en/monsters'),
    getText('https://mhrise.kiranico.com/data/monsters?view=lg'),
    getText('https://mhrise.kiranico.com/data/monsters?view=sm'),
    getText('https://mhgu.kiranico.com/monster'),
  ]);

  const worldNames = new Set(world.map((record) => record.name.toLowerCase()));
  const worldRecords = [...world, ...worldSupplement.filter((record) => !worldNames.has(record.name.toLowerCase()))];
  const entries = [
    ...worldRecords.map((record) => baseEntry('world', record)),
    ...rise.map((record) => baseEntry('rise', record)),
    ...wilds.map((record) => baseEntry('wilds', record)),
    ...[...kiranicoMhguIndex(mhguPage).values()].map((record) => baseEntry('mhgu', { id: record.id, name: record.name, type: 'large' })),
  ];
  for (const entry of entries) {
    if (entry.game === 'world' && entry.name === 'Nightshade Paolomu') entry.name = 'Nightshade Paolumu';
    if (entry.game === 'world' && entry.name === 'Silver Rathian') entry.name = 'Silver Rathalos';
  }
  const zukanGameNames = { world: 'Monster Hunter World', rise: 'Monster Hunter Rise', wilds: 'Monster Hunter Wilds', mhgu: 'Monster Hunter Generations Ultimate' };
  const zukanByKey = new Map((zukanMonsters.monsters || []).flatMap((monster) => (monster.games || []).map((game) => [`${game.game}|${monster.name}`.toLowerCase(), { ...monster, gameInfo: game }])));
  for (const entry of entries) {
    const supplement = zukanByKey.get(`${zukanGameNames[entry.game]}|${entry.name}`.toLowerCase());
    if (!supplement) continue;
    if (supplement.gameInfo.info && !entry.description) entry.description = supplement.gameInfo.info;
    if (supplement.species && entry.species === 'unknown') entry.species = supplement.species;
    if (typeof supplement.isLarge === 'boolean') entry.type = supplement.isLarge ? 'large' : 'small';
    if (!entry.elements.length && supplement.elements?.length) entry.elements = supplement.elements;
    if (!entry.ailments.length && supplement.ailments?.length) entry.ailments = supplement.ailments;
    if ((!entry.weaknesses || entry.weaknesses.length === 0) && supplement.weakness?.length) entry.weaknesses = normalizeWeaknesses(supplement.weakness.map((element) => ({ element })));
  }
  const riseNames = new Map([
    ...(mhrice.monster_names?.entries || []),
    ...(mhrice.monster_names_mr?.entries || []),
  ].flatMap((entry) => (entry.content || []).filter(Boolean).map((name) => [name.toLowerCase(), entry])));
  const riseList = mhrice.monster_list?.data_list || [];
  const riseMonstersByName = new Map();
  for (const [name, nameEntry] of riseNames) {
    const index = Number(nameEntry.name?.replace(/\D/g, ''));
    const emType = riseList[index]?.em_type?.Em;
    const monster = (mhrice.monsters || []).find((record) => record.em_type?.Em === emType && record.data_tune?.base_hp_vital != null);
    if (monster) riseMonstersByName.set(name, monster);
  }
  const iconAssets = iconManifest.filter((asset) => asset.type === 'file' && asset.name.endsWith('.png'));
  const renderPages = {
    mhw: renderIndex(worldRenderPages, 'mhw'),
    mhr: renderIndex(riseRenderPages, 'mhr'),
    mhwilds: renderIndex(wildsRenderPages, 'mhwilds'),
  };

  const mhguPages = kiranicoMhguIndex(mhguKiranicoPages);

  for (const entry of entries) {
    if (entry.game === 'rise') entry.type = riseSmallMonsterNames.has(entry.name) ? 'small' : 'large';
    if (entry.game === 'mhgu') entry.type = new Set(['Aptonoth', 'Apceros', 'Kelbi', 'Mosswine', 'Hornetaur', 'Vespoid', 'Felyne', 'Melynx', 'Velociprey', 'Genprey', 'Ioprey', 'Cephalos', 'Bullfango', 'Popo', 'Giaprey', 'Remobra', 'Jaggi', 'Jaggia', 'Bnahabra', 'Altaroth', 'Rhenopnos', 'Rhenoplos', 'Gargwa', 'Slagtoth', 'Uroktor', 'Zamite', 'Gypceros', 'Anteka', 'Hermitaur', 'Ceanataur', 'Blango', 'Ludroth', 'Konchu', 'Maccao', 'Larinoth', 'Moofah', 'Great Thunderbug', 'Conga']).has(entry.name) ? 'small' : 'large';
    entry.icon = iconFor(entry, iconAssets);
    entry.availability.icon = Boolean(entry.icon);
    if (entry.game === 'mhgu' && !entry.icon) entry.iconFallbackAsset = 'assets/monster-icons/mhgu-unknown.png';
    entry.render = renderFor(entry, renderPages);
    entry.availability.render = Boolean(entry.render);
    if (entry.game === 'rise') {
      const riceName = riseNames.get(entry.name.toLowerCase());
      const riceMonster = riseMonstersByName.get(entry.name.toLowerCase()) || null;
      entry.baseHealth = riceMonster?.data_tune?.base_hp_vital ?? null;
      entry.availability.health = entry.baseHealth != null;
      entry.parts = (riceMonster?.data_tune?.enemy_parts_break_data_list || []).map((part, index) => ({
        id: `group-${part.parts_group ?? index}`,
        name: `Parte ${index + 1}`,
        breakThresholds: (part.parts_break_data_list || []).map((threshold) => threshold.vital).filter((value) => value > 0),
        hitzones: null,
      }));
      entry.availability.parts = entry.parts.length > 0;
      if (riceName && !entry.description) entry.description = `Dados extraídos do MHRice para ${entry.name}.`;
    }
    if (entry.game === 'wilds') {
      entry.parts = (wilds.find((record) => record.name === entry.name)?.parts || []).map((part) => ({
        id: part.id ?? part.part,
        name: part.name || part.part || 'Parte sem nome',
        health: part.health ?? null,
        hitzones: part.multipliers || null,
        breakThresholds: [],
      }));
      entry.availability.parts = entry.parts.length > 0;
    }
  }

  await enrichWorldHealth(entries, kiranicoIndex(worldKiranicoPages));
  await enrichFromKiranico(entries, kiranicoIndex(worldKiranicoPages), 'world');
  const riseKiranicoPages = new Map([...kiranicoRiseIndex(riseKiranicoLargePages), ...kiranicoRiseIndex(riseKiranicoSmallPages)]);
  await enrichFromKiranico(entries, riseKiranicoPages, 'rise');
  await enrichFromMhguKiranico(entries, mhguPages);
  await enrichFromMonsterTools(entries, renderPages);
  await enrichFromFandom(entries);
  await enrichFromFandomCrossGame(entries);
  deriveRankData(entries);
  await translateCatalogText(entries);

  const renderChecks = await Promise.all(entries.map(async (entry) => [entry, await isReachable(entry.render)]));
  for (const [entry, available] of renderChecks) {
    if (!available) entry.render = null;
    entry.availability.render = available;
    if (!entry.render && entry.icon) entry.imageFallback = entry.icon;
    if (entry.render && !entry.renderSource) entry.renderSource = 'monster-hunter-tools';
  }

  const catalog = {
    schema: 'monster-catalog.v1',
    generatedAt: new Date().toISOString(),
    locale: 'en',
    sources: [
      { id: 'mhw-db', games: ['world'], url: 'https://mhw-db.com/monsters', note: 'Primary World/Iceborne-era records for weaknesses, locations and rewards; the API does not expose World hitzones in this endpoint.' },
      { id: 'kiranico-world-health', games: ['world'], url: 'https://mhworld.kiranico.com/en/monsters', note: 'World expedition health profiles by rank and locale; stored as reference profiles instead of being mislabeled as a universal base health.' },
      { id: 'neryss-world-db', games: ['world'], url: 'https://github.com/Neryss/monster_hunter_db', note: 'World/Iceborne roster supplement used for records absent from the primary endpoint.' },
      { id: 'mhrice', games: ['rise'], url: 'https://mhrise.mhrice.info/', license: 'MIT/Apache-2.0', note: 'Game-extracted Rise data and base health/part thresholds.' },
      { id: 'neryss-rise-db', games: ['rise'], url: 'https://github.com/Neryss/monster_hunter_db', note: 'Rise/Sunbreak weakness and resistance supplement.' },
      { id: 'wilds-mhdb', games: ['wilds'], url: 'https://wilds.mhdb.io/en/monsters', note: 'Wilds weaknesses, rewards and part multipliers.' },
      { id: 'mhgu-kiranico', games: ['mhgu'], url: 'https://mhgu.kiranico.com/monster', note: 'MHGU pages provide rank-specific quest health, hitzones A/B, status thresholds, break data and Low/High/G Rank reward tables.' },
      { id: 'monster-hunter-db-icons', games: ['world', 'rise', 'wilds', 'mhgu'], url: 'https://github.com/CrimsonNynja/monster-hunter-DB/tree/master/icons', note: 'Game-specific icon references; attribution retained.' },
      { id: 'monster-hunter-tools-renders', games: ['world', 'rise', 'wilds'], url: 'https://monsterhunter.tools/', note: 'High-resolution game render references by title and monster; image source attribution is retained by the provider.' },
      { id: 'monster-hunter-fandom-renders', games: ['world', 'wilds', 'mhgu'], url: 'https://monsterhunter.fandom.com/wiki/Category:Monster_Renders', note: 'PNG render references selected by exact game/variant filename; MHGU may also use an explicitly marked cross-game render from MHGen/MH4U/MHFU/MH3U when no MHGU file exists.' },
      { id: 'monster-hunter-tools-ecology', games: ['world', 'rise', 'wilds'], url: 'https://monsterhunter.tools/', note: 'Alternative source for ecology, useful information and habitat text when the structured dataset lacks it.' },
      { id: 'zukan-monster-db', games: ['world', 'rise', 'wilds'], url: 'https://github.com/lazywalker/zukan-assets/tree/master/source/monster-hunter-DB', license: 'See upstream repository', note: 'Alternative per-game bestiary descriptions, species, size, elements, ailments and weaknesses used only as field-level fallback.' },
      { id: 'local-portuguese-translation-map', games: ['world', 'rise', 'wilds', 'mhgu'], url: 'https://github.com/argosopentech/argos-translate', note: 'Local build-time Portuguese translations are stored separately from source text; the catalog does not silently fall back to English in the UI.' },
    ],
    entries,
  };
  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  await fs.writeFile(OUTPUT_JS, `window.monsterCatalog = ${JSON.stringify(catalog)};\n`, 'utf8');
  console.log(`Generated ${entries.length} monster records: ${entries.filter((entry) => entry.game === 'world').length} World, ${entries.filter((entry) => entry.game === 'rise').length} Rise, ${entries.filter((entry) => entry.game === 'wilds').length} Wilds, ${entries.filter((entry) => entry.game === 'mhgu').length} MHGU.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
