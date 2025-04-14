const { Composer } = require('grammy');
const {
    isCreator,
    hasPermission,
    getUserIdFromMention,
    getUserRole
} = require('../utils/utils');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../db/data.db');

const dotenv = require('dotenv');
dotenv.config();

const userCommand = new Composer();

module.exports = (db) => {
    userCommand.command('user', async (ctx) => {
        const args = ctx.message.text.split(' ').slice(1);
        const subcommand = args[0];
        const mention = args[1];

        if (!subcommand || !mention) {
            return ctx.reply('❌ Usage: /user <add|delete|info|setadmin> @username');
        }

        if (!await hasPermission(db, ctx.from.id, 'admin')) {
            return ctx.reply('🚫 You are not authorized to manage users.');
        }

        const username = getUserIdFromMention(mention);
        if (!username) return ctx.reply('❌ Invalid username. Use @username');

        ctx.getChatMember(mention).then(async (member) => {
            const targetId = member.user.id;

            switch (subcommand) {
                case 'add':
                    db.run(`INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)`, [targetId, username], (err) => {
                        if (err) return ctx.reply('❌ DB Error: ' + err.message);
                        ctx.reply(`✅ User @${username} added.`);
                    });
                    break;

                case 'setadmin':
                    db.run(`UPDATE users SET role = 'admin' WHERE id = ?`, [targetId], (err) => {
                        if (err) return ctx.reply('❌ DB Error');
                        ctx.reply(`✅ @${username} promoted to admin.`);
                    });
                    break;

                case 'delete':
                    db.run(`DELETE FROM users WHERE id = ?`, [targetId], (err) => {
                        if (err) return ctx.reply('❌ DB Error');
                        ctx.reply(`🗑️ @${username} deleted.`);
                    });
                    break;

                case 'info':
                    db.get(`SELECT id, username, role FROM users WHERE id = ?`, [targetId], (err, row) => {
                        if (err || !row) return ctx.reply('❌ User not found.');
                        ctx.reply(`🧾 <b>User Info</b>\nID: ${row.id}\nUsername: @${row.username}\nRole: ${row.role}`, { parse_mode: 'HTML' });
                    });
                    break;

                default:
                    ctx.reply('❌ Unknown subcommand.');
            }
        }).catch(() => ctx.reply('❌ User not found in chat.'));
    });

    userCommand.command('listadmins', async (ctx) => {
        if (!await hasPermission(db, ctx.from.id, 'admin')) {
            return ctx.reply('🚫 You are not authorized.');
        }

        db.all(`SELECT username, id FROM users WHERE role = 'admin'`, (err, rows) => {
            if (err || !rows.length) return ctx.reply('📭 No admins found.');
            const list = rows.map((r, i) => `${i + 1}. ${r.username ? '@' + r.username : r.id}`).join('\n');
            ctx.reply(`<b>Admins:</b>\n\n${list}`, { parse_mode: 'HTML' });
        });
    });

    return userCommand;
};
