// ─── State ────────────────────────────────────────────────
let currentSection = 'plan';
let currentPhase   = 0;

// ─── Theme ────────────────────────────────────────────────
function toggleTheme() {
  const current = document.documentElement.dataset.theme || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  document.getElementById('themeToggle').textContent = next === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('theme', next);
}

// ─── Section Navigation ────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  const sectionEl = document.getElementById('section-' + name);
  if (sectionEl) sectionEl.classList.add('active');

  const tabEl = document.querySelector('[data-section="' + name + '"]');
  if (tabEl) tabEl.classList.add('active');

  currentSection = name;

  // Show phase sub-nav only for plan section
  const subnav = document.getElementById('phaseSubnav');
  if (subnav) subnav.style.display = name === 'plan' ? 'flex' : 'none';

  if (name === 'log')      { renderActivityLog(); renderAnalytics(); renderHeatmap(); }
  if (name === 'shadowing') { renderShadowExamples(); }
  if (name === 'speaking')  { renderPhonemeGrid(); renderJournalChart(); }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Phase Navigation (within plan section) ───────────────
function showPhase(index) {
  document.querySelectorAll('#section-plan .phase').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));

  const phaseEl = document.getElementById('phase-' + index);
  if (phaseEl) phaseEl.classList.add('active');

  const tabs = document.querySelectorAll('.phase-tab');
  if (tabs[index]) tabs[index].classList.add('active');

  currentPhase = index;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Day Selector ─────────────────────────────────────────
function highlightDayCards(index, cards) {
  cards.forEach((card, i) => {
    card.classList.remove('day-active', 'day-inactive');
    card.classList.add(i === index ? 'day-active' : 'day-inactive');
  });
}

function selectDay(index, btn) {
  const phaseEl = document.getElementById('phase-' + currentPhase);
  if (!phaseEl) return;
  highlightDayCards(index, phaseEl.querySelectorAll('.day-card'));
  phaseEl.querySelectorAll('.day-sel-btn').forEach((b, i) => b.classList.toggle('active', i === index));
  localStorage.setItem('activeStudyDay', index);
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  // Theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.dataset.theme = savedTheme;
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

  // All modules
  loadMilestones();
  renderActivityLog();
  renderAnalytics();
  renderHeatmap();
  for (let i = 0; i < 4; i++) refreshPrompt(i);

  // Init phase progress map
  renderPhaseProgressMap();
  loadLevelTaskStates();
});
