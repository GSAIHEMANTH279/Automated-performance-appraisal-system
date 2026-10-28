const $ = (selector) => document.querySelector(selector);
let currentUser = null;
const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const api = async (url, options = {}) => {
  const response = await fetch(url, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Something went wrong.');
  return payload;
};
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 2800);
}
function showLoggedOut() {
  currentUser = null;
  $('#login-view').classList.remove('hidden');
  $('#app-view').classList.add('hidden');
  $('#user-area').classList.add('hidden');
}
function showLoggedIn(user) {
  currentUser = user;
  $('#login-view').classList.add('hidden');
  $('#app-view').classList.remove('hidden');
  $('#user-area').classList.remove('hidden');
  $('#user-label').textContent = user.name + ' · ' + user.role.toUpperCase();
  $('#welcome-title').textContent = `Hello, ${user.name.split(' ')[0]}.`;
  $('#welcome-copy').textContent = user.role === 'employee' ? 'Set clear goals and follow their review status.' : user.role === 'manager' ? 'Review submitted goals and return actionable feedback.' : 'Monitor appraisal activity and review the audit trail.';
  $('#employee-tools').classList.toggle('hidden', user.role !== 'employee');
  $('#audit-section').classList.toggle('hidden', user.role !== 'hr');
  $('#goals-heading').textContent = user.role === 'employee' ? 'My goals' : 'Team goals';
}
function statusClass(status) {
  return status === 'Approved' ? 'approved' : status === 'Needs revision' ? 'revision' : 'submitted';
}
function renderGoals(goals) {
  $('#goal-count').textContent = `${goals.length} goal${goals.length === 1 ? '' : 's'}`;
  if (!goals.length) {
    $('#goals-list').innerHTML = '<div class="empty-state"><span class="empty-icon">◎</span><h3>No goals yet</h3><p>Submitted objectives will appear here.</p></div>';
    return;
  }
  $('#goals-list').innerHTML = goals.map(goal => `
    <article class="goal-card">
      <div class="goal-main"><div class="goal-topline"><span class="pill ${statusClass(goal.status)}">${esc(goal.status)}</span><span class="muted small">Due ${esc(goal.dueDate)}</span></div>
      <h3>${esc(goal.title)}</h3><p class="goal-description">${esc(goal.description || 'No description added.')}</p>
      <div class="metric"><span>SUCCESS METRIC</span><p>${esc(goal.metric || 'Not specified')}</p></div>
      ${currentUser.role !== 'employee' ? `<p class="owner-line">Submitted by <b>${esc(goal.employee?.name || 'Employee')}</b></p>` : ''}
      ${goal.managerComment ? `<div class="review-note"><b>Review note</b><p>${esc(goal.managerComment)}</p></div>` : ''}
      </div>
      ${['manager','hr'].includes(currentUser.role) && ['Submitted','Needs revision'].includes(goal.status) ? `
        <form class="review-form" data-goal-id="${esc(goal.id)}"><label>Feedback<textarea name="comment" rows="2" maxlength="1000" placeholder="Add helpful feedback (optional)">${esc(goal.managerComment || '')}</textarea></label><div class="review-actions"><button class="button button-secondary" name="status" value="Needs revision" type="submit">Return</button><button class="button button-primary" name="status" value="Approved" type="submit">Approve</button></div></form>` : ''}
    </article>`).join('');
  document.querySelectorAll('.review-form').forEach(form => form.addEventListener('submit', async event => {
    event.preventDefault();
    const status = event.submitter.value;
    try {
      await api(`/api/goals/${encodeURIComponent(form.dataset.goalId)}/review`, { method: 'PATCH', body: JSON.stringify({ status, comment: new FormData(form).get('comment') }) });
      showToast(status === 'Approved' ? 'Goal approved.' : 'Goal returned for revision.');
      await refreshWorkspace();
    } catch (error) { showToast(error.message); }
  }));
}
async function refreshWorkspace() {
  const { goals } = await api('/api/goals');
  renderGoals(goals);
  const approved = goals.filter(goal => goal.status === 'Approved').length;
  const submitted = goals.filter(goal => goal.status === 'Submitted').length;
  const revision = goals.filter(goal => goal.status === 'Needs revision').length;
  $('#stats').innerHTML = [
    ['TOTAL GOALS', goals.length, 'Across the current view'],
    ['AWAITING REVIEW', submitted, 'Submitted objectives'],
    ['APPROVED', approved, 'Reviewed and approved'],
    ['NEEDS REVISION', revision, 'Feedback requested']
  ].map(([label, value, note]) => `<article class="stat-card"><p>${label}</p><strong>${value}</strong><span>${note}</span></article>`).join('');
  if (currentUser.role === 'hr') {
    const { events } = await api('/api/audit');
    $('#audit-list').innerHTML = events.slice(0, 12).map(event => `<div class="audit-row"><span class="audit-dot"></span><div><b>${esc(event.action.replaceAll('_',' ').toLowerCase())}</b><p>${esc(event.actorName)} · ${new Date(event.at).toLocaleString()}</p></div></div>`).join('') || '<p class="muted">No audit events yet.</p>';
  }
}
$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  $('#login-error').textContent = '';
  const data = new FormData(event.currentTarget);
  try {
    const { user } = await api('/api/login', { method: 'POST', body: JSON.stringify({ email: data.get('email'), password: data.get('password') }) });
    showLoggedIn(user);
    await refreshWorkspace();
  } catch (error) { $('#login-error').textContent = error.message; }
});
$('#goal-form').addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  try {
    await api('/api/goals', { method: 'POST', body: JSON.stringify(Object.fromEntries(data.entries())) });
    event.currentTarget.reset();
    $('#goal-message').textContent = 'Goal submitted successfully.';
    await refreshWorkspace();
  } catch (error) { $('#goal-message').textContent = error.message; }
});
$('#logout-button').addEventListener('click', async () => {
  try { await api('/api/logout', { method: 'POST', body: '{}' }); } finally { showLoggedOut(); }
});
$('#refresh-button').addEventListener('click', () => refreshWorkspace().then(() => showToast('Workspace refreshed.')).catch(error => showToast(error.message)));
(async () => {
  try {
    const { user } = await api('/api/me');
    showLoggedIn(user);
    await refreshWorkspace();
  } catch { showLoggedOut(); }
})();