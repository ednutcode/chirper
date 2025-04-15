// middleware/onlyAdmin.js
const { getUserRole } = require('../utils/utils');

async function onlyAdmin(ctx, next) {
  try {
    const senderId = ctx.from.id;
    const role = await getUserRole(senderId);

    if (role !== 'admin') {
      return ctx.reply('⚠️ You are not authorized to perform this action.');
    }

    return next(); // Proceed to the next middleware
  } catch (error) {
    console.error('❌ Error in onlyAdmin middleware:', error.message);
    return ctx.reply('⚠️ An error occurred while checking your permissions.');
  }
}

module.exports = onlyAdmin;