const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/emailService');

// @desc    Test Email connectivity
// @route   GET /api/test/email
router.get('/email', async (req, res) => {
    try {
        const testEmail = req.query.email || process.env.EMAIL_USER;

        await sendEmail({
            to: testEmail,
            subject: "Diagnostic: Kashmir Yatra Email Test",
            html: `
                <h3>Diagnostic Test Successful</h3>
                <p>If you are reading this, your Render backend is successfully communicating with Gmail.</p>
                <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            `
        });

        res.json({
            success: true,
            message: `Diagnostic email queued for ${testEmail}. Check your inbox and Render logs.`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.code || "Check server console for more details"
        });
    }
});

module.exports = router;
