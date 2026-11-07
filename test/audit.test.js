// APAS-16 · TC-AUD-01, TC-AUD-02 — audit trail for appraisal changes
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helpers');

const { request, login, close } = startServer();
test.after(close);

let cycle;
async function appraise(name, employeeId) {
  const employee = await login(name);
  const { data: { goals } } = await request(`/api/cycles/${cycle.id}/self-assessment`, { cookie: employee });
  await request(`/api/cycles/${cycle.id}/self-assessment`, { method: 'PUT', cookie: employee, body: { ratings: goals.map(goal => ({ goalId: goal.id, rating: 4 })) } });
  const boss = await login('manager');
  await request(`/api/cycles/${cycle.id}/assessments/${employeeId}/manager`, { method: 'PUT', cookie: boss, body: { ratings: goals.map(goal => ({ goalId: goal.id, rating: 4 })) } });
}

test.before(async () => {
  const hr = await login('hr');
  cycle = (await request('/api/cycles', { cookie: hr })).data.cycles.find(item => item.status === 'Open');
  const asha = await login('employee2');
  const goal = (await request('/api/goals', { cookie: asha })).data.goals[0];
  await request(`/api/goals/${goal.id}/progress`, { method: 'POST', cookie: asha, body: { note: 'Halfway there', percent: 50 } });
  await appraise('employee2', 'u-employee2');
  await appraise('employee3', 'u-employee3');
  await appraise('employee4', 'u-employee4');
  await request(`/api/cycles/${cycle.id}/finalize`, { method: 'POST', cookie: hr, body: {} });
  const next = await request('/api/cycles', { method: 'POST', cookie: hr, body: { name: 'FY 2027', startDate: '2027-04-01', endDate: '2028-03-31' } });
  await request(`/api/cycles/${next.data.cycle.id}`, { method: 'PATCH', cookie: hr, body: { status: 'Closed' } });
});

test('TC-AUD-01: every appraisal change records who, what, which record and when', async () => {
  const hr = await login('hr');
  const { data: { events } } = await request('/api/audit', { cookie: hr });
  const actions = new Set(events.map(event => event.action));
  for (const action of ['LOGIN', 'GOAL_PROGRESS_ADDED', 'SELF_ASSESSMENT_SUBMITTED', 'MANAGER_RATED', 'CYCLE_FINALIZED', 'CYCLE_CREATED', 'CYCLE_STATUS_CHANGED']) {
    assert.ok(actions.has(action), `missing audit event ${action}`);
  }
  for (const event of events.filter(item => item.action !== 'DEMO_DATA_INITIALIZED')) {
    assert.ok(event.actorId && event.at && event.targetId, `incomplete audit event ${event.action}`);
  }
  const finalized = events.find(event => event.action === 'CYCLE_FINALIZED');
  assert.equal(finalized.actorId, 'u-hr');
  assert.equal(finalized.targetId, cycle.id);
});

test('TC-AUD-02: nobody can change or delete audit history through the API', async () => {
  const hr = await login('hr');
  const before = (await request('/api/audit', { cookie: hr })).data.events.length;
  for (const method of ['PUT', 'PATCH', 'DELETE', 'POST']) {
    assert.equal((await request('/api/audit', { method, cookie: hr, body: {} })).status, 404, method);
  }
  const after = (await request('/api/audit', { cookie: hr })).data.events.length;
  assert.equal(after, before);
});

test('only HR can read the audit log', async () => {
  assert.equal((await request('/api/audit', { cookie: await login('employee') })).status, 403);
  assert.equal((await request('/api/audit', { cookie: await login('manager') })).status, 403);
});
