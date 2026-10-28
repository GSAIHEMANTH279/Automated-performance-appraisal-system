const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apas-test-'));
process.env.APAS_DATA_FILE = path.join(tempDir, 'store.json');
const { app } = require('../server');
const server = app.listen(0);
const baseUrl = `http://127.0.0.1:${server.address().port}`;

async function request(route, { method = 'GET', body, cookie } = {}) {
  const response = await fetch(baseUrl + route, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  return { response, data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
test('health endpoint reports ready', async () => {
  const { response, data } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(data.status, 'ok');
});
test('private routes reject anonymous requests', async () => {
  const { response, data } = await request('/api/goals');
  assert.equal(response.status, 401);
  assert.match(data.error, /sign in/i);
});
test('employee can sign in and submit a goal, but cannot review it', async () => {
  const login = await request('/api/login', { method: 'POST', body: { email: 'employee@apas.local', password: 'employee123' } });
  assert.equal(login.response.status, 200);
  assert.equal(login.data.user.role, 'employee');
  assert.ok(login.cookie);
  const created = await request('/api/goals', { method: 'POST', cookie: login.cookie, body: { title: 'Ship the first milestone', description: 'Complete and test the milestone.', metric: 'All acceptance checks pass', dueDate: '2026-12-01' } });
  assert.equal(created.response.status, 201);
  const { response: forbidden } = await request(`/api/goals/${created.data.goal.id}/review`, { method: 'PATCH', cookie: login.cookie, body: { status: 'Approved', comment: '' } });
  assert.equal(forbidden.status, 403);
});
test('manager can approve a submitted goal and HR can read audit events', async () => {
  const manager = await request('/api/login', { method: 'POST', body: { email: 'manager@apas.local', password: 'manager123' } });
  const goals = await request('/api/goals', { cookie: manager.cookie });
  const pending = goals.data.goals.find(goal => goal.status === 'Submitted');
  assert.ok(pending);
  const reviewed = await request(`/api/goals/${pending.id}/review`, { method: 'PATCH', cookie: manager.cookie, body: { status: 'Approved', comment: 'Clear and measurable objective.' } });
  assert.equal(reviewed.response.status, 200);
  assert.equal(reviewed.data.goal.status, 'Approved');
  const hr = await request('/api/login', { method: 'POST', body: { email: 'hr@apas.local', password: 'hr123' } });
  const audit = await request('/api/audit', { cookie: hr.cookie });
  assert.equal(audit.response.status, 200);
  assert.ok(audit.data.events.some(event => event.action === 'GOAL_APPROVED'));
});
test('invalid review decisions are rejected', async () => {
  const manager = await request('/api/login', { method: 'POST', body: { email: 'manager@apas.local', password: 'manager123' } });
  const { response, data } = await request('/api/goals/fake-id/review', { method: 'PATCH', cookie: manager.cookie, body: { status: 'Maybe', comment: '' } });
  assert.equal(response.status, 400);
  assert.match(data.error, /Approved or Needs revision/);
});
test.after(() => {
  server.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});