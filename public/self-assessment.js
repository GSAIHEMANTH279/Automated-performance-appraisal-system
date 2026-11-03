// APAS-10 · employee year-end self-assessment panel
(() => {
  const { api, esc, showToast } = window.APAS;
  const $ = (selector) => document.querySelector(selector);
  const options = selected => [1, 2, 3, 4, 5].map(value => `<option value="${value}" ${value === selected ? 'selected' : ''}>${value}</option>`).join('');
  let cycleId = null;

  async function refresh(user) {
    const section = $('#self-assessment-section');
    section.classList.toggle('hidden', user.role !== 'employee');
    if (user.role !== 'employee') return;
    const { cycles } = await api('/api/cycles');
    const open = cycles.find(cycle => cycle.status === 'Open');
    const body = $('#self-assessment-body');
    if (!open) { cycleId = null; body.innerHTML = '<p class="muted">No appraisal cycle is open.</p>'; return; }
    cycleId = open.id;
    const { goals, assessment } = await api(`/api/cycles/${encodeURIComponent(open.id)}/self-assessment`);
    if (!goals.length) { body.innerHTML = '<p class="muted">You need at least one approved goal in this cycle before the year-end self-assessment.</p>'; return; }
    if (assessment) {
      body.innerHTML = `<p class="notice">Submitted ${new Date(assessment.selfSubmittedAt).toLocaleDateString()} · status <b>${esc(assessment.status)}</b></p>` +
        goals.map(goal => `<div class="rating-row"><b>${esc(goal.title)}</b><span class="pill approved">Self ${esc(assessment.selfRatings[goal.id]?.rating ?? '–')}/5</span><p class="muted small">${esc(assessment.selfRatings[goal.id]?.comment || '')}</p></div>`).join('');
      return;
    }
    body.innerHTML = `<form id="self-assessment-form" class="rating-form"><p class="muted small">Rate each approved goal: 1 Unsatisfactory · 2 Needs improvement · 3 Meets · 4 Exceeds · 5 Outstanding. You can submit once.</p>
      ${goals.map(goal => `<div class="rating-row" data-goal-id="${esc(goal.id)}"><b>${esc(goal.title)}</b><label>Rating<select name="rating">${options(3)}</select></label><label class="wide">Comment<input name="comment" maxlength="500" placeholder="What did you achieve?"></label></div>`).join('')}
      <div class="form-footer"><span class="muted small">Weights: ${goals.map(goal => `${esc(goal.title)} ${esc(goal.weight)}`).join(' · ')}</span><button class="button button-primary" type="submit">Submit self-assessment →</button></div></form>`;
  }

  $('#self-assessment-body').addEventListener('submit', async event => {
    if (event.target.id !== 'self-assessment-form') return;
    event.preventDefault();
    const ratings = [...event.target.querySelectorAll('.rating-row')].map(row => ({ goalId: row.dataset.goalId, rating: Number(row.querySelector('[name=rating]').value), comment: row.querySelector('[name=comment]').value }));
    try {
      await api(`/api/cycles/${encodeURIComponent(cycleId)}/self-assessment`, { method: 'PUT', body: JSON.stringify({ ratings }) });
      showToast('Self-assessment submitted.');
      await window.APAS.refresh();
    } catch (error) { showToast(error.message); }
  });

  window.APAS.features.push({ refresh });
})();
