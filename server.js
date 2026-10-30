const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_FILE = process.env.APAS_DATA_FILE || path.join(__dirname, 'data', 'store.json');
const sessions = new Map();
const loginFailures = new Map();

function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function passwordMatches(password, stored) {
  const [salt, expected] = String(stored || '').split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
}
const DEFAULT_CYCLE_ID = 'c-fy2026';
const DEFAULT_WEIGHT = 10;
function defaultCycle(now) {
  return { id: DEFAULT_CYCLE_ID, name: 'FY 2026', startDate: '2026-04-01', endDate: '2027-03-31', status: 'Open', createdAt: now };
}
function initialStore() {
  const now = new Date().toISOString();
  const employee = (id, name, email) => ({ id, name, email, role: 'employee', managerId: 'u-manager', password: passwordHash('employee123') });
  const goal = (employeeId, title, metric, weight, status, managerComment = '') => ({ id: crypto.randomUUID(), employeeId, cycleId: DEFAULT_CYCLE_ID, title, description: '', metric, dueDate: '2027-03-15', weight, status, managerComment, createdAt: now, updatedAt: now });
  return {
    users: [
      employee('u-employee', 'Demo Employee', 'employee@apas.local'),
      { id: 'u-manager', name: 'Demo Manager', email: 'manager@apas.local', role: 'manager', password: passwordHash('manager123') },
      { id: 'u-hr', name: 'Demo HR', email: 'hr@apas.local', role: 'hr', password: passwordHash('hr123') },
      employee('u-employee2', 'Asha Rao', 'employee2@apas.local'),
      employee('u-employee3', 'Rahul Menon', 'employee3@apas.local'),
      employee('u-employee4', 'Priya Shah', 'employee4@apas.local')
    ],
    cycles: [defaultCycle(now)],
    goals: [
      { ...goal('u-employee', 'Complete assigned learning path', 'All modules completed', DEFAULT_WEIGHT, 'Submitted'), description: 'Finish the agreed learning modules and share key takeaways.', dueDate: '2026-12-15' },
      goal('u-employee2', 'Reduce the support ticket backlog', 'Backlog under 20 tickets', 60, 'Approved', 'Clear and measurable.'),
      goal('u-employee2', 'Mentor two new joiners', 'Both complete onboarding', 40, 'Approved'),
      goal('u-employee3', 'Ship the billing module', 'Released to production', 50, 'Approved'),
      goal('u-employee3', 'Raise test coverage to 80%', 'Coverage report at 80%', 50, 'Approved'),
      goal('u-employee4', 'Automate the monthly reports', 'Reports generated without manual steps', 70, 'Approved'),
      goal('u-employee4', 'Complete security training', 'Certificate earned', 30, 'Approved')
    ],
    assessments: [],
    audit: [{ id: crypto.randomUUID(), actorId: 'system', action: 'DEMO_DATA_INITIALIZED', targetId: null, at: now }]
  };
}
function migrateStore(store) {
  const now = new Date().toISOString();
  if (!Array.isArray(store.cycles)) store.cycles = [defaultCycle(now)];
  if (!Array.isArray(store.assessments)) store.assessments = [];
  for (const user of store.users) if (user.role === 'employee' && !user.managerId) user.managerId = 'u-manager';
  const open = store.cycles.find(cycle => cycle.status === 'Open');
  for (const goal of store.goals) {
    if (!('cycleId' in goal)) goal.cycleId = open ? open.id : null;
    if (!goal.weight) goal.weight = DEFAULT_WEIGHT;
  }
  return store;
}
function ensureStore() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(initialStore(), null, 2));
}
function readStore() {
  ensureStore();
  return migrateStore(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
}
function writeStore(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const temp = DATA_FILE + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(store, null, 2));
  fs.renameSync(temp, DATA_FILE);
}
function audit(store, actorId, action, targetId) {
  store.audit.push({ id: crypto.randomUUID(), actorId, action, targetId: targetId || null, at: new Date().toISOString() });
}
function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
function sessionUser(req) {
  const token = req.cookies?.apas_session;
  const userId = token && sessions.get(token);
  if (!userId) return null;
  return readStore().users.find(user => user.id === userId) || null;
}
function requireAuth(req, res, next) {
  const user = sessionUser(req);
  if (!user) return res.status(401).json({ error: 'Please sign in to continue.' });
  req.user = user;
  next();
}
function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ error: 'Your role is not allowed to perform this action.' });
}
function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return index < 0 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  req.cookies = parseCookies(req.headers.cookie);
  next();
});
app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Automated Performance Appraisal System' }));

