import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('#save-baseline');

  if (submitButton) {
    submitButton.addEventListener('click', async (e) => {
      e.preventDefault();

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
        
        // Optional: Hide setup and show dashboard once saved successfully
        document.querySelector('#setup-section').classList.add('dashboard-hidden');
        document.querySelector('#main-dashboard').classList.remove('dashboard-hidden');
        
      } catch (error) {
        console.error('Error saving data:', error.message);
      }
    });
  }
});