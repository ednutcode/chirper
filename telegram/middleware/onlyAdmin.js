// middleware/onlyAdmin.js
const { getUserRole } = require('../utils/utils');

async function onlyAdmin(ctx, next) {
  try {
    const senderId = ctx.from.id;
    console.log(`🔍 Checking admin permissions for user ID: ${senderId}`);
    const role = await getUserRole(senderId);

    if (role !== 'admin') {
      console.log(`❌ User ID: ${senderId} is not an admin`);
      return ctx.reply('⚠️ You are not authorized to perform this action.');
    }

    console.log(`✅ User ID: ${senderId} is an admin`);
    return next(); // critical for middleware flow
  } catch (error) {
    console.error('❌ Error in onlyAdmin middleware:', error.message);
    ctx.reply('⚠️ An error occurred while checking your permissions.');
  }
}

module.exports = onlyAdmin;