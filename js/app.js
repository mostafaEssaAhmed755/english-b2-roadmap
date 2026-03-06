// ─── State ────────────────────────────────────────────────
let currentPhase = 0;

// ─── Theme ────────────────────────────────────────────────
function toggleTheme() {
  const current = document.documentElement.dataset.theme || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  document.getElementById('themeToggle').textContent = next === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('theme', next);
}

// ─── Phase Navigation ─────────────────────────────────────
function showPhase(index) {
  document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('phase-' + index).classList.add('active');
  document.querySelectorAll('.tab')[index].classList.add('active');
  currentPhase = index;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  renderWeeklyTracker();

  const savedDay = localStorage.getItem('activeStudyDay');
  if (savedDay !== null && index < 4) {
    const phaseEl = document.getElementById('phase-' + index);
    if (phaseEl) {
      highlightDayCards(parseInt(savedDay), phaseEl.querySelectorAll('.day-card'));
      phaseEl.querySelectorAll('.day-sel-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === parseInt(savedDay));
      });
    }
  }

  if (index === 5) {
    renderActivityLog();
    renderAnalytics();
  }
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
  renderWeeklyTracker();
  renderActivityLog();
  renderAnalytics();
  for (let i = 0; i < 4; i++) refreshPrompt(i);

  // Make time-slots clickable → load duration into timer
  document.querySelectorAll('.time-slot').forEach(slot => {
    const timeEl = slot.querySelector('.slot-time');
    const textEl = slot.querySelector('.slot-text');
    if (timeEl && textEl) {
      const match = timeEl.textContent.match(/\d+/);
      if (match) {
        const mins = parseInt(match[0]);
        const label = textEl.textContent.trim().substring(0, 40);
        slot.addEventListener('click', () => setTimer(mins, label));
        slot.setAttribute('title', 'اضغط لضبط المؤقت على ' + mins + ' دقيقة');
      }
    }
  });

  // Restore day highlight on phase-0
  const savedDay = localStorage.getItem('activeStudyDay');
  if (savedDay !== null) {
    const phaseEl = document.getElementById('phase-0');
    if (phaseEl) {
      highlightDayCards(parseInt(savedDay), phaseEl.querySelectorAll('.day-card'));
      phaseEl.querySelectorAll('.day-sel-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === parseInt(savedDay));
      });
    }
  }
});
