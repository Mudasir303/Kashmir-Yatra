/**
 * Seasonal Deals Loader for Kashmir Yatra
 * Fetches deals from API and renders into the home page slider
 */

document.addEventListener('DOMContentLoaded', () => {
    loadSeasonalDeals();
});

async function loadSeasonalDeals() {
    const container = document.getElementById('seasonal-deals-container');
    if (!container) return;

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/tours?isSeasonalDeal=true`);
        if (!response.ok) throw new Error('Failed to fetch deals');

        const deals = await response.json();

        if (deals.length === 0) {
            // If no deals, we could hide the section or show a default message
            // For now, let's keep the static content or show a "Check back soon"
            return;
        }

        renderDeals(deals, container);
    } catch (error) {
        console.error('Error loading seasonal deals:', error);
    }
}

function renderDeals(deals, container) {
    const apiBase = CONFIG.API_BASE_URL.replace('/api', '');

    container.innerHTML = deals.map(deal => {
        const mainImage = deal.images && deal.images.length > 0
            ? deal.images[0]
            : 'assets/img/tour/29.jpg';

        const discountBadge = deal.offerLabel
            ? `<div class="offer-badge">${deal.offerLabel}</div>`
            : '';

        const priceDisplay = deal.discountPrice
            ? `<span class="original-price">₹${deal.price}</span> <span class="deal-price">₹${deal.discountPrice}</span>`
            : `<span class="deal-price">₹${deal.price}</span>`;

        return `
            <div class="swiper-slide">
                <div class="tour-card-item">
                    <div class="tour-image">
                        <img src="${mainImage}" alt="${deal.title}">
                        ${discountBadge}
                    </div>
                    <div class="tour-content">
                        <h6>${deal.season || 'Special'} <span>Package</span></h6>
                        <h4>
                            <a href="tour-details.html?id=${deal._id}">
                                ${deal.title}
                            </a>
                        </h4>
                        <ul>
                            <li>
                                <i class="far fa-map-marker-alt"></i>
                                ${deal.location}
                            </li>
                        </ul>
                        <div class="list">
                            <ul>
                                <li>
                                    <i class="far fa-calendar"></i>
                                    ${deal.duration}
                                </li>
                            </ul>
                            <div class="price-box">
                                ${priceDisplay}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Re-initialize Swiper if it exists
    if (window.Swiper) {
        new Swiper(".tour-slider", {
            spaceBetween: 30,
            speed: 1500,
            loop: deals.length > 1,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".dot",
                clickable: true,
            },
            breakpoints: {
                1199: {
                    slidesPerView: 2,
                },
                991: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 1,
                },
                575: {
                    slidesPerView: 1,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }
}
