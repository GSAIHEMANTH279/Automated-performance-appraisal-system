// APAS-5 · TC-AUTH-02, TC-SEC-03, TC-SEC-04 and sign-in throttling
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { startServer } = require('./helpers');

const { request, login, close } = startServer();
test.after(close);

test('TC-AUTH-02: a wrong password is rejected with a generic message and no session', async () => {
  const wrong = await request('/api/login', { method: 'POST', body: { email: 'employee@apas.local', password: 'not-the-password' } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.data.error, 'Invalid email or password.');
  assert.equal(wrong.cookie, undefined);
  const unknown = await request('/api/login', { method: 'POST', body: { email: 'nobody@apas.local', password: 'x' } });
  assert.equal(unknown.status, 401);
  assert.equal(unknown.data.error, 'Invalid email or password.');
});

test('the session cookie is HttpOnly and SameSite', async () => {
  const result = await request('/api/login', { method: 'POST', body: { email: 'hr@apas.local', password: 'hr123' } });
  const header = result.response.headers.get('set-cookie');
  assert.match(header, /HttpOnly/);
  assert.match(header, /SameSite=Lax/);
});

test('signing out ends the session', async () => {
  const cookie = await login('employee');
  assert.equal((await request('/api/me', { cookie })).status, 200);
  await request('/api/logout', { method: 'POST', cookie, body: {} });
  assert.equal((await request('/api/me', { cookie })).status, 401);
});

test('TC-SEC-03: passwords are stored only as salted scrypt hashes', () => {
  const store = JSON.parse(fs.readFileSync(process.env.APAS_DATA_FILE, 'utf8'));
  for (const user of store.users) {
    assert.match(user.password, /^[0-9a-f]{32}:[0-9a-f]{128}$/);
    for (const plain of ['employee123', 'manager123', 'hr123']) assert.equal(user.password.includes(plain), false);
  }
});

test('TC-SEC-04: oversized or malformed requests are refused without changing data', async () => {
  const cookie = await login('employee');
  const before = (await request('/api/goals', { cookie })).data.goals.length;
  const big = JSON.stringify({ title: 'x'.repeat(40 * 1024), dueDate: '2027-01-01' });
  const tooLarge = await request('/api/goals', { method: 'POST', cookie, body: {}, raw: big });
  assert.equal(tooLarge.status, 413);
  assert.equal(tooLarge.data.error, 'Request is too large.');
  const broken = await request('/api/goals', { method: 'POST', cookie, body: {}, raw: '{"title": ' });
  assert.equal(broken.status, 400);
  assert.equal(broken.data.error, 'Request body is not valid JSON.');
  assert.equal(JSON.stringify(broken.data).includes('at '), false);
  assert.equal((await request('/api/goals', { cookie })).data.goals.length, before);
});

// Keep this test last: it locks sign-in for this test server for 60 seconds.
test('repeated wrong passwords pause sign-in (429)', async () => {
  for (let i = 0; i < 8; i += 1) await request('/api/login', { method: 'POST', body: { email: 'employee@apas.local', password: `wrong-${i}` } });
  const blocked = await request('/api/login', { method: 'POST', body: { email: 'employee@apas.local', password: 'employee123' } });
  assert.equal(blocked.status, 429);
});
