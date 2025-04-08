require('dotenv').config(); // Load environment variables for testing
const db = require('../../telegram/db/database'); // Corrected path
// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database('./db/data.db');

// Before all tests, ensure the database is initialized
beforeAll((done) => {
    db.serialize(() => {
        db.run(
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id TEXT UNIQUE NOT NULL,
                username TEXT,
                role TEXT DEFAULT 'user'
            )`,
            done
        );
    });
});

// After all tests, clean up the database
afterAll((done) => {
    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS users', done);
    });
});