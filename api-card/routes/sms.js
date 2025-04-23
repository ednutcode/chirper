/**
 * Route handler for sending SMS messages to users for a specific service.
 * - Validates input parameters.
 * - Uses Twilio to send SMS.
 * - Stores SMS details in the database.
 */
module.exports = function(request, response) {
    // Import dependencies
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');
    const config = require('../config');
    const client = require('twilio')(config.accountSid, config.authToken);

    // Extract parameters from the request body
    var to = request.body.to || null;
    var user = request.body.user || null;
    // Compose the service key for SMS template (e.g., 'paypalsms')
    var service = request.body.service + 'sms';

    // Validate required parameters
    if (!to || !user || !service) {
        response.status(200).json({ error: 'Please post all the informations needed.' });
        return false;
    }
    // Check if the SMS template for the service exists in config
    if (config[service] == undefined) {
        response.status(200).json({ error: 'The service wasn\'t recognised.' });
        return false;
    }
    // Validate phone number format (8-14 digits)
    if (!to.match(/^\d{8,14}$/g)) {
        response.status(200).json({ error: 'Bad phone number or username or service.' });
        return;
    }

    // Send SMS using Twilio API
    client.messages.create({
        body: config[service], // SMS content from config
        from: config.callerid, // Sender ID from config
        statusCallback: config.serverurl + '/status/' + config.apipassword, // Status callback URL
        to: '+' + to // Recipient phone number
    }).then((message) => {
        var smssid = message.sid;
        // Respond with the SMS SID
        response.status(200).json({ smssid });
        // Store SMS details in the database
        db.run(
            `INSERT INTO sms(smssid, user, itsfrom, itsto, content, service, date) VALUES(?, ?, ?, ?, ?, ?, ?)`,
            [smssid, user, config.callerid, to, config[service], service, Date.now()],
            function(err) {
                if (err) return console.log(err.message);
            }
        );
    }).catch(error => {
        // Handle Twilio API errors
        response.status(500).json({ error: 'Failed to send SMS: ' + error.message });
    });
};