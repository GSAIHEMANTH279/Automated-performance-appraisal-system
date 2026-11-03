// APAS-10 · FR-007 — employee year-end self-assessment
const crypto = require('node:crypto');
const { approvedGoals, parseRatings } = require('../lib/ratings');

module.exports = (app, { readStore, writeStore, audit, requireAuth, requireRole }) => {
  app.get('/api/cycles/:cycleId/self-assessment', requireAuth, requireRole('employee'), (req, res) => {
    const store = readStore();
    const cycle = store.cycles.find(item => item.id === req.params.cycleId);
    if (!cycle) return res.status(404).json({ error: 'Cycle not found.' });
    const assessment = store.assessments.find(item => item.cycleId === cycle.id && item.employeeId === req.user.id) || null;
    res.json({ cycle, goals: approvedGoals(store, req.user.id, cycle.id), assessment });
  });

  app.put('/api/cycles/:cycleId/self-assessment', requireAuth, requireRole('employee'), (req, res) => {
    const store = readStore();
    const cycle = store.cycles.find(item => item.id === req.params.cycleId);
    if (!cycle) return res.status(404).json({ error: 'Cycle not found.' });
    if (cycle.status !== 'Open') return res.status(409).json({ error: 'Self-assessment is allowed only while the cycle is open.' });
    const goals = approvedGoals(store, req.user.id, cycle.id);
    if (!goals.length) return res.status(409).json({ error: 'You have no approved goals in this cycle.' });
    if (store.assessments.some(item => item.cycleId === cycle.id && item.employeeId === req.user.id)) return res.status(409).json({ error: 'Self-assessment already submitted; it is locked.' });
    const { ratings, error } = parseRatings(req.body?.ratings, goals);
    if (error) return res.status(400).json({ error });
    const now = new Date().toISOString();
    const assessment = { id: crypto.randomUUID(), cycleId: cycle.id, employeeId: req.user.id, selfRatings: ratings, selfSubmittedAt: now, managerRatings: null, managerSubmittedAt: null, status: 'SelfSubmitted', createdAt: now };
    store.assessments.push(assessment);
    audit(store, req.user.id, 'SELF_ASSESSMENT_SUBMITTED', assessment.id);
    writeStore(store);
    res.json({ assessment });
  });
};
