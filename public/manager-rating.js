// APAS-11 · manager team appraisal panel (HR sees the same list read-only)
(() => {
  const { api, esc, showToast } = window.APAS;
  const $ = (selector) => document.querySelector(selector);
  const options = selected => [1, 2, 3, 4, 5].map(value => `<option value="${value}" ${value === selected ? 'selected' : ''}>${value}</option>`).join('');
  const statusText = assessment => !assessment ? 'Waiting for self-assessment' : assessment.status === 'SelfSubmitted' ? 'Ready for your rating' : assessment.status === 'ManagerRated' ? 'Rated' : assessment.status;
  let cycleId = null;

  function member({ employee, goals, assessment }, canRate) {
    const head = `<div class="team-head"><b>${esc(employee.name)}</b><span class="pill ${assessment?.status === 'SelfSubmitted' ? 'submitted' : assessment ? 'approved' : 'revision'}">${esc(statusText(assessment))}</span></div>`;
    if (!goals.length) return `<article class="team-card">${head}<p class="muted small">No approved goals in this cycle.</p></article>`;
    const rows = goals.map(goal => {
      const self = assessment?.selfRatings?.[goal.id];
      const mine = assessment?.managerRatings?.[goal.id];
      const input = canRate && assessment?.status === 'SelfSubmitted'
        ? `<label>Your rating<select name="rating">${options(self?.rating ?? 3)}</select></label><label class="wide">Feedback<input name="comment" maxlength="500" placeholder="Feedback for ${esc(employee.name.split(' ')[0])}"></label>`
        : `<span class="pill approved">Manager ${esc(mine?.rating ?? '–')}/5</span>`;
      return `<div class="rating-row" data-goal-id="${esc(goal.id)}"><b>${esc(goal.title)} <span class="muted small">· weight ${esc(goal.weight)} · self ${esc(self?.rating ?? '–')}/5</span></b>${input}${self?.comment ? `<p class="muted small">Employee: ${esc(self.comment)}</p>` : ''}</div>`;
    }).join('');
    const ready = canRate && assessment?.status === 'SelfSubmitted';
    return `<article class="team-card">${head}${ready ? `<form class="manager-rating-form rating-form" data-employee-id="${esc(employee.id)}">${rows}<div class="form-footer"><span class="muted small">Rate every goal 1–5.</span><button class="button button-primary" type="submit">Submit ratings →</button></div></form>` : rows}</article>`;
  }

  async function refresh(user) {
    const section = $('#team-section');
    const visible = ['manager', 'hr'].includes(user.role);
    section.classList.toggle('hidden', !visible);
    if (!visible) return;
    $('#team-title').textContent = user.role === 'manager' ? 'My team\'s appraisals' : 'Appraisal progress';
    section.querySelector('.pill').textContent = user.role === 'manager' ? 'Manager' : 'HR';
    const { cycles } = await api('/api/cycles');
    const open = cycles.find(cycle => cycle.status === 'Open');
    if (!open) { cycleId = null; $('#team-list').innerHTML = '<p class="muted">No appraisal cycle is open.</p>'; return; }
    cycleId = open.id;
    const { team } = await api(`/api/cycles/${encodeURIComponent(open.id)}/team`);
    $('#team-list').innerHTML = team.map(entry => member(entry, user.role === 'manager')).join('') || '<p class="muted">No employees report to you.</p>';
  }

  $('#team-list').addEventListener('submit', async event => {
    const form = event.target.closest('.manager-rating-form');
    if (!form) return;
    event.preventDefault();
    const ratings = [...form.querySelectorAll('.rating-row')].map(row => ({ goalId: row.dataset.goalId, rating: Number(row.querySelector('[name=rating]').value), comment: row.querySelector('[name=comment]').value }));
    try {
      await api(`/api/cycles/${encodeURIComponent(cycleId)}/assessments/${encodeURIComponent(form.dataset.employeeId)}/manager`, { method: 'PUT', body: JSON.stringify({ ratings }) });
      showToast('Ratings submitted.');
      await window.APAS.refresh();
    } catch (error) { showToast(error.message); }
  });

  window.APAS.features.push({ refresh });
})();
