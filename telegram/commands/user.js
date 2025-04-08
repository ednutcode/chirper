// commands/user.js

const { Composer } = require('grammy');
//const db = require('../db/database'); // Import the database connection 
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');

const { getUserRole } = require('../utils/utils'); // Utility function to fetch user roles

const userCommand = new Composer();

userCommand.command('user', async (ctx) => {
    console.log(`📥 Received /user command from: ${ctx.from.id}`);

    // Parse the command arguments
    const args = ctx.message.text.split(' ').slice(1);
    const command = args[0]; // Subcommand (e.g., add, remove, setadmin, etc.)
    const targetId = args[1]; // Target user ID or username

    if (!command) {
        // If no subcommand is provided, show usage instructions
        return ctx.reply('❓ Usage: /user add|remove|setadmin|setmod|list');
    }

    try {
        // Fetch the role of the user issuing the command
        const userRole = await getUserRole(ctx.from.id);
        console.log(`🔍 ${ctx.from.id} role: ${userRole}`);

        if (userRole !== 'admin') {
            // Only admins are allowed to execute user management commands
            return ctx.reply('❌ You are not authorized to perform this action.');
        }

        // Handle the different subcommands
        if (command === 'add') {
            // Add a new user to the database
            db.run(
                'INSERT INTO users (telegram_id, username) VALUES (?, ?)',
                [targetId, ctx.from.username],
                (err) => {
                    if (err) return ctx.reply('⚠️ User already exists or database error.');
                    ctx.reply(`✅ User ${targetId} added successfully.`);
                }
            );
        } else if (command === 'remove') {
            // Remove a user from the database
            db.run('DELETE FROM users WHERE telegram_id = ?', [targetId], (err) => {
                if (err) return ctx.reply('⚠️ Error removing user.');
                ctx.reply(`✅ User ${targetId} removed.`);
            });
        } else if (command === 'setadmin') {
            // Grant admin privileges to a user
            db.run('UPDATE users SET role = "admin" WHERE telegram_id = ?', [targetId], (err) => {
                if (err) return ctx.reply('⚠️ Error updating role.');
                ctx.reply(`🔑 User ${targetId} is now an Admin.`);
            });
        } else if (command === 'setmod') {
            // Grant moderator privileges to a user
            db.run('UPDATE users SET role = "moderator" WHERE telegram_id = ?', [targetId], (err) => {
                if (err) return ctx.reply('⚠️ Error updating role.');
                ctx.reply(`🛠️ User ${targetId} is now a Moderator.`);
            });
        } else if (command === 'list') {
            // List all registered users
            db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) return ctx.reply('⚠️ Error fetching users.');
                const usersList = rows.map((u) => `${u.username} (${u.telegram_id}) - ${u.role}`).join('\n');
                ctx.reply(`📋 Registered Users:\n${usersList || 'No users found.'}`);
            });
        } else {
            // Handle invalid subcommands
            ctx.reply('❓ Invalid subcommand.');
        }
    } catch (error) {
        console.error('❌ Error in /user command:', error.message);
        ctx.reply('⚠️ Failed to process the request. Please try again later.');
    }
});

module.exports = userCommand;
