const nodemailer = require("nodemailer");
const dns = require("dns");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Aggressively force IPv4 to avoid 20-30s DNS/IPv6 timeout behavior
    lookup: (hostname, options, callback) => {
        return dns.lookup(hostname, { family: 4 }, callback);
    }
});

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options (to, subject, html, replyTo)
 */
const sendEmail = async (options) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
    };

    const startTime = Date.now();
    try {
        await transporter.sendMail(mailOptions);
        const duration = (Date.now() - startTime) / 1000;
        console.log(`Email sent to ${options.to} in ${duration}s`);
    } catch (error) {
        console.error("Email Sending Error:", error);
        throw error;
    }
};

module.exports = { sendEmail };
