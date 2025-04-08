const { Bot, session } = require('grammy');
const help = require('./commands/help');
const call = require('./commands/call');
const user = require('./commands/user');
const secret = require('./commands/secret');
const { getUser, addUser } = require('./utils/user');
const { generateToken } = require('./utils/token');
const config = require('./config');
const { initializeDatabase } = require('./db/database'); // Import the database initialization function

const TOKEN = config.telegramToken;
const bot = new Bot(TOKEN);

// Middleware for session handling
bot.use(session());
bot.use(user);
bot.use(help);
bot.use(call);
bot.use(secret);

// Middleware to initialize session user data
bot.use((ctx, next) => {
    if (ctx.session) {
        ctx.session.user = ctx.session.user || {};
        ctx.session.user.telegramId = ctx.from.id;
        ctx.session.user.username = ctx.from.username || ctx.from.first_name;
    }
    return next();
});

// Command: /start
bot.command('start', async (ctx) => {
    try {
        const user = await getUser(ctx.from.id);
        if (!user) {
            await addUser(ctx.from.id, ctx.from.username || ctx.from.first_name);
            ctx.reply('Welcome! You have been registered successfully.');
        } else {
            ctx.reply('Welcome back! You are already registered.');
        }
    } catch (error) {
        console.error('❌ Error in /start command:', error.message);
        ctx.reply('⚠️ An error occurred while registering you. Please try again later.');
    }
});

// Initialize the database and start the bot
(async () => {
    try {
        await initializeDatabase(); // Ensure the database is fully initialized
        console.log('✅ Database initialized successfully.');

        // Generate a token for the admin user
        const adminTelegramId = config.telegramId; // Admin Telegram ID from config
        const token = await generateToken(adminTelegramId);
        console.log(`🔑 Admin token generated: ${token}`);

        // Start the bot
        bot.start();
        console.log('🤖 Telegram Bot is running!');
    } catch (error) {
        console.error('❌ Error during bot initialization:', error.message);
    }
})();