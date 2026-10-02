// Import Supabase directly from a CDN so the browser can load it without a bundler
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

console.log('Script loaded successfully!');

// Replace these with your actual Supabase URL and Anon/Public Key from your Supabase project settings
const supabaseUrl = 'https://orodgbfpamnyufkcrknp.supabase.co'
const supabaseAnonKey = 'sb_publishable_D5VMx6SOABgyv5Jp1jckHA_IWi2re76'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('#save-baseline');

  if (submitButton) {
    submitButton.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('Start My Journey button clicked!');

      const habitData = {
        habit: document.querySelector('#habit-name')?.value || '',
        cost: document.querySelector('#daily-cost')?.value || 0
      };

      try {
        const { data, error } = await supabase
          .from('habits') 
          .insert([habitData]);

        if (error) {
          throw error;
        }

        console.log('Habit data saved:', data);
        
        // Hide setup and show dashboard once saved successfully
        document.querySelector('#setup-section').classList.add('dashboard-hidden');
        document.querySelector('#main-dashboard').classList.remove('dashboard-hidden');
        
      } catch (error) {
        console.error('Error saving data:', error.message);
      }
    });
  }
});