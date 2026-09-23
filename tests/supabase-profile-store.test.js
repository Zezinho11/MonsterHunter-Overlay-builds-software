const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createSupabaseProfileStore } = require('../src/infrastructure/supabase-profile-store');

function fixture(userOverride = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'hunter-supabase-'));
  const user = { id: 'user-1', email: 'deli@example.com', user_metadata: { display_name: 'Deli' }, created_at: '2026-01-01T00:00:00Z', ...userOverride };
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith('/auth/v1/signup') || url.includes('grant_type=password') || url.includes('grant_type=refresh_token')) return { ok: true, text: async () => JSON.stringify({ access_token: 'access', refresh_token: 'refresh', user }) };
    if (url.endsWith('/auth/v1/user') && options.method === 'PUT') { user.user_metadata = {...user.user_metadata,...JSON.parse(options.body).data}; return { ok: true, text: async () => JSON.stringify(user) }; }
    if (url.endsWith('/auth/v1/user')) return { ok: true, text: async () => JSON.stringify(user) };
    if (url.endsWith('/auth/v1/logout')) return { ok: true, text: async () => '' };
    if (url.includes('/rest/v1/rpc/search_community_builds')) return { ok: true, text: async () => JSON.stringify([]) };
    if (url.includes('/rest/v1/community_builds')) return { ok: true, text: async () => JSON.stringify([{ id: 'shared-1' }]) };
    return { ok: false, text: async () => JSON.stringify({ message: 'unexpected request' }) };
  };
  return { directory, calls, store: createSupabaseProfileStore({ url: 'https://hunter.supabase.co', anonKey: 'public-anon-key', sessionPath: path.join(directory, 'session'), fetchImpl }) };
}

test('returns no remote provider when Supabase is not configured', () => {
  assert.equal(createSupabaseProfileStore({}), null);
});

test('creates, restores, updates and logs out of a Supabase session', async () => {
  const { directory, calls, store } = fixture();
  const created = await store.create({ email: 'Deli@example.com', displayName: '', avatar: 'data:image/png;base64,avatar', password: 'caçador-seguro' });
  assert.equal(created.mode, 'online');
  assert.equal(created.profile.displayName, 'Deli');
  assert.equal(fs.existsSync(path.join(directory, 'session')), true);
  assert.equal((await store.update({ displayName: 'Deli Wilds' })).profile.displayName, 'Deli Wilds');
  await store.update({steamUrl:'https://steamcommunity.com/id/hunter',wildsCode:'ABC123',followedGames:['Wilds'],avatar:'data:image/png;base64,aGVsbG8='});
  const reloaded = await store.state();
  assert.equal(reloaded.profile.wildsCode,'ABC123');
  assert.equal(reloaded.profile.displayName,'Deli Wilds');
  assert.deepEqual(reloaded.profile.followedGames,['Wilds']);
  assert.equal(reloaded.profile.avatar,'data:image/png;base64,aGVsbG8=');
  assert.equal((await store.logout()).authenticated, false);
  const loggedBackIn = await store.login({ email: 'DELI@example.com', password: 'caçador-seguro' });
  assert.equal(loggedBackIn.authenticated, true);
  assert.equal(loggedBackIn.profile.displayName, 'Deli Wilds');
  assert.ok(calls.some((call) => call.url.includes('/auth/v1/signup')));
  const signup = calls.find((call) => call.url.endsWith('/auth/v1/signup'));
  const signupBody = JSON.parse(signup.options.body);
  assert.equal(signupBody.data.display_name, 'NomeCaçador');
  assert.equal(signupBody.data.avatar, 'data:image/png;base64,avatar');
  const tokenLogin = calls.find((call) => call.url.includes('grant_type=password'));
  assert.deepEqual(Object.keys(JSON.parse(tokenLogin.options.body)).sort(), ['email', 'password']);
});

test('uses NomeCaçador when the remote account has no display name', async () => {
  const { store } = fixture({ user_metadata: {} });
  const state = await store.create({ email: 'deli@example.com', displayName: '', password: 'caçador-seguro' });
  assert.equal(state.profile.displayName, 'NomeCaçador');
});

test('does not report a false login when the returned session cannot be validated', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'hunter-supabase-invalid-session-'));
  const fetchImpl = async (url) => {
    if (url.includes('grant_type=password')) return { ok: true, text: async () => JSON.stringify({ access_token: 'access', refresh_token: 'refresh' }) };
    return { ok: false, status: 401, text: async () => JSON.stringify({ error_code: 'bad_jwt', msg: 'Invalid JWT' }) };
  };
  const store = createSupabaseProfileStore({ url: 'https://hunter.supabase.co', anonKey: 'public-anon-key', sessionPath: path.join(directory, 'session'), fetchImpl });
  await assert.rejects(store.login({ email: 'deli@example.com', password: 'caçador-seguro' }), /não validou a sessão/);
  assert.equal(fs.existsSync(path.join(directory, 'session')), false);
});

test('searches the community API and publishes only allowlisted build fields', async () => {
  const { calls, store } = fixture();
  await store.login({ email: 'deli@example.com', password: 'caçador-seguro' });
  const results = await store.searchBuilds({ game: 'Monster Hunter: Wilds', weaponType: 'Espada Longa', buildType: 'DPS' });
  assert.deepEqual(results, []);
  const search = calls.find((call) => call.url.includes('/rest/v1/rpc/search_community_builds'));
  assert.deepEqual(JSON.parse(search.options.body), { game_filter: 'Monster Hunter: Wilds', weapon_filter: 'Espada Longa', type_filter: 'DPS', result_limit: 40 });
  await store.publishBuild({ id: 'local-1', title: 'Set público', game: 'Monster Hunter: Wilds', weaponType: 'Espada Longa', type: 'DPS', weaponId: 'wilds-weapon-1', talisman: 'Amuleto X', talismanId: 'charm-1', talismanSkills: [{ name: 'Antivento', level: 1 }], talismanSlots: [2], decorationSlots: { head: [{ id: 'deco-1', name: 'Joia X', requiredSlot: 1, slotIndex: 0 }] }, notes: 'não publicar', email: 'private@example.com' });
  const publish = calls.find((call) => call.url.includes('/rest/v1/community_builds?on_conflict='));
  const body = JSON.parse(publish.options.body);
  assert.equal(body.author_name, 'Deli');
  assert.deepEqual(body.payload, { id: 'local-1', title: 'Set público', game: 'Monster Hunter: Wilds', weaponId: 'wilds-weapon-1', type: 'DPS', talisman: 'Amuleto X', talismanId: 'charm-1', talismanSkills: [{ name: 'Antivento', level: 1 }], talismanSlots: [2], decorationSlots: { head: [{ id: 'deco-1', name: 'Joia X', requiredSlot: 1, slotIndex: 0 }] } });
  assert.equal(body.payload.notes, undefined);
  assert.equal(body.payload.email, undefined);
  assert.equal(publish.options.headers.Prefer, 'resolution=merge-duplicates,return=representation');
});
