// const db = require('../db/database'); // Import the database connection
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');

/**
 * Get user details from the database.
 * @param {number} telegramId - The Telegram ID of the user.
 * @returns {Promise<object>} - The user details (e.g., username, role).
 */
const getUser = (telegramId) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM users WHERE telegram_id = ?',
            [telegramId],
            (err, row) => {
                if (err) {
                    console.error('❌ Error fetching user details:', err.message);
                    return reject(err);
                }
                resolve(row || null); // Return the user details or null if not found
            }
        );
    });
};

/**
 * Add a new user to the database.
 * @param {number} telegramId - The Telegram ID of the user.
 * @param {string} username - The Telegram username of the user.
 * @param {string} role - The role of the user (default: 'user').
 * @returns {Promise<void>}
 */
const addUser = (telegramId, username, role = 'user') => {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO users (telegram_id, username, role) VALUES (?, ?, ?)',
            [telegramId, username, role],
            (err) => {
                if (err) {
                    console.error('❌ Error adding user:', err.message);
                    return reject(err);
                }
                resolve();
            }
        );
    });
};

module.exports = {
    getUser,
    addUser,
};