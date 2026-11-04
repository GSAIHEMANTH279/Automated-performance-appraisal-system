// APAS-13 · HR finalization and ranking panel
(() => {
  const { api, esc, showToast } = window.APAS;
  const $ = (selector) => document.querySelector(selector);
  let targetId = null;

  async function refresh(user) {
    const section = $('#ranking-section');
    section.classList.toggle('hidden', user.role !== 'hr');
    if (user.role !== 'hr') return;
    const { cycles } = await api('/api/cycles');
    const target = cycles.find(cycle => cycle.status === 'Open') || cycles.find(cycle => cycle.finalizedAt);
    const body = $('#ranking-body');
    if (!target) { targetId = null; body.innerHTML = '<p class="muted">No cycle to finalize yet.</p>'; return; }
    targetId = target.id;
    const { finalized, ranking } = await api(`/api/cycles/${encodeURIComponent(target.id)}/ranking`);
    if (finalized) {
      body.innerHTML = `<p class="notice">${esc(target.name)} finalized on ${new Date(target.finalizedAt).toLocaleDateString()} · scoring policy v1 (30% self + 70% manager)</p>
        <table class="ranking-table"><thead><tr><th>Rank</th><th>Employee</th><th>Final score</th><th>Band</th></tr></thead><tbody>
        ${ranking.map(row => `<tr><td><b>${esc(row.rank)}</b></td><td>${esc(row.name)}</td><td>${esc(row.finalScore.toFixed(2))}</td><td>${esc(row.band)}</td></tr>`).join('')}</tbody></table>`;
      return;
    }
    const { team } = await api(`/api/cycles/${encodeURIComponent(target.id)}/team`);
    const participants = team.filter(entry => entry.goals.length);
    const ready = participants.filter(entry => entry.assessment?.status === 'ManagerRated');
    body.innerHTML = `<p><b>${esc(target.name)}</b> · ${ready.length} of ${participants.length} employees fully rated</p>
      <ul class="progress-history">${participants.map(entry => `<li>${esc(entry.employee.name)}: ${entry.assessment?.status === 'ManagerRated' ? 'ready' : entry.assessment ? 'waiting for manager' : 'waiting for self-assessment'}</li>`).join('')}</ul>
      <div class="form-footer"><span class="muted small">Finalizing closes the cycle and publishes the ranking.</span><button id="finalize-button" class="button button-primary" ${ready.length === participants.length && participants.length ? '' : 'disabled'}>Finalize cycle →</button></div>`;
  }

  $('#ranking-body').addEventListener('click', async event => {
    if (event.target.id !== 'finalize-button') return;
    try {
      await api(`/api/cycles/${encodeURIComponent(targetId)}/finalize`, { method: 'POST', body: '{}' });
      showToast('Cycle finalized. Ranking published.');
      await window.APAS.refresh();
    } catch (error) { showToast(error.message); }
  });

  window.APAS.features.push({ refresh });
})();
