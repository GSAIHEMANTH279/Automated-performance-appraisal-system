// APAS-14 · FR-002 / FR-006 — appraisal cycles
const crypto = require('node:crypto');

module.exports = (app, { readStore, writeStore, audit, requireAuth, requireRole, isIsoDate }) => {
  app.get('/api/cycles', requireAuth, (req, res) => {
    const { cycles } = readStore();
    res.json({ cycles: cycles.slice().sort((a, b) => b.startDate.localeCompare(a.startDate)) });
  });

  app.post('/api/cycles', requireAuth, requireRole('hr'), (req, res) => {
    const name = String(req.body?.name || '').trim();
    const startDate = String(req.body?.startDate || '').trim();
    const endDate = String(req.body?.endDate || '').trim();
    if (name.length < 3 || name.length > 80) return res.status(400).json({ error: 'Cycle name must be 3–80 characters.' });
    if (!isIsoDate(startDate) || !isIsoDate(endDate)) return res.status(400).json({ error: 'Choose valid start and end dates.' });
    if (endDate <= startDate) return res.status(400).json({ error: 'End date must be after the start date.' });
    const store = readStore();
    if (store.cycles.some(cycle => cycle.name.toLowerCase() === name.toLowerCase())) return res.status(409).json({ error: 'A cycle with this name already exists.' });
    if (store.cycles.some(cycle => cycle.status === 'Open')) return res.status(409).json({ error: 'Close the current open cycle before starting a new one.' });
    const cycle = { id: crypto.randomUUID(), name, startDate, endDate, status: 'Open', createdAt: new Date().toISOString() };
    store.cycles.push(cycle);
    audit(store, req.user.id, 'CYCLE_CREATED', cycle.id);
    writeStore(store);
    res.status(201).json({ cycle });
  });

  app.patch('/api/cycles/:id', requireAuth, requireRole('hr'), (req, res) => {
    const status = String(req.body?.status || '');
    if (!['Open', 'Closed'].includes(status)) return res.status(400).json({ error: 'Status must be Open or Closed.' });
    const store = readStore();
    const cycle = store.cycles.find(item => item.id === req.params.id);
    if (!cycle) return res.status(404).json({ error: 'Cycle not found.' });
    if (cycle.finalizedAt) return res.status(409).json({ error: 'A finalized cycle cannot be reopened.' });
    if (status === 'Open' && store.cycles.some(item => item.status === 'Open' && item.id !== cycle.id)) return res.status(409).json({ error: 'Only one cycle can be open at a time.' });
    cycle.status = status;
    cycle.updatedAt = new Date().toISOString();
    audit(store, req.user.id, 'CYCLE_STATUS_CHANGED', cycle.id);
    writeStore(store);
    res.json({ cycle });
  });
};
