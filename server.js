const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Adjust folder name if your frontend files are elsewhere

// Example API Endpoint (Update route to match your app's needs)
app.post('/api/submit-shift', (req, res) => {
  try {
    const { habit, cost } = req.body;
    
    // Add your backend logic or database saving here
    
    res.status(200).json({ 
      success: true, 
      message: 'Data received successfully!',
      data: { habit, cost } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback to serve index.html for single-page apps (if applicable)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Adjust path if your index.html is elsewhere
});

// Updated listen method with '0.0.0.0' for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});