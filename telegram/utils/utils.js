//const db = require('../db/database'); // Import the database connection
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');

/**
 * Fetch the role of a user from the database.
 * @param {number} telegramId - The Telegram ID of the user.
 * @returns {Promise<string>} - The role of the user (e.g., 'admin', 'moderator', 'user').
 */
const getUserRole = (telegramId) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT role FROM users WHERE telegram_id = ?',
            [telegramId],
            (err, row) => {
                if (err) {
                    console.error('❌ Error fetching user role:', err.message);
                    return reject(err);
                }
                if (row) {
                    resolve(row.role); // Return the user's role
                } else {
                    resolve('user'); // Default to 'user' if no role is found
                }
            }
        );
    });
};

/**
 * Check if a user exists in the database.
 * @param {number} telegramId - The Telegram ID of the user.
 * @returns {Promise<boolean>} - True if the user exists, false otherwise.
 */
const userExists = (telegramId) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT 1 FROM users WHERE telegram_id = ?',
            [telegramId],
            (err, row) => {
                if (err) {
                    console.error('❌ Error checking user existence:', err.message);
                    return reject(err);
                }
                resolve(!!row); // Return true if a row is found, false otherwise
            }
        );
    });
};

module.exports = {
    getUserRole,
    userExists,
};