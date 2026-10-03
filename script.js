// Import Supabase directly from a CDN so the browser can load it without a bundler
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

console.log('Script loaded successfully!');

// Supabase configuration
const supabaseUrl = 'https://orodgbfpamnyufkcrknp.supabase.co'
const supabaseAnonKey = 'sb_publishable_D5VMx6SOABgyv5Jp1jckHA_IWi2re76'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Track currently selected exercise (default to 'breathe')
let selectedExercise = 'breathe';

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. Baseline Form Submission Logic
  // -------------------------------------------------------------
  const submitButton = document.querySelector('#save-baseline');

  if (submitButton) {
    submitButton.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('Start My Journey button clicked!');

      const habitInput = document.querySelector('#habit-name')?.value || '';
      const costInput = document.querySelector('#daily-cost')?.value || 0;
      const whyInput = document.querySelector('#core-why')?.value || '';

      const habitData = {
        habit: habitInput,
        cost: Number(costInput)
      };

      try {
        const { data, error } = await supabase
          .from('habits') 
          .insert([habitData]);

        if (error) throw error;
        
        // Hide setup and show dashboard once saved successfully
        document.querySelector('#setup-section')?.classList.add('dashboard-hidden');
        document.querySelector('#main-dashboard')?.classList.remove('dashboard-hidden');
        
        const displayedWhy = document.querySelector('#displayed-why');
        if (displayedWhy) displayedWhy.textContent = whyInput;
        
      } catch (error) {
        console.error('Error saving data to Supabase:', error.message || error);
        alert('Could not save your baseline. Check console for details.');
      }
    });
  }

  // -------------------------------------------------------------
  // 2. Stress Level Slider Display
  // -------------------------------------------------------------
  const stressSlider = document.querySelector('#stress-level');
  const stressVal = document.querySelector('#stress-val');
  if (stressSlider && stressVal) {
    stressSlider.addEventListener('input', (e) => {
      stressVal.textContent = e.target.value;
    });
  }

  // -------------------------------------------------------------
  // 3. Daily Check-In Button Handler
  // -------------------------------------------------------------
  const saveCheckinBtn = document.querySelector('#save-checkin');
  if (saveCheckinBtn) {
    saveCheckinBtn.addEventListener('click', () => {
      const currentStress = stressSlider ? stressSlider.value : 5;
      console.log('Daily check-in saved. Stress level:', currentStress);
      alert('Check-in saved!');
    });
  }

  // -------------------------------------------------------------
  // 4. Exercise Tab Selection (Strict data-game mapping)
  // -------------------------------------------------------------
  const exerciseButtons = document.querySelectorAll('.game-btn, .exercise-card button, .exercise-tab, [data-game]');
  
  if (exerciseButtons.length > 0) {
    exerciseButtons.forEach((btn) => {
      if (btn.id === 'launch-exercise-btn' || btn.id === 'save-checkin' || btn.id === 'save-baseline') return;

      btn.addEventListener('click', () => {
        exerciseButtons.forEach((b) => {
          if (b.id !== 'launch-exercise-btn') {
            b.classList.remove('active-tab', 'active', 'bg-teal-700', 'text-white');
          }
        });
        
        btn.classList.add('active-tab', 'active');
        
        selectedExercise = btn.getAttribute('data-game') || 'breathe';
        console.log('Selected exercise updated to:', selectedExercise);
      });
    });
  }

  // -------------------------------------------------------------
  // 5. Full Screen Exercise Overlay Toggle & Dynamic Interactive Renderer
  // -------------------------------------------------------------
  const launchExerciseBtn = document.querySelector('#launch-exercise-btn');
  const closeOverlayBtn = document.querySelector('#close-overlay');
  const exerciseOverlay = document.querySelector('#exercise-overlay');
  const overlayGameBox = document.querySelector('.overlay-game-box');

  let activeInterval = null; // To clear animations when closing overlay

  if (launchExerciseBtn && exerciseOverlay) {
    launchExerciseBtn.addEventListener('click', () => {
      console.log(`Launching full screen overlay for exercise ID: "${selectedExercise}"`);
      
      const overlayTitle = document.querySelector('#overlay-exercise-title');
      if (overlayTitle) {
        const titles = {
          'breathe': 'BREATHE',
          'grounding': 'LOOK AROUND',
          'cbt': 'CHANGE THOUGHT',
          'focus-game': 'TAP FOCUS'
        };
        overlayTitle.textContent = titles[selectedExercise] || 'EXERCISE';
      }

      // Clear any prior running intervals
      if (activeInterval) {
        clearInterval(activeInterval);
        activeInterval = null;
      }

      // Render interactive content
      if (overlayGameBox) {
        if (selectedExercise === 'breathe') {
          overlayGameBox.innerHTML = `
            <div id="breathe-instruction" style="font-size: 1.3rem; font-weight: bold; color: #0f766e; margin-bottom: 1.5rem; transition: opacity 0.5s;">Prepare to inhale...</div>
            <div style="position: relative; width: 180px; height: 180px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <div id="breathe-circle" style="width: 60px; height: 60px; background: rgba(15, 118, 110, 0.2); border: 3px solid #0f766e; border-radius: 50%; transition: transform 4s ease-in-out, width 4s ease-in-out, height 4s ease-in-out;"></div>
              <span style="position: absolute; font-size: 0.9rem; color: #0f766e; font-weight: 600;" id="breathe-subtext">Breathe</span>
            </div>
            <p style="margin-top: 2rem; color: #64748b; font-size: 0.95rem;">Follow the expanding and contracting rhythm.</p>
          `;

          // Breathing cycle timer logic
          const instructionEl = overlayGameBox.querySelector('#breathe-instruction');
          const circleEl = overlayGameBox.querySelector('#breathe-circle');
          const subtextEl = overlayGameBox.querySelector('#breathe-subtext');

          let phase = 0; // 0: Inhale, 1: Hold, 2: Exhale, 3: Hold
          const runBreatheCycle = () => {
            if (!instructionEl || !circleEl) return;
            if (phase === 0) {
              instructionEl.textContent = "Inhale slowly...";
              subtextEl.textContent = "Inhale";
              circleEl.style.transform = "scale(2.2)";
            } else if (phase === 1) {
              instructionEl.textContent = "Hold your breath...";
              subtextEl.textContent = "Hold";
            } else if (phase === 2) {
              instructionEl.textContent = "Exhale gently...";
              subtextEl.textContent = "Exhale";
              circleEl.style.transform = "scale(1)";
            } else if (phase === 3) {
              instructionEl.textContent = "Hold & relax...";
              subtextEl.textContent = "Hold";
            }
            phase = (phase + 1) % 4;
          };

          runBreatheCycle();
          activeInterval = setInterval(runBreatheCycle, 4000);

        } else if (selectedExercise === 'grounding') {
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold; color: #0f766e; margin-bottom: 1rem;">Grounding Technique</div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; max-width: 400px; margin: 0 auto; text-align: left;">
              <p style="color: #334155; font-size: 1rem; line-height: 1.6; margin-bottom: 1rem;">Take a slow breath and identify:</p>
              <ul style="color: #475569; font-size: 0.95rem; line-height: 1.8; padding-left: 1.2rem; margin: 0;">
                <li><strong>3 things</strong> you can see around you</li>
                <li><strong>2 things</strong> you can physically touch</li>
                <li><strong>1 thing</strong> you can hear right now</li>
              </ul>
            </div>
            <p style="margin-top: 1.5rem; color: #64748b; font-size: 0.9rem;">Notice physical textures and colors to bring your mind back to the present.</p>
          `;
        } else if (selectedExercise === 'cbt') {
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold; color: #0f766e; margin-bottom: 1rem;">Cognitive Reframing</div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; max-width: 400px; margin: 0 auto; text-align: center;">
              <p style="color: #1e293b; font-size: 1.05rem; font-style: italic; line-height: 1.6; margin-bottom: 1rem;">"This urge is a wave. It rises, peaks, and inevitably subsides. I am the observer, not the wave."</p>
              <p style="color: #64748b; font-size: 0.9rem;">Allow the feeling to pass without acting on it.</p>
            </div>
          `;
        } else {
          // focus-game / Tap Focus with random jumping targets
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.1rem; font-weight: bold; color: #0f766e; margin-bottom: 0.5rem;">Tap to Reset Focus</div>
            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1rem;" id="focus-instruction">Tap the moving target 5 times. (<span id="tap-count">0</span>/5)</p>
            
            <div id="focus-play-area" style="position: relative; width: 100%; height: 260px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; overflow: hidden; margin: 0 auto;">
              <div id="focustarget" style="position: absolute; cursor: pointer; width: 55px; height: 55px; background: #0f766e; border-radius: 50%; box-shadow: 0 4px 10px rgba(15, 118, 110, 0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.85rem; top: 100px; left: 120px; transition: background 0.2s;">Tap</div>
            </div>
          `;

          let taps = 0;
          const playArea = overlayGameBox.querySelector('#focus-play-area');
          const targetDot = overlayGameBox.querySelector('#focustarget');
          const tapCountSpan = overlayGameBox.querySelector('#tap-count');
          const instruction = overlayGameBox.querySelector('#focus-instruction');

          const moveTargetRandomly = () => {
            if (!playArea || !targetDot) return;
            const maxX = playArea.clientWidth - 65;
            const maxY = playArea.clientHeight - 65;
            const randomX = Math.max(10, Math.floor(Math.random() * maxX));
            const randomY = Math.max(10, Math.floor(Math.random() * maxY));
            targetDot.style.left = `${randomX}px`;
            targetDot.style.top = `${randomY}px`;
          };

          // Position target initially
          setTimeout(moveTargetRandomly, 50);

          targetDot.addEventListener('click', (e) => {
            e.stopPropagation();
            taps++;
            if (tapCountSpan) tapCountSpan.textContent = taps;

            if (taps >= 5) {
              targetDot.style.background = '#10b981';
              targetDot.textContent = 'Done!';
              if (instruction) instruction.textContent = "Fantastic! Focus successfully restored.";
              
              let focusTimeoutId = null;
// ... in the click handler:
if (taps >= 5) {
  targetDot.style.background = '#10b981';
  targetDot.textContent = 'Done!';
  if (instruction) instruction.textContent = "Fantastic! Focus successfully restored.";
  
  focusTimeoutId = setTimeout(() => {
    exerciseOverlay.classList.add('exercise-overlay-hidden');
  }, 1200);
}

// In the close button handler:
if (closeOverlayBtn && exerciseOverlay) {
  closeOverlayBtn.addEventListener('click', () => {
    if (activeInterval) clearInterval(activeInterval);
    if (focusTimeoutId) clearTimeout(focusTimeoutId);  // <-- Add this
    exerciseOverlay.classList.add('exercise-overlay-hidden');
  });
}