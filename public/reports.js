// APAS-22 · employee "My results" and HR cycle report
(() => {
  const { api, esc } = window.APAS;
  const $ = (selector) => document.querySelector(selector);

  async function refresh(user) {
    $('#results-section').classList.toggle('hidden', user.role !== 'employee');
    $('#report-section').classList.toggle('hidden', user.role !== 'hr');
    if (user.role === 'employee') {
      const { history } = await api(`/api/employees/${encodeURIComponent(user.id)}/history`);
      $('#results-body').innerHTML = history.map(item => `<article class="stat-card"><p>${esc(item.cycleName)}</p><strong>${esc(item.finalScore.toFixed(2))}</strong><span>${esc(item.band)} · rank ${esc(item.rank)} of ${esc(item.rankedOutOf)}</span></article>`).join('')
        || '<p class="muted">Your results appear here after HR finalizes the cycle.</p>';
    }
    if (user.role === 'hr') {
      const { cycles } = await api('/api/cycles');
      const cycle = cycles.find(item => item.finalizedAt);
      if (!cycle) { $('#report-body').innerHTML = '<p class="muted">The report appears after a cycle is finalized.</p>'; return; }
      const report = await api(`/api/cycles/${encodeURIComponent(cycle.id)}/report`);
      $('#report-body').innerHTML = `<div class="stats-grid">
          <article class="stat-card"><p>CYCLE</p><strong>${esc(cycle.name)}</strong><span>Finalized ${new Date(cycle.finalizedAt).toLocaleDateString()}</span></article>
          <article class="stat-card"><p>EMPLOYEES APPRAISED</p><strong>${esc(report.finalizedCount)}</strong><span>of ${esc(report.participants)} with approved goals</span></article>
          <article class="stat-card"><p>AVERAGE SCORE</p><strong>${esc(report.averageScore?.toFixed(2) ?? '–')}</strong><span>out of 5.00</span></article>
        </div>
        <table class="ranking-table"><thead><tr><th>Band</th><th>Employees</th></tr></thead><tbody>
        ${Object.entries(report.bands).map(([name, count]) => `<tr><td>${esc(name)}</td><td>${esc(count)}</td></tr>`).join('')}</tbody></table>`;
    }
  }

  window.APAS.features.push({ refresh });
})();