app.post('/api/login', (req, res) => {
  const ip = req.ip || 'local';
  const failures = loginFailures.get(ip) || { count: 0, until: 0 };
  if (failures.until > Date.now()) return res.status(429).json({ error: 'Too many attempts. Wait a minute and try again.' });
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const store = readStore();
  const user = store.users.find(item => item.email.toLowerCase() === email);
  if (!user || !passwordMatches(password, user.password)) {
    failures.count += 1;
    if (failures.count >= 8) { failures.count = 0; failures.until = Date.now() + 60_000; }
    loginFailures.set(ip, failures);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  loginFailures.delete(ip);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, user.id);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `apas_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${secure}`);
  audit(store, user.id, 'LOGIN', user.id);
  writeStore(store);
  res.json({ user: safeUser(user) });
});
app.post('/api/logout', (req, res) => {
  const token = req.cookies?.apas_session;
  const userId = token && sessions.get(token);
  if (token) sessions.delete(token);
  if (userId) {
    const store = readStore();
    audit(store, userId, 'LOGOUT', userId);
    writeStore(store);
  }
  res.setHeader('Set-Cookie', 'apas_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  res.json({ ok: true });
});
app.get('/api/me', requireAuth, (req, res) => res.json({ user: safeUser(req.user) }));

app.get('/api/goals', requireAuth, (req, res) => {
  const store = readStore();
  const goals = req.user.role === 'employee'
    ? store.goals.filter(goal => goal.employeeId === req.user.id)
    : store.goals;
  res.json({ goals: goals.map(goal => ({
    ...goal,
    employee: safeUser(store.users.find(user => user.id === goal.employeeId) || { id: goal.employeeId, name: 'Unknown', email: '', role: 'employee' })
  })) });
});
app.post('/api/goals', requireAuth, requireRole('employee'), (req, res) => {
  const title = String(req.body?.title || '').trim();
  const description = String(req.body?.description || '').trim();
  const metric = String(req.body?.metric || '').trim();
  const dueDate = String(req.body?.dueDate || '').trim();
  if (title.length < 3 || title.length > 120) return res.status(400).json({ error: 'Goal title must be 3–120 characters.' });
  if (description.length > 1000 || metric.length > 200) return res.status(400).json({ error: 'Description or success metric is too long.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(dueDate))) return res.status(400).json({ error: 'Choose a valid due date.' });
  const rawWeight = req.body?.weight;
  const weight = rawWeight === undefined || rawWeight === null || rawWeight === '' ? DEFAULT_WEIGHT : Number(rawWeight);
  if (!Number.isInteger(weight) || weight < 1 || weight > 100) return res.status(400).json({ error: 'Weight must be a whole number from 1 to 100.' });
  const store = readStore();
  const now = new Date().toISOString();
  const openCycle = store.cycles.find(cycle => cycle.status === 'Open');
  const goal = { id: crypto.randomUUID(), employeeId: req.user.id, cycleId: openCycle ? openCycle.id : null, title, description, metric, dueDate, weight, status: 'Submitted', managerComment: '', createdAt: now, updatedAt: now };
  store.goals.push(goal);
  audit(store, req.user.id, 'GOAL_SUBMITTED', goal.id);
  writeStore(store);
  res.status(201).json({ goal });
});
app.patch('/api/goals/:id/review', requireAuth, requireRole('manager', 'hr'), (req, res) => {
  const status = String(req.body?.status || '');
  const comment = String(req.body?.comment || '').trim();
  if (!['Approved', 'Needs revision'].includes(status)) return res.status(400).json({ error: 'Status must be Approved or Needs revision.' });
  if (comment.length > 1000) return res.status(400).json({ error: 'Comment must be 1000 characters or fewer.' });
  const store = readStore();
  const goal = store.goals.find(item => item.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found.' });
  if (goal.status !== 'Submitted' && goal.status !== 'Needs revision') return res.status(409).json({ error: 'Only submitted or returned goals can be reviewed.' });
  goal.status = status;
  goal.managerComment = comment;
  goal.updatedAt = new Date().toISOString();
  audit(store, req.user.id, status === 'Approved' ? 'GOAL_APPROVED' : 'GOAL_RETURNED_FOR_REVISION', goal.id);
  writeStore(store);
  res.json({ goal });
});
app.get('/api/audit', requireAuth, requireRole('hr'), (req, res) => {
  const store = readStore();
  const users = new Map(store.users.map(user => [user.id, user.name]));
  res.json({ events: store.audit.slice().reverse().map(event => ({ ...event, actorName: users.get(event.actorId) || event.actorId })) });
});

const isIsoDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const ctx = { readStore, writeStore, audit, requireAuth, requireRole, safeUser, isIsoDate };
require('./routes/cycles')(app, ctx);

if (require.main === module) {
  ensureStore();
  app.listen(PORT, () => console.log(`APAS MVP running at http://localhost:${PORT}`));
}
module.exports = { app, ensureStore, readStore, writeStore };