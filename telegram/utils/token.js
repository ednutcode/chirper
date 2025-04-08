const crypto = require('crypto'); // Import crypto for generating random tokens
const { db } = require('../db/database'); // Import the database connection

/**
 * Generate a unique token for a given Telegram ID.
 * @param {string} telegramId - The Telegram ID of the user.
 * @returns {Promise<string>} - The generated token.
 */
function generateToken(telegramId) {
    return new Promise((resolve, reject) => {
        const token = crypto.randomBytes(32).toString('hex'); // Generate a random 32-byte token
        const query = `INSERT INTO tokens (token, telegram_id) VALUES (?, ?)`;

        db.run(query, [token, telegramId], (err) => {
            if (err) {
                console.error('❌ Error inserting token into database:', err.message);
                return reject(err);
            }
            console.log('✅ Token successfully generated and stored.');
            resolve(token);
        });
    });
}

module.exports = { generateToken }; // Export the token generation function