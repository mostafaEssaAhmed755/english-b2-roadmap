// ─── Pomodoro Timer ───────────────────────────────────────

let timerInterval = null;
let timerSeconds = 25 * 60;
let timerRunning = false;
let timerOriginalSeconds = 25 * 60;

function setTimer(minutes, label) {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = minutes * 60;
  timerOriginalSeconds = minutes * 60;
  document.getElementById('timerActivity').textContent = label;
  document.getElementById('timerDisplay').classList.remove('timer-urgent');
  renderTimerDisplay();
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  timerInterval = setInterval(() => {
    timerSeconds--;
    renderTimerDisplay();
    if (timerSeconds <= 60) document.getElementById('timerDisplay').classList.add('timer-urgent');
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      document.getElementById('timerDisplay').textContent = '00:00';
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('انتهى الوقت! ✅', { body: document.getElementById('timerActivity').textContent });
      }
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = timerOriginalSeconds;
  document.getElementById('timerDisplay').classList.remove('timer-urgent');
  renderTimerDisplay();
}

function renderTimerDisplay() {
  const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const s = (timerSeconds % 60).toString().padStart(2, '0');
  document.getElementById('timerDisplay').textContent = m + ':' + s;
  document.title = m + ':' + s + ' — Roadmap B2';
}
