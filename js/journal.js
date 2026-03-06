// ─── Speaking Journal + Pronunciation Radar ───────────────

let journalMediaRecorder = null;
let journalAudioChunks   = [];
let journalRecording     = false;
let journalTimerRef      = null;
let journalSeconds       = 0;
let journalCurrentScores = { fluency: 0, vocab: 0, grammar: 0, pronunciation: 0 };
let journalCurrentBlob   = null;

// ── Speaking Journal ──────────────────────────────────────

function getJournalTopic() {
  const topics = SPEAKING_TOPICS.flat();
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const el = document.getElementById('journalTopic');
  if (el) el.textContent = topic;
}

async function toggleJournalRecord() {
  const btn  = document.getElementById('journalRecordBtn');
  const timerEl = document.getElementById('journalTimerDisplay');
  const playback = document.getElementById('journalPlayback');
  const rubric = document.getElementById('journalRubric');
  if (!btn) return;

  if (journalRecording) {
    // Stop
    journalMediaRecorder.stop();
    journalRecording = false;
    clearInterval(journalTimerRef);
    btn.textContent = '● ابدأ التسجيل';
    btn.classList.remove('recording');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    journalAudioChunks = [];
    journalSeconds = 0;
    journalMediaRecorder = new MediaRecorder(stream);
    journalMediaRecorder.ondataavailable = e => journalAudioChunks.push(e.data);
    journalMediaRecorder.onstop = () => {
      journalCurrentBlob = new Blob(journalAudioChunks, { type: 'audio/webm' });
      if (playback) {
        playback.src = URL.createObjectURL(journalCurrentBlob);
        playback.style.display = 'block';
      }
      if (rubric) { rubric.removeAttribute('hidden'); renderRubricStars(); }
      stream.getTracks().forEach(t => t.stop());
    };
    journalMediaRecorder.start();
    journalRecording = true;
    btn.textContent = '⏹ إيقاف التسجيل';
    btn.classList.add('recording');

    journalTimerRef = setInterval(() => {
      journalSeconds++;
      const m = Math.floor(journalSeconds / 60);
      const s = journalSeconds % 60;
      if (timerEl) timerEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
  } catch (err) {
    alert('لم نتمكن من الوصول للميكروفون — تأكد من منح الإذن');
  }
}

function renderRubricStars() {
  ['fluency', 'vocab', 'grammar', 'pronunciation'].forEach(dim => {
    const container = document.getElementById('stars-' + dim);
    if (!container) return;
    container.innerHTML = [1,2,3,4,5].map(n =>
      `<button class="rubric-star" onclick="setScore('${dim}', ${n})" data-val="${n}">☆</button>`
    ).join('');
  });
}

function setScore(dim, val) {
  journalCurrentScores[dim] = val;
  const container = document.getElementById('stars-' + dim);
  if (!container) return;
  container.querySelectorAll('.rubric-star').forEach((btn, i) => {
    btn.textContent = i < val ? '★' : '☆';
    btn.classList.toggle('active', i < val);
  });
}

function saveJournalEntry() {
  const topicEl = document.getElementById('journalTopic');
  const topic = topicEl ? topicEl.textContent : '';
  const entry = {
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    topic,
    duration: journalSeconds,
    scores: { ...journalCurrentScores }
  };
  const log = getJournalLog();
  log.unshift(entry);
  localStorage.setItem('speaking_journal', JSON.stringify(log));
  journalCurrentScores = { fluency: 0, vocab: 0, grammar: 0, pronunciation: 0 };
  const rubric = document.getElementById('journalRubric');
  if (rubric) rubric.setAttribute('hidden', '');
  renderJournalChart();
  alert('✅ تم حفظ التقييم!');
}

function getJournalLog() {
  try { return JSON.parse(localStorage.getItem('speaking_journal') || '[]'); } catch { return []; }
}

function renderJournalChart() {
  const container = document.getElementById('journalChart');
  if (!container) return;
  const log = getJournalLog().slice(0, 10).reverse();
  if (log.length === 0) { container.innerHTML = ''; return; }

  const dims = ['fluency', 'vocab', 'grammar', 'pronunciation'];
  const dimAr = { fluency: 'Fluency', vocab: 'Vocabulary', grammar: 'Grammar', pronunciation: 'Pronunciation' };

  container.innerHTML = `
    <div class="journal-chart-title">تقدمك في آخر ${log.length} جلسات</div>
    <div class="journal-chart-body">
      ${dims.map(dim => `
        <div class="jchart-row">
          <span class="jchart-label">${dimAr[dim]}</span>
          <div class="jchart-bars">
            ${log.map(e => {
              const val = (e.scores && e.scores[dim]) || 0;
              const pct = (val / 5) * 100;
              return `<div class="jchart-bar" style="height:${pct}%" title="${e.date}: ${val}/5"></div>`;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Pronunciation Radar ───────────────────────────────────

const PHONEME_PAIRS = [
  { id: 'p-b',    sym: '/p/ vs /b/', words: 'pin — bin, pack — back',        tip: '/p/ مع نفَس واضح، /b/ بدون نفَس' },
  { id: 'v-f',    sym: '/v/ vs /f/', words: 'vine — fine, very — fairy',      tip: '/v/ يُشغّل الحبال الصوتية' },
  { id: 'th-s',   sym: 'θ vs /s/',   words: 'think — sink, three — sea',      tip: 'θ: اللسان بين الأسنان' },
  { id: 'th-d',   sym: 'ð vs /d/',   words: 'this — dis, they — day',         tip: 'ð: θ لكن مع الصوت' },
  { id: 'w-v',    sym: '/w/ vs /v/', words: 'wine — vine, west — vest',       tip: '/w/ بتدوير الشفتين' },
  { id: 'i-ee',   sym: '/ɪ/ vs /iː/',words: 'ship — sheep, bit — beat',      tip: '/iː/ أطول وأشد توتراً' },
  { id: 'ae-e',   sym: '/æ/ vs /e/', words: 'bad — bed, hat — het',           tip: '/æ/ فم أفتح وأوسع' },
  { id: 'u-oo',   sym: '/ʌ/ vs /uː/',words: 'cup — coop, luck — look',       tip: '/ʌ/ في المنتصف بدون تدوير' },
  { id: 'r-l',    sym: '/r/ vs /l/', words: 'right — light, read — lead',     tip: '/r/ اللسان لا يلمس السقف' },
  { id: 'ng-n',   sym: '/ŋ/ vs /n/', words: 'sing — sin, king — kin',         tip: '/ŋ/ في مؤخرة الحلق' },
  { id: 'ch-sh',  sym: '/tʃ/ vs /ʃ/', words: 'chin — shin, cheap — sheep',   tip: '/tʃ/ ابدأ بـ /t/ قصيرة' },
  { id: 'dj-j',   sym: '/dʒ/ vs /j/', words: 'jet — yet, joke — yoke',       tip: '/dʒ/ ابدأ بـ /d/ قصيرة' },
];

function renderPhonemeGrid() {
  const grid = document.getElementById('phonemeGrid');
  if (!grid) return;
  grid.innerHTML = PHONEME_PAIRS.map(p => {
    const done = localStorage.getItem('phoneme_' + p.id) === '1';
    return `
      <div class="phoneme-card ${done ? 'mastered' : ''}" id="phoneme-card-${p.id}">
        <div class="phoneme-sym">${p.sym}</div>
        <div class="phoneme-words">${p.words}</div>
        <div class="phoneme-tip">${p.tip}</div>
        <button class="phoneme-master-btn" onclick="togglePhonemeMastered('${p.id}')">
          ${done ? '✓ أتقنته' : 'أتقنته ✓'}
        </button>
      </div>
    `;
  }).join('');
}

function togglePhonemeMastered(id) {
  const isDone = localStorage.getItem('phoneme_' + id) === '1';
  localStorage.setItem('phoneme_' + id, isDone ? '0' : '1');
  renderPhonemeGrid();
}
