// APAS-14 · appraisal cycles: current-cycle banner for everyone, cycle management for HR
(() => {
  const { api, esc, showToast } = window.APAS;
  const $ = (selector) => document.querySelector(selector);

  async function refresh(user) {
    const { cycles } = await api('/api/cycles');
    const open = cycles.find(cycle => cycle.status === 'Open');
    const banner = $('#cycle-banner');
    banner.textContent = open ? `Current cycle: ${open.name} · ${open.startDate} to ${open.endDate}` : 'No appraisal cycle is open.';
    banner.classList.remove('hidden');
    $('#cycles-section').classList.toggle('hidden', user.role !== 'hr');
    if (user.role !== 'hr') return;
    $('#cycles-list').innerHTML = cycles.map(cycle => {
      const action = cycle.status === 'Open' ? ['Closed', 'Close cycle'] : !cycle.finalizedAt ? ['Open', 'Reopen'] : null;
      const label = cycle.finalizedAt ? 'Finalized' : cycle.status;
      return `<div class="cycle-row"><div><b>${esc(cycle.name)}</b><p class="muted small">${esc(cycle.startDate)} to ${esc(cycle.endDate)}</p></div>
        <span class="pill ${cycle.status === 'Open' ? 'approved' : 'submitted'}">${esc(label)}</span>
        ${action ? `<button class="button button-secondary" data-cycle-id="${esc(cycle.id)}" data-cycle-status="${action[0]}">${action[1]}</button>` : '<span></span>'}</div>`;
    }).join('') || '<p class="muted">No cycles yet.</p>';
  }

  $('#cycles-list').addEventListener('click', async event => {
    const button = event.target.closest('[data-cycle-id]');
    if (!button) return;
    try {
      await api(`/api/cycles/${encodeURIComponent(button.dataset.cycleId)}`, { method: 'PATCH', body: JSON.stringify({ status: button.dataset.cycleStatus }) });
      showToast(button.dataset.cycleStatus === 'Open' ? 'Cycle reopened.' : 'Cycle closed.');
      await window.APAS.refresh();
    } catch (error) { showToast(error.message); }
  });

  $('#cycle-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await api('/api/cycles', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) });
      form.reset();
      showToast('Cycle started.');
      await window.APAS.refresh();
    } catch (error) { showToast(error.message); }
  });

  window.APAS.features.push({ refresh });
})();
