// ─── Weekly Day Tracker ───────────────────────────────────

const DAY_NAMES_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function renderWeeklyTracker() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const container = document.getElementById('trackerDays');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + i);
    const key = 'day_' + getDateKey(d);
    const isStudied = localStorage.getItem(key) === '1';
    const isToday   = i === dayOfWeek;

    const btn = document.createElement('button');
    btn.className = 'day-dot' + (isStudied ? ' studied' : '') + (isToday ? ' today' : '');
    btn.innerHTML =
      '<span>' + DAY_NAMES_AR[i] + '</span>' +
      '<span class="day-num">' + d.getDate() + '</span>' +
      (isStudied ? '<span>✓</span>' : '');
    btn.onclick = () => {
      const newState = localStorage.getItem(key) !== '1';
      localStorage.setItem(key, newState ? '1' : '0');
      renderWeeklyTracker();
    };
    container.appendChild(btn);
  }
  renderStreak();
}

function renderStreak() {
  const today = new Date();
  let weeks = 0;
  for (let w = 0; w < 52; w++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - w * 7);
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      if (localStorage.getItem('day_' + getDateKey(day)) === '1') count++;
    }
    if (count >= 3) weeks++;
    else break;
  }
  const el = document.getElementById('streakDisplay');
  if (el) el.textContent = 'سلسلة: ' + weeks + ' أسبوع' + (weeks !== 1 ? ' متواصل' : '');
}
