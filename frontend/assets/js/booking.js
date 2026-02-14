document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("tour-booking-form");
    const personsInput = document.getElementById("booking-persons");
    const totalPriceEl = document.getElementById("booking-total-price");
    const submitBtn = document.getElementById("booking-submit-btn");

    let perPersonPrice = 0;

    // 1. Listen for price updates from the main fetch
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === "tour-detail-price") {
                perPersonPrice = parseInt(mutation.target.textContent.replace(/[^0-9]/g, "")) || 0;
                updateTotalPrice();
            }
        });
    });

    const priceEl = document.getElementById("tour-detail-price");
    if (priceEl) {
        observer.observe(priceEl, { characterData: true, childList: true, subtree: true });
        // Initial set
        setTimeout(() => {
            perPersonPrice = parseInt(priceEl.textContent.replace(/[^0-9]/g, "")) || 0;
            updateTotalPrice();
        }, 500);
    }

    const updateTotalPrice = () => {
        const persons = parseInt(personsInput.value) || 1;
        totalPriceEl.textContent = (perPersonPrice * persons).toLocaleString();
    };

    if (personsInput) {
        personsInput.addEventListener("input", updateTotalPrice);
        personsInput.addEventListener("change", updateTotalPrice);
    }

    // 2. Numeric Restriction for Phone
    const phoneInput = bookingForm?.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
        });
    }

    // 3. Handle Submission
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const urlParams = new URLSearchParams(window.location.search);
            const tourId = urlParams.get('id');

            if (!tourId) {
                showToast("Invalid Tour ID", "error");
                return;
            }

            const formData = new FormData(bookingForm);
            const data = {
                tourId,
                name: formData.get("name"),
                email: formData.get("email"),
                phone: formData.get("phone"),
                departureDate: formData.get("departureDate"),
                persons: parseInt(formData.get("persons"))
            };

            // Basic Validation
            if (!data.name || !data.email || !data.phone || !data.departureDate || !data.persons) {
                showToast("Please fill in all fields", "error");
                return;
            }

            // Set Loading
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = "<span>Processing...</span>";

            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/bookings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || "Failed to submit booking");
                }

                showToast("Booking request sent! We will contact you soon.", "success");
                bookingForm.reset();
                updateTotalPrice();

            } catch (error) {
                console.error("Booking Error:", error);
                showToast(error.message, "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});
