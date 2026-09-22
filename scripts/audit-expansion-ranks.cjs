/* Cross-check rank tabs with World/Iceborne quest evidence, without treating
   generic Kiranico reward placeholders as a huntable monster variant. */
const fs = require('node:fs');
const path = require('node:path');
const { get } = require('./revalidate-rewards.cjs');

const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/data/monster-catalog.v1.json'), 'utf8'));
const key = (text) => String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const clean = (text) => String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function questRanks(html) {
  const section = html.match(/<h6[^>]*>Quest<\/h6>([\s\S]*?)(?=<h6\b)/i)?.[1] || '';
  const quests = [...section.matchAll(/<a[^>]+href="([^"]*\/quests\/[^\"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({ url: match[1], title: clean(match[2]) }));
  const ranks = [...new Set(quests.map((quest) => /^M★/i.test(quest.title) ? 'master' : /^★[1-5]\b/.test(quest.title) ? 'low' : /^★[6-9]\b/.test(quest.title) ? 'high' : null).filter(Boolean))];
  return { quests, ranks };
}

async function main() {
  const index = await get('https://mhworld.kiranico.com/en/monsters');
  const urls = new Map([...index.matchAll(/<a\b[^>]*href="([^"]*\/en\/monsters\/[^\"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => [key(clean(match[2])), match[1]]));
  const world = catalog.entries.filter((entry) => entry.game === 'world');
  const report = { checkedAt: new Date().toISOString(), checked: world.length, missingMasterQuestRank: [], questOnlyRanks: [], sourceMissing: [], examples: [] };
  for (const entry of world) {
    const source = urls.get(key(entry.name === 'Kestodon' ? 'Kestodon (Male)' : entry.name));
    if (!source) { report.sourceMissing.push(entry.name); continue; }
    const evidence = questRanks(await get(source));
    if (evidence.ranks.includes('master') && !entry.ranks.includes('master')) report.missingMasterQuestRank.push({ monster: entry.name, quests: evidence.quests.filter((quest) => /^M★/i.test(quest.title)) });
    for (const rank of evidence.ranks) if (!entry.ranks.includes(rank)) report.questOnlyRanks.push({ monster: entry.name, rank, quests: evidence.quests.filter((quest) => rank === 'master' ? /^M★/i.test(quest.title) : rank === 'low' ? /^★[1-5]\b/.test(quest.title) : /^★[6-9]\b/.test(quest.title)) });
    if (['Nergigante', 'Ruiner Nergigante', 'Bazelgeuse', 'Seething Bazelgeuse', 'Deviljho', 'Savage Deviljho', 'Vaal Hazak', 'Blackveil Vaal Hazak'].includes(entry.name)) report.examples.push({ monster: entry.name, catalogRanks: entry.ranks, questRanks: evidence.ranks, source });
  }
  const out = path.join(root, 'work/reward-audit/expansion-ranks.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ checked: report.checked, missingMasterQuestRank: report.missingMasterQuestRank, questOnlyRanks: report.questOnlyRanks, sourceMissing: report.sourceMissing, examples: report.examples }, null, 2));
  // The sole quest-only rank is Nergigante's low-rank story appearance in
  // One for the History Books, whose objective and rewards belong to Zorah.
  const unexplained = report.questOnlyRanks.filter(({ monster, rank }) => monster !== 'Nergigante' || rank !== 'low');
  if (unexplained.length || report.sourceMissing.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
