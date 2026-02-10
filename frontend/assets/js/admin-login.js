const API_URL = `${CONFIG.API_BASE_URL}/auth/admin/login`;

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    const btn = document.querySelector('.btn-login-card');

    // Reset error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Login successful
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.user)); // Optional: store user info
            window.location.href = 'admin-dashboard.html';
        } else {
            // Login failed
            errorDiv.textContent = data.message || 'Login failed. Please check credentials.';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
    } finally {
        btn.textContent = 'Login';
        btn.disabled = false;
    }
});
