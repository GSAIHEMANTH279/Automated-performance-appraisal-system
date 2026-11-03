// APAS-10 · shared rules for self and manager ratings (used by APAS-10 and APAS-11)

// The goals an employee is appraised on: their approved goals in that cycle.
function approvedGoals(store, employeeId, cycleId) {
  return store.goals.filter(goal => goal.employeeId === employeeId && goal.cycleId === cycleId && goal.status === 'Approved');
}

// input: [{ goalId, rating, comment }] → { ratings: { <goalId>: { rating, comment } } } or { error }
function parseRatings(input, goals) {
  if (!Array.isArray(input)) return { error: 'Ratings must be a list.' };
  const allowed = new Set(goals.map(goal => goal.id));
  const ratings = {};
  for (const item of input) {
    const goalId = String(item?.goalId || '');
    if (!allowed.has(goalId)) return { error: 'Ratings can be given only for approved goals in this cycle.' };
    if (ratings[goalId]) return { error: 'Each goal can be rated only once.' };
    const rating = Number(item.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'Each rating must be a whole number from 1 to 5.' };
    const comment = String(item.comment || '').trim();
    if (comment.length > 500) return { error: 'Comments must be 500 characters or fewer.' };
    ratings[goalId] = { rating, comment };
  }
  if (Object.keys(ratings).length !== goals.length) return { error: 'Rate every approved goal before submitting.' };
  return { ratings };
}

module.exports = { approvedGoals, parseRatings };
