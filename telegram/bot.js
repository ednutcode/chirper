const { Bot } = require('grammy');
const config = require('./config');
const callCommand = require('./commands/call');
const helpCommand = require('./commands/help');
const userCommand = require('./commands/user');
const { initDatabase } = require('./db/db'); // Import initDatabase

// Initialize the database
try {
  initDatabase();
  console.log('✅ Database initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize the database:', error.message);
  process.exit(1); // Exit the process if database initialization fails
}

// Create the bot instance
const bot = new Bot(config.telegramToken);

// Register commands
bot.use(callCommand);
bot.use(helpCommand);
bot.use(userCommand);

// Start the bot
bot.start();
bot.catch((error) => {
  console.error('❌ An error occurred:', error.message);
});