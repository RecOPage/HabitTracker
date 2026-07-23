/* ==========================================================================
   🎮 8-BIT RETRO PIXEL ART HABIT BINDER - JAVASCRIPT LOGIC
   ========================================================================== */

// --- Application State ---
const state = {
  studentCount: parseInt(localStorage.getItem("pixel_student_count") || "24", 10),
  targetGoalCount: parseInt(localStorage.getItem("pixel_target_goal_count") || "15", 10),
  activeHabit: {
    title: localStorage.getItem("pixel_active_habit_title") || "내 책상 위 물건 3개 정리하기",
    desc: localStorage.getItem("pixel_active_habit_desc") || "1분 동안 내 주변 쓰레기를 줍고 연필을 연필꽂이에 쏙 넣어요!",
    startDate: localStorage.getItem("pixel_active_habit_start_date") || "2026.09.01",
    endDate: localStorage.getItem("pixel_active_habit_end_date") || "2026.09.12",
    totalDays: parseInt(localStorage.getItem("pixel_active_habit_total_days") || "10", 10)
  },
  studentNames: JSON.parse(localStorage.getItem("pixel_student_names") || "[]"),
  flippedCardIndices: new Set(),
  completedStreakDays: new Set(JSON.parse(localStorage.getItem("pixel_completed_streak_days") || "[]")),
  cardIcon: localStorage.getItem("pixel_card_icon") || "⭐",
  hallOfFame: JSON.parse(localStorage.getItem("pixel_hall_of_fame")) || [],
  timer: {
    interval: null,
    totalSeconds: 60,
    remainingSeconds: 60,
    isRunning: false
  },
  hasCelebratedCurrentGoal: false
};

function getStudentDisplayName(index) {
  if (state.studentNames && state.studentNames[index - 1]) {
    return state.studentNames[index - 1];
  }
  return `학생 ${String(index).padStart(2, "0")}`;
}

window.setPresetDays = function(days) {
  const input = document.getElementById("inputHabitTotalDays");
  if (input) input.value = days;
  audio.playClick();
};

