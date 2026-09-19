const test = require('node:test');
const assert = require('node:assert/strict');
const { getAdapterForGame, getIntegrationStatus } = require('../src/integration/adapter-registry');

test('keeps a detected game unavailable until a versioned adapter is validated', () => {
  const status = getIntegrationStatus([{ id: 'world', name: 'Monster Hunter: World' }]);
  assert.equal(status.state, 'detected-unavailable');
  assert.equal(status.dataAvailable, false);
  assert.deepEqual(status.capabilities, []);
  assert.match(status.reason, /versão|validada/i);
});

test('does not select an adapter for an unknown game', () => {
  assert.equal(getAdapterForGame('unknown'), null);
});

test('blocks capture when more than one supported process is detected', () => {
  const status = getIntegrationStatus([
    { id: 'world', name: 'Monster Hunter: World' },
    { id: 'rise', name: 'Monster Hunter: Rise' },
  ]);
  assert.equal(status.state, 'multiple-detected');
  assert.equal(status.dataAvailable, false);
});
