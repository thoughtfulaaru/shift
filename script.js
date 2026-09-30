document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('#submit-btn'); // Update selector to match your button ID/class

  if (submitButton) {
    submitButton.addEventListener('click', async (e) => {
      e.preventDefault();

      // Gather your input values here
      const habitData = {
        habit: document.querySelector('#habit-input')?.value || '',
        cost: document.querySelector('#cost-input')?.value || 0
      };

      try {
        // Use a relative URL so it works seamlessly on Render and Localhost
        const response = await fetch('/api/submit-shift', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(habitData)
        });

        const result = await response.json();
        
        if (response.ok) {
          console.log('Success:', result);
          // Add your UI success updates here (e.g., redirect or show success message)
        } else {
          console.error('Server error:', result.error);
        }
      } catch (error) {
        console.error('Network or fetch error:', error);
      }
    });
  }
});