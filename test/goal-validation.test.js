// APAS-4 · TC-GOAL-02 — invalid goals are rejected with a clear message and nothing is saved
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helpers');

const { request, login, close } = startServer();
test.after(close);

const valid = { title: 'Improve onboarding guide', description: 'Rewrite the guide', metric: 'Guide published', dueDate: '2027-01-31' };

test('TC-GOAL-02: goals with a short title, bad date or bad weight are rejected and not saved', async () => {
  const cookie = await login('employee');
  const before = (await request('/api/goals', { cookie })).data.goals.length;
  for (const [body, message] of [
    [{ ...valid, title: 'ab' }, /title/i],
    [{ ...valid, dueDate: '31-01-2027' }, /due date/i],
    [{ ...valid, dueDate: '2027-02-30x' }, /due date/i],
    [{ ...valid, weight: 0 }, /weight/i],
    [{ ...valid, weight: 101 }, /weight/i]
  ]) {
    const result = await request('/api/goals', { method: 'POST', cookie, body });
    assert.equal(result.status, 400, JSON.stringify(body));
    assert.match(result.data.error, message);
  }
  assert.equal((await request('/api/goals', { cookie })).data.goals.length, before);
});
