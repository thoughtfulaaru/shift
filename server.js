const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const dbPath = path.resolve(__dirname, 'shifts.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database', err.message);
    else console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habitName TEXT,
        dailyCost REAL,
        coreWhy TEXT,
        startDate TEXT,
        urgesSurfed INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stressLevel INTEGER,
        timestamp TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS urge_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        intensity INTEGER,
        timestamp TEXT
    )`);
});

app.get('/api/state', (req, res) => {
    db.get(`SELECT * FROM settings ORDER BY id DESC LIMIT 1`, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(`SELECT * FROM checkins ORDER BY id DESC`, (err, checkIns) => {
            if (err) return res.status(500).json({ error: err.message });

            db.all(`SELECT * FROM urge_logs ORDER BY id DESC`, (err, urgeLogs) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!row) return res.json({ isInitialized: false, checkIns: [], urgeLogs: [] });

                res.json({
                    isInitialized: true,
                    habitName: row.habitName,
                    dailyCost: row.dailyCost,
                    coreWhy: row.coreWhy,
                    startDate: row.startDate,
                    urgesSurfed: row.urgesSurfed,
                    checkIns: checkIns || [],
                    urgeLogs: urgeLogs || []
                });
            });
        });
    });
});

app.post('/api/setup', (req, res) => {
    const { habitName, dailyCost, coreWhy } = req.body;
    
    if (!habitName || !coreWhy) {
        return res.status(400).json({ error: 'Habit name and core why are required.' });
    }

    const cost = parseFloat(dailyCost) || 0;
    const startDate = new Date().toISOString();

    db.run(`DELETE FROM settings`, () => {
        db.run(
            `INSERT INTO settings (habitName, dailyCost, coreWhy, startDate, urgesSurfed) VALUES (?, ?, ?, ?, 0)`,
            [habitName, cost, coreWhy, startDate],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Baseline initialized successfully.' });
            }
        );
    });
});

app.post('/api/checkin', (req, res) => {
    const { stressLevel } = req.body;
    if (stressLevel === undefined) return res.status(400).json({ error: 'Stress level is required.' });

    const timestamp = new Date().toISOString();
    db.run(`INSERT INTO checkins (stressLevel, timestamp) VALUES (?, ?)`, [stressLevel, timestamp], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Check-in logged successfully.', id: this.lastID });
    });
});

app.post('/api/urge-log', (req, res) => {
    const { intensity } = req.body;
    if (intensity === undefined) return res.status(400).json({ error: 'Urge intensity is required.' });

    const timestamp = new Date().toISOString();
    db.run(`INSERT INTO urge_logs (intensity, timestamp) VALUES (?, ?)`, [intensity, timestamp], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Urge log saved successfully.', id: this.lastID });
    });
});

app.post('/api/urges', (req, res) => {
    db.run(`UPDATE settings SET urgesSurfed = urgesSurfed + 1`, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get(`SELECT urgesSurfed FROM settings ORDER BY id DESC LIMIT 1`, (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Urge count updated.', urgesSurfed: row ? row.urgesSurfed : 0 });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Shift server running smoothly at http://localhost:${PORT}`);
});