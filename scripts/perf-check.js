// APAS-17 · NFR-001 / TC-PERF-01 — response-time check under normal concurrent use.
// Starts its own server on a temporary data file, so the demo data is never touched.
// Settings: PERF_USERS (20), PERF_SECONDS (60), PERF_THINK_MS (1000), PERF_TARGET_MS (3000).
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const USERS = Number(process.env.PERF_USERS || 20);
const SECONDS = Number(process.env.PERF_SECONDS || 60);
const THINK_MS = Number(process.env.PERF_THINK_MS ?? 1000);
const TARGET_MS = Number(process.env.PERF_TARGET_MS || 3000);
const WRITE_EVERY = 10; // employees submit one goal per ten requests

const accounts = {
  employee: ['employee@apas.local', 'employee123'],
  employee2: ['employee2@apas.local', 'employee123'],
  employee3: ['employee3@apas.local', 'employee123'],
  employee4: ['employee4@apas.local', 'employee123'],
  manager: ['manager@apas.local', 'manager123'],
  hr: ['hr@apas.local', 'hr123']
};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const samples = new Map();
let errors = 0;

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function percentile(sorted, share) {
  return sorted[Math.max(0, Math.ceil(sorted.length * share) - 1)];
}

async function timed(baseUrl, label, route, { method = 'GET', body, cookie } = {}) {
  const started = performance.now();
  const response = await fetch(baseUrl + route, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  const elapsed = performance.now() - started;
  if (!samples.has(label)) samples.set(label, []);
  samples.get(label).push(elapsed);
  if (!response.ok) {
    errors += 1;
    console.error(`${method} ${route} → ${response.status}`);
  }
  return { response, text };
}

// One browser session: signs in, then repeats what that role does in the app until time is up.
async function virtualUser(baseUrl, name, cycleId, deadline, index) {
  const [email, password] = accounts[name];
  const { response } = await timed(baseUrl, 'POST /api/login', '/api/login', { method: 'POST', body: { email, password } });
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  const reads = {
    employee: [
      ['GET /api/goals', '/api/goals'],
      ['GET /api/cycles', '/api/cycles'],
      ['GET self-assessment', `/api/cycles/${cycleId}/self-assessment`]
    ],
    manager: [
      ['GET /api/goals', '/api/goals'],
      ['GET team', `/api/cycles/${cycleId}/team`]
    ],
    hr: [
      ['GET /api/goals', '/api/goals'],
      ['GET report', `/api/cycles/${cycleId}/report`],
      ['GET /api/audit', '/api/audit']
    ]
  }[name.replace(/\d+$/, '')];
  const isEmployee = name.startsWith('employee');
  let count = index; // staggers the writes across users
  while (Date.now() < deadline) {
    count += 1;
    if (isEmployee && count % WRITE_EVERY === 0) {
      await timed(baseUrl, 'POST /api/goals', '/api/goals', { method: 'POST', cookie, body: { title: `Load test goal ${index}-${count}`, description: '', metric: 'Measured', dueDate: '2027-03-01', weight: 10 } });
    } else {
      const [label, route] = reads[count % reads.length];
      await timed(baseUrl, label, route, { cookie });
    }
    await sleep(THINK_MS);
  }
}

async function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apas-perf-'));
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(port), APAS_DATA_FILE: path.join(tempDir, 'store.json') },
    stdio: 'ignore'
  });
  try {
    for (let tries = 0; ; tries += 1) {
      try {
        if ((await fetch(`${baseUrl}/api/health`)).ok) break;
      } catch { /* not listening yet */ }
      if (tries > 50) throw new Error('Server did not start.');
      await sleep(100);
    }
    const names = Object.keys(accounts);
    const hrLogin = await fetch(`${baseUrl}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: accounts.hr[0], password: accounts.hr[1] }) });
    const cycles = await (await fetch(`${baseUrl}/api/cycles`, { headers: { Cookie: hrLogin.headers.get('set-cookie').split(';')[0] } })).json();
    const cycleId = cycles.cycles.find(cycle => cycle.status === 'Open').id;

    console.log(`Running ${USERS} concurrent users for ${SECONDS} s (think time ${THINK_MS} ms)…`);
    const deadline = Date.now() + SECONDS * 1000;
    await Promise.all(Array.from({ length: USERS }, (_, index) => virtualUser(baseUrl, names[index % names.length], cycleId, deadline, index)));
  } finally {
    server.kill();
    await sleep(200);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const all = [...samples.values()].flat().sort((a, b) => a - b);
  const row = (label, values) => {
    const sorted = values.slice().sort((a, b) => a - b);
    return `| ${label} | ${sorted.length} | ${percentile(sorted, 0.5).toFixed(0)} | ${percentile(sorted, 0.95).toFixed(0)} | ${sorted.at(-1).toFixed(0)} |`;
  };
  console.log('\n| Operation | Requests | p50 (ms) | p95 (ms) | Max (ms) |\n|---|---:|---:|---:|---:|');
  for (const label of [...samples.keys()].sort()) console.log(row(label, samples.get(label)));
  console.log(row('**All operations**', all));
  const p95 = percentile(all, 0.95);
  const passed = p95 <= TARGET_MS && errors === 0;
  console.log(`\nFailed requests: ${errors}\nOverall p95: ${p95.toFixed(0)} ms (target ≤ ${TARGET_MS} ms) → ${passed ? 'PASS' : 'FAIL'}`);
  if (!passed) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
