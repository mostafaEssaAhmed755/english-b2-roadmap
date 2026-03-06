// ─── Milestones ───────────────────────────────────────────

function toggleMilestone(el) {
  el.classList.toggle('done');
  el.querySelector('.milestone-check').textContent = el.classList.contains('done') ? '✓' : '';
  const id = el.dataset.id;
  if (id) localStorage.setItem('milestone_' + id, el.classList.contains('done') ? '1' : '0');
  updateProgress();
}

function loadMilestones() {
  document.querySelectorAll('.milestone-item[data-id]').forEach(el => {
    if (localStorage.getItem('milestone_' + el.dataset.id) === '1') {
      el.classList.add('done');
      el.querySelector('.milestone-check').textContent = '✓';
    }
  });
  updateProgress();
}

function updateProgress() {
  const total = document.querySelectorAll('.milestone-item').length;
  const done  = document.querySelectorAll('.milestone-item.done').length;
  const pct   = Math.round((done / total) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressVal').textContent  = pct + '%';
}
