const { Composer } = require('grammy');
const axios = require('axios');
const qs = require('qs');
const config = require('../config');
const { getUserRole } = require('../utils/utils'); // Import the function to fetch user roles

const callCommand = new Composer();

// Store user session data temporarily
const userSessions = new Map();

callCommand.command('call', async (ctx) => {
    const userId = ctx.from.id;

    try {
        // Fetch user role from the database
        const role = await getUserRole(userId);
        
        if (role !== 'admin') {
            // Restrict access to non-admin users
            return ctx.reply('🚫 You are not authorized to use this command.');
        }

        // Initialize session for the user
        userSessions.set(userId, { step: 'phone' });

        await ctx.reply('📞 Please provide the client phone number to call (e.g., 33612345678):');
    } catch (error) {
        console.error('❌ Error fetching user role:', error.message);
        return ctx.reply('⚠️ An error occurred while checking your permissions.');
    }
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
            return ctx.reply('❌ Invalid phone number. Please provide a valid client phone number (e.g., 33612345678):');
        }

        session.phone = text;
        session.step = 'service';
        return ctx.reply('🏦 Please provide the service name (e.g., PayPal):');
    }

    if (session.step === 'service') {
        // Validate service name
        if (!text.match(/^[a-zA-Z]+$/gm)) {
            return ctx.reply('❌ Invalid service name. Please provide a valid service name (e.g., PayPal):');
        }

        session.service = text.toLowerCase();
        session.step = 'name';
        return ctx.reply('📇 Please provide the name of the client to call (or type "none" if not applicable):');
    }

    if (session.step === 'name') {
        session.name = text.toLowerCase() === 'none' ? null : text.toLowerCase();

        // Send the call request
        try {
            await axios.post(`${config.apiUrl}/call/`, qs.stringify({
                password: config.apiPassword,
                to: session.phone,
                user: ctx.from.username,
                service: session.service,
                name: session.name,
            }));

            await ctx.reply(
                `✅ Call request sent!\n\n📞 **Details:**\n- 📲 Phone: ${session.phone}\n- 🏦 Service: ${session.service}\n- 📇 Name: ${session.name || 'N/A'}`,
                { parse_mode: 'Markdown' }
            );
        } catch (error) {
            console.error('❌ Error placing call:', error.message);
            await ctx.reply('⚠️ Failed to place the call. Please try again later.');
        }

        // Clear the session
        userSessions.delete(userId);
    }
});

module.exports = callCommand;
