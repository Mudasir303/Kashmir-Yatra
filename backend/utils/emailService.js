const nodemailer = require("nodemailer");
const dns = require("dns");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback); // force IPv4
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
    console.error("Email Sending Error:", error);
  }
};

module.exports = { sendEmail };