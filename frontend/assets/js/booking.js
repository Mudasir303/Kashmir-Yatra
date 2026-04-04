document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("tour-booking-form");
    const personsInput = document.getElementById("booking-persons");
    const totalPriceEl = document.getElementById("booking-total-price");
    const submitBtn = document.getElementById("booking-submit-btn");

    let perPersonPrice = 0;

    const syncPerPersonPrice = () => {
        const priceEl = document.getElementById("tour-detail-price");
        let foundValidPrice = false;
        
        if (priceEl && priceEl.textContent && priceEl.textContent !== "0" && priceEl.textContent !== "Loading price...") {
            const numericPrice = parseInt(priceEl.textContent.replace(/[^\d]/g, "")) || 0;
            if (numericPrice !== perPersonPrice) {
                perPersonPrice = numericPrice;
                updateTotalPrice();
            }
            foundValidPrice = true;
        } else if (perPersonPrice !== 0) {
            perPersonPrice = 0;
            updateTotalPrice();
        }

        return foundValidPrice;
    };

    // Observe a stable container (the entire details content)
    const container = document.querySelector(".details-content") || document.body;
    const observer = new MutationObserver(() => {
        syncPerPersonPrice();
    });
    observer.observe(container, { childList: true, subtree: true, characterData: true });

    const updateTotalPrice = () => {
        const persons = parseInt(personsInput.value) || 1;
        const currentTotalPriceSp = document.getElementById("booking-total-price");
        if (currentTotalPriceSp) {
            const totalContainer = currentTotalPriceSp.closest('h4');
            if (perPersonPrice > 0) {
                if (totalContainer) {
                    totalContainer.innerHTML = `Total: &#8377;<span id="booking-total-price">${(perPersonPrice * persons).toLocaleString()}</span>`;
                    totalContainer.style.display = 'block';
                }
            } else {
                if (totalContainer) {
                    totalContainer.innerHTML = `<span style="font-size: 0.9em; color: #888; font-style: italic;">Contact for Pricing</span><span id="booking-total-price" style="display:none;">0</span>`;
                    totalContainer.style.display = 'block';
                }
            }
        }
    };

    // Initial load: set visibility based on initial perPersonPrice (which is 0)
    updateTotalPrice();

    // Initial and Polling check as fallback
    syncPerPersonPrice();
    let checkCount = 0;
    const checkPrice = setInterval(() => {
        if (syncPerPersonPrice()) {
            // We found a price, but for seasonal deals it might change AGAIN
            // after the initial load, so we continue polling for a bit
        }
        if (++checkCount > 30) clearInterval(checkPrice);
    }, 300);

    if (personsInput) {
        personsInput.addEventListener("input", updateTotalPrice);
        personsInput.addEventListener("change", updateTotalPrice);
    }

    // Initialize Datepicker with Restriction (Disable Past Dates)
    const datePickerEl = $('#datepicker');
    if (datePickerEl.length) {
        datePickerEl.datepicker({
            autoclose: true,
            todayHighlight: true,
            startDate: new Date(), // Disables all dates before today
            format: 'dd-mm-yyyy'
        }).on('changeDate', updateTotalPrice); // Ensure price updates if date selection somehow affects logic in future
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

            if (!data.name || !data.email || !data.phone || !data.departureDate || !data.persons) {
                showToast("Please fill in all fields", "error");
                return;
            }

            if (data.phone.length < 10) {
                showToast("Please enter a valid 10-digit phone number", "error");
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
