# API App Documentation

## Overview
This project is an API application designed to facilitate the acquisition of credit or debit card information from customers through voice calls. It utilizes Twilio for handling calls and SMS, SQLite for data storage, and Express for the web server framework.

## Project Structure
```
api-app
├── db
│   └── data.db                # SQLite database file
├── middleware
│   └── authentification.js     # Middleware for API authentication
├── routes
│   ├── call.js                 # Route for initiating calls
│   ├── get.js                  # Route for retrieving call information
│   ├── sms.js                  # Route for sending SMS messages
│   ├── status.js               # Route for handling status updates from Twilio
│   ├── stream.js               # Route for streaming audio files
│   └── voice.js                # Route for processing incoming voice requests
├── app.js                       # Main application setup file
├── api.js                       # HTTP server initialization file
├── config.js                    # Configuration settings
├── setup.js                     # Database initialization and setup
└── README.md                    # Project documentation
```

## Setup Instructions
1. **Clone the Repository**
   ```
   git clone <repository-url>
   cd api-app
   ```

2. **Install Dependencies**
   Ensure you have Node.js installed, then run:
   ```
   npm install
   ```

3. **Database Setup**
   The `setup.js` file initializes the SQLite database and creates necessary tables. Run the following command to set up the database:
   ```
   node setup.js
   ```

4. **Configuration**
   Update the `config.js` file with your Twilio API credentials and other necessary configurations.

5. **Start the Server**
   To start the application, run:
   ```
   node api.js
   ```

## Usage
- **Initiate a Call**
  Send a POST request to `/call` with the required parameters to initiate a call and acquire credit or debit card information.

- **Send SMS**
  Use the `/sms` route to send SMS messages to customers.

- **Retrieve Call Information**
  Access the `/get` route with the call SID to retrieve information about past calls.

- **Handle Status Updates**
  The `/status` route processes status updates from Twilio for calls and SMS.

## Notes
- Ensure that your Twilio account is properly set up and that you have the necessary permissions to make calls and send SMS messages.
- The application is designed to handle sensitive information; ensure that you comply with relevant regulations and best practices for data security.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.