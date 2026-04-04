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
        const deals = await response.json();
        const section = document.getElementById('seasonal-deals-section');
        const slider = document.querySelector('.tour-slider');

        if (section) section.style.display = 'block';

        if (deals.length === 0) {
            if (slider) {
                slider.style.transform = 'none';
                slider.style.width = '100%';
                slider.innerHTML = `
                    <div class="no-deals-card" style="background: rgba(0,0,0,0.4); border: 2px dashed rgba(255,255,255,0.2); border-radius: 28px; padding: 80px 30px; text-align: center; backdrop-filter: blur(10px); width: 100%; max-width: 500px; margin: 0 auto; box-sizing: border-box;">
                        <div class="content" style="background: transparent;">
                            <h3 class="text-white mb-3" style="font-weight: 700; font-size: 1.8rem; line-height: 1.3; overflow-wrap: break-word;">Check Back for the <br> Best Offers!</h3>
                            <p style="color: rgba(255,255,255,0.8); font-size: 1.1rem; line-height: 1.6; margin: 0 auto; overflow-wrap: break-word;">
                                We're currently curating our next round of exclusive seasonal deals. 
                                Stay tuned for unbeatable packages and special discounts!
                            </p>
                        </div>
                    </div>
                `;
                slider.classList.remove('swiper');
            }
            return;
        }

        if (slider) slider.classList.add('swiper');
        renderDeals(deals, container);
    } catch (error) {
        console.error('Error loading seasonal deals:', error);
    }
}

function renderDeals(deals, container) {
    const apiBase = CONFIG.API_BASE_URL.replace('/api', '');

    container.innerHTML = deals.map(deal => {
        const mainImage = deal.images && deal.images.length > 0
            ? (deal.images[0].startsWith('http') ? deal.images[0] : `${apiBase}/${deal.images[0]}`)
            : 'assets/img/tour/29.jpg';

        const discountBadge = deal.offerLabel
            ? `<div class="offer-badge">${deal.offerLabel}</div>`
            : '';

        const priceDisplay = deal.discountPrice
            ? `<span class="original-price">₹${deal.price || ''}</span> <span class="deal-price">₹${deal.discountPrice}</span> <span style="font-size: 0.8em; font-weight: normal; color: #666;">per person</span>`
            : (deal.price ? `<span class="deal-price">₹${deal.price}</span> <span style="font-size: 0.8em; font-weight: normal; color: #666;">per person</span>` : '<span class="deal-price" style="font-size:0.85em; font-style:italic;">Contact for Best Price</span>');

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
