const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serves static files like index.html, style.css, script.js

// Dynamic backend state matching the new setup parameters
let appState = {
    isInitialized: false,
    habitName: '',
    dailyCost: 0,
    coreWhy: '',
    startDate: null,
    urgesSurfed: 0,
    checkIns: []
};

// API Route: Get current app state
app.get('/api/state', (req, res) => {
    res.json(appState);
});

// API Route: Initialize habit baseline and core why
app.post('/api/setup', (req, res) => {
    const { habitName, dailyCost, coreWhy } = req.body;
    
    if (!habitName || dailyCost === undefined || dailyCost <= 0 || !coreWhy) {
        return res.status(400).json({ error: 'Valid habit name, daily cost, and core why are required.' });
    }

    appState.isInitialized = true;
    appState.habitName = habitName;
    appState.dailyCost = parseFloat(dailyCost);
    appState.coreWhy = coreWhy;
    appState.startDate = new Date();
    appState.urgesSurfed = 0;
    appState.checkIns = [];

    res.json({ message: 'Baseline initialized successfully.', appState });
});

// API Route: Log a daily check-in (stress level)
app.post('/api/checkin', (req, res) => {
    const { stressLevel } = req.body;
    
    if (stressLevel === undefined) {
        return res.status(400).json({ error: 'Stress level is required.' });
    }

    const checkInRecord = {
        stressLevel,
        timestamp: new Date()
    };

    appState.checkIns.push(checkInRecord);
    res.json({ message: 'Check-in logged successfully.', checkIn: checkInRecord });
});

// API Route: Increment urges surfed
app.post('/api/urges', (req, res) => {
    appState.urgesSurfed++;
    res.json({ message: 'Urge surf recorded.', urgesSurfed: appState.urgesSurfed });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Shift server running smoothly at http://localhost:${PORT}`);
});