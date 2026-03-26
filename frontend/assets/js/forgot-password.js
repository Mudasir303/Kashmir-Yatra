document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const messageDiv = document.getElementById('message');
    const submitBtn = e.target.querySelector('button');

    messageDiv.style.display = 'none';
    messageDiv.className = 'text-center mt-3';
    submitBtn.disabled = true;
    submitBtn.textContent = 'SENDING...';

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/admin/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                baseUrl: window.location.href.split('/').slice(0, -1).join('/')
            })
        });

        const data = await response.json();

        if (data.success) {
            messageDiv.style.display = 'block';
            messageDiv.style.color = '#059669';
            messageDiv.textContent = 'A reset link has been sent to your email.';
            e.target.reset();
        } else {
            throw new Error(data.message || 'Something went wrong');
        }
    } catch (error) {
        messageDiv.style.display = 'block';
        messageDiv.style.color = '#dc2626';
        messageDiv.textContent = error.message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'SEND RESET LINK';
    }
});
