const { Composer } = require('grammy');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');

const secretCommand = new Composer();

/**
 * Command: /secret
 * Purpose: Grant admin privileges to a user using a unique token.
 * Usage: /secret <token>
 */
secretCommand.command('secret', async (ctx) => {
    try {
        // Extract the token argument from the command
        const args = ctx.message.text.split(' ').slice(1);
        const token = args[0]; // The provided token

        if (!token) {
            // If no token is provided, show usage instructions
            return ctx.reply('❓ Usage: /secret <token>\n\nProvide a valid token to gain admin access.');
        }

        console.log(`🔍 Received token: ${token}`); // Debugging log

        // Check if the token exists in the database and is valid
        db.get(
            'SELECT * FROM tokens WHERE token = ? AND used = 0',
            [token],
            (err, row) => {
                if (err) {
                    console.error('❌ Database error:', err.message);
                    return ctx.reply('⚠️ An error occurred while verifying your token. Please try again later.');
                }

                if (!row) {
                    // If the token is invalid or already used
                    console.log('❌ Invalid or expired token.');
                    return ctx.reply('❌ Invalid or expired token. Access denied.');
                }

                console.log(`✅ Valid token found for Telegram ID: ${row.telegram_id}`); // Debugging log

                // Check if the user exists in the `users` table
                db.get('SELECT * FROM users WHERE telegram_id = ?', [ctx.from.id], (err, userRow) => {
                    if (err) {
                        console.error('❌ Database error:', err.message);
                        return ctx.reply('⚠️ An error occurred while verifying your account. Please try again later.');
                    }

                    if (!userRow) {
                        console.log('❌ User not found in the database.');
                        return ctx.reply('❌ You are not registered. Please use /start to register first.');
                    }

                    // Mark the token as used
                    db.run('UPDATE tokens SET used = 1 WHERE token = ?', [token], (err) => {
                        if (err) {
                            console.error('❌ Database error:', err.message);
                            return ctx.reply('⚠️ Failed to update token status. Please try again later.');
                        }

                        // Update the user's role to 'admin'
                        db.run('UPDATE users SET role = "admin" WHERE telegram_id = ?', [ctx.from.id], (err) => {
                            if (err) {
                                console.error('❌ Database error:', err.message);
                                return ctx.reply('⚠️ Failed to update your role. Please try again later.');
                            }

                            console.log(`✅ User ${ctx.from.id} is now an Admin.`);
                            ctx.reply('✅ Congratulations! You are now an Admin! 🎉');
                        });
                    });
                });
            }
        );
    } catch (error) {
        console.error('❌ Error in /secret command:', error.message);
        ctx.reply('⚠️ An unexpected error occurred. Please try again later.');
    }
});

module.exports = secretCommand;