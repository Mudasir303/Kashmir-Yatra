document.addEventListener('DOMContentLoaded', function () {
    const forms = [
        {
            id: 'accommodation-inquiry-form',
            subjectPrefix: 'Accommodation Inquiry',
            typeField: 'stay_type',
            messagePrefix: 'Stay Type'
        },
        {
            id: 'pilgrimage-inquiry-form',
            subjectPrefix: 'Pilgrimage Inquiry',
            typeField: 'yatra_type',
            messagePrefix: 'Yatra Type'
        },
        {
            id: 'taxi-inquiry-form',
            subjectPrefix: 'Taxi Inquiry',
            typeField: 'vehicle_type',
            messagePrefix: 'Vehicle Type'
        },
        {
            id: 'ticketing-inquiry-form',
            subjectPrefix: 'Ticketing Inquiry',
            typeField: 'ticket_type',
            messagePrefix: 'Ticket Type'
        },
        {
            id: 'unexplored-inquiry-form',
            subjectPrefix: 'Unexplored Kashmir Inquiry',
            typeField: 'destination',
            messagePrefix: 'Destination'
        }
    ];

    forms.forEach(formConfig => {
        const formElement = document.getElementById(formConfig.id);
        if (formElement) {
            formElement.addEventListener('submit', async function (e) {
                e.preventDefault();

                // Get form data
                const formData = new FormData(formElement);
                const typeValue = formData.get(formConfig.typeField);

                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    subject: `${formConfig.subjectPrefix}: ${typeValue || 'General'}`,
                    message: `
${formConfig.messagePrefix}: ${typeValue || 'Not specified'}
Requirements: ${formData.get('message')}
                    `.trim()
                };

                const submitBtn = formElement.querySelector('button[type="submit"]');
                const originalBtnContent = submitBtn.innerHTML;

                try {
                    // UI Feedback
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>Sending... <i class="fas fa-spinner fa-spin"></i></span>';
                    formElement.classList.add('form-loading');

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
                        formElement.reset();

                        // Reset nice-select if present
                        if (typeof $.fn.niceSelect === 'function') {
                            $(formElement).find('select').niceSelect('update');
                        }
                    } else {
                        showToast(result.message || 'Something went wrong. Please try again.', 'error');
                    }

                } catch (error) {
                    console.error(`${formConfig.id} Error:`, error);
                    showToast('Unable to connect to server. Please check your internet.', 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                    formElement.classList.remove('form-loading');
                }
            });
        }
    });
});
