const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Use an absolute path for the database file
const dbPath = path.resolve(__dirname, '../db/data.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to the database:', err.message);
  } else {
    console.log('✅ Connected to the SQLite database.');
  }
});

const config = require('../config');

function initDatabase() {
  const DEFAULT_ADMIN_ID = config.telegramId;

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        telegram_id INTEGER UNIQUE,
        username TEXT,
        role TEXT DEFAULT 'user',
        bio TEXT
      )
    `);

    db.run(
      `INSERT OR IGNORE INTO users (telegram_id, username, role) VALUES (?, ?, ?)`,
      [DEFAULT_ADMIN_ID, 'creator', 'admin']
    );
  });
}

module.exports = { db, initDatabase };