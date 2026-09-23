const fs = require('node:fs');
const path = require('node:path');
const { profileDetails } = require('./profile-details');

const DEFAULT_PROFILE_NAME = 'NomeCaçador';

function createSupabaseProfileStore({ url, anonKey, sessionPath, secureStorage = null, fetchImpl = fetch } = {}) {
  const baseUrl = String(url || '').replace(/\/$/, '');
  if (!/^https:\/\/[^\s]+$/i.test(baseUrl) || !anonKey) return null;
  let session = readSession();

  function readSession() {
    try {
      const raw = fs.readFileSync(sessionPath, 'utf8');
      const value = secureStorage?.isEncryptionAvailable?.() ? secureStorage.decryptString(Buffer.from(raw, 'base64')) : raw;
      return JSON.parse(value);
    } catch { return null; }
  }

  function writeSession(value) {
    if (!value) { try { fs.rmSync(sessionPath, { force: true }); } catch {} return; }
    fs.mkdirSync(path.dirname(sessionPath), { recursive: true });
    const raw = JSON.stringify(value);
    const stored = secureStorage?.isEncryptionAvailable?.() ? secureStorage.encryptString(raw).toString('base64') : raw;
    fs.writeFileSync(sessionPath, stored, { encoding: 'utf8', mode: 0o600 });
  }

  function publicProfile(user) {
    if (!user) return null;
    return {
      id: user.id,
      ...profileDetails(user.user_metadata || {}),
      email: user.email,
      displayName: user.user_metadata?.display_name || DEFAULT_PROFILE_NAME,
      avatar: user.user_metadata?.avatar || null,
      createdAt: user.created_at || null,
      lastLoginAt: user.last_sign_in_at || null,
    };
  }

  async function request(endpoint, options = {}) {
    const response = await fetchImpl(`${baseUrl}${endpoint}`, {
      ...options,
      headers: { apikey: anonKey, 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = null; }
    if (!response.ok) {
      const message = body?.msg || body?.error_description || body?.message || 'Não foi possível conectar à conta online.';
      const error = new Error(message);
      error.code = body?.code || body?.error || null;
      error.status = response.status;
      throw error;
    }
    return body;
  }

  async function buildsRequest(endpoint, options = {}, authenticated = false) {
    const user = authenticated ? await currentUser() : null;
    if (authenticated && (!user || !session?.access_token)) throw new Error('Entre no perfil para publicar ou remover uma build online.');
    return request(`/rest/v1/${endpoint}`, {
      ...options,
      headers: {
        ...(authenticated ? { Authorization: `Bearer ${session.access_token}` } : {}),
        ...(options.headers || {}),
      },
    });
  }

  async function searchBuilds({ game, weaponType, buildType, limit = 40 } = {}) {
    const result = await buildsRequest('rpc/search_community_builds', { method: 'POST', body: JSON.stringify({ game_filter: game || null, weapon_filter: weaponType || null, type_filter: buildType || null, result_limit: Math.max(1, Math.min(60, Number(limit) || 40)) }) });
    return Array.isArray(result) ? result : [];
  }

  async function getMyPublishedBuilds() {
    const user = await currentUser();
    if (!user || !session?.access_token) return [];
    const query = new URLSearchParams({ select: 'id,local_build_id', user_id: `eq.${user.id}`, is_public: 'eq.true', limit: '100' });
    const result = await buildsRequest(`community_builds?${query}`, { headers: { Authorization: `Bearer ${session.access_token}` } }, true);
    return Array.isArray(result) ? result : [];
  }

  async function publishBuild(build) {
    const user = await currentUser();
    if (!user || !session?.access_token) throw new Error('Entre no perfil para publicar uma build.');
    const publicFields = ['id', 'title', 'game', 'weapon', 'weaponId', 'type', 'armor', 'armorIds', 'armorSkills', 'talisman', 'talismanId', 'talismanSkills', 'talismanSlots', 'skills', 'decorations', 'decorationSlots', 'icon', 'createdAt', 'updatedAt'];
    const publicBuild = Object.fromEntries(publicFields.filter((key) => Object.hasOwn(build, key)).map((key) => [key, build[key]]));
    const payload = {
      user_id: user.id,
      local_build_id: String(build.id || ''),
      title: String(build.title || 'Build sem título').trim().slice(0, 100),
      game: String(build.game || ''),
      weapon_type: String(build.weaponType || ''),
      build_type: String(build.type || 'DPS'),
      game_version: String(build.gameVersion || 'Não informada').slice(0, 60),
      author_name: String(user.user_metadata?.display_name || DEFAULT_PROFILE_NAME).trim().slice(0, 40),
      payload: publicBuild,
      is_public: true,
      published_at: new Date().toISOString(),
    };
    if (!payload.local_build_id || !payload.game || !payload.weapon_type) throw new Error('A build precisa ter jogo, arma e tipo de arma registrados antes de ser publicada.');
    if (Buffer.byteLength(JSON.stringify(publicBuild), 'utf8') > 65536) throw new Error('Esta build é grande demais para ser compartilhada.');
    return buildsRequest('community_builds?on_conflict=user_id,local_build_id', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload) }, true);
  }

  async function unpublishBuild(localBuildId) {
    const user = await currentUser();
    if (!user || !session?.access_token) throw new Error('Entre no perfil para remover uma build online.');
    const query = new URLSearchParams({ user_id: `eq.${user.id}`, local_build_id: `eq.${String(localBuildId)}` });
    return buildsRequest(`community_builds?${query}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}`, Prefer: 'return=minimal' } }, true);
  }

  async function currentUser() {
    if (!session?.access_token) return null;
    try {
      return await request('/auth/v1/user', { headers: { Authorization: `Bearer ${session.access_token}` } });
    } catch (error) {
      if (!session.refresh_token) return null;
      try {
        const refreshed = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: session.refresh_token }) });
        session = { access_token: refreshed.access_token, refresh_token: refreshed.refresh_token || session.refresh_token, expires_at: refreshed.expires_at || null, user: refreshed.user || session.user || null };
        writeSession(session);
        try { return await request('/auth/v1/user', { headers: { Authorization: `Bearer ${session.access_token}` } }); }
        catch (refreshedUserError) { if (session.user && !refreshedUserError.status) return session.user; throw refreshedUserError; }
      } catch { session = null; writeSession(null); return null; }
    }
  }

  async function state() {
    const user = await currentUser();
    return { authenticated: Boolean(user), profile: publicProfile(user), mode: 'online' };
  }

  async function authenticate(endpoint, input) {
    const displayName = String(input.displayName || '').trim() || DEFAULT_PROFILE_NAME;
    const payload = { email: String(input.email || '').trim().toLowerCase(), password: String(input.password || '') };
    if (endpoint.endsWith('/signup')) {
      payload.data = { display_name: displayName };
      if (input.avatar) payload.data.avatar = input.avatar;
    }
    const body = await request(endpoint, { method: 'POST', body: JSON.stringify(payload) });
    if (!body.access_token) {
      const error = new Error(`Conta criada para ${payload.email}, mas o Supabase exige confirmação por e-mail antes do primeiro acesso.`);
      error.code = 'email_confirmation_required';
      error.pendingEmail = payload.email;
      throw error;
    }
    session = { access_token: body.access_token, refresh_token: body.refresh_token, expires_at: body.expires_at || null, user: body.user || null };
    writeSession(session);
    if (body.user) return { authenticated: true, profile: publicProfile(body.user), mode: 'online' };
    try {
      const user = await request('/auth/v1/user', { headers: { Authorization: `Bearer ${session.access_token}` } });
      return { authenticated: true, profile: publicProfile(user), mode: 'online' };
    } catch (error) {
      session = null;
      writeSession(null);
      const detail = error?.message || 'não foi possível validar a sessão';
      const authError = new Error(`Login não concluído: o Supabase aceitou as credenciais, mas não validou a sessão (${detail}).`);
      authError.code = 'session_validation_failed';
      authError.status = error?.status || null;
      throw authError;
    }
  }

  return {
    mode: 'online',
    state,
    create: (input) => authenticate('/auth/v1/signup', input),
    login: (input) => authenticate('/auth/v1/token?grant_type=password', input),
    async logout() {
      if (session?.access_token) { try { await request('/auth/v1/logout', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } }); } catch {} }
      session = null; writeSession(null); return state();
    },
    async update(input = {}) {
      const details = profileDetails(input);
      if (!session?.access_token) throw new Error('Nenhum perfil conectado.');
      const user = await request('/auth/v1/user', { method: 'PUT', headers: { Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ data: { ...details, ...(input.displayName !== undefined ? { display_name: String(input.displayName || '').trim() || DEFAULT_PROFILE_NAME } : {}), ...(input.avatar !== undefined ? { avatar: input.avatar || null } : {}) } }) });
      return { authenticated: true, profile: publicProfile(user), mode: 'online' };
    },
    searchBuilds,
    getMyPublishedBuilds,
    publishBuild,
    unpublishBuild,
  };
}

module.exports = { createSupabaseProfileStore };
