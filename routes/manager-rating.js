// APAS-11 · FR-008 — manager ratings for the manager's own team
const { approvedGoals, parseRatings } = require('../lib/ratings');

module.exports = (app, { readStore, writeStore, audit, requireAuth, requireRole, safeUser }) => {
  // Managers see their own team; HR sees every employee (read-only).
  app.get('/api/cycles/:cycleId/team', requireAuth, requireRole('manager', 'hr'), (req, res) => {
    const store = readStore();
    const cycle = store.cycles.find(item => item.id === req.params.cycleId);
    if (!cycle) return res.status(404).json({ error: 'Cycle not found.' });
    const members = store.users.filter(user => user.role === 'employee' && (req.user.role === 'hr' || user.managerId === req.user.id));
    res.json({
      cycle,
      team: members.map(user => ({
        employee: safeUser(user),
        goals: approvedGoals(store, user.id, cycle.id),
        assessment: store.assessments.find(item => item.cycleId === cycle.id && item.employeeId === user.id) || null
      }))
    });
  });

  app.put('/api/cycles/:cycleId/assessments/:employeeId/manager', requireAuth, requireRole('manager'), (req, res) => {
    const store = readStore();
    const cycle = store.cycles.find(item => item.id === req.params.cycleId);
    if (!cycle) return res.status(404).json({ error: 'Cycle not found.' });
    const employee = store.users.find(user => user.id === req.params.employeeId && user.role === 'employee');
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });
    if (employee.managerId !== req.user.id) return res.status(403).json({ error: 'You can rate only employees who report to you.' });
    if (cycle.status !== 'Open') return res.status(409).json({ error: 'Ratings are allowed only while the cycle is open.' });
    const assessment = store.assessments.find(item => item.cycleId === cycle.id && item.employeeId === employee.id);
    if (!assessment) return res.status(409).json({ error: 'Waiting for the employee\'s self-assessment.' });
    if (assessment.status !== 'SelfSubmitted') return res.status(409).json({ error: 'This employee has already been rated.' });
    const { ratings, error } = parseRatings(req.body?.ratings, approvedGoals(store, employee.id, cycle.id));
    if (error) return res.status(400).json({ error });
    assessment.managerRatings = ratings;
    assessment.managerId = req.user.id;
    assessment.managerSubmittedAt = new Date().toISOString();
    assessment.status = 'ManagerRated';
    audit(store, req.user.id, 'MANAGER_RATED', assessment.id);
    writeStore(store);
    res.json({ assessment });
  });
};
