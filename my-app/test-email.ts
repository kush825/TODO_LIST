
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the parent directory where .env usually is in this project structure
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Testing Email Sending...');
console.log('GMAIL_USER:', process.env.GMAIL_USER);
// obscure password in logs
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? '********' : 'NOT SET');

async function main() {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.error('ERROR: GMAIL_USER or GMAIL_PASS not found in .env');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    try {
        console.log('Attempting to verify transporter connection...');
        await transporter.verify();
        console.log('Transporter connection successful!');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to self
            subject: 'Test Email from Debugger',
            text: 'If you receive this, email sending is working!',
        });
        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('----------------------------------------');
        console.error('FAILED TO SEND EMAIL. DETAILED ERROR:');
        console.error(error);
        console.error('----------------------------------------');
    }
}

main();
