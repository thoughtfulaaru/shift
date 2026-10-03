// Import Supabase directly from a CDN so the browser can load it without a bundler
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

console.log('Script loaded successfully!');

// Supabase configuration
const supabaseUrl = 'https://orodgbfpamnyufkcrknp.supabase.co'
const supabaseAnonKey = 'sb_publishable_D5VMx6SOABgyv5Jp1jckHA_IWi2re76'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

document.addEventListener('DOMContentLoaded', () => {
  // 1. Baseline Form Submission Logic
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
        document.querySelector('#setup-section').classList.add('dashboard-hidden');
        document.querySelector('#main-dashboard').classList.remove('dashboard-hidden');
        
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

  // 2. Stress Level Slider Display
  const stressSlider = document.querySelector('#stress-level');
  const stressVal = document.querySelector('#stress-val');
  if (stressSlider && stressVal) {
    stressSlider.addEventListener('input', (e) => {
      stressVal.textContent = e.target.value;
    });
  }

  // 3. Daily Check-In Button Handler
  const saveCheckinBtn = document.querySelector('#save-checkin');
  if (saveCheckinBtn) {
    saveCheckinBtn.addEventListener('click', () => {
      const currentStress = stressSlider ? stressSlider.value : 5;
      console.log('Daily check-in saved. Stress level:', currentStress);
      alert('Check-in saved!');
    });
  }

  // 4. Exercise Overlay Toggle Controls (with debugging logs)
  const launchExerciseBtn = document.querySelector('#launch-exercise-btn');
  const closeOverlayBtn = document.querySelector('#close-overlay');
  const exerciseOverlay = document.querySelector('#exercise-overlay');

  if (launchExerciseBtn && exerciseOverlay) {
    launchExerciseBtn.addEventListener('click', () => {
      console.log('Open Exercise Full Screen button clicked!');
      exerciseOverlay.classList.remove('exercise-overlay-hidden');
    });
  } else {
    console.warn('Warning: #launch-exercise-btn or #exercise-overlay element could not be found!');
  }

  if (closeOverlayBtn && exerciseOverlay) {
    closeOverlayBtn.addEventListener('click', () => {
      console.log('Close overlay button clicked!');
      exerciseOverlay.classList.add('exercise-overlay-hidden');
    });
  }
});