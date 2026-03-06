// ─── Phase Progress Map ────────────────────────────────────

const UNLOCK_THRESHOLD = 0.60;

// Map of task keys to their phase/level — derived dynamically from DOM
function getTasksByPhaseLevel() {
  const map = {}; // { 'p0_l0': ['p0_l0_listening', ...], ... }
  document.querySelectorAll('[data-task-key]').forEach(el => {
    const key = el.dataset.taskKey;
    const parts = key.split('_');
    const pl = parts[0] + '_' + parts[1]; // e.g. 'p0_l0'
    if (!map[pl]) map[pl] = [];
    if (!map[pl].includes(key)) map[pl].push(key);
  });
  return map;
}

function toggleLevelTask(event, taskKey) {
  event.stopPropagation();
  const isDone = localStorage.getItem('task_' + taskKey) === '1';
  localStorage.setItem('task_' + taskKey, isDone ? '0' : '1');
  // Update visual state of the clicked button
  const btn = event.currentTarget;
  btn.classList.toggle('done', !isDone);
  btn.querySelector('.check-icon').textContent = isDone ? '○' : '✓';
  renderPhaseProgressMap();
}

function toggleSlotResources(event, btn) {
  event.stopPropagation();
  const slot = btn.closest('.time-slot');
  const panel = slot.querySelector('.slot-resources-panel');
  if (!panel) return;
  const isHidden = panel.hasAttribute('hidden');
  panel.toggleAttribute('hidden', !isHidden);
  btn.classList.toggle('open', isHidden);
}

function handleSlotClick(slot, event) {
  // Load timer from slot
  const timeEl = slot.querySelector('.slot-time');
  const textEl = slot.querySelector('.slot-text');
  if (timeEl && textEl) {
    const match = timeEl.textContent.match(/\d+/);
    if (match) {
      setTimer(parseInt(match[0]), textEl.textContent.trim().substring(0, 40));
    }
  }
}

function renderPhaseProgressMap() {
  const taskMap = getTasksByPhaseLevel();

  for (let p = 0; p < 4; p++) {
    let phaseDone = 0, phaseTotal = 0;

    for (let l = 0; l < 3; l++) {
      const plKey = 'p' + p + '_l' + l;
      const tasks = taskMap[plKey] || [];
      const total = tasks.length;
      const done = tasks.filter(k => localStorage.getItem('task_' + k) === '1').length;

      phaseDone += done;
      phaseTotal += total;

      const pct = total > 0 ? done / total : 0;
      const circumference = 94;
      const fillLen = Math.round(pct * circumference * 10) / 10;

      // Ring
      const ring = document.getElementById('ppm-ring-p' + p + '-l' + l);
      if (ring) ring.setAttribute('stroke-dasharray', fillLen + ' ' + circumference);

      // Pct label
      const pctEl = document.getElementById('ppm-pct-p' + p + '-l' + l);
      if (pctEl) pctEl.textContent = Math.round(pct * 100) + '%';

      // Node icon + state
      const node = document.getElementById('ppm-p' + p + '-l' + l);
      if (node) {
        const icon = node.querySelector('.ppm-node-icon');
        if (pct >= 1.0) {
          node.classList.remove('locked', 'unlocked');
          node.classList.add('completed');
          if (icon) icon.textContent = '✓';
        }
      }

      // Unlock next level when threshold reached
      if (pct >= UNLOCK_THRESHOLD && l < 2) {
        const nextNode = document.getElementById('ppm-p' + p + '-l' + (l + 1));
        if (nextNode && nextNode.classList.contains('locked')) {
          nextNode.classList.remove('locked');
          nextNode.classList.add('unlocked');
          const nextIcon = nextNode.querySelector('.ppm-node-icon');
          if (nextIcon && nextIcon.textContent === '🔒') nextIcon.textContent = '▶';
        }
      }

      // Unlock next phase's first level when this phase > threshold
      if (pct >= UNLOCK_THRESHOLD && l === 2 && p < 3) {
        const nextPhaseNode = document.getElementById('ppm-p' + (p + 1) + '-l0');
        if (nextPhaseNode && nextPhaseNode.classList.contains('locked')) {
          nextPhaseNode.classList.remove('locked');
          nextPhaseNode.classList.add('unlocked');
          const ni = nextPhaseNode.querySelector('.ppm-node-icon');
          if (ni && ni.textContent === '🔒') ni.textContent = '▶';
          const phaseBlock = document.getElementById('ppm-phase-' + (p + 1));
          if (phaseBlock) phaseBlock.classList.remove('locked-phase');
        }
      }
    }

    // Phase bar
    const phasePct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
    const bar = document.getElementById('ppm-bar-p' + p);
    if (bar) bar.style.width = phasePct + '%';
    const lbl = document.getElementById('ppm-bar-label-p' + p);
    if (lbl) lbl.textContent = phaseDone + ' / ' + phaseTotal + ' مهمة';
  }

  // Current banner
  updateCurrentBanner(taskMap);
}

function updateCurrentBanner(taskMap) {
  const phaseNames = ['المرحلة الأولى', 'المرحلة الثانية', 'المرحلة الثالثة', 'المرحلة الرابعة'];
  const monthNames = ['الشهر الأول', 'الشهر الثاني', 'الشهر الثالث',
                      'الشهر الرابع', 'الشهر الخامس', 'الشهر السادس',
                      'الشهر السابع', 'الشهر الثامن', 'الشهر التاسع',
                      'الشهر العاشر', 'الشهر الحادي عشر', 'الشهر الثاني عشر'];

  let currentPhaseIdx = 0, currentLevelIdx = 0;
  outer: for (let p = 0; p < 4; p++) {
    for (let l = 0; l < 3; l++) {
      const plKey = 'p' + p + '_l' + l;
      const tasks = taskMap[plKey] || [];
      const total = tasks.length;
      const done = tasks.filter(k => localStorage.getItem('task_' + k) === '1').length;
      const pct = total > 0 ? done / total : 0;
      if (pct < 1.0) {
        currentPhaseIdx = p;
        currentLevelIdx = l;
        break outer;
      }
    }
    currentPhaseIdx = p; currentLevelIdx = 2;
  }

  const banner = document.getElementById('ppmCurrentLabel');
  const hint = document.getElementById('ppmUnlockHint');
  if (banner) {
    banner.textContent = 'أنت في: ' + phaseNames[currentPhaseIdx] + ' — ' + monthNames[currentPhaseIdx * 3 + currentLevelIdx];
  }

  const plKey = 'p' + currentPhaseIdx + '_l' + currentLevelIdx;
  const tasks = taskMap[plKey] || [];
  const total = tasks.length;
  const done = tasks.filter(k => localStorage.getItem('task_' + k) === '1').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const remaining = Math.ceil(total * UNLOCK_THRESHOLD) - done;

  if (hint) {
    if (pct >= 100) {
      hint.textContent = '🎉 أكملت هذا الشهر!';
    } else {
      hint.textContent = 'أكمل ' + Math.max(0, remaining) + ' مهمة إضافية للانتقال للشهر التالي (' + pct + '% / 60%)';
    }
  }
}

function loadLevelTaskStates() {
  document.querySelectorAll('[data-task-key]').forEach(slot => {
    const key = slot.dataset.taskKey;
    const isDone = localStorage.getItem('task_' + key) === '1';
    const btn = slot.querySelector('.slot-check');
    if (btn) {
      btn.classList.toggle('done', isDone);
      const icon = btn.querySelector('.check-icon');
      if (icon) icon.textContent = isDone ? '✓' : '○';
    }
  });
  renderPhaseProgressMap();
}
