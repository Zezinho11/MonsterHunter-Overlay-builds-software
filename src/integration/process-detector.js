const SUPPORTED_GAMES = Object.freeze([
  { id: 'world', name: 'Monster Hunter: World', executable: 'MonsterHunterWorld.exe' },
  { id: 'rise', name: 'Monster Hunter: Rise', executable: 'MonsterHunterRise.exe' },
  { id: 'wilds', name: 'Monster Hunter: Wilds', executable: 'MonsterHunterWilds.exe' },
]);

function parseTasklistCsv(output) {
  return String(output || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const fields = line.match(/"(?:[^"]|"")*"/g) || [];
    return { imageName: (fields[0] || '').replace(/^"|"$/g, '').replace(/""/g, '"'), pid: Number((fields[1] || '').replace(/^"|"$/g, '')) };
  }).filter((process) => process.imageName && Number.isInteger(process.pid));
}

function findSupportedGames(processes) {
  return SUPPORTED_GAMES.filter((game) => processes.some((process) => process.imageName.toLowerCase() === game.executable.toLowerCase())).map((game) => ({ ...game, detected: true }));
}

function getDetectorStatus(detectedGames) {
  if (!detectedGames.length) return { state: 'simulation', label: 'Modo de simulação · nenhum jogo detectado', game: null };
  if (detectedGames.length === 1) return { state: 'detected-unavailable', label: `Jogo detectado · ${detectedGames[0].name} · adaptador pendente`, game: detectedGames[0] };
  return { state: 'multiple-detected', label: 'Mais de um jogo detectado · selecione um jogo', game: null };
}

module.exports = { SUPPORTED_GAMES, parseTasklistCsv, findSupportedGames, getDetectorStatus };
