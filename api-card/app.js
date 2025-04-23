/**
 * Main Express app setup.
 * - Registers all routes and middleware.
 */
const express = require('express');
const setup = require('./setup');
const config = require('./config');

const voice = require('./routes/voice');
const status = require('./routes/status');
const call = require('./routes/call');
const sms = require('./routes/sms');
const get = require('./routes/get');
const stream = require('./routes/stream');
const auth = require('./middleware/authentification');

if (config.setupdone === 'false') setup();

const app = express();
app.use(express.urlencoded({ extended: true }));

app.post('/voice/:apipassword', auth, voice);
app.post('/status/:apipassword', auth, status);
app.post('/call', auth, call);
app.post('/sms', auth, sms);
app.post('/get', auth, get);
app.get('/stream/:service', stream);

app.use((req, res) => {
    res.status(404).json({ error: 'Not found, or bad request method.' });
});

module.exports = app;