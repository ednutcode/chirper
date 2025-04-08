const { Composer } = require('grammy');

const helpCommand = new Composer();

// List of supported call services
const callServices = [
    'Google',
    'Snapchat',
    'Instagram',
    'Facebook',
    'WhatsApp',
    'Twitter',
    'Amazon',
    'Cdiscount',
    'Default: works for all systems',
    'Bank: bypass 3D Secure',
];

// Generate the help message dynamically
const generateHelpMessage = () => `
<b>Help, Commands & Information</b>

<b>Description: All the Admin Commands</b>
/user add @user - Allow someone to use the bot & the calls
/user delete @user - Remove someone or an admin from the bot
/user info @user - Get info from a user
/user setadmin @user - Set a user to admin

<b>All the User Commands:</b>
/secret yoursecretpassword @user - Set a user to admin without being admin
/call phonenumber service (e.g., /call 33612345678 paypal) - Allows you to make a call to the phone number and get the code

<b>The Different Call Services Supported:</b>
${callServices.map((service, index) => `${index + 1}. ${service}`).join('\n')}
`;

helpCommand.command('help', async (ctx) => {
    try {
        const helpMessage = generateHelpMessage();

        await ctx.reply(helpMessage, {
            parse_mode: 'HTML',  // Using Telegram's HTML formatting
        });
    } catch (error) {
        console.error('❌ Error sending help message:', error);
        await ctx.reply('An error occurred while fetching the help message. Please try again later.');
    }
});

module.exports = helpCommand;
