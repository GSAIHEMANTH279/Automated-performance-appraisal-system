// APAS-21 · FR-005 — goal progress updates
const crypto = require('node:crypto');

module.exports = (app, { readStore, writeStore, audit, requireAuth, requireRole }) => {
  app.post('/api/goals/:id/progress', requireAuth, requireRole('employee'), (req, res) => {
    const note = String(req.body?.note || '').trim();
    const percent = Number(req.body?.percent);
    if (note.length < 1 || note.length > 500) return res.status(400).json({ error: 'Progress note must be 1–500 characters.' });
    if (!Number.isInteger(percent) || percent < 0 || percent > 100) return res.status(400).json({ error: 'Percent complete must be a whole number from 0 to 100.' });
    const store = readStore();
    const goal = store.goals.find(item => item.id === req.params.id);
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });
    if (goal.employeeId !== req.user.id) return res.status(403).json({ error: 'You can update progress only on your own goals.' });
    if (goal.status !== 'Approved') return res.status(409).json({ error: 'Progress can be added only to approved goals.' });
    const update = { id: crypto.randomUUID(), note, percent, at: new Date().toISOString() };
    goal.progress = [...(goal.progress || []), update];
    goal.updatedAt = update.at;
    audit(store, req.user.id, 'GOAL_PROGRESS_ADDED', goal.id);
    writeStore(store);
    res.status(201).json({ goal });
  });
};
