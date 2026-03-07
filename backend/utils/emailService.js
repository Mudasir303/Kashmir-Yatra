const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `"Kashmir Yatra" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            replyTo: options.replyTo || options.reply_to
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully via Nodemailer:", info.messageId);
        return info;

    } catch (error) {
        console.error("Email Sending Error:", error.message);
        throw error;
    }
};

module.exports = { sendEmail };