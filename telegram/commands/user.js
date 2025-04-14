// commands/user.js
const { Composer } = require('grammy');
const { upsertUser, deleteUser, getUser, getUserByUsername } = require('../utils/utils');

const userCommand = new Composer();
const userSessions = new Map(); // To track interactive sessions

// Handle /user command
userCommand.command('user', async (ctx) => {
  const userId = ctx.from.id;

  // Start a new session for the user
  userSessions.set(userId, { step: 'command' });
  return ctx.reply(
    'What would you like to do?\nOptions:\n1. Add User\n2. Set Admin\n3. Delete User\n4. Get User Info\n\nReply with the number of your choice:'
  );
});

// Handle interactive sessions
userCommand.on('message', async (ctx) => {
  const userId = ctx.from.id;
  if (!userSessions.has(userId)) return;

  const session = userSessions.get(userId);
  const text = ctx.message.text.trim();

  switch (session.step) {
    case 'command':
      if (text === '1') {
        session.action = 'add';
        session.step = 'username';
        return ctx.reply('Please enter the username to add (e.g., @username):');
      } else if (text === '2') {
        session.action = 'setadmin';
        session.step = 'username';
        return ctx.reply('Please enter the username to promote to admin (e.g., @username):');
      } else if (text === '3') {
        session.action = 'delete';
        session.step = 'username';
        return ctx.reply('Please enter the username to delete (e.g., @username):');
      } else if (text === '4') {
        session.action = 'info';
        session.step = 'username';
        return ctx.reply('Please enter the username to fetch info (e.g., @username), or type "me" to fetch your own info:');
      } else {
        return ctx.reply('Invalid choice. Please reply with a number between 1 and 4.');
      }

    case 'username':
      if (session.action === 'info' && text.toLowerCase() === 'me') {
        // Fetch the user's own information
        const userInfo = await getUser(userId);
        if (!userInfo) {
          userSessions.delete(userId);
          return ctx.reply(`⚠️ Your information was not found in the database.`);
        }
        userSessions.delete(userId);
        return ctx.reply(`ℹ️ Info for you:\nRole: ${userInfo.role}\nTelegram ID: ${userInfo.telegram_id}`);
      }

      if (!text.startsWith('@')) {
        return ctx.reply('❌ Invalid username. Please enter a valid username starting with @ (e.g., @username):');
      }
      session.username = text.replace('@', '');

      if (session.action === 'add') {
        session.step = 'telegram_id';
        return ctx.reply('Please enter the Telegram ID of the user:');
      } else if (session.action === 'setadmin') {
        const userToPromote = await getUserByUsername(session.username);
        if (!userToPromote) {
          userSessions.delete(userId);
          return ctx.reply(`⚠️ User @${session.username} not found.`);
        }
        await upsertUser(userToPromote.telegram_id, session.username, 'admin');
        userSessions.delete(userId);
        return ctx.reply(`✅ User @${session.username} promoted to 'admin'.`);
      } else if (session.action === 'delete') {
        const userToDelete = await getUserByUsername(session.username);
        if (!userToDelete) {
          userSessions.delete(userId);
          return ctx.reply(`⚠️ User @${session.username} not found.`);
        }
        await deleteUser(userToDelete.telegram_id);
        userSessions.delete(userId);
        return ctx.reply(`✅ User @${session.username} deleted successfully.`);
      } else if (session.action === 'info') {
        const userInfo = await getUserByUsername(session.username);
        if (!userInfo) {
          userSessions.delete(userId);
          return ctx.reply(`⚠️ User @${session.username} not found.`);
        }
        userSessions.delete(userId);
        return ctx.reply(`ℹ️ Info for @${session.username}\nRole: ${userInfo.role}\nTelegram ID: ${userInfo.telegram_id}`);
      }
      break;

    case 'telegram_id':
      if (!text.match(/^\d+$/)) {
        return ctx.reply('❌ Invalid Telegram ID. Please enter a valid numeric Telegram ID:');
      }
      session.telegram_id = parseInt(text, 10);

      // Add the user to the database
      try {
        await upsertUser(session.telegram_id, session.username, 'user');
        userSessions.delete(userId);
        return ctx.reply(`✅ User @${session.username} added successfully.`);
      } catch (error) {
        console.error('❌ Error adding user:', error.message);
        userSessions.delete(userId);
        return ctx.reply('⚠️ Failed to add user. Please try again.');
      }

    default:
      userSessions.delete(userId);
      return ctx.reply('⚠️ Something went wrong. Please start over.');
  }
});

module.exports = userCommand;