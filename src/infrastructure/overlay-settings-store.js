const fs = require('node:fs');
const path = require('node:path');

const VERSION = 1;
const DEFAULT_SETTINGS = Object.freeze({
  editMode: true,
  clickThrough: false,
  opacity: 0.94,
  scale: 1,
  widgets: Object.freeze({ monster: true, damage: true }),
});

function normalizeSettings(value) {
  const input = value && typeof value === 'object' ? value : {};
  return {
    editMode: Boolean(input.editMode ?? DEFAULT_SETTINGS.editMode),
    clickThrough: Boolean(input.clickThrough ?? DEFAULT_SETTINGS.clickThrough),
    opacity: Math.min(1, Math.max(0.25, Number(input.opacity) || DEFAULT_SETTINGS.opacity)),
    scale: Math.min(2, Math.max(0.1, Number(input.scale) || DEFAULT_SETTINGS.scale)),
    widgets: {
      monster: input.widgets?.monster !== false,
      damage: input.widgets?.damage !== false,
    },
  };
}

function normalizeBounds(value) {
  if (!value || typeof value !== 'object') return null;
  const bounds = { x: Number(value.x), y: Number(value.y), width: Number(value.width), height: Number(value.height) };
  if (!Object.values(bounds).every(Number.isInteger) || bounds.width < 420 || bounds.height < 420) return null;
  return bounds;
}

function loadOverlaySettings(filePath) {
  try {
    const document = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (document?.version !== VERSION) return { settings: { ...DEFAULT_SETTINGS }, bounds: null };
    return { settings: normalizeSettings(document.settings), bounds: normalizeBounds(document.bounds) };
  } catch {
    return { settings: { ...DEFAULT_SETTINGS }, bounds: null };
  }
}

function saveOverlaySettings(filePath, settings, bounds) {
  const document = JSON.stringify({ version: VERSION, settings: normalizeSettings(settings), bounds: normalizeBounds(bounds) }, null, 2);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${document}\n`, 'utf8');
}

module.exports = { VERSION, DEFAULT_SETTINGS, normalizeSettings, normalizeBounds, loadOverlaySettings, saveOverlaySettings };
