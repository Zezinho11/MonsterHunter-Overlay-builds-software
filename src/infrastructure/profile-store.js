const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { profileDetails } = require('./profile-details');

const VERSION = 1;
const KEY_LENGTH = 64;
const MAX_AVATAR_LENGTH = 1_500_000;
const DEFAULT_PROFILE_NAME = 'NomeCaçador';

function emptyDocument() {
  return { version: VERSION, activeProfileId: null, profiles: [] };
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validateProfileInput(input = {}) {
  const email = normalizeEmail(input.email);
  const displayName = String(input.displayName || '').trim() || DEFAULT_PROFILE_NAME;
  const password = String(input.password || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um e-mail válido.');
  if (displayName.length < 2 || displayName.length > 32) throw new Error('O nome deve ter entre 2 e 32 caracteres.');
  if (password.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
  return { email, displayName, password };
}

function readDocument(filePath) {
  try {
    const document = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (document?.version !== VERSION || !Array.isArray(document.profiles)) return emptyDocument();
    return { version: VERSION, activeProfileId: document.activeProfileId || null, profiles: document.profiles };
  } catch {
    return emptyDocument();
  }
}

function writeDocument(filePath, document) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(document, null, 2), { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporaryPath, filePath);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex'),
  };
}

function passwordMatches(password, profile) {
  const actual = crypto.scryptSync(password, profile.passwordSalt, KEY_LENGTH);
  const expected = Buffer.from(profile.passwordHash, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
}

function publicProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    ...profileDetails(profile),
    email: profile.email,
    displayName: profile.displayName,
    avatar: profile.avatar || null,
    createdAt: profile.createdAt,
    lastLoginAt: profile.lastLoginAt || null,
  };
}

function assertAvatar(avatar) {
  if (avatar != null && (typeof avatar !== 'string' || avatar.length > MAX_AVATAR_LENGTH || !avatar.startsWith('data:image/'))) {
    throw new Error('A imagem do perfil é inválida ou muito grande.');
  }
}

function createProfileStore(filePath) {
  function state() {
    const document = readDocument(filePath);
    const active = document.profiles.find((profile) => profile.id === document.activeProfileId) || null;
    return { authenticated: Boolean(active), profile: publicProfile(active), mode: 'local' };
  }

  function create(input) {
    const { email, displayName, password } = validateProfileInput(input);
    assertAvatar(input.avatar);
    const document = readDocument(filePath);
    if (document.profiles.some((profile) => profile.email === email)) throw new Error('Já existe um perfil com este e-mail.');
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const credentials = hashPassword(password);
    document.profiles.push({ id, email, displayName, avatar: input.avatar || null, passwordSalt: credentials.salt, passwordHash: credentials.hash, createdAt: now, lastLoginAt: now });
    document.activeProfileId = id;
    writeDocument(filePath, document);
    return state();
  }

  function login(input = {}) {
    const email = normalizeEmail(input.email);
    const password = String(input.password || '');
    const document = readDocument(filePath);
    const profile = document.profiles.find((candidate) => candidate.email === email);
    if (!profile || !passwordMatches(password, profile)) throw new Error('E-mail ou senha inválidos.');
    profile.lastLoginAt = new Date().toISOString();
    document.activeProfileId = profile.id;
    writeDocument(filePath, document);
    return state();
  }

  function logout() {
    const document = readDocument(filePath);
    document.activeProfileId = null;
    writeDocument(filePath, document);
    return state();
  }

  function update(input = {}) {
    const document = readDocument(filePath);
    const profile = document.profiles.find((candidate) => candidate.id === document.activeProfileId);
    if (!profile) throw new Error('Nenhum perfil conectado.');
    Object.assign(profile, profileDetails(input));
    if (input.displayName !== undefined) {
      const displayName = String(input.displayName || '').trim() || DEFAULT_PROFILE_NAME;
      if (displayName.length < 2 || displayName.length > 32) throw new Error('O nome deve ter entre 2 e 32 caracteres.');
      profile.displayName = displayName;
    }
    if (input.avatar !== undefined) { assertAvatar(input.avatar); profile.avatar = input.avatar || null; }
    writeDocument(filePath, document);
    return state();
  }

  return { state, create, login, logout, update };
}

module.exports = { createProfileStore, normalizeEmail, validateProfileInput, DEFAULT_PROFILE_NAME };
