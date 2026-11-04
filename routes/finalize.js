// APAS-13 · FR-010 / FR-011 / NFR-002 — HR finalization and ranking
const { approvedGoals } = require('../lib/ratings');
const { calculateScore, rank, ScoringError } = require('../lib/scoring');

module.exports = (app, { readStore, writeStore, audit, requireAuth, requireRole }) => {
  app.post('/api/cycles/:id/finalize', requireAuth, requireRole('hr'), (req, res) => {
    const store = readStore();
    const cycle = store.cycles.find(item => item.id === req.params.id);
    if (!cycle) return res.status(404).json({ error: 'Cycle not found.' });
    if (cycle.finalizedAt) return res.status(409).json({ error: 'This cycle is already finalized.' });
    const participants = store.users.filter(user => user.role === 'employee' && approvedGoals(store, user.id, cycle.id).length);
    if (!participants.length) return res.status(409).json({ error: 'No employee has approved goals in this cycle.' });
    const assessmentOf = user => store.assessments.find(item => item.cycleId === cycle.id && item.employeeId === user.id);
    const missing = participants.filter(user => assessmentOf(user)?.status !== 'ManagerRated').map(user => user.name);
    if (missing.length) return res.status(409).json({ error: `Still waiting for ratings: ${missing.join(', ')}.`, missing });

    // Calculate everything first, then change the data in one step (no partial finalization).
    const scored = [];
    for (const user of participants) {
      const assessment = assessmentOf(user);
      const goals = approvedGoals(store, user.id, cycle.id).map(goal => ({ weight: goal.weight, selfRating: assessment.selfRatings[goal.id].rating, managerRating: assessment.managerRatings[goal.id].rating }));
      try {
        scored.push({ assessment, ...calculateScore(goals) });
      } catch (error) {
        if (error instanceof ScoringError) return res.status(409).json({ error: `${user.name}: ${error.message}` });
        throw error;
      }
    }
    const results = rank(scored);
    const now = new Date().toISOString();
    for (const result of results) {
      Object.assign(result.assessment, { finalScore: result.finalScore, managerScore: result.managerScore, band: result.band, rank: result.rank, policyVersion: result.policyVersion, status: 'Finalized', finalizedAt: now });
    }
    cycle.status = 'Closed';
    cycle.finalizedAt = now;
    audit(store, req.user.id, 'CYCLE_FINALIZED', cycle.id);
    writeStore(store);
    res.json({ cycle, ranking: rankingFor(store, cycle) });
  });

  app.get('/api/cycles/:id/ranking', requireAuth, requireRole('hr'), (req, res) => {
    const store = readStore();
    const cycle = store.cycles.find(item => item.id === req.params.id);
    if (!cycle) return res.status(404).json({ error: 'Cycle not found.' });
    res.json({ cycle, finalized: Boolean(cycle.finalizedAt), ranking: rankingFor(store, cycle) });
  });
};

function rankingFor(store, cycle) {
  const names = new Map(store.users.map(user => [user.id, user.name]));
  return store.assessments
    .filter(item => item.cycleId === cycle.id && item.status === 'Finalized')
    .sort((a, b) => a.rank - b.rank || names.get(a.employeeId).localeCompare(names.get(b.employeeId)))
    .map(item => ({ rank: item.rank, employeeId: item.employeeId, name: names.get(item.employeeId), finalScore: item.finalScore, managerScore: item.managerScore, band: item.band }));
}
