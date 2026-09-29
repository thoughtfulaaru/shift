// Local Application State
let appState = {
    isInitialized: false,
    habitName: '',
    dailyCost: 0,
    coreWhy: '',
    startDate: null,
    urgesSurfed: 0,
    checkIns: []
};

// DOM Elements
const setupSection = document.getElementById('setup-section');
const mainDashboard = document.getElementById('main-dashboard');
const saveBaselineBtn = document.getElementById('save-baseline');
const habitNameInput = document.getElementById('habit-name');
const dailyCostInput = document.getElementById('daily-cost');
const coreWhyInput = document.getElementById('core-why');
const displayedWhyEl = document.getElementById('displayed-why');

const moneySavedEl = document.getElementById('money-saved');
const urgesCountEl = document.getElementById('urges-count');
const stressLevelInput = document.getElementById('stress-level');
const stressValEl = document.getElementById('stress-val');
const saveCheckinBtn = document.getElementById('save-checkin');
const gameButtons = document.querySelectorAll('.game-btn');
const gameContainer = document.getElementById('game-container');

// Update stress level text indicator live
stressLevelInput.addEventListener('input', () => {
    stressValEl.textContent = stressLevelInput.value;
});

// Initialize Profile Baseline with Core "Why"
saveBaselineBtn.addEventListener('click', () => {
    const name = habitNameInput.value.trim();
    const cost = parseFloat(dailyCostInput.value);
    const why = coreWhyInput.value.trim();

    if (!name || isNaN(cost) || cost <= 0 || !why) {
        alert('Please fill out all fields so we can personalize your journey.');
        return;
    }

    appState.isInitialized = true;
    appState.habitName = name;
    appState.dailyCost = cost;
    appState.coreWhy = why;
    appState.startDate = new Date();
    appState.urgesSurfed = 0;

    // Display the core why on the dashboard
    displayedWhyEl.textContent = `"${why}"`;

    setupSection.style.display = 'none';
    mainDashboard.classList.remove('dashboard-hidden');
    updateDashboard();
});

// Update Dashboard Counters
function updateDashboard() {
    if (!appState.isInitialized) return;

    // Calculate money saved based on days elapsed since start
    const now = new Date();
    const diffTime = Math.abs(now - appState.startDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const saved = diffDays * appState.dailyCost;

    moneySavedEl.textContent = `$${saved.toFixed(2)}`;
    urgesCountEl.textContent = appState.urgesSurfed;
}

// Log Check-In
saveCheckinBtn.addEventListener('click', () => {
    const stress = stressLevelInput.value;
    appState.checkIns.push({ stress, time: new Date() });
    alert(`Check-in recorded. Stress level: ${stress}/10. Awareness is the first step of shifting.`);
});

// Switch Game Tabs
gameButtons.forEach(button => {
    button.addEventListener('click', () => {
        gameButtons.forEach(btn => btn.classList.remove('active-tab'));
        button.classList.add('active-tab');

        const gameType = button.getAttribute('data-game');
        if (gameType === 'breathe') {
            renderBreatheExercise();
        } else if (gameType === 'grounding') {
            renderGroundingExercise();
        } else if (gameType === 'focus-game') {
            renderFocusGame();
        }
    });
});

// 1. Breathing Exercise
function renderBreatheExercise() {
    gameContainer.innerHTML = `
        <p id="breathe-instruction" style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">Ready to sync your breathing?</p>
        <div id="breathe-circle" style="width: 70px; height: 70px; background-color: var(--accent); border-radius: 50%; margin: 0 auto 1rem auto; transition: transform 4s ease-in-out;"></div>
        <button id="start-breathe" style="width: auto; padding: 0.5rem 1rem;">Start Cycle</button>
    `;

    const startBtn = document.getElementById('start-breathe');
    const circle = document.getElementById('breathe-circle');
    const instruction = document.getElementById('breathe-instruction');

    startBtn.addEventListener('click', () => {
        startBtn.disabled = true;
        runBreatheCycle(circle, instruction, startBtn);
    });
}

function runBreatheCycle(circle, instruction, startBtn) {
    let cycles = 0;
    const maxCycles = 3;

    function cycle() {
        if (cycles >= maxCycles) {
            instruction.textContent = "Wave surfed successfully!";
            circle.style.transform = "scale(1)";
            startBtn.disabled = false;
            appState.urgesSurfed++;
            updateDashboard();
            return;
        }

        instruction.textContent = "Inhale slowly...";
        circle.style.transform = "scale(1.4)";

        setTimeout(() => {
            instruction.textContent = "Hold...";
            setTimeout(() => {
                instruction.textContent = "Exhale slowly...";
                circle.style.transform = "scale(1)";

                setTimeout(() => {
                    cycles++;
                    cycle();
                }, 4000);
            }, 2000);
        }, 4000);
    }
    cycle();
}

// 2. Grounding Technique
function renderGroundingExercise() {
    const steps = [
        "Look around: Name 5 things you can **see**.",
        "Touch: Notice 4 things you can physically **feel**.",
        "Hear: Listen for 3 sounds around you.",
        "Smell: Identify 2 things you can **smell**.",
        "Taste: Notice 1 thing you can **taste**."
    ];
    let currentStep = 0;

    gameContainer.innerHTML = `
        <div style="text-align: left; width: 100%;">
            <p id="grounding-text" style="font-size: 0.95rem; margin-bottom: 1rem;">${steps[currentStep]}</p>
            <button id="next-grounding" style="width: auto; padding: 0.4rem 1rem; font-size: 0.85rem;">Next Step</button>
        </div>
    `;

    document.getElementById('next-grounding').addEventListener('click', () => {
        currentStep++;
        if (currentStep < steps.length) {
            document.getElementById('grounding-text').innerHTML = steps[currentStep];
        } else {
            gameContainer.innerHTML = `<p style="color: var(--primary); font-weight: 600;">Grounding complete. You anchored your mind.</p>`;
            appState.urgesSurfed++;
            updateDashboard();
        }
    });
}

// 3. Focus Tap Game (Instant Cognitive Distraction)
function renderFocusGame() {
    let score = 0;
    const targetScore = 10;

    gameContainer.innerHTML = `
        <p id="game-status" style="margin-bottom: 0.5rem; font-size: 0.9rem;">Tap the shifting targets to break the craving loop! (0/${targetScore})</p>
        <div id="play-area" style="width: 100%; height: 90px; position: relative; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;"></div>
    `;

    const playArea = document.getElementById('play-area');
    const statusEl = document.getElementById('game-status');

    function spawnTarget() {
        if (score >= targetScore) return;
        playArea.innerHTML = '';

        const dot = document.createElement('div');
        dot.classList.add('target-dot');
        
        const maxX = playArea.clientWidth - 50;
        const maxY = playArea.clientHeight - 50;
        dot.style.position = 'absolute';
        dot.style.left = `${Math.max(10, Math.floor(Math.random() * maxX))}px`;
        dot.style.top = `${Math.max(5, Math.floor(Math.random() * maxY))}px`;

        dot.addEventListener('click', () => {
            score++;
            if (score < targetScore) {
                statusEl.textContent = `Great focus! Keep tapping (${score}/${targetScore})`;
                spawnTarget();
            } else {
                playArea.innerHTML = '';
                statusEl.innerHTML = `<span style="color: var(--primary); font-weight: bold;">Focus achieved! Urge successfully intercepted.</span>`;
                appState.urgesSurfed++;
                updateDashboard();
            }
        });

        playArea.appendChild(dot);
    }

    spawnTarget();
}