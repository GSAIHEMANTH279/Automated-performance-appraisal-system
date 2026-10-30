// Syntax-checks every JavaScript file the app ships (works on Windows, macOS and Linux).
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const files = ['server.js'];
for (const dir of ['routes', 'lib', 'public', 'scripts']) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) continue;
  for (const name of fs.readdirSync(full)) if (name.endsWith('.js')) files.push(path.join(dir, name));
}
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}
if (failed) process.exit(1);
console.log(`Syntax OK: ${files.length} files`);
