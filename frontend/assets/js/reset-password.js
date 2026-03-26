document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('message');
    const submitBtn = e.target.querySelector('button');

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        messageDiv.style.display = 'block';
        messageDiv.style.color = '#dc2626';
        messageDiv.textContent = 'Invalid or missing reset token.';
        return;
    }

    if (password !== confirmPassword) {
        messageDiv.style.display = 'block';
        messageDiv.style.color = '#dc2626';
        messageDiv.textContent = 'Passwords do not match.';
        return;
    }

    messageDiv.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'UPDATING...';

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/admin/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, password })
        });

        const data = await response.json();

        if (data.success) {
            messageDiv.style.display = 'block';
            messageDiv.style.color = '#059669';
            messageDiv.textContent = 'Password reset successful! Redirecting to login...';
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 3000);
        } else {
            throw new Error(data.message || 'Something went wrong');
        }
    } catch (error) {
        messageDiv.style.display = 'block';
        messageDiv.style.color = '#dc2626';
        messageDiv.textContent = error.message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'UPDATE PASSWORD';
    }
});
