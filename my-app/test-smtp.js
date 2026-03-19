const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Testing GMAIL_USER:', process.env.GMAIL_USER);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

transporter.verify(function (error, success) {
    if (error) {
        console.log('Verification failed:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});
