document.addEventListener('DOMContentLoaded', function () {
    const miceForm = document.getElementById('mice-inquiry-form');

    if (miceForm) {
        miceForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(miceForm);
            const data = {
                name: formData.get('name'),
                company: formData.get('company'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: `MICE Inquiry: ${formData.get('mice_type')}`,
                message: `
                    MICE Type: ${formData.get('mice_type')}
                    Company: ${formData.get('company')}
                    Requirements: ${formData.get('message')}
                `.trim()
            };

            const submitBtn = miceForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;

            try {
                // UI Feedback
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Sending... <i class="fas fa-spinner fa-spin"></i></span>';
                miceForm.classList.add('form-loading');

                const response = await fetch(`${CONFIG.API_BASE_URL}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    showToast('Thank you! Your inquiry has been sent successfully.', 'success');
                    miceForm.reset();
                } else {
                    showToast(result.message || 'Something went wrong. Please try again.', 'error');
                }

            } catch (error) {
                console.error('MICE Form Error:', error);
                showToast('Unable to connect to server. Please check your internet.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                miceForm.classList.remove('form-loading');
            }
        });
    }
});
