import nodemailer from 'nodemailer';

const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_SERVICE = 'gmail';


// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: SMTP_SERVICE,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
    },
});

// Verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

export default transporter;

