// APAS-14 · TC-CYCLE-01, TC-CYCLE-02 and goal weights
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helpers');

const { request, login, close } = startServer();
test.after(close);

test('every role sees the seeded open cycle', async () => {
  const cookie = await login('employee');
  const { status, data } = await request('/api/cycles', { cookie });
  assert.equal(status, 200);
  const open = data.cycles.find(cycle => cycle.status === 'Open');
  assert.equal(open.name, 'FY 2026');
});

test('the extra demo employees can sign in', async () => {
  for (const name of ['employee2', 'employee3', 'employee4']) assert.ok(await login(name));
});

test('TC-CYCLE-02: only HR can create a cycle and dates must be valid', async () => {
  const employee = await login('employee');
  const forbidden = await request('/api/cycles', { method: 'POST', cookie: employee, body: { name: 'FY 2027', startDate: '2027-04-01', endDate: '2028-03-31' } });
  assert.equal(forbidden.status, 403);
  const hr = await login('hr');
  const backwards = await request('/api/cycles', { method: 'POST', cookie: hr, body: { name: 'FY 2027', startDate: '2027-04-01', endDate: '2027-01-01' } });
  assert.equal(backwards.status, 400);
  const badDate = await request('/api/cycles', { method: 'POST', cookie: hr, body: { name: 'FY 2027', startDate: '2027-02-30', endDate: '2027-12-31' } });
  assert.equal(badDate.status, 400);
});

test('a second cycle cannot open while one is open', async () => {
  const hr = await login('hr');
  const result = await request('/api/cycles', { method: 'POST', cookie: hr, body: { name: 'FY 2027', startDate: '2027-04-01', endDate: '2028-03-31' } });
  assert.equal(result.status, 409);
});

test('TC-CYCLE-01: HR closes the open cycle and starts a new one', async () => {
  const hr = await login('hr');
  const { data: { cycles } } = await request('/api/cycles', { cookie: hr });
  const fy2026 = cycles.find(cycle => cycle.name === 'FY 2026');
  const closed = await request(`/api/cycles/${fy2026.id}`, { method: 'PATCH', cookie: hr, body: { status: 'Closed' } });
  assert.equal(closed.status, 200);
  assert.equal(closed.data.cycle.status, 'Closed');
  const created = await request('/api/cycles', { method: 'POST', cookie: hr, body: { name: 'FY 2027', startDate: '2027-04-01', endDate: '2028-03-31' } });
  assert.equal(created.status, 201);
  assert.equal(created.data.cycle.status, 'Open');
  const reopen = await request(`/api/cycles/${fy2026.id}`, { method: 'PATCH', cookie: hr, body: { status: 'Open' } });
  assert.equal(reopen.status, 409);
});

test('new goals join the open cycle and carry a weight', async () => {
  const employee = await login('employee');
  const { data: { cycles } } = await request('/api/cycles', { cookie: employee });
  const open = cycles.find(cycle => cycle.status === 'Open');
  const created = await request('/api/goals', { method: 'POST', cookie: employee, body: { title: 'Lead the quarterly demo', description: '', metric: 'Demo delivered', dueDate: '2027-06-30', weight: 40 } });
  assert.equal(created.status, 201);
  assert.equal(created.data.goal.cycleId, open.id);
  assert.equal(created.data.goal.weight, 40);
  const badWeight = await request('/api/goals', { method: 'POST', cookie: employee, body: { title: 'Another goal', description: '', metric: '', dueDate: '2027-06-30', weight: 0 } });
  assert.equal(badWeight.status, 400);
});