// Data Backup (JSON Export)
window.exportDataBackup = function() {
  const backupObj = {
    studentCount: state.studentCount,
    targetGoalCount: state.targetGoalCount,
    studentNames: state.studentNames,
    cardIcon: state.cardIcon,
    activeHabit: state.activeHabit,
    completedStreakDays: Array.from(state.completedStreakDays),
    hallOfFame: state.hallOfFame,
    observationLogs: JSON.parse(localStorage.getItem("pixel_observation_logs") || "[]"),
    exportDate: new Date().toLocaleDateString("ko-KR")
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `마이크로해빗_백업_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  audio.playClick();
};

// Data Restore (JSON Import)
window.importDataBackup = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.studentCount) localStorage.setItem("pixel_student_count", data.studentCount);
      if (data.targetGoalCount) localStorage.setItem("pixel_target_goal_count", data.targetGoalCount);
      if (data.studentNames) localStorage.setItem("pixel_student_names", JSON.stringify(data.studentNames));
      if (data.cardIcon) localStorage.setItem("pixel_card_icon", data.cardIcon);
      if (data.activeHabit) {
        localStorage.setItem("pixel_active_habit_title", data.activeHabit.title);
        localStorage.setItem("pixel_active_habit_desc", data.activeHabit.desc);
        localStorage.setItem("pixel_active_habit_start_date", data.activeHabit.startDate);
        localStorage.setItem("pixel_active_habit_end_date", data.activeHabit.endDate);
        localStorage.setItem("pixel_active_habit_total_days", data.activeHabit.totalDays);
      }
      if (data.completedStreakDays) localStorage.setItem("pixel_completed_streak_days", JSON.stringify(data.completedStreakDays));
      if (data.hallOfFame) localStorage.setItem("pixel_hall_of_fame", JSON.stringify(data.hallOfFame));
      if (data.observationLogs) localStorage.setItem("pixel_observation_logs", JSON.stringify(data.observationLogs));

      alert("🎉 데이터가 성공적으로 백업 파일에서 복원되었습니다!");
      location.reload();
    } catch (err) {
      alert("⚠️ 올바르지 않은 백업 파일 형식입니다.");
    }
  };
  reader.readAsText(file);
};

// --- Web Audio API 8-Bit Sound Synthesizer ---
class PixelAudioController {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // 8-Bit Card Flip Blip Sound ("뾱!")
  playBlip() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 8-Bit Goal Achieved Fanfare
  playFanfare() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 659.25, d: 0.1 },  // E5
      { f: 783.99, d: 0.1 },  // G5
      { f: 1046.50, d: 0.3 }  // C6
    ];

    let offset = 0;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(n.f, now + offset);

      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + n.d + 0.05);
      offset += n.d * 0.8;
    });
  }

  playClick() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

const audio = new PixelAudioController();

// --- Fullscreen 8-Bit Golden Pixel Star Fireworks Physics Engine ---
class PixelStarEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.isRunning = false;
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  triggerCelebration() {
    this.particles = [];
    this.isRunning = true;
    const count = 50;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: -30 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 7,
        vy: Math.random() * 3 + 4,
        size: Math.random() * 16 + 22,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.12,
        bounce: 0.55
      });
    }

    this.loop();

    setTimeout(() => {
      this.isRunning = false;
    }, 5000);
  }

  loop() {
    if (!this.isRunning && this.particles.length === 0) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      return;
    }

    this.update();
    this.draw();

    if (this.isRunning || this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    }
  }

  update() {
    const gravity = 0.32;
    const floorY = this.height - 30;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      if (p.y > floorY) {
        p.y = floorY;
        p.vy *= -p.bounce;
        p.vx *= 0.8;
      }

      if (p.x < -50 || p.x > this.width + 50 || p.y > this.height + 100) {
        this.particles.splice(i, 1);
      }
    }
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = "#222034"; // 8-Bit Chunky Dark Border
    this.ctx.stroke();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const starColors = ["#FBF236", "#DF7126", "#99E550", "#D95763", "#F59E0B"];

    this.particles.forEach((p, idx) => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      const color = starColors[idx % starColors.length];
      const r = p.size / 2;

      this.drawStar(0, 0, 5, r, r * 0.48, color);

      this.ctx.restore();
    });
  }
}

let starEngine;

// --- DOM Rendering & Controller Logic ---
document.addEventListener("DOMContentLoaded", () => {
  starEngine = new PixelStarEngine("bananaCanvas");

  renderActiveHabitUI();
  renderStreakTracker();
  renderCardBinderGrid();
  renderHallOfFame();
  updateProgressUI();

  setupEventListeners();
  setupKeyboardShortcuts();
});

// --- Active Habit Header Controller ---
function renderActiveHabitUI() {
  document.getElementById("displayHabitTitle").textContent = state.activeHabit.title;
  document.getElementById("displayHabitPeriod").textContent = `기간: ${state.activeHabit.startDate} ~ ${state.activeHabit.endDate} (${state.activeHabit.totalDays}일 미션)`;

  document.getElementById("inputActiveHabitTitle").value = state.activeHabit.title;
  document.getElementById("inputActiveHabitDesc").value = state.activeHabit.desc;
  document.getElementById("inputHabitStartDate").value = state.activeHabit.startDate;
  document.getElementById("inputHabitEndDate").value = state.activeHabit.endDate;
  document.getElementById("inputHabitTotalDays").value = state.activeHabit.totalDays;
}

// --- Daily Habit Streak Tracker Controller (기간별 일자 추적 스탬프 판) ---
function renderStreakTracker() {
  const grid = document.getElementById("streakSlotsGrid");
  const summaryText = document.getElementById("streakSummaryText");
  if (!grid || !summaryText) return;

  grid.innerHTML = "";
  const total = state.activeHabit.totalDays;
  const completedCount = state.completedStreakDays.size;

  summaryText.textContent = `${total}일 중 ${completedCount}일 달성 완료`;

  for (let d = 1; d <= total; d++) {
    const isCompleted = state.completedStreakDays.has(d);

    const slot = document.createElement("div");
    slot.className = `streak-slot ${isCompleted ? "completed" : ""}`;
    slot.title = `${d}일차 달성 스탬프 (클릭하여 스탬프 변경 가능)`;
    slot.innerHTML = `
      <span class="streak-slot-num">${d}일차</span>
      <span class="streak-slot-icon">${isCompleted ? "⭐" : "🔒"}</span>
    `;

    slot.addEventListener("click", () => toggleStreakSlot(d));
    grid.appendChild(slot);
  }
}

function toggleStreakSlot(day) {
  audio.playBlip();

  if (state.completedStreakDays.has(day)) {
    state.completedStreakDays.delete(day);
  } else {
    state.completedStreakDays.add(day);
  }

  localStorage.setItem("pixel_completed_streak_days", JSON.stringify(Array.from(state.completedStreakDays)));
  renderStreakTracker();
}

function autoStampNextStreakSlot() {
  const total = state.activeHabit.totalDays;
  for (let d = 1; d <= total; d++) {
    if (!state.completedStreakDays.has(d)) {
      state.completedStreakDays.add(d);
      localStorage.setItem("pixel_completed_streak_days", JSON.stringify(Array.from(state.completedStreakDays)));
      renderStreakTracker();
      break;
    }
  }
}

// --- Dynamic Card Binder Grid Controller ---
function renderCardBinderGrid() {
  const container = document.getElementById("cardBinderGrid");
  const countInfo = document.getElementById("binderStudentCountInfo");
  if (!container) return;

  container.innerHTML = "";
  countInfo.textContent = `총 ${state.studentCount}명 렌더링됨 (클릭하여 카드 flip)`;

  for (let i = 1; i <= state.studentCount; i++) {
    const isFlipped = state.flippedCardIndices.has(i);

    const cardEl = document.createElement("div");
    cardEl.className = `pixel-card-item ${isFlipped ? "is-flipped" : ""}`;
    cardEl.dataset.index = i;

    const numStr = String(i).padStart(2, "0");

    cardEl.innerHTML = `
      <div class="pixel-card-inner">
        <!-- Card Front (Unflipped) -->
        <div class="card-face card-front">
          <span class="card-num-badge">#${numStr}</span>
          <div class="card-avatar-box">❓</div>
          <span class="card-student-name">${getStudentDisplayName(i)}</span>
          <span class="card-status-label">READY</span>
        </div>

        <!-- Card Back (Flipped / Achieved) -->
        <div class="card-face card-back">
          <span class="card-num-badge">#${numStr}</span>
          <div class="banana-pixel-icon">${state.cardIcon}</div>
          <span class="card-achieved-text">SUCCESS</span>
          <span class="card-status-label" style="color:var(--pixel-text);">달성 완료</span>
        </div>
      </div>
    `;

    cardEl.addEventListener("click", () => toggleCardFlip(i, cardEl));
    container.appendChild(cardEl);
  }
}

// Card Flip Interaction
function toggleCardFlip(index, cardEl) {
  audio.playBlip();

  if (state.flippedCardIndices.has(index)) {
    state.flippedCardIndices.delete(index);
    cardEl.classList.remove("is-flipped");
  } else {
    state.flippedCardIndices.add(index);
    cardEl.classList.add("is-flipped");
  }

  updateProgressUI();
}

// Update Progress Toolbar UI & Trigger Nano Banana Fireworks
function updateProgressUI() {
  const flippedCount = state.flippedCardIndices.size;
  const targetGoal = state.targetGoalCount;

  document.getElementById("currentFlippedCount").textContent = flippedCount;
  document.getElementById("targetGoalCount").textContent = targetGoal;

  const percent = Math.min(100, Math.round((flippedCount / targetGoal) * 100));
  document.getElementById("goalProgressBar").style.width = `${percent}%`;
  document.getElementById("goalProgressPercent").textContent = `${percent}%`;

  if (flippedCount >= targetGoal && targetGoal > 0) {
    if (!state.hasCelebratedCurrentGoal) {
      state.hasCelebratedCurrentGoal = true;
      audio.playFanfare();
      starEngine.triggerCelebration();
      autoStampNextStreakSlot(); // Automatically stamp next day on streak board!
    }
  } else {
    state.hasCelebratedCurrentGoal = false;
  }
}

// Reset Cards
function resetAllCards() {
  audio.playClick();
  state.flippedCardIndices.clear();
  state.hasCelebratedCurrentGoal = false;
  renderCardBinderGrid();
  updateProgressUI();
}

// --- Spacebar 1-Minute Visual Pixel Timer Controller ---
function openTimerModal() {
  audio.playClick();
  document.getElementById("modalTimerHabitTitle").textContent = state.activeHabit.title;
  document.getElementById("modalTimerHabitPeriod").textContent = `기간: ${state.activeHabit.startDate} ~ ${state.activeHabit.endDate} (${state.activeHabit.totalDays}일 미션)`;

  document.getElementById("timerModal").classList.add("active");
}

function closeTimerModal() {
  document.getElementById("timerModal").classList.remove("active");
  pauseTimer();
}

function startTimer() {
  if (state.timer.isRunning) return;

  state.timer.isRunning = true;
  document.getElementById("btnTimerStart").style.display = "none";
  document.getElementById("btnTimerPause").style.display = "inline-flex";
  document.getElementById("timerStatus").textContent = "RUNNING...";

  state.timer.interval = setInterval(() => {
    if (state.timer.remainingSeconds > 0) {
      state.timer.remainingSeconds--;
      updateTimerDisplay();
    } else {
      pauseTimer();
      audio.playFanfare();
      document.getElementById("timerStatus").textContent = "TIME UP! MISSION CLEAR!";
    }
  }, 1000);
}

function pauseTimer() {
  state.timer.isRunning = false;
  clearInterval(state.timer.interval);
  document.getElementById("btnTimerStart").style.display = "inline-flex";
  document.getElementById("btnTimerPause").style.display = "none";
  document.getElementById("timerStatus").textContent = "PAUSED";
}

function resetTimer() {
  pauseTimer();
  state.timer.remainingSeconds = state.timer.totalSeconds;
  document.getElementById("timerStatus").textContent = "READY!";
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const secs = state.timer.remainingSeconds;
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  document.getElementById("timerDisplay").textContent = `${m}:${s}`;
}

// Complete Mission via Timer: Mass Flip All Cards & Launch Fireworks!
function massFlipAllCardsFromTimer() {
  closeTimerModal();

  for (let i = 1; i <= state.studentCount; i++) {
    state.flippedCardIndices.add(i);
  }

  renderCardBinderGrid();
  updateProgressUI();

  audio.playFanfare();
  starEngine.triggerCelebration();
  autoStampNextStreakSlot(); // Stamp next day on streak tracker grid!
  alert(`🎉 단체 미션 성공! 모든 학생의 카드가 싹 뒤집히고 일자 스탬프가 찍혔습니다! ⭐`);
}

// --- Hall of Fame Archive Controller (완료 기념 카드 앨범) ---
function renderHallOfFame() {
  const grid = document.getElementById("hofBadgesGrid");
  const badge = document.getElementById("hofCountBadge");
  if (!grid || !badge) return;

  badge.textContent = `${state.hallOfFame.length}개 완료`;
  grid.innerHTML = "";

  if (state.hallOfFame.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--pixel-text-muted); padding: 20px 0; font-size:0.9rem;">
        아직 명예의 전당에 등재된 완주 습관이 없습니다. 기간별 습관 실천 후 [완료 및 전당 등록] 버튼을 눌러보세요!
      </div>
    `;
    return;
  }

  state.hallOfFame.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "hof-item-card";
    const periodText = item.startDate && item.endDate ? `${item.startDate} ~ ${item.endDate}` : (item.date || "기간 미정");
    const streakSummary = item.streakSummary || `${item.totalDays || 14}일 도전 완주!`;

    card.innerHTML = `
      <div class="hof-item-icon">🏆</div>
      <div class="hof-item-details">
        <span class="hof-item-title">${item.title}</span>
        <span class="hof-item-date">📅 실천 기간: ${periodText}</span>
        <span style="font-size:0.75rem; color:var(--pixel-yellow); margin-top:2px;">
          ⭐️ 일자 스탬프: ${streakSummary}
        </span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function completeActiveHabitToHOF() {
  if (!confirm(`'${state.activeHabit.title}' (${state.activeHabit.startDate} ~ ${state.activeHabit.endDate}) 습관 실천 기간을 종료하고 명예의 전당 앨범에 완료 기념 카드로 등록하시겠습니까?`)) {
    return;
  }

  const streakSummaryText = `${state.activeHabit.totalDays}일 중 ${state.completedStreakDays.size}일 달성 성공!`;

  const newItem = {
    id: Date.now(),
    title: state.activeHabit.title,
    desc: state.activeHabit.desc,
    startDate: state.activeHabit.startDate,
    endDate: state.activeHabit.endDate,
    totalDays: state.activeHabit.totalDays,
    streakSummary: streakSummaryText,
    achieverCount: state.flippedCardIndices.size,
    completedDate: new Date().toLocaleDateString("ko-KR")
  };

  state.hallOfFame.push(newItem);
  localStorage.setItem("pixel_hall_of_fame", JSON.stringify(state.hallOfFame));

  // Reset current habit streak tracker for next challenge
  state.completedStreakDays.clear();
  localStorage.setItem("pixel_completed_streak_days", "[]");

  resetAllCards();
  renderStreakTracker();
  renderHallOfFame();
  audio.playFanfare();
}

// --- Manual Log Confirmation Modal Controller ---
function openManualLogConfirmModal() {
  audio.playClick();

  const backdrop = document.getElementById("confirmLogModal");
  document.getElementById("logPreviewDate").textContent = new Date().toLocaleDateString("ko-KR");
  document.getElementById("logPreviewHabit").textContent = state.activeHabit.title;
  document.getElementById("logPreviewAchieverCount").textContent = `${state.flippedCardIndices.size}명`;

  const achieverContainer = document.getElementById("logPreviewAchieverNames");
  achieverContainer.innerHTML = "";

  if (state.flippedCardIndices.size === 0) {
    achieverContainer.innerHTML = `<span style="font-size:0.8rem; color:#94a3b8;">선택된 달성 학생이 없습니다.</span>`;
  } else {
    Array.from(state.flippedCardIndices).sort((a,b)=>a-b).forEach(num => {
      const badge = document.createElement("span");
      badge.className = "achiever-badge";
      badge.textContent = getStudentDisplayName(num);
      achieverContainer.appendChild(badge);
    });
  }

  backdrop.classList.add("active");
}

function closeManualLogConfirmModal() {
  document.getElementById("confirmLogModal").classList.remove("active");
}

function confirmSaveObservationLog() {
  const achieverList = Array.from(state.flippedCardIndices).sort((a,b)=>a-b).map(n => getStudentDisplayName(n));

  const newLog = {
    id: Date.now(),
    date: new Date().toLocaleDateString("ko-KR"),
    habitTitle: state.activeHabit.title,
    achieverCount: state.flippedCardIndices.size,
    achievers: achieverList
  };

  const logs = JSON.parse(localStorage.getItem("pixel_observation_logs") || "[]");
  logs.push(newLog);
  localStorage.setItem("pixel_observation_logs", JSON.stringify(logs));

  autoStampNextStreakSlot(); // Automatically stamp next day on streak tracker!
  closeManualLogConfirmModal();
  audio.playFanfare();
  alert(`📝 관찰 일지가 명시적으로 기록 저장되었으며 일자 스탬프가 찍혔습니다! (달성 인원: ${state.flippedCardIndices.size}명)`);
}

// --- Settings Modal Controller ---
function openSettingsModal() {
  audio.playClick();
  document.getElementById("inputStudentCount").value = state.studentCount;
  document.getElementById("inputTargetGoalCount").value = state.targetGoalCount;
  document.getElementById("selectCardIcon").value = state.cardIcon;
  document.getElementById("inputActiveHabitTitle").value = state.activeHabit.title;
  document.getElementById("inputActiveHabitDesc").value = state.activeHabit.desc;
  document.getElementById("inputHabitStartDate").value = state.activeHabit.startDate;
  document.getElementById("inputHabitEndDate").value = state.activeHabit.endDate;
  document.getElementById("inputHabitTotalDays").value = state.activeHabit.totalDays;

  const namesArea = document.getElementById("inputStudentNames");
  if (namesArea) {
    namesArea.value = (state.studentNames || []).join("\n");
  }

  document.getElementById("settingsModal").classList.add("active");
}

function closeSettingsModal() {
  document.getElementById("settingsModal").classList.remove("active");
}

function saveSettings() {
  audio.playClick();

  const newStudentCount = parseInt(document.getElementById("inputStudentCount").value, 10);
  const newTargetGoal = parseInt(document.getElementById("inputTargetGoalCount").value, 10);
  const newCardIcon = document.getElementById("selectCardIcon").value;
  const newTitle = document.getElementById("inputActiveHabitTitle").value.trim();
  const newDesc = document.getElementById("inputActiveHabitDesc").value.trim();
  const newStartDate = document.getElementById("inputHabitStartDate").value.trim();
  const newEndDate = document.getElementById("inputHabitEndDate").value.trim();
  const newTotalDays = parseInt(document.getElementById("inputHabitTotalDays").value, 10);

  const rawNames = document.getElementById("inputStudentNames").value;
  const parsedNames = rawNames
    .split(/[\n,]/)
    .map(n => n.trim())
    .filter(n => n.length > 0);

  state.studentNames = parsedNames;
  localStorage.setItem("pixel_student_names", JSON.stringify(parsedNames));

  if (!isNaN(newStudentCount) && newStudentCount > 0) {
    state.studentCount = newStudentCount;
    localStorage.setItem("pixel_student_count", newStudentCount.toString());
  }

  if (!isNaN(newTargetGoal) && newTargetGoal > 0) {
    state.targetGoalCount = newTargetGoal;
    localStorage.setItem("pixel_target_goal_count", newTargetGoal.toString());
  }

  if (newCardIcon) {
    state.cardIcon = newCardIcon;
    localStorage.setItem("pixel_card_icon", newCardIcon);
  }

  if (newTitle) {
    state.activeHabit.title = newTitle;
    state.activeHabit.desc = newDesc;
    state.activeHabit.startDate = newStartDate || "2026.09.01";
    state.activeHabit.endDate = newEndDate || "2026.09.14";

    if (!isNaN(newTotalDays) && newTotalDays > 0) {
      state.activeHabit.totalDays = newTotalDays;
      localStorage.setItem("pixel_active_habit_total_days", newTotalDays.toString());
    }

    localStorage.setItem("pixel_active_habit_title", newTitle);
    localStorage.setItem("pixel_active_habit_desc", newDesc);
    localStorage.setItem("pixel_active_habit_start_date", state.activeHabit.startDate);
    localStorage.setItem("pixel_active_habit_end_date", state.activeHabit.endDate);
  }

  renderActiveHabitUI();
  renderStreakTracker();
  renderCardBinderGrid();
  updateProgressUI();
  closeSettingsModal();
}

// --- Event Listeners & Keyboard Shortcuts ---
function setupEventListeners() {
  // Settings Launchers
  document.getElementById("btnOpenSettings").addEventListener("click", openSettingsModal);
  document.getElementById("btnEditActiveHabit").addEventListener("click", openSettingsModal);
  document.getElementById("btnCloseSettings").addEventListener("click", closeSettingsModal);
  document.getElementById("btnSaveSettings").addEventListener("click", saveSettings);

  // Timer Launchers & Controls
  document.getElementById("btnOpenTimerModal").addEventListener("click", openTimerModal);
  document.getElementById("btnCloseTimerModal").addEventListener("click", closeTimerModal);
  document.getElementById("btnTimerStart").addEventListener("click", startTimer);
  document.getElementById("btnTimerPause").addEventListener("click", pauseTimer);
  document.getElementById("btnTimerReset").addEventListener("click", resetTimer);
  document.getElementById("btnTimerFinishMassFlip").addEventListener("click", massFlipAllCardsFromTimer);

  // Manual Log Save Launchers
  document.getElementById("btnSaveLog").addEventListener("click", openManualLogConfirmModal);
  document.getElementById("btnCloseConfirmLog").addEventListener("click", closeManualLogConfirmModal);
  document.getElementById("btnCancelSaveLog").addEventListener("click", closeManualLogConfirmModal);
  document.getElementById("btnConfirmSaveLog").addEventListener("click", confirmSaveObservationLog);

  // Card Reset
  document.getElementById("btnResetCards").addEventListener("click", () => {
    if (confirm("모든 학생 카드의 뒤집힘 상태를 초기화하시겠습니까?")) {
      resetAllCards();
    }
  });

  // Complete Active Habit to Hall of Fame
  document.getElementById("btnCompleteHabit").addEventListener("click", completeActiveHabitToHOF);
}

function setupKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    const activeEl = document.activeElement;
    const isInput = activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA";

    if (e.code === "Space" && !isInput) {
      e.preventDefault();
      const timerModal = document.getElementById("timerModal");
      if (timerModal.classList.contains("active")) {
        closeTimerModal();
      } else {
        openTimerModal();
      }
    } else if (e.key === "Enter" && !isInput) {
      e.preventDefault();
      const confirmModal = document.getElementById("confirmLogModal");
      if (confirmModal.classList.contains("active")) {
        confirmSaveObservationLog();
      } else {
        openManualLogConfirmModal();
      }
    } else if (e.key === "Escape") {
      closeSettingsModal();
      closeTimerModal();
      closeManualLogConfirmModal();
    }
  });
}
