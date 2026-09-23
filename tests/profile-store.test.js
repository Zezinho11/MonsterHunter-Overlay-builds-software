const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createProfileStore } = require('../src/infrastructure/profile-store');

function fixtureStore() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'hunter-profile-'));
  return { directory, store: createProfileStore(path.join(directory, 'profiles.v1.json')) };
}

test('creates a local profile without persisting plaintext password', () => {
  const { directory, store } = fixtureStore();
  const created = store.create({ email: 'Deli@Example.com', displayName: 'Deli', password: 'caçador-seguro' });
  assert.equal(created.authenticated, true);
  assert.equal(created.profile.email, 'deli@example.com');
  const raw = fs.readFileSync(path.join(directory, 'profiles.v1.json'), 'utf8');
  assert.equal(raw.includes('caçador-seguro'), false);
  assert.equal(raw.includes('passwordHash'), true);
});

test('logs in, updates the profile and logs out', () => {
  const { store } = fixtureStore();
  store.create({ email: 'hunter@example.com', displayName: 'Hunter', password: '12345678' });
  store.logout();
  assert.equal(store.state().authenticated, false);
  assert.equal(store.login({ email: 'HUNTER@example.com', password: '12345678' }).profile.displayName, 'Hunter');
  assert.equal(store.update({ displayName: 'Hunter Wilds' }).profile.displayName, 'Hunter Wilds');
  assert.equal(store.logout().profile, null);
});

test('rejects duplicate accounts and invalid credentials', () => {
  const { store } = fixtureStore();
  store.create({ email: 'hunter@example.com', displayName: 'Hunter', password: '12345678' });
  assert.throws(() => store.create({ email: 'HUNTER@example.com', displayName: 'Other', password: '12345678' }), /Já existe/);
  assert.throws(() => store.login({ email: 'hunter@example.com', password: 'wrongpass' }), /inválidos/);
});

test('persists social details and isolates avatars between accounts', () => {
  const { store, directory } = fixtureStore();
  store.create({email:'first@example.com',password:'12345678'});
  const details = {steamUrl:'https://steamcommunity.com/id/hunter',wildsCode:'ABC123',hunterTitle:'Explorador',followedGames:['Wilds'],avatar:'data:image/png;base64,aGVsbG8='};
  store.update(details);
  store.logout();
  store.create({email:'second@example.com',password:'12345678'});
  assert.equal(store.state().profile.avatar,null);
  store.logout();
  const restored = createProfileStore(path.join(directory,'profiles.v1.json')).login({email:'first@example.com',password:'12345678'}).profile;
  for (const key of Object.keys(details)) assert.deepEqual(restored[key],details[key]);
  assert.throws(()=>store.update({steamUrl:'https://evil.test/id/hunter'}),/Use https/);
});
