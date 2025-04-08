require('dotenv').config();

module.exports = {
    telegramToken: process.env.TELEGRAM_BOT_TOKEN, // Telegram bot token
    apiUrl: process.env.API_URL,                  // API URL for external requests
    apiPassword: process.env.API_PASSWORD,        // API password for authentication
    telegramId: process.env.ADMIN_TELEGRAM_ID,    // Admin Telegram ID
    secretPassword: process.env.SECRET_PASSWORD,  // Secret password for admin access
    username: process.env.ADMIN_USERNAME          // Admin username
};
