const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadOverlaySettings, saveOverlaySettings, normalizeBounds } = require('../src/infrastructure/overlay-settings-store');

test('persists and restores overlay settings and bounds', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'hunter-companion-'));
  const filePath = path.join(directory, 'overlay-settings.v1.json');
  const settings = { editMode: false, clickThrough: true, opacity: 0.7, scale: 1.4, widgets: { monster: true, damage: true } };
  const bounds = { x: 40, y: 80, width: 800, height: 600 };
  saveOverlaySettings(filePath, settings, bounds);
  assert.deepEqual(loadOverlaySettings(filePath), { settings, bounds });
  fs.rmSync(directory, { recursive: true, force: true });
});

test('rejects incomplete bounds and clamps visual settings', () => {
  assert.equal(normalizeBounds({ x: 0, y: 0, width: 100, height: 100 }), null);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'hunter-companion-'));
  const filePath = path.join(directory, 'invalid.json');
  fs.writeFileSync(filePath, JSON.stringify({ version: 1, settings: { opacity: 9, scale: 0 }, bounds: { x: 0 } }));
  const loaded = loadOverlaySettings(filePath);
  assert.equal(loaded.settings.opacity, 1);
  assert.equal(loaded.settings.scale, 1);
  assert.equal(loaded.bounds, null);
  fs.rmSync(directory, { recursive: true, force: true });
});
