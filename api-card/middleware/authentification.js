/**
 * Middleware for API authentication.
 * - Checks if the API password is set in config.
 * - Validates the password from request body or URL params.
 * - Returns 401 error if authentication fails.
 */
module.exports = (request, response, next) => {
    const config = require('../config');
    try {
        // Accept password from body (POST) or URL params (GET/POST)
        const pass = request.body.password || request.params.apipassword;

        // Check if API password is set in config
        if (!config.apipassword) return error('Your API Password is not set, look at your config file.', 401);

        // Check if password is provided
        if (!pass) return error('Please send the API password.', 401);

        // Check if password is not empty
        if (pass.trim() === '') return error('The password you sent is empty.', 401);

        // Validate password
        if (pass !== config.apipassword) return error('Invalid password.', 401);

        // If all checks pass, continue to next middleware/route
        next();
    } catch {
        response.status(401).json({ error: 'Invalid request!' });
    }

    // Helper function to send error response
    function error(msg, statuscode) {
        response.status(statuscode).json({ error: msg });
    }
};