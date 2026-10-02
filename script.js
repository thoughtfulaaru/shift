// Import Supabase directly from a CDN so the browser can load it without a bundler
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

console.log('Script loaded successfully!');

// Replace these with your actual Supabase URL and Anon/Public Key from your Supabase project settings
const supabaseUrl = 'https://orodgbfpamnyufkcrknp.supabase.co'
const supabaseAnonKey = 'sb_publishable_D5VMx6SOABgyv5Jp1jckHA_IWi2re76'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

document.addEventListener('DOMContentLoaded', () => {
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
        cost: Number(costInput),
        core_why: whyInput // Adjust this key ('core_why' or 'why') to match your Supabase column name exactly!
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
});