const Message = require("../models/Message");
const { sendEmail } = require("../utils/emailService");

// @desc    Send a new message
// @route   POST /api/messages
// @access  Public
exports.sendMessage = async (req, res) => {
    try {
        const { name, email, subject, phone, message } = req.body;

        // Save to Database first
        const newMessage = await Message.create({
            name,
            email,
            phone,
            subject: subject || "New Inquiry from Website",
            message
        });

        // Send Response immediately to the user for speed
        res.status(201).json(newMessage);

        // Background Email logic
        const mailSubject = subject || "New Contact Form Submission";

        // 1. Admin Notification
        const adminEmailOptions = {
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `${mailSubject}: ${name}`,
            html: `
                <h3>New Message from Kashmir Yatra Contact Form</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Subject:</strong> ${mailSubject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
        };

        // 2. User Confirmation
        const userEmailOptions = {
            to: email,
            subject: `Thank you for contacting Kashmir Yatra`,
            html: `
                <h3>Hello ${name},</h3>
                <p>Thank you for reaching out to us. We have received your inquiry regarding "<strong>${mailSubject}</strong>".</p>
                <p><strong>Your Message:</strong></p>
                <p><em>${message}</em></p>
                <p>Our team will get back to you shortly.</p>
                <br>
                <p>Best Regards,</p>
                <p><strong>Kashmir Yatra Team</strong></p>
            `,
        };

        // Send in background (non-blocking)
        sendEmail(adminEmailOptions).catch(err => console.error("Admin Email Background Error:", err));
        sendEmail(userEmailOptions).catch(err => console.error("User Email Background Error:", err));

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private (Admin only)
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private (Admin only)
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.json({ message: "Message deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
