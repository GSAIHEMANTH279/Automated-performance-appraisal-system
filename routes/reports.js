// APAS-22 · FR-012 / FR-013 — appraisal history and HR cycle report
const { approvedGoals } = require('../lib/ratings');

const BANDS = ['Outstanding', 'Exceeds expectations', 'Meets expectations', 'Needs improvement', 'Unsatisfactory'];

module.exports = (app, { readStore, requireAuth, requireRole, safeUser }) => {
  // Employees see their own history, managers their own team, HR everyone.
  app.get('/api/employees/:id/history', requireAuth, (req, res) => {
    const store = readStore();
    const employee = store.users.find(user => user.id === req.params.id && user.role === 'employee');
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });
    const allowed = req.user.role === 'hr' || req.user.id === employee.id || (req.user.role === 'manager' && employee.managerId === req.user.id);
    if (!allowed) return res.status(403).json({ error: 'You cannot view this employee\'s appraisal history.' });
    const history = store.assessments
      .filter(item => item.employeeId === employee.id && item.status === 'Finalized')
      .map(item => {
        const cycle = store.cycles.find(c => c.id === item.cycleId);
        const rankedOutOf = store.assessments.filter(other => other.cycleId === item.cycleId && other.status === 'Finalized').length;
        return { cycleId: item.cycleId, cycleName: cycle?.name || '', finalScore: item.finalScore, band: item.band, rank: item.rank, rankedOutOf, finalizedAt: item.finalizedAt };
      })
      .sort((a, b) => b.finalizedAt.localeCompare(a.finalizedAt));
    res.json({ employee: safeUser(employee), history });
  });

  app.get('/api/cycles/:id/report', requireAuth, requireRole('hr'), (req, res) => {
    const store = readStore();
    const cycle = store.cycles.find(item => item.id === req.params.id);
    if (!cycle) return res.status(404).json({ error: 'Cycle not found.' });
    const participants = store.users.filter(user => user.role === 'employee' && approvedGoals(store, user.id, cycle.id).length);
    const finalized = store.assessments.filter(item => item.cycleId === cycle.id && item.status === 'Finalized');
    const average = finalized.length ? Math.round(finalized.reduce((sum, item) => sum + item.finalScore, 0) / finalized.length * 100) / 100 : null;
    const bands = Object.fromEntries(BANDS.map(name => [name, finalized.filter(item => item.band === name).length]));
    const names = new Map(store.users.map(user => [user.id, user.name]));
    const ranking = finalized.slice().sort((a, b) => a.rank - b.rank).map(item => ({ rank: item.rank, name: names.get(item.employeeId), finalScore: item.finalScore, band: item.band }));
    res.json({ cycle, finalized: Boolean(cycle.finalizedAt), participants: participants.length, finalizedCount: finalized.length, averageScore: average, bands, ranking });
  });
};
