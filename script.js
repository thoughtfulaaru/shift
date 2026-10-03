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

      console.log('Attempting to insert data into Supabase:', habitData);

      try {
        const { data, error } = await supabase
          .from('habits') 
          .insert([habitData]);

        if (error) {
          console.error('Supabase error object:', error);
          throw error;
        }

        console.log('Habit data saved successfully:', data);
        
        // Hide setup and show dashboard once saved successfully
        document.querySelector('#setup-section')?.classList.add('dashboard-hidden');
        document.querySelector('#main-dashboard')?.classList.remove('dashboard-hidden');
        
        // Populate the core why reminder banner
        const displayedWhy = document.querySelector('#displayed-why');
        if (displayedWhy) {
          displayedWhy.textContent = whyInput;
        }
        
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
  // 4. Exercise Tab Selection
  // -------------------------------------------------------------
  const exerciseButtons = document.querySelectorAll('.exercise-card button, .game-btn, .exercise-tab, [data-game]');
  
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
        
        const exerciseName = btn.textContent.trim().toLowerCase();
        selectedExercise = exerciseName;
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

  let taps = 0; // Track taps outside so it persists when rendered

  if (launchExerciseBtn && exerciseOverlay) {
    launchExerciseBtn.addEventListener('click', () => {
      console.log(`Launching full screen overlay for exercise: ${selectedExercise}`);
      
      const overlayTitle = document.querySelector('#overlay-exercise-title');
      if (overlayTitle) {
        overlayTitle.textContent = selectedExercise.toUpperCase();
      }

      // Reset taps counter on open
      taps = 0;

      // Render interactive content inside the exercise box based on selection
      if (overlayGameBox) {
        if (selectedExercise.includes('breathe')) {
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold; color: #0f766e; margin-bottom: 1rem;">Inhale... Exhale...</div>
            <div class="target-dot" style="animation: pulse 4s infinite alternate;"></div>
            <p style="margin-top: 1rem; color: #64748b; font-size: 0.9rem;">Follow the rhythm of your breath to let the urge pass.</p>
          `;
        } else if (selectedExercise.includes('look around')) {
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.1rem; font-weight: bold; color: #0f766e; margin-bottom: 0.5rem;">Grounding Technique</div>
            <p style="color: #334155; font-size: 0.95rem; line-height: 1.5;">Name 3 things you can see around you right now, and notice their textures and colors.</p>
          `;
        } else if (selectedExercise.includes('change thought')) {
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.1rem; font-weight: bold; color: #0f766e; margin-bottom: 0.5rem;">Reframing</div>
            <p style="color: #334155; font-size: 0.95rem; line-height: 1.5;">"This urge is temporary. It peaks and then it subsides. I am in control of my next step."</p>
          `;
        } else {
          // Tap Focus / Default
          overlayGameBox.innerHTML = `
            <div style="font-size: 1.1rem; font-weight: bold; color: #0f766e; margin-bottom: 1rem;">Tap to Reset Focus</div>
            <div class="target-dot" id="focustarget" style="cursor: pointer; width: 60px; height: 60px; background: var(--primary, #0f766e); border-radius: 50%; margin: 0 auto; transition: transform 0.2s;"></div>
            <p style="margin-top: 1rem; color: #64748b; font-size: 0.9rem;" id="focus-instruction">Tap the dot calmly 5 times. (<span id="tap-count">0</span>/5)</p>
          `;
        }
      }

      // Show overlay
      exerciseOverlay.classList.remove('exercise-overlay-hidden');
    });
  }

  // Event Delegation: Listen for clicks anywhere inside the overlay-game-box
  if (overlayGameBox) {
    overlayGameBox.addEventListener('click', (e) => {
      // Check if the clicked element (or its parent) is our focus target dot
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