const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTasklistCsv, findSupportedGames, getDetectorStatus } = require('../src/integration/process-detector');

test('parses tasklist output without touching process memory', () => {
  const processes = parseTasklistCsv('"MonsterHunterWorld.exe","1234","Console","1","100,000 K"\r\n"other.exe","55","Console","1","10,000 K"');
  assert.deepEqual(processes[0], { imageName: 'MonsterHunterWorld.exe', pid: 1234 });
  assert.equal(processes.length, 2);
});

test('detects only supported exact executable names', () => {
  const games = findSupportedGames([{ imageName: 'MonsterHunterRise.exe', pid: 99 }, { imageName: 'MonsterHunterRiseHelper.exe', pid: 100 }]);
  assert.deepEqual(games.map((game) => game.id), ['rise']);
});

test('does not claim data availability when a game is only detected', () => {
  const status = getDetectorStatus([{ id: 'world', name: 'Monster Hunter: World', executable: 'MonsterHunterWorld.exe' }]);
  assert.equal(status.state, 'detected-unavailable');
  assert.match(status.label, /adaptador pendente/);
});
