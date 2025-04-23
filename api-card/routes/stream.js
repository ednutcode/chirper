/**
 * Streams audio files for IVR (welcome/end prompts) based on service.
 * - Only allows configured file paths.
 * - Returns audio/mpeg content.
 */
const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = function(req, res) {
    // Map service param to config file path
    const service = req.params.service;
    let filePath;

    if (service === 'end') {
        filePath = config.endfilepath;
    } else {
        filePath = config[`${service}filepath`];
    }

    // Security: Only allow files from config
    if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Audio file not found for this service.' });
    }

    // Stream the audio file
    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fs.statSync(filePath).size
    });
    fs.createReadStream(filePath).pipe(res);
};