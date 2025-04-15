const { Composer } = require('grammy');
const axios = require('axios');
const qs = require('qs');
const config = require('../config');
const onlyAdmin = require('../middleware/onlyAdmin');

const callCommand = new Composer();

callCommand.command('call', onlyAdmin, async (ctx) => {
  ctx.session.callSession = { step: 'phone' }; // Initialize session
  return ctx.reply('📞 Please provide the phone number to call (e.g., 33612345678):');
});

callCommand.command('cancelcall', async (ctx) => {
  if (ctx.session.callSession) {
    ctx.session.callSession = null; // Clear session
    return ctx.reply('❌ Call session canceled.');
  }
  return ctx.reply('ℹ️ No active call session found.');
});

callCommand.on('message:text', async (ctx, next) => {
  const session = ctx.session.callSession;
  if (!session) return next(); // No active session, pass to next middleware

  const text = ctx.message.text.trim();

  switch (session.step) {
    case 'phone':
      if (!/^\d{8,14}$/.test(text)) {
        return ctx.reply('❌ Invalid phone number. Please enter a valid number (e.g., 33612345678):');
      }
      session.phone = text;
      session.step = 'service';
      return ctx.reply('🏦 Please enter the service name (e.g., PayPal):');

    case 'service':
      if (!/^[a-zA-Z]+$/.test(text)) {
        return ctx.reply('❌ Invalid service name. Use alphabetic characters only (e.g., PayPal):');
      }
      session.service = text;
      session.step = 'name';
      return ctx.reply('📇 Enter the client name (or type "none" if not applicable):');

    case 'name':
      session.name = text.toLowerCase() === 'none' ? null : text;

      try {
        const payload = {
          password: config.apiPassword,
          to: session.phone,
          user: ctx.from.username || 'unknown',
          service: session.service,
          name: session.name,
        };

        await axios.post(`${config.apiUrl}/call/`, qs.stringify(payload));

        await ctx.reply(
          `✅ Call request sent successfully:\n\n📲 Phone: ${session.phone}\n🏦 Service: ${session.service}\n📇 Name: ${session.name || 'N/A'}`
        );
      } catch (err) {
        console.error('❌ API call error:', err.message);
        await ctx.reply('⚠️ Failed to send call request. Please check the service or API.');
      }

      ctx.session.callSession = null; // Clear session
      break;

    default:
      ctx.session.callSession = null; // Clear session
      return ctx.reply('⚠️ Unknown session step. Please restart using /call.');
  }
});

module.exports = callCommand;
