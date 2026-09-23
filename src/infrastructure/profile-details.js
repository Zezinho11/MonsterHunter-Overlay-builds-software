const fields = ['steamUrl', 'wildsCode', 'hunterTitle'];
function profileDetails(input = {}) {
  const result = {};
  if (input.followedGames !== undefined) {
    const allowed = ['World / Iceborne', 'Rise / Sunbreak', 'Wilds', 'Generations Ultimate'];
    if (!Array.isArray(input.followedGames) || input.followedGames.some(g => !allowed.includes(g))) throw new Error('Seleção de jogos inválida.');
    result.followedGames = [...new Set(input.followedGames)];
  }
  for (const key of fields) if (input[key] !== undefined) {
    const value = String(input[key] || '').trim();
    if (value.length > (key === 'steamUrl' ? 240 : 64)) throw new Error('O campo do perfil é muito longo.');
    if (key === 'steamUrl' && value) {
      let url;
      try { url = new URL(value); } catch { throw new Error('Informe um link válido do perfil Steam.'); }
      if (url.protocol !== 'https:' || url.hostname !== 'steamcommunity.com' || !/^\/(id|profiles)\/[^/]+\/?$/.test(url.pathname) || url.username || url.password || url.search || url.hash) throw new Error('Use https://steamcommunity.com/id/seu-perfil ou /profiles/seu-id.');
    }
    result[key] = value;
  }
  return result;
}
module.exports = { profileDetails };
