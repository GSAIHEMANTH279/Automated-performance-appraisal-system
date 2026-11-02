// APAS-21 · TC-GOAL-05 — goal progress updates
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helpers');

const { request, login, close } = startServer();
test.after(close);

async function firstGoal(cookie, status) {
  const { data } = await request('/api/goals', { cookie });
  return data.goals.find(goal => goal.status === status);
}

test('TC-GOAL-05: an employee records progress on an approved goal', async () => {
  const asha = await login('employee2');
  const goal = await firstGoal(asha, 'Approved');
  const result = await request(`/api/goals/${goal.id}/progress`, { method: 'POST', cookie: asha, body: { note: 'Backlog down to 35 tickets', percent: 40 } });
  assert.equal(result.status, 201);
  assert.equal(result.data.goal.progress.at(-1).percent, 40);
  const manager = await login('manager');
  const { data } = await request('/api/goals', { cookie: manager });
  assert.equal(data.goals.find(item => item.id === goal.id).progress.length, 1);
});

test('progress input is validated', async () => {
  const asha = await login('employee2');
  const goal = await firstGoal(asha, 'Approved');
  assert.equal((await request(`/api/goals/${goal.id}/progress`, { method: 'POST', cookie: asha, body: { note: 'Too much', percent: 150 } })).status, 400);
  assert.equal((await request(`/api/goals/${goal.id}/progress`, { method: 'POST', cookie: asha, body: { note: '   ', percent: 10 } })).status, 400);
});

test('progress is refused on someone else\'s goal or a goal not yet approved', async () => {
  const asha = await login('employee2');
  const ashaGoal = await firstGoal(asha, 'Approved');
  const demo = await login('employee');
  assert.equal((await request(`/api/goals/${ashaGoal.id}/progress`, { method: 'POST', cookie: demo, body: { note: 'Not mine', percent: 10 } })).status, 403);
  const submitted = await firstGoal(demo, 'Submitted');
  assert.equal((await request(`/api/goals/${submitted.id}/progress`, { method: 'POST', cookie: demo, body: { note: 'Too early', percent: 10 } })).status, 409);
  const manager = await login('manager');
  assert.equal((await request(`/api/goals/${ashaGoal.id}/progress`, { method: 'POST', cookie: manager, body: { note: 'Manager', percent: 10 } })).status, 403);
});
