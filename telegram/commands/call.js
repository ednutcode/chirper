const { Composer } = require('grammy');
const axios = require('axios');
const qs = require('qs');
const config = require('../config');

const callCommand = new Composer();

// Store user session data temporarily
const userSessions = new Map();

callCommand.command('call', async (ctx) => {
    const userId = ctx.from.id;

    // Initialize session for the user
    userSessions.set(userId, { step: 'phone' });

    await ctx.reply('Please provide the client phone number to call (e.g., 33612345678):');
});

callCommand.on('message', async (ctx) => {
    const userId = ctx.from.id;

    // Check if the user is in a session
    if (!userSessions.has(userId)) {
        return; // Ignore messages from users not in a session
    }

    const session = userSessions.get(userId);
    const text = ctx.message.text.trim();

    if (session.step === 'phone') {
        // Validate phone number
        if (!text.match(/^\d{8,14}$/g)) {
            return ctx.reply('Invalid phone number. Please provide a valid client phone number (e.g., 33612345678):');
        }

        session.phone = text;
        session.step = 'service';
        return ctx.reply('Please provide the service name (e.g., paypal):');
    }

    if (session.step === 'service') {
        // Validate service name
        if (!text.match(/[a-zA-Z]+/gm)) {
            return ctx.reply('Invalid service name. Please provide a valid service name (e.g., paypal):');
        }

        session.service = text.toLowerCase();
        session.step = 'name';
        return ctx.reply('Please provide the name of the client to call (or type "none" if not applicable):');
    }

    if (session.step === 'name') {
        session.name = text.toLowerCase() === 'none' ? null : text.toLowerCase();

        // Send the call request
        try {
            await axios.post(`${config.apiurl}/call/`, qs.stringify({
                password: config.apipassword,
                to: session.phone,
                user: ctx.from.username,
                service: session.service,
                name: session.name,
            }));

            await ctx.reply(
                `📞 Calling Client....\nDetails:\n- 📲 Phone: ${session.phone}\n- 🏦 Service: ${session.service}\n- 📇 Name: ${session.name || 'N/A'}`
            );
        } catch (error) {
            console.error('Error placing call:', error.message);
            await ctx.reply('Failed to place the call. Please try again later.');
        }

        // Clear the session
        userSessions.delete(userId);
    }
});

module.exports = callCommand;
