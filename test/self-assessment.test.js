// APAS-10 · TC-APP-01, TC-APP-02 — employee self-assessment
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helpers');

const { request, login, close } = startServer();
test.after(close);

async function openCycle(cookie) {
  const { data } = await request('/api/cycles', { cookie });
  return data.cycles.find(cycle => cycle.status === 'Open');
}

test('an employee sees their approved goals for the open cycle', async () => {
  const asha = await login('employee2');
  const cycle = await openCycle(asha);
  const { status, data } = await request(`/api/cycles/${cycle.id}/self-assessment`, { cookie: asha });
  assert.equal(status, 200);
  assert.equal(data.goals.length, 2);
  assert.equal(data.assessment, null);
});

test('ratings are validated: every goal, whole numbers 1–5', async () => {
  const asha = await login('employee2');
  const cycle = await openCycle(asha);
  const { data: { goals } } = await request(`/api/cycles/${cycle.id}/self-assessment`, { cookie: asha });
  const put = ratings => request(`/api/cycles/${cycle.id}/self-assessment`, { method: 'PUT', cookie: asha, body: { ratings } });
  assert.equal((await put([{ goalId: goals[0].id, rating: 4 }])).status, 400);
  assert.equal((await put(goals.map(goal => ({ goalId: goal.id, rating: 6 })))).status, 400);
  assert.equal((await put(goals.map(goal => ({ goalId: goal.id, rating: 0 })))).status, 400);
  assert.equal((await put(goals.map(goal => ({ goalId: 'not-a-goal', rating: 3 })))).status, 400);
});

test('TC-APP-01 and TC-APP-02: submitted once, then locked', async () => {
  const asha = await login('employee2');
  const cycle = await openCycle(asha);
  const { data: { goals } } = await request(`/api/cycles/${cycle.id}/self-assessment`, { cookie: asha });
  const body = { ratings: goals.map((goal, i) => ({ goalId: goal.id, rating: 4 - i, comment: 'Delivered on time' })) };
  const first = await request(`/api/cycles/${cycle.id}/self-assessment`, { method: 'PUT', cookie: asha, body });
  assert.equal(first.status, 200);
  assert.equal(first.data.assessment.status, 'SelfSubmitted');
  const second = await request(`/api/cycles/${cycle.id}/self-assessment`, { method: 'PUT', cookie: asha, body });
  assert.equal(second.status, 409);
});

test('managers cannot submit a self-assessment, and employees need approved goals', async () => {
  const manager = await login('manager');
  const cycle = await openCycle(manager);
  assert.equal((await request(`/api/cycles/${cycle.id}/self-assessment`, { method: 'PUT', cookie: manager, body: { ratings: [] } })).status, 403);
  const demo = await login('employee');
  assert.equal((await request(`/api/cycles/${cycle.id}/self-assessment`, { method: 'PUT', cookie: demo, body: { ratings: [] } })).status, 409);
});

test('no self-assessment once the cycle is closed', async () => {
  const hr = await login('hr');
  const cycle = await openCycle(hr);
  await request(`/api/cycles/${cycle.id}`, { method: 'PATCH', cookie: hr, body: { status: 'Closed' } });
  const rahul = await login('employee3');
  const { data: { goals } } = await request(`/api/cycles/${cycle.id}/self-assessment`, { cookie: rahul });
  const result = await request(`/api/cycles/${cycle.id}/self-assessment`, { method: 'PUT', cookie: rahul, body: { ratings: goals.map(goal => ({ goalId: goal.id, rating: 3 })) } });
  assert.equal(result.status, 409);
});
