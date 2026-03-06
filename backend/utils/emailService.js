const sendEmail = async (options) => {
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Kashmir Yatra <onboarding@resend.dev>', // Keep as onboarding@resend.dev until domain is verified
                to: options.to,
                subject: options.subject,
                html: options.html,
                reply_to: options.replyTo || options.reply_to
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Email sent successfully via Resend:", data.id);
            return data;
        } else {
            console.error("Resend API Error:", data);
            throw new Error(data.message || "Failed to send email");
        }
    } catch (error) {
        console.error("Email Sending Error:", error.message);
        throw error;
    }
};

module.exports = { sendEmail };