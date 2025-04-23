/**
 * Initiates a call to the customer for card acquisition.
 * - Stores call info and sets initial card_stage.
 */
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');
const config = require('../config');
const client = require('twilio')(config.accountSid, config.authToken);

module.exports = function(request, response) {
    const to = request.body.to || null;
    const user = request.body.user || null;
    const service = request.body.service || null;
    const name = request.body.name || null;

    if (!to || !user || !service) {
        return response.status(400).json({ error: 'Please post all the information needed.' });
    }
    if (!config[`${service}filepath`]) {
        return response.status(400).json({ error: "The service wasn't recognized." });
    }
    if (!to.match(/^\d{8,14}$/g)) {
        return response.status(400).json({ error: 'Bad phone number.' });
    }

    client.calls.create({
        method: 'POST',
        statusCallbackEvent: ['initiated', 'answered', 'completed'],
        statusCallback: `${config.serverurl}/status/${config.apipassword}`,
        url: `${config.serverurl}/voice/${config.apipassword}`,
        to: to,
        from: config.callerid
    }).then((call) => {
        const callSid = call.sid;
        db.get('SELECT callSid FROM calls WHERE callSid = ?', [callSid], (err, row) => {
            if (err) return console.log(err.message);
            if (!row) {
                db.run(
                    `INSERT INTO calls(callSid, user, service, itsto, name, card_stage) VALUES(?, ?, ?, ?, ?, ?)`,
                    [callSid, user, service, to, name, 'number']
                );
            } else {
                db.run(
                    `UPDATE calls SET user = ?, service = ?, itsto = ?, name = ?, card_stage = ? WHERE callSid = ?`,
                    [user, service, to, name, 'number', callSid]
                );
            }
        });
        response.status(200).json({ callSid });
    }).catch(error => {
        response.status(500).json({
            error: 'There was a problem with your call: ' + error
        });
    });
};