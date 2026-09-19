const ADAPTERS = Object.freeze({
  world: Object.freeze({
    gameId: 'world',
    source: 'read-only-process-adapter',
    status: 'not-configured',
    capabilities: [],
    reason: 'Nenhuma versão do executável foi validada para leitura somente leitura.',
  }),
  rise: Object.freeze({
    gameId: 'rise',
    source: 'read-only-process-adapter-or-reframework-bridge',
    status: 'not-configured',
    capabilities: [],
    reason: 'REFramework/adaptador versionado ainda não foi instalado ou validado.',
  }),
  wilds: Object.freeze({
    gameId: 'wilds',
    source: 'read-only-process-adapter-or-reframework-bridge',
    status: 'not-configured',
    capabilities: [],
    reason: 'REFramework/adaptador versionado ainda não foi instalado ou validado.',
  }),
});

function getAdapterForGame(gameId) {
  return ADAPTERS[gameId] || null;
}

function getIntegrationStatus(detectedGames) {
  if (!detectedGames.length) {
    return {
      state: 'simulation',
      label: 'Modo de simulação · nenhum jogo detectado',
      game: null,
      dataAvailable: false,
      source: 'fixture',
      capabilities: [],
      reason: 'Nenhum processo suportado está em execução.',
    };
  }

  if (detectedGames.length > 1) {
    return {
      state: 'multiple-detected',
      label: 'Mais de um jogo detectado · selecione um jogo',
      game: null,
      dataAvailable: false,
      source: 'process-detector',
      capabilities: [],
      reason: 'A captura permanece bloqueada até existir exatamente um alvo.',
    };
  }

  const game = detectedGames[0];
  const adapter = getAdapterForGame(game.id);
  return {
    state: 'detected-unavailable',
    label: `Jogo detectado · ${game.name} · adaptador pendente`,
    game,
    dataAvailable: false,
    source: adapter?.source || 'unknown',
    capabilities: adapter?.capabilities || [],
    reason: adapter?.reason || 'Nenhum adaptador seguro registrado para este jogo.',
  };
}

module.exports = { ADAPTERS, getAdapterForGame, getIntegrationStatus };
