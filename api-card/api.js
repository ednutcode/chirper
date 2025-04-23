/**
 * HTTP web server launcher for Express app.
 */
const app = require('./app');
const config = require('./config');
const http = require('http');

const server = http.createServer(app);
server.listen(config.port || 80, function() {
    console.log('Express server started on *:' + (config.port || 80));
});