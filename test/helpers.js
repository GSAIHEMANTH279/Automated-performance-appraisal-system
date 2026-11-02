// Shared test helper: starts the app on a free port with its own temporary data file.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const accounts = {
  employee: ['employee@apas.local', 'employee123'],
  employee2: ['employee2@apas.local', 'employee123'],
  employee3: ['employee3@apas.local', 'employee123'],
  employee4: ['employee4@apas.local', 'employee123'],
  manager: ['manager@apas.local', 'manager123'],
  hr: ['hr@apas.local', 'hr123']
};

function startServer() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apas-test-'));
  process.env.APAS_DATA_FILE = path.join(tempDir, 'store.json');
  const { app } = require('../server');
  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function request(route, { method = 'GET', body, cookie, raw } = {}) {
    const response = await fetch(baseUrl + route, {
      method,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined
    });
    const text = await response.text();
    let data = {};
    try { data = JSON.parse(text); } catch { data = { text }; }
    return { response, status: response.status, data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }

  async function login(name) {
    const [email, password] = accounts[name];
    const result = await request('/api/login', { method: 'POST', body: { email, password } });
    if (result.status !== 200) throw new Error(`login failed for ${name}: ${result.status}`);
    return result.cookie;
  }

  function close() {
    server.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  return { request, login, close };
}

module.exports = { startServer, accounts };
