document.addEventListener('DOMContentLoaded', function () {
    const subscribeForms = document.querySelectorAll('.subscribe-form form');
    const API_BASE = CONFIG.API_BASE_URL;

    subscribeForms.forEach(form => {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Subscribing...';

                const response = await fetch(`${API_BASE}/subscribers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (response.ok) {
                    showToast(data.message || 'Subscribed successfully!');
                    emailInput.value = '';
                } else {
                    showToast(data.message || 'Subscription failed.');
                }
            } catch (error) {
                console.error('Subscription error:', error);
                showToast('An error occurred. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    });

    function showToast(message) {
        // Use the existing toast system if available in main.js
        // If not, we can implement a simple one here or assume main.js provides it
        // Based on previous tasks, there is a toast system in toast.css and main.js/admin.js
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.style.display = 'block';
            setTimeout(() => toast.style.display = 'none', 3000);
        } else {
            alert(message);
        }
    }
});
