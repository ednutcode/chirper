const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const config = require('./config');

// Ensure the database directory exists
const dbDir = path.resolve(__dirname, './db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'data.db');
let db;

async function initDatabase() {
  try {
    // Open the database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create the users table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        telegram_id INTEGER UNIQUE,
        username TEXT UNIQUE,
        role TEXT DEFAULT 'user',
        bio TEXT DEFAULT NULL
      )
    `);

    // Insert the bot creator as the default admin
    if (config.telegramId && config.adminUsername) {
      await db.run(
        `INSERT OR IGNORE INTO users (telegram_id, username, role)
         VALUES (?, ?, 'admin')`,
        [config.telegramId, config.adminUsername]
      );
      console.log('✅ Default admin inserted:', config.adminUsername);
    } else {
      console.warn('⚠️ ADMIN_TELEGRAM_ID or ADMIN_USERNAME not set in .env');
    }

    console.log('✅ Connected to the SQLite database.');
  } catch (error) {
    console.error('❌ Failed to initialize the database:', error.message);
    throw error;
  }
}

function getDb() {
  if (!db) throw new Error('Database not initialized!');
  return db;
}

module.exports = { initDatabase, getDb };