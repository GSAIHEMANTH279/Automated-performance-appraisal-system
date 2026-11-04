// APAS-22 · TC-HIST-01, TC-REP-01 — appraisal history and HR cycle report
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helpers');

const { request, login, close } = startServer();
test.after(close);

let cycle;
async function appraise(name, employeeId, self, manager) {
  const employee = await login(name);
  const { data: { goals } } = await request(`/api/cycles/${cycle.id}/self-assessment`, { cookie: employee });
  await request(`/api/cycles/${cycle.id}/self-assessment`, { method: 'PUT', cookie: employee, body: { ratings: goals.map((goal, i) => ({ goalId: goal.id, rating: self[i] })) } });
  const boss = await login('manager');
  await request(`/api/cycles/${cycle.id}/assessments/${employeeId}/manager`, { method: 'PUT', cookie: boss, body: { ratings: goals.map((goal, i) => ({ goalId: goal.id, rating: manager[i] })) } });
}

test.before(async () => {
  const hr = await login('hr');
  const { data } = await request('/api/cycles', { cookie: hr });
  cycle = data.cycles.find(item => item.status === 'Open');
});

test('before finalization the report is empty and history has no results', async () => {
  const hr = await login('hr');
  const { status, data } = await request(`/api/cycles/${cycle.id}/report`, { cookie: hr });
  assert.equal(status, 200);
  assert.equal(data.finalized, false);
  assert.equal(data.participants, 3);
  assert.equal(data.finalizedCount, 0);
  const asha = await login('employee2');
  assert.deepEqual((await request('/api/employees/u-employee2/history', { cookie: asha })).data.history, []);
});

test('TC-REP-01: the HR report matches the finalized results', async () => {
  await appraise('employee2', 'u-employee2', [4, 3], [5, 3]);
  await appraise('employee3', 'u-employee3', [4, 4], [4, 3]);
  await appraise('employee4', 'u-employee4', [5, 5], [4, 4]);
  const hr = await login('hr');
  assert.equal((await request(`/api/cycles/${cycle.id}/finalize`, { method: 'POST', cookie: hr, body: {} })).status, 200);
  const { data } = await request(`/api/cycles/${cycle.id}/report`, { cookie: hr });
  assert.equal(data.finalizedCount, 3);
  assert.equal(data.averageScore, 3.99);
  assert.equal(data.bands['Exceeds expectations'], 3);
  assert.deepEqual(data.ranking.map(row => row.name), ['Priya Shah', 'Asha Rao', 'Rahul Menon']);
  const manager = await login('manager');
  assert.equal((await request(`/api/cycles/${cycle.id}/report`, { cookie: manager })).status, 403);
});

test('TC-HIST-01: employees see only their own history; managers only their team', async () => {
  const asha = await login('employee2');
  const own = await request('/api/employees/u-employee2/history', { cookie: asha });
  assert.equal(own.status, 200);
  assert.deepEqual(own.data.history.map(item => [item.cycleName, item.finalScore, item.rank, item.rankedOutOf]), [['FY 2026', 4.02, 2, 3]]);
  assert.equal((await request('/api/employees/u-employee3/history', { cookie: asha })).status, 403);
  assert.equal((await request('/api/employees/u-employee2/history', { cookie: await login('manager') })).status, 200);
  assert.equal((await request('/api/employees/u-employee2/history', { cookie: await login('manager2') })).status, 403);
  assert.equal((await request('/api/employees/u-employee2/history', { cookie: await login('hr') })).status, 200);
  assert.equal((await request('/api/employees/nobody/history', { cookie: await login('hr') })).status, 404);
});
