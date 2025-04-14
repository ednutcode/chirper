const { getDb } = require('../db');

async function getUserRole(telegramId) {
  try {
    const db = getDb();
    const user = await db.get(
      `SELECT role FROM users WHERE telegram_id = ?`,
      [telegramId]
    );
    return user ? user.role : null;
  } catch (error) {
    console.error('Error fetching user role:', error.message);
    throw error;
  }
}

async function getUser(telegramId) {
  try {
    const db = getDb();
    const user = await db.get(
      `SELECT * FROM users WHERE telegram_id = ?`,
      [telegramId]
    );
    return user || null;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const db = getDb();
    const user = await db.get(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );
    return user || null;
  } catch (error) {
    console.error('Error fetching user by username:', error.message);
    throw error;
  }
}

async function upsertUser(telegramId, username, role = 'user') {
  try {
    const db = getDb();
    await db.run(
      `INSERT INTO users (telegram_id, username, role) VALUES (?, ?, ?)
       ON CONFLICT(telegram_id) DO UPDATE SET username = excluded.username, role = excluded.role`,
      [telegramId, username, role]
    );
  } catch (error) {
    console.error('Error upserting user:', error.message);
    throw error;
  }
}

async function deleteUser(telegramId) {
  try {
    const db = getDb();
    await db.run(`DELETE FROM users WHERE telegram_id = ?`, [telegramId]);
  } catch (error) {
    console.error('Error deleting user:', error.message);
    throw error;
  }
}

module.exports = {
  getUserRole,
  getUser,
  getUserByUsername,
  upsertUser,
  deleteUser,
};