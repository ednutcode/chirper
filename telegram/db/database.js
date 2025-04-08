const sqlite3 = require('sqlite3').verbose(); // Import SQLite3 library
const path = require('path');

// Define the path to the database file
const dbPath = path.resolve(__dirname, './data.db');

// Create or open the database file
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to the database:', err.message);
    } else {
        console.log(`✅ Connected to the SQLite database at ${dbPath}`);
    }
});

// Initialize the database tables
const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id TEXT UNIQUE NOT NULL,
                    username TEXT,
                    role TEXT DEFAULT 'user'
                )`,
                (err) => {
                    if (err) {
                        console.error('❌ Error creating users table:', err.message);
                        return reject(err);
                    }
                    console.log('✅ Users table is ready.');
                }
            );

            db.run(
                `CREATE TABLE IF NOT EXISTS tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    token TEXT UNIQUE NOT NULL,
                    telegram_id TEXT NOT NULL,
                    used INTEGER DEFAULT 0
                )`,
                (err) => {
                    if (err) {
                        console.error('❌ Error creating tokens table:', err.message);
                        return reject(err);
                    }
                    console.log('✅ Tokens table is ready.');
                }
            );

            resolve(); // Resolve the promise once all tables are created
        });
    });
};

module.exports = { db, initializeDatabase };