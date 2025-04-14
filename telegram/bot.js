// bot.js
const { Bot } = require('grammy');
const config = require('./config');
const { initDatabase, getDb } = require('./db');

// Import command handlers
const callCommand = require('./commands/call');
const helpCommand = require('./commands/help');
const userCommand = require('./commands/user');

// Init DB
initDatabase().then(async () => {
  console.log('✅ Database initialized successfully');

  // Insert default admin
  const db = getDb();
  const adminExists = await db.get('SELECT * FROM users WHERE telegram_id = ?', [config.telegramId]);
  if (!adminExists) {
    await db.run(
      'INSERT INTO users (telegram_id, username, role) VALUES (?, ?, ?)',
      [config.telegramId, config.adminUsername, 'admin']
    );
    console.log(`✅ Default admin inserted: @${config.adminUsername}`);
  }
}).catch((error) => {
  console.error('❌ Failed to initialize the database:', error.message);
  process.exit(1);
});

const bot = new Bot(config.telegramToken);

// Register commands
console.log('ℹ️ Registering commands...');
bot.use(helpCommand);
bot.use(userCommand);
bot.use(callCommand);
console.log('✅ Commands registered successfully');

// Log full stack trace
bot.catch((err) => {
  console.error('❌ Bot encountered an error:', err.error || err);
});

bot.start().then(() => {
  console.log('✅ Bot started successfully');
});