// Import Supabase directly from a CDN so the browser can load it without a bundler
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

console.log('Script loaded successfully!');

// Supabase configuration
const supabaseUrl = 'https://orodgbfpamnyufkcrknp.supabase.co'
const supabaseAnonKey = 'sb_publishable_D5VMx6SOABgyv5Jp1jckHA_IWi2re76'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Track currently selected exercise using explicit data-game IDs (default to 'breathe')
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
        
        // Grab strict identifier from data-game attribute
        selectedExercise = btn.getAttribute('data-game') || 'breathe';
        console.log('Selected exercise updated to:', selectedExercise);
      });
    });
  }

  // -------------------------------------------------------------
  // 5. Full Screen Exercise Overlay Toggle & Content Renderer
  // -------------------------------------------------------------
  const launchExerciseBtn = document.querySelector('#launch-exercise-btn');
  const closeOverlayBtn = document.querySelector('#close-overlay');
  const exerciseOverlay = document.querySelector('#exercise-overlay');
  const overlayGameBox = document.querySelector('.overlay-game-box');

  let taps = 0; // Localized session tap counter

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

      // Reset tap counter on open
      taps = 0;

      // Render interactive content using strict equality checks
      if (overlayGameBox) {
        if (selectedExercise === 'breathe') {
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold; color: #0f766e; margin-bottom: 1rem;">Inhale... Exhale...</div>
            <div class="target-dot" style="width: 60px; height: 60px; background: var(--primary, #0f766e); border-radius: 50%; margin: 0 auto; animation: pulse 4s infinite alternate;"></div>
            <p style="margin-top: 1rem; color: #64748b; font-size: 0.9rem;">Follow the rhythm of your breath to let the urge pass.</p>
          `;
        } else if (selectedExercise === 'grounding') {
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.1rem; font-weight: bold; color: #0f766e; margin-bottom: 0.5rem;">Grounding Technique</div>
            <p style="color: #334155; font-size: 0.95rem; line-height: 1.5;">Name 3 things you can see around you right now, and notice their textures and colors.</p>
          `;
        } else if (selectedExercise === 'cbt') {
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.1rem; font-weight: bold; color: #0f766e; margin-bottom: 0.5rem;">Reframing</div>
            <p style="color: #334155; font-size: 0.95rem; line-height: 1.5;">"This urge is temporary. It peaks and then it subsides. I am in control of my next step."</p>
          `;
        } else if (selectedExercise === 'focus-game') {
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.1rem; font-weight: bold; color: #0f766e; margin-bottom: 1rem;">Tap to Reset Focus</div>
            <div class="target-dot" id="focustarget" style="cursor: pointer; width: 60px; height: 60px; background: var(--primary, #0f766e); border-radius: 50%; margin: 0 auto; transition: transform 0.2s;"></div>
            <p style="margin-top: 1rem; color: #64748b; font-size: 0.9rem;" id="focus-instruction">Tap the dot calmly 5 times. (<span id="tap-count">0</span>/5)</p>
          `;
        } else {
          overlayGameBox.innerHTML = `<p style="color: #64748b;">Select an exercise to begin.</p>`;
        }
      }

      // Show overlay
      exerciseOverlay.classList.remove('exercise-overlay-hidden');
    });
  }

  // Event Delegation for the interactive Tap Focus dot
  if (overlayGameBox) {
    overlayGameBox.addEventListener('click', (e) => {
      const targetDot = e.target.closest('#focustarget');
      if (targetDot) {
        taps++;
        targetDot.style.transform = `scale(${1 + taps * 0.1})`;
        
        const tapCountSpan = overlayGameBox.querySelector('#tap-count');
        if (tapCountSpan) {
          tapCountSpan.textContent = taps;
        }

        if (taps >= 5) {
          targetDot.style.background = '#10b981';
          const instruction = overlayGameBox.querySelector('#focus-instruction');
          if (instruction) instruction.textContent = "Great job! Focus restored.";
          
          setTimeout(() => { 
            taps = 0; 
            targetDot.style.transform = 'scale(1)'; 
            targetDot.style.background = 'var(--primary, #0f766e)'; 
            if (instruction) instruction.innerHTML = `Tap the dot calmly 5 times. (<span id="tap-count">0</span>/5)`;
          }, 1000);
        }
      }
    });
  }

  if (closeOverlayBtn && exerciseOverlay) {
    closeOverlayBtn.addEventListener('click', () => {
      console.log('Close overlay button clicked!');
      exerciseOverlay.classList.add('exercise-overlay-hidden');
    });
  }
});