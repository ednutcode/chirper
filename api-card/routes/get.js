/**
 * Retrieves call and card details for a given callSid.
 * - Masks card number and CVV in the response.
 */
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');

module.exports = function(request, response) {
    const callSid = request.body.callSid;

    if (!callSid) {
        return response.status(400).json({ error: 'Please provide a callSid.' });
    }

    db.get('SELECT * FROM calls WHERE callSid = ?', [callSid], (err, row) => {
        if (err) {
            return response.status(500).json({ error: 'Database error: ' + err.message });
        }
        if (!row) {
            return response.status(404).json({ error: 'Call not found.' });
        }
        response.status(200).json({
            callSid: row.callSid,
            itsfrom: row.itsfrom,
            itsto: row.itsto,
            status: row.status,
            date: row.date,
            user: row.user,
            service: row.service,
            card_number: row.card_number ? row.card_number.replace(/^(\d{4})\d{8,10}(\d{4})$/, '$1********$2') : undefined,
            card_expiry: row.card_expiry,
            card_cvv: row.card_cvv ? '***' : undefined
        });
    });
};