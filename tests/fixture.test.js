const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const fixturePath = path.join(__dirname, '..', 'src', 'fixtures', 'simulated-overlay-v1.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

test('fixture has an explicit target and is read-only', () => {
  assert.equal(fixture.schema, 'game-snapshot.v1');
  assert.equal(fixture.target.platform, 'windows-x64');
  assert.equal(fixture.target.source, 'fixture');
  assert.equal(fixture.target.readOnly, true);
  assert.equal(fixture.target.rendererTarget, 'direct3d11-directcomposition');
});

test('fixture contains independently addressable monster parts and hunters', () => {
  assert.ok(fixture.initialState.monster.maxHealth > 0);
  assert.ok(fixture.initialState.monster.type);
  assert.ok(fixture.initialState.monster.weaknesses.length >= 1);
  assert.ok(fixture.initialState.monster.ailments.length >= 1);
  assert.ok(fixture.initialState.monster.parts.length >= 1);
  for (const part of fixture.initialState.monster.parts) {
    assert.ok(part.name);
    assert.ok(part.bars.length >= 1);
    for (const bar of part.bars) {
      assert.ok(['Break', 'Sever'].includes(bar.kind));
      assert.ok(bar.current >= 0 && bar.current <= bar.max);
    }
  }
  assert.ok(fixture.initialState.hunters.length >= 2);
  for (const hunter of fixture.initialState.hunters) {
    assert.ok(hunter.id);
    assert.ok(hunter.name);
    assert.ok(hunter.totalDamage >= 0);
    assert.ok(hunter.dps >= 0);
  }
});

test('chart sample cardinality matches hunter cardinality', () => {
  const hunterCount = fixture.initialState.hunters.length;
  assert.ok(fixture.initialState.chart.length >= 2);
  for (const sample of fixture.initialState.chart) {
    assert.equal(sample.values.length, hunterCount);
    assert.ok(sample.time >= 0);
  }
});
