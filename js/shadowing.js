// ─── Shadowing Mode ────────────────────────────────────────

let shadowMediaRecorder = null;
let shadowAudioChunks   = [];
let shadowRecording     = false;

const SHADOW_EXAMPLES = [
  { phase: 0, title: 'BBC 6 Minute English — Daily Life', url: 'https://www.youtube.com/watch?v=sQd_bboFQgE', level: 'B1', topic: 'Daily life' },
  { phase: 0, title: 'English with Lucy — 100 Daily Phrases', url: 'https://www.youtube.com/watch?v=_-gASn_JIhA', level: 'B1', topic: 'Phrases' },
  { phase: 0, title: 'Speak English with Vanessa — Morning Routine', url: 'https://www.youtube.com/watch?v=vn71vjYwHHM', level: 'B1', topic: 'Speaking' },
  { phase: 1, title: 'TED-Ed — How language shapes thought', url: 'https://www.youtube.com/watch?v=RKK7wGAYP6k', level: 'B1+', topic: 'Language' },
  { phase: 1, title: 'BBC News — Short Reports', url: 'https://www.youtube.com/watch?v=2TmMmVoLFyw', level: 'B2', topic: 'News' },
  { phase: 2, title: 'TED Talk — Your body language shapes who you are', url: 'https://www.youtube.com/watch?v=Ks-_Mh1QhMc', level: 'B2', topic: 'Psychology' },
  { phase: 2, title: 'NPR Shortcast — 5min Stories', url: 'https://www.youtube.com/watch?v=jMEjfKxWLrI', level: 'B2', topic: 'Stories' },
  { phase: 3, title: 'Obama Speech — Formal English', url: 'https://www.youtube.com/watch?v=OFPwDe22CoY', level: 'C1', topic: 'Formal' },
  { phase: 3, title: 'Economist Podcast — In Brief', url: 'https://www.youtube.com/watch?v=7mxPh6e6SYA', level: 'C1', topic: 'Economics' },
];

function loadShadowVideo() {
  const url = document.getElementById('shadowYoutubeUrl').value.trim();
  if (!url) return;

  const embedUrl = youtubeToEmbed(url);
  if (!embedUrl) {
    alert('الرابط غير صالح — استخدم رابط YouTube صحيح');
    return;
  }

  const container = document.getElementById('shadowPlayerContainer');
  container.innerHTML =
    '<iframe width="100%" height="100%" src="' + embedUrl +
    '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
}

function youtubeToEmbed(url) {
  let id = null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      id = u.searchParams.get('v');
    } else if (u.hostname === 'youtu.be') {
      id = u.pathname.slice(1);
    }
  } catch (e) { return null; }
  if (!id) return null;
  return 'https://www.youtube.com/embed/' + id + '?rel=0';
}

function toggleTranscriptVisibility() {
  const ta = document.getElementById('shadowTranscript');
  const btn = document.getElementById('shadowToggleText');
  if (!ta || !btn) return;
  const isHidden = ta.style.opacity === '0.05';
  ta.style.opacity = isHidden ? '1' : '0.05';
  ta.style.userSelect = isHidden ? '' : 'none';
  btn.textContent = isHidden ? 'إخفاء النص — Shadow Mode' : 'إظهار النص';
}

async function toggleShadowRecording() {
  const btn = document.getElementById('shadowRecord');
  const playback = document.getElementById('shadowPlayback');
  if (!btn || !playback) return;

  if (shadowRecording) {
    // Stop
    shadowMediaRecorder.stop();
    shadowRecording = false;
    btn.textContent = '● تسجيل صوتك';
    btn.classList.remove('recording');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    shadowAudioChunks = [];
    shadowMediaRecorder = new MediaRecorder(stream);
    shadowMediaRecorder.ondataavailable = e => shadowAudioChunks.push(e.data);
    shadowMediaRecorder.onstop = () => {
      const blob = new Blob(shadowAudioChunks, { type: 'audio/webm' });
      playback.src = URL.createObjectURL(blob);
      playback.style.display = 'block';
      stream.getTracks().forEach(t => t.stop());
    };
    shadowMediaRecorder.start();
    shadowRecording = true;
    btn.textContent = '⏹ إيقاف التسجيل';
    btn.classList.add('recording');
  } catch (err) {
    alert('لم نتمكن من الوصول للميكروفون — تأكد من منح الإذن');
  }
}

function renderShadowExamples() {
  const container = document.getElementById('shadowExamples');
  if (!container) return;
  container.innerHTML = SHADOW_EXAMPLES.map(ex => `
    <div class="shadow-example-card">
      <div class="shadow-ex-header">
        <span class="shadow-ex-level level-${ex.phase}">${ex.level}</span>
        <span class="shadow-ex-topic">${ex.topic}</span>
      </div>
      <div class="shadow-ex-title">${ex.title}</div>
      <div class="shadow-ex-actions">
        <button onclick="loadExampleVideo('${ex.url}')">▶ تحميل وتشغيل</button>
        <a href="${ex.url}" target="_blank" rel="noopener">فتح في YouTube ↗</a>
      </div>
    </div>
  `).join('');
}

function loadExampleVideo(url) {
  document.getElementById('shadowYoutubeUrl').value = url;
  loadShadowVideo();
  document.getElementById('shadowYoutubeUrl').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
