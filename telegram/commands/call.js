// commands/call.js
const { Composer } = require('grammy');
const axios = require('axios');
const qs = require('qs');
const config = require('../config');
const onlyAdmin = require('../middleware/onlyAdmin');

const callCommand = new Composer();
const userSessions = new Map(); // To track interactive sessions

callCommand.use(onlyAdmin);

callCommand.command('call', async (ctx) => {
  const userId = ctx.from.id;

  console.log(`📞 /call command received from user ID: ${userId}`);

  // Start a new session for the user
  userSessions.set(userId, { step: 'phone' });
  return ctx.reply('📞 Please provide the phone number to call (e.g., 33612345678):');
});

callCommand.on('message', async (ctx) => {
  const userId = ctx.from.id;
  if (!userSessions.has(userId)) {
    console.log(`⚠️ No active session for user ID: ${userId}`);
    return;
  }

  const session = userSessions.get(userId);
  const text = ctx.message.text.trim();

  console.log(`📩 Received input from user ID: ${userId}, Step: ${session.step}, Input: ${text}`);

  switch (session.step) {
    case 'phone':
      if (!text.match(/^\d{8,14}$/)) {
        return ctx.reply('❌ Invalid phone number. Please enter a valid phone number (e.g., 33612345678):');
      }
      session.phone = text;
      session.step = 'service';
      console.log(`✅ Phone number saved: ${session.phone}`);
      return ctx.reply('🏦 Please enter the service name (e.g., PayPal):');

    case 'service':
      if (!text.match(/^[a-zA-Z]+$/)) {
        return ctx.reply('❌ Invalid service name. Please enter a valid service name (e.g., PayPal):');
      }
      session.service = text;
      session.step = 'name';
      console.log(`✅ Service name saved: ${session.service}`);
      return ctx.reply('📇 Please enter the client name (or type "none" if not applicable):');

    case 'name':
      session.name = text.toLowerCase() === 'none' ? null : text;
      console.log(`✅ Client name saved: ${session.name || 'N/A'}`);

      try {
        // Make the API call
        console.log('🌐 Making API call with the following data:', {
          password: config.apiPassword,
          to: session.phone,
          user: ctx.from.username || 'unknown',
          service: session.service,
          name: session.name,
        });

        const response = await axios.post(`${config.apiUrl}/call/`, qs.stringify({
          password: config.apiPassword,
          to: session.phone,
          user: ctx.from.username || 'unknown',
          service: session.service,
          name: session.name,
        }));

        console.log('✅ API Response:', response.data);

        await ctx.reply(
          `✅ Call request sent successfully:\n\n📲 Phone: ${session.phone}\n🏦 Service: ${session.service}\n📇 Name: ${session.name || 'N/A'}`
        );
      } catch (error) {
        console.error('❌ Error making call request:', error.message);
        await ctx.reply('⚠️ Failed to send call request. Please try again.');
      }

      userSessions.delete(userId); // End the session
      break;

    default:
      console.log(`⚠️ Invalid session step for user ID: ${userId}`);
      userSessions.delete(userId);
      return ctx.reply('⚠️ Something went wrong. Please start over.');
  }
});

module.exports = callCommand;