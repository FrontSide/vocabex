const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'vocabex.db'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

function initDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fetch_date TEXT NOT NULL,
            fullResponseJson TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

function saveResponse(fetchDate, responseJson) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO responses (fetch_date, fullResponseJson) VALUES (?, ?)',
            [fetchDate, JSON.stringify(responseJson)],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

function getLatestNResponses(n) {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM responses ORDER BY created_at DESC LIMIT ?',
            n,
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    let parsedRows = [];
                    for (const row of rows) {
                        parsedRows.push({ 
                                response: JSON.parse(row.fullResponseJson),
                                fetch_date: row.fetch_date
                        });
                    }
                    resolve(parsedRows);
                }
            }
        );
    });
}


module.exports = {
    saveResponse,
    getLatestNResponses
}; 