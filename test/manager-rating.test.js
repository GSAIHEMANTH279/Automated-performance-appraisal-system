// APAS-11 · TC-APP-03 and TC-GOAL-04 — manager ratings and assigned-manager checks
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helpers');

const { request, login, close } = startServer();
test.after(close);

let cycle;
async function selfAssess(name, rating) {
  const cookie = await login(name);
  const { data: { goals } } = await request(`/api/cycles/${cycle.id}/self-assessment`, { cookie });
  const result = await request(`/api/cycles/${cycle.id}/self-assessment`, { method: 'PUT', cookie, body: { ratings: goals.map(goal => ({ goalId: goal.id, rating })) } });
  assert.equal(result.status, 200);
}
async function teamEntry(cookie, employeeId) {
  const { data } = await request(`/api/cycles/${cycle.id}/team`, { cookie });
  return data.team.find(entry => entry.employee.id === employeeId);
}

test.before(async () => {
  const hr = await login('hr');
  const { data } = await request('/api/cycles', { cookie: hr });
  cycle = data.cycles.find(item => item.status === 'Open');
  await selfAssess('employee2', 4);
});

test('the manager sees their team with self-assessment status', async () => {
  const manager = await login('manager');
  const asha = await teamEntry(manager, 'u-employee2');
  assert.equal(asha.assessment.status, 'SelfSubmitted');
  assert.equal(asha.goals.length, 2);
  const rahul = await teamEntry(manager, 'u-employee3');
  assert.equal(rahul.assessment, null);
});

test('TC-APP-03: ratings are validated, saved once and locked', async () => {
  const manager = await login('manager');
  const { goals } = await teamEntry(manager, 'u-employee2');
  const url = `/api/cycles/${cycle.id}/assessments/u-employee2/manager`;
  assert.equal((await request(url, { method: 'PUT', cookie: manager, body: { ratings: goals.map(goal => ({ goalId: goal.id, rating: 6 })) } })).status, 400);
  assert.equal((await request(url, { method: 'PUT', cookie: manager, body: { ratings: [{ goalId: goals[0].id, rating: 4 }] } })).status, 400);
  const saved = await request(url, { method: 'PUT', cookie: manager, body: { ratings: goals.map(goal => ({ goalId: goal.id, rating: 5, comment: 'Strong year' })) } });
  assert.equal(saved.status, 200);
  assert.equal(saved.data.assessment.status, 'ManagerRated');
  assert.equal((await request(url, { method: 'PUT', cookie: manager, body: { ratings: goals.map(goal => ({ goalId: goal.id, rating: 5 })) } })).status, 409);
});

test('a manager cannot rate before the self-assessment', async () => {
  const manager = await login('manager');
  const result = await request(`/api/cycles/${cycle.id}/assessments/u-employee3/manager`, { method: 'PUT', cookie: manager, body: { ratings: [] } });
  assert.equal(result.status, 409);
});

test('only the employee\'s own manager can rate; employees and HR cannot', async () => {
  await selfAssess('employee4', 3);
  const url = `/api/cycles/${cycle.id}/assessments/u-employee4/manager`;
  const other = await login('manager2');
  assert.equal((await request(url, { method: 'PUT', cookie: other, body: { ratings: [] } })).status, 403);
  assert.equal((await teamEntry(other, 'u-employee4')), undefined);
  const employee = await login('employee');
  assert.equal((await request(url, { method: 'PUT', cookie: employee, body: { ratings: [] } })).status, 403);
  const hr = await login('hr');
  assert.equal((await request(url, { method: 'PUT', cookie: hr, body: { ratings: [] } })).status, 403);
  assert.ok(await teamEntry(hr, 'u-employee4'));
});

test('TC-GOAL-04: a manager cannot review goals of another manager\'s employee', async () => {
  const employee = await login('employee');
  const { data } = await request('/api/goals', { cookie: employee });
  const goal = data.goals.find(item => item.status === 'Submitted');
  const other = await login('manager2');
  const result = await request(`/api/goals/${goal.id}/review`, { method: 'PATCH', cookie: other, body: { status: 'Approved', comment: '' } });
  assert.equal(result.status, 403);
  const after = await request('/api/goals', { cookie: employee });
  assert.equal(after.data.goals.find(item => item.id === goal.id).status, 'Submitted');
});
