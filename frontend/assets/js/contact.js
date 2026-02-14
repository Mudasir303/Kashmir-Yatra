

const setupContactForm = (formId, defaultSubject = 'New Website Inquiry') => {
    const contactForm = document.getElementById(formId);

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // Basic Validation
            const nameInput = contactForm.querySelector('input[name="name"]');
            const emailInput = contactForm.querySelector('input[name="email"]');
            const phoneInput = contactForm.querySelector('input[name="phone"]');
            const messageInput = contactForm.querySelector('textarea[name="message"]');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            if (!name || !email || !phone || !message) {
                showToast('Please fill in all fields including phone number.', 'error');
                return;
            }

            // Set loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';

            try {
                const API_BASE = CONFIG.API_BASE_URL;

                const res = await fetch(`${API_BASE}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        subject: defaultSubject,
                        message
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    showToast('Message sent successfully! We will contact you soon.', 'success');
                    contactForm.reset();
                } else {
                    showToast(data.message || 'Failed to send message. Please try again.', 'error');
                }

            } catch (error) {
                console.error('Error sending message:', error);
                showToast('An error occurred. Please check your internet connection.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Restrict phone inputs to numbers only
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    });

    setupContactForm('contact-form-hero', 'New Website Inquiry');
    setupContactForm('contact-form1', 'New Website Inquiry');
    setupContactForm('contact-form', 'New Website Inquiry');
});
