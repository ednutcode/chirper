const { Composer } = require('grammy');
const axios = require('axios');
const qs = require('qs');
const config = require('../config');
const { hasPermission } = require('../utils/utils');

module.exports = (db) => {
    const callCommand = new Composer();
    const userSessions = new Map();

    callCommand.command('call', async (ctx) => {
        const userId = ctx.from.id;
        if (!await hasPermission(db, userId, 'admin')) {
            return ctx.reply('🚫 You are not authorized to use this command.');
        }

        userSessions.set(userId, { step: 'phone' });
        await ctx.reply('📞 Provide the phone number to call (e.g., 33612345678):');
    });

    callCommand.on('message', async (ctx) => {
        const userId = ctx.from.id;
        if (!userSessions.has(userId)) return;

        const session = userSessions.get(userId);
        const text = ctx.message.text.trim();

        if (session.step === 'phone') {
            if (!text.match(/^\d{8,14}$/)) return ctx.reply('❌ Invalid phone number.');
            session.phone = text;
            session.step = 'service';
            return ctx.reply('🏦 Provide the service name (e.g., PayPal):');
        }

        if (session.step === 'service') {
            if (!text.match(/^[a-zA-Z]+$/)) return ctx.reply('❌ Invalid service name.');
            session.service = text.toLowerCase();
            session.step = 'name';
            return ctx.reply('📇 Provide client name or type "none":');
        }

        if (session.step === 'name') {
            session.name = text.toLowerCase() === 'none' ? null : text.toLowerCase();

            try {
                await axios.post(`${config.apiUrl}/call/`, qs.stringify({
                    password: config.apiPassword,
                    to: session.phone,
                    user: ctx.from.username,
                    service: session.service,
                    name: session.name,
                }));

                await ctx.reply(
                    `✅ Call Request Sent!\n\n📲 Phone: ${session.phone}\n🏦 Service: ${session.service}\n📇 Name: ${session.name || 'N/A'}`,
                    { parse_mode: 'Markdown' }
                );
            } catch (err) {
                console.error('❌ Call failed:', err.message);
                await ctx.reply('⚠️ Call failed. Please try again.');
            }

            userSessions.delete(userId);
        }
    });

    return callCommand;
};
