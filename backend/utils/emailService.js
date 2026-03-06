const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Helps avoid some handshake issues in cloud environments
    }
});

// Verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Connection Error:", error);
    } else {
        console.log("Server is ready to send emails");
    }
});

const sendEmail = async (options) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: options.to,
            subject: options.subject,
            html: options.html,
            replyTo: options.replyTo
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.error("Detailed Email Error:", {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        throw error; // Rethrow to let the caller handle it if needed
    }
};

module.exports = { sendEmail };