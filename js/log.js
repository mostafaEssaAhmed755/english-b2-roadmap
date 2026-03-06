// ─── Activity Log ─────────────────────────────────────────

const SKILL_ICONS    = { listening: '🎧', speaking: '🗣️', reading: '📖', vocab: '🗂️' };
const SKILL_NAMES_AR = { listening: 'استماع', speaking: 'كلام', reading: 'قراءة', vocab: 'مفردات' };

function getActivityLog() {
  try { return JSON.parse(localStorage.getItem('activityLog') || '[]'); } catch (e) { return []; }
}

function saveActivityLog(log) {
  localStorage.setItem('activityLog', JSON.stringify(log));
}

function addLogEntry() {
  const skill    = document.getElementById('logSkill').value;
  const duration = parseInt(document.getElementById('logDuration').value);
  const resource = document.getElementById('logResource').value.trim();
  const note     = document.getElementById('logNote').value.trim();

  if (!duration || duration < 1) { alert('يرجى إدخال مدة الجلسة بالدقائق'); return; }
  if (!resource)                  { alert('يرجى إدخال اسم المصدر أو النشاط'); return; }

  const log = getActivityLog();
  log.unshift({ id: Date.now(), date: new Date().toISOString().slice(0, 10), skill, duration, resource, note });
  saveActivityLog(log);

  document.getElementById('logDuration').value = '';
  document.getElementById('logResource').value = '';
  document.getElementById('logNote').value     = '';

  renderActivityLog();
  renderAnalytics();
}

function deleteLogEntry(id) {
  saveActivityLog(getActivityLog().filter(e => e.id !== id));
  renderActivityLog();
  renderAnalytics();
}

function renderActivityLog() {
  const log = getActivityLog();
  const container = document.getElementById('logEntries');
  if (!container) return;

  if (log.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--muted);padding:40px">لم تسجّل أي جلسة بعد — ابدأ الآن!</div>';
    return;
  }

  container.innerHTML = log.slice(0, 50).map(e => `
    <div class="log-entry">
      <div class="log-entry-skill ${e.skill}">${SKILL_ICONS[e.skill] || '📌'}</div>
      <div class="log-entry-body">
        <div class="log-entry-header">
          <span class="log-entry-resource">${e.resource}</span>
          <span class="log-entry-meta">${e.date} · ${e.duration} دقيقة · ${SKILL_NAMES_AR[e.skill] || e.skill}</span>
        </div>
        ${e.note ? `<div class="log-entry-note">${e.note}</div>` : ''}
      </div>
      <button class="log-entry-delete" onclick="deleteLogEntry(${e.id})" title="حذف">🗑</button>
    </div>
  `).join('');
}

// ─── Analytics ────────────────────────────────────────────

function renderAnalytics() {
  const log = getActivityLog();
  if (log.length === 0) return;

  const totals = { listening: 0, speaking: 0, reading: 0, vocab: 0 };
  log.forEach(e => { totals[e.skill] = (totals[e.skill] || 0) + e.duration; });

  const totalMins = Object.values(totals).reduce((a, b) => a + b, 0);
  const lsPct = totalMins > 0 ? Math.round(((totals.listening + totals.speaking) / totalMins) * 100) : 0;

  const el = id => document.getElementById(id);
  if (el('totalListening')) el('totalListening').textContent = Math.round(totals.listening / 60 * 10) / 10;
  if (el('totalSpeaking'))  el('totalSpeaking').textContent  = Math.round(totals.speaking  / 60 * 10) / 10;
  if (el('totalSessions'))  el('totalSessions').textContent  = log.length;
  if (el('lsPct'))          el('lsPct').textContent          = lsPct + '%';

  // Skill bar — last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recent = log.filter(e => new Date(e.date) >= thirtyDaysAgo);
  const recentTotals = { listening: 0, speaking: 0, reading: 0, vocab: 0 };
  recent.forEach(e => { recentTotals[e.skill] = (recentTotals[e.skill] || 0) + e.duration; });
  const recentTotal = Object.values(recentTotals).reduce((a, b) => a + b, 0);

  const barContainer = el('skillBarContainer');
  const bar          = el('skillBar');
  if (barContainer && bar && recentTotal > 0) {
    barContainer.style.display = 'block';
    bar.innerHTML = Object.entries(recentTotals).map(([skill, mins]) => {
      const pct = ((mins / recentTotal) * 100).toFixed(1);
      return `<div class="bar-segment ${skill}" style="width:${pct}%"
                   title="${SKILL_NAMES_AR[skill]}: ${Math.round(mins/60*10)/10} ساعة (${pct}%)"></div>`;
    }).join('');

    const recentLsPct = ((recentTotals.listening + recentTotals.speaking) / recentTotal) * 100;
    const warning = el('targetWarning');
    if (warning) warning.style.display = recentLsPct < 50 ? 'inline' : 'none';
  }
}

// ─── Activity Heatmap ─────────────────────────────────────

function renderHeatmap() {
  const container = document.getElementById('activityHeatmap');
  if (!container) return;
  const log = getActivityLog();

  // Build daily totals map
  const dayMap = {};
  log.forEach(e => {
    dayMap[e.date] = (dayMap[e.date] || 0) + e.duration;
  });

  const today = new Date();
  const cells = [];
  // 52 weeks × 7 days = 364 days back
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const mins = dayMap[key] || 0;
    let level = 0;
    if (mins > 0)   level = 1;
    if (mins >= 30) level = 2;
    if (mins >= 60) level = 3;
    if (mins >= 90) level = 4;
    cells.push({ key, mins, level });
  }

  // Render as grid of week columns
  const weeks = [];
  for (let w = 0; w < 52; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  container.innerHTML = `
    <div class="heatmap-grid">
      ${weeks.map(week =>
        `<div class="heatmap-col">${week.map(c =>
          `<div class="heat-cell level-${c.level}" title="${c.key}: ${c.mins} دقيقة"></div>`
        ).join('')}</div>`
      ).join('')}
    </div>
    <div class="heatmap-legend">
      <span>أقل</span>
      <div class="heat-cell level-0"></div>
      <div class="heat-cell level-1"></div>
      <div class="heat-cell level-2"></div>
      <div class="heat-cell level-3"></div>
      <div class="heat-cell level-4"></div>
      <span>أكثر</span>
    </div>
  `;
}

// ─── Data Backup ──────────────────────────────────────────

function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'english-roadmap-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
      location.reload();
    } catch (err) {
      alert('الملف غير صالح — يرجى اختيار ملف JSON صحيح');
    }
  };
  reader.readAsText(file);
}

function confirmReset() {
  if (confirm('هل أنت متأكد؟ سيتم حذف كل بياناتك. هذا لا يمكن التراجع عنه.')) {
    localStorage.clear();
    location.reload();
  }
}
