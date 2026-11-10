#!/usr/bin/env node
// APAS-4 · Test Plan §8 / §14 — runs every automated test with coverage and writes the
// reports to docs/test-reports/:
//   unit-test-report.md          every test with its result
//   coverage-report.md           line, branch and function coverage per source file
//   system-validation-report.md  every Test Plan case (§13) with its result
// Usage: npm run report   (file name must not start with "test-", or node --test runs it as a test)
const { spawnSync, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'docs', 'test-reports');
fs.mkdirSync(outDir, { recursive: true });
fs.rmSync(path.join(root, 'data', 'store.json'), { force: true }); // start from fresh demo data

const run = spawnSync(process.execPath, [
  '--test', '--experimental-test-coverage', '--test-coverage-exclude=test/**',
  '--test-reporter=spec'
], { cwd: root, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' } });
const output = (run.stdout + run.stderr).replace(/\x1b\[[0-9;]*m/g, '');

const commit = (() => { try { return execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); } catch { return 'unknown'; } })();
const header = `Generated: ${new Date().toISOString()} · Commit: \`${commit}\` · Node.js ${process.version} · Command: \`npm run report\``;

// ---- unit / integration test results
const results = [];
for (const line of output.split('\n')) {
  const m = line.match(/^\s*(✔|✖)\s+(.+?)(?:\s+\([\d.]+m?s\))?$/);
  if (m && !/^(tests|suites|pass|fail)\b/.test(m[2])) results.push({ ok: m[1] === '✔', name: m[2].trim() });
}
const total = name => (output.match(new RegExp(`ℹ ${name} (\\d+)`)) || [])[1] || '0';
const passed = results.filter(r => r.ok).length;
const failed = results.length - passed;
fs.writeFileSync(path.join(outDir, 'unit-test-report.md'), [
  '# Unit and Integration Test Report', '', header, '',
  `**Result: ${total('pass')} passed, ${total('fail')} failed, ${total('tests')} total.**`, '',
  'Tests use the Node.js built-in test runner. Unit tests call `lib/` functions directly; integration tests start the real server on a free port and call the HTTP API with fresh demo data.', '',
  '| # | Test | Result |', '|---|---|---|',
  ...results.map((r, i) => `| ${i + 1} | ${r.name.replace(/\|/g, '\\|')} | ${r.ok ? 'Pass' : '**Fail**'} |`), ''
].join('\n'));

// ---- coverage
const rows = [];
let inReport = false, folder = '';
for (const line of output.split('\n')) {
  if (line.includes('start of coverage report')) { inReport = true; continue; }
  if (line.includes('end of coverage report')) break;
  if (!inReport) continue;
  const cells = line.replace(/^ℹ\s?/, '').split('|').map(c => c.trimEnd());
  if (cells.length < 5 || /^-+$/.test(cells[0].trim()) || cells[0].trim() === 'file') continue;
  const [name, lineP, branchP, funcP, uncovered] = cells;
  if (!lineP.trim()) { folder = name.trim() + '/'; continue; }
  const file = name.trim() === 'all files' ? '**All files**' : (name.startsWith(' ') ? folder : '') + name.trim();
  rows.push(`| ${file} | ${lineP.trim()} | ${branchP.trim()} | ${funcP.trim()} | ${uncovered.trim() || '–'} |`);
}
fs.writeFileSync(path.join(outDir, 'coverage-report.md'), [
  '# Code Coverage and Branch Coverage Report', '', header, '',
  'Measured with the Node.js built-in coverage (`--experimental-test-coverage`) over all automated tests. Test files are excluded.', '',
  '| File | Line % | Branch % | Function % | Uncovered lines |', '|---|---|---|---|---|',
  ...rows, '',
  '**Line coverage** = share of code lines run by the tests. **Branch coverage** = share of `if`/`else`, `?:`, `||` and similar decision paths taken by the tests.', ''
].join('\n'));

// ---- system validation against the Test Plan
const plan = fs.readFileSync(path.join(root, 'SRS_SAD_TestPlan', 'Test_Plan.md'), 'utf8');
const cases = [...plan.matchAll(/^\| (TC-[A-Z]+-\d+) \| ([^|]*) \| ([^|]*) \| ([^|]*) \| ([^|]*) \|/gm)]
  .map(m => ({ id: m[1], req: m[2].trim(), scenario: m[3].trim(), expected: m[4].trim(), type: m[5].trim() }));
const mapped = {}; // older tests are named in the Test Plan's mapping list instead of carrying a TC id
for (const m of plan.matchAll(/^- "(.+?)" → (.+)$/gm)) for (const id of m[2].match(/TC-[A-Z]+-\d+/g) || []) (mapped[id] ||= []).push(m[1]);
const rowsSV = cases.map(c => {
  const tests = results.filter(r => r.name.includes(c.id) || (mapped[c.id] || []).includes(r.name));
  let status;
  if (tests.length) status = tests.every(t => t.ok) ? 'Pass (automated)' : '**Fail**';
  else status = 'Manual: record result';
  return `| ${c.id} | ${c.req} | ${c.scenario} | ${c.expected} | ${c.type} | ${status} |`;
});
fs.writeFileSync(path.join(outDir, 'system-validation-report.md'), [
  '# System Validation Report', '', header, '',
  'Every test case from Test Plan §13. Automated cases are filled in from the test run above. For **Manual** cases, run the step in the browser (`npm start`, http://localhost:3000) and replace the status with **Pass** or **Fail**, the tester\'s name and the date.', '',
  '| Test ID | Requirement | Scenario | Expected result | Type | Status |', '|---|---|---|---|---|---|',
  ...rowsSV, ''
].join('\n'));

console.log(`Tests: ${passed} passed, ${failed} failed. Reports written to docs/test-reports/`);
process.exit(run.status === 0 ? 0 : 1);
