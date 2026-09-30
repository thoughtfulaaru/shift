document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const habitInput = form.querySelector('input[name="habit"]') || form.querySelector('input:nth-of-type(1)');
    const reasonInput = form.querySelector('textarea[name="reason"]') || form.querySelector('textarea');

    // Check if required fields (habit and reason) are filled
    if (!habitInput.value.trim() || !reasonInput.value.trim()) {
      alert("Please fill out all fields so we can personalize your journey.");
      return;
    }

    // Proceed with form submission or next steps
    alert("Journey started successfully!");
  });
});