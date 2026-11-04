// APAS-13 · TC-REL-01, TC-REL-02, TC-REL-04, TC-SCORE-03, TC-SCORE-05 — HR finalization and ranking
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helpers');

const { request, login, close } = startServer();
test.after(close);

let cycle;
// self and manager ratings per goal, in the order the goals were seeded
async function appraise(name, employeeId, self, manager) {
  const employee = await login(name);
  const { data: { goals } } = await request(`/api/cycles/${cycle.id}/self-assessment`, { cookie: employee });
  assert.equal((await request(`/api/cycles/${cycle.id}/self-assessment`, { method: 'PUT', cookie: employee, body: { ratings: goals.map((goal, i) => ({ goalId: goal.id, rating: self[i] })) } })).status, 200);
  const boss = await login('manager');
  assert.equal((await request(`/api/cycles/${cycle.id}/assessments/${employeeId}/manager`, { method: 'PUT', cookie: boss, body: { ratings: goals.map((goal, i) => ({ goalId: goal.id, rating: manager[i] })) } })).status, 200);
}

test.before(async () => {
  const hr = await login('hr');
  const { data } = await request('/api/cycles', { cookie: hr });
  cycle = data.cycles.find(item => item.status === 'Open');
});

test('finalization is blocked until every employee is rated', async () => {
  const hr = await login('hr');
  const result = await request(`/api/cycles/${cycle.id}/finalize`, { method: 'POST', cookie: hr, body: {} });
  assert.equal(result.status, 409);
  assert.deepEqual(result.data.missing.sort(), ['Asha Rao', 'Priya Shah', 'Rahul Menon']);
});

test('TC-REL-02: only HR can finalize or see the ranking', async () => {
  const manager = await login('manager');
  assert.equal((await request(`/api/cycles/${cycle.id}/finalize`, { method: 'POST', cookie: manager, body: {} })).status, 403);
  assert.equal((await request(`/api/cycles/${cycle.id}/ranking`, { cookie: manager })).status, 403);
  const employee = await login('employee2');
  assert.equal((await request(`/api/cycles/${cycle.id}/finalize`, { method: 'POST', cookie: employee, body: {} })).status, 403);
});

test('TC-REL-01 and TC-SCORE-03: HR finalizes and the ranking follows the scores', async () => {
  await appraise('employee2', 'u-employee2', [4, 3], [5, 3]); // 60/40 → 4.02
  await appraise('employee3', 'u-employee3', [4, 4], [4, 3]); // 50/50 → 3.65
  await appraise('employee4', 'u-employee4', [5, 5], [4, 4]); // 70/30 → 4.30
  const hr = await login('hr');
  const result = await request(`/api/cycles/${cycle.id}/finalize`, { method: 'POST', cookie: hr, body: {} });
  assert.equal(result.status, 200);
  assert.deepEqual(result.data.ranking.map(row => [row.rank, row.name, row.finalScore, row.band]), [
    [1, 'Priya Shah', 4.3, 'Exceeds expectations'],
    [2, 'Asha Rao', 4.02, 'Exceeds expectations'],
    [3, 'Rahul Menon', 3.65, 'Exceeds expectations']
  ]);
  assert.equal(result.data.cycle.status, 'Closed');
  assert.ok(result.data.cycle.finalizedAt);
});

test('TC-SCORE-05: employees without approved goals are not ranked', async () => {
  const hr = await login('hr');
  const { data } = await request(`/api/cycles/${cycle.id}/ranking`, { cookie: hr });
  assert.equal(data.finalized, true);
  assert.equal(data.ranking.some(row => row.name === 'Demo Employee'), false);
});

test('TC-REL-04: finalizing twice or reopening a finalized cycle is refused', async () => {
  const hr = await login('hr');
  assert.equal((await request(`/api/cycles/${cycle.id}/finalize`, { method: 'POST', cookie: hr, body: {} })).status, 409);
  assert.equal((await request(`/api/cycles/${cycle.id}`, { method: 'PATCH', cookie: hr, body: { status: 'Open' } })).status, 409);
  const { data } = await request(`/api/cycles/${cycle.id}/ranking`, { cookie: hr });
  assert.equal(data.ranking.length, 3);
});
