module.exports = function(request, response) {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');
    const config = require('../config');
    const client = require('twilio')(config.accountSid, config.authToken);

    var to = request.body.to || null;
    var user = request.body.user || null;
    var service = request.body.service + 'sms';

    if (!to || !user || !service) {
        response.status(200).json({ error: 'Please post all the informations needed.' });
        return false;
    }
    if (config[service] == undefined) {
        response.status(200).json({ error: 'The service wasn\'t recognised.' });
        return false;
    }
    if (!to.match(/^\d{8,14}$/g)) {
        response.status(200).json({ error: 'Bad phone number or username or service.' });
        return;
    }

    client.messages.create({
        body: config[service],
        from: config.callerid,
        statusCallback: config.serverurl + '/status/' + config.apipassword,
        to: '+' + to
    }).then((message) => {
        var smssid = message.sid;
        response.status(200).json({ smssid });
        db.run(`INSERT INTO sms(smssid, user, itsfrom, itsto, content, service, date) VALUES(?, ?, ?, ?, ?, ?, ?)`, [smssid, user, config.callerid, to, config[service], service, Date.now()], function(err) {
            if (err) return console.log(err.message);
        });
    });
};