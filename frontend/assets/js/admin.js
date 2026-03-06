const API_BASE = CONFIG.API_BASE_URL;
const BASE_URL = API_BASE.replace('/api', '');
const token = localStorage.getItem('adminToken');

// Auth Check
if (!token) {
    window.location.href = 'admin-login.html';
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
});

// Navigation
const navItems = document.querySelectorAll('.nav-links li[data-target]');
const sections = document.querySelectorAll('.content-view');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target');

        // Update active link
        navItems.forEach(li => li.classList.remove('active'));
        item.classList.add('active');

        // Show section
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(`${target}-section`).classList.add('active');

        // Load Data
        if (target === 'dashboard') loadStats();
        if (target === 'tours') loadTours();
        if (target === 'blogs') loadBlogs();
        if (target === 'bookings') loadBookings();
        if (target === 'messages') loadMessages();
        if (target === 'subscribers') loadSubscribers();
    });
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    updateAdminProfile();
    loadStats();

    // Mobile Sidebar Toggle
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggleBtn && sidebar && sidebarOverlay) {
        menuToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        // Close sidebar when clicking outside
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });

        // Close sidebar when clicking a nav link on mobile
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 991) {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
    }
});

function updateAdminProfile() {
    try {
        const adminUserStr = localStorage.getItem('adminUser');
        if (!adminUserStr) return;

        const adminUser = JSON.parse(adminUserStr);
        console.log("Admin User Data:", adminUser);

        if (adminUser) {
            const nameEl = document.getElementById('adminName');
            const emailEl = document.getElementById('adminEmail');
            const avatar = document.querySelector('.user-profile img');

            if (nameEl) nameEl.textContent = adminUser.name || 'Admin User';
            if (emailEl) emailEl.textContent = adminUser.email || '';

            if (avatar && adminUser.name) {
                avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminUser.name)}&background=6c5ce7&color=fff`;
            }
        }
    } catch (e) {
        console.error("Error updating profile UI:", e);
    }
}

// --- API Helpers ---
async function fetchAPI(endpoint, options = {}) {
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
        // 'Content-Type': 'application/json' // REMOVED default Content-Type to allow FormData (browser sets it)
    };

    // If body is NOT FormData, set Content-Type to JSON
    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
            throw new Error('Unauthorized');
        }
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
    }
    return response;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

// --- Dashboard Stats ---
// --- Dashboard Stats ---
// --- Dashboard Stats & Recent Activity ---
async function loadStats() {
    try {
        const results = await Promise.allSettled([
            fetchAPI('/tours/admin'), // Use Admin route for full count
            fetchAPI('/blogs'),
            fetchAPI('/messages'),
            fetchAPI('/bookings/admin')
        ]);

        const [toursResult, blogsResult, msgsResult, bookingsResult] = results;
        let tours = [];

        if (toursResult.status === 'fulfilled') {
            tours = await toursResult.value.json();
            document.getElementById('totalTours').textContent = tours.length;

            // Populate Recent Tours (Last 5)
            const recentTours = tours.slice(-5).reverse();
            const recentTable = document.getElementById('recentToursTableBody');
            if (recentTable) {
                recentTable.innerHTML = recentTours.map(t => `
                    <tr>
                        <td>${t.title}</td>
                        <td>${t.category || '-'} / ${t.subCategory || '-'}</td>
                        <td>₹${t.price}</td>
                        <td>${t.location}</td>
                    </tr>
                `).join('');
            }

            // Populate Breakdown
            const domestic = tours.filter(t => t.category === 'Domestic').length;
            const international = tours.filter(t => t.category === 'International').length;
            if (document.getElementById('domesticCount')) document.getElementById('domesticCount').textContent = domestic;
            if (document.getElementById('internationalCount')) document.getElementById('internationalCount').textContent = international;

        } else {
            console.error("Tours failed:", toursResult.reason);
            document.getElementById('totalTours').textContent = '-';
        }

        if (blogsResult.status === 'fulfilled') {
            const blogs = await blogsResult.value.json();
            document.getElementById('totalBlogs').textContent = blogs.length;
            console.log('Blogs data loaded:', blogs.length, 'blogs');
        } else {
            console.error("Blogs failed:", blogsResult.reason);
            document.getElementById('totalBlogs').textContent = '-';
        }

        if (msgsResult.status === 'fulfilled') {
            const msgs = await msgsResult.value.json();
            // document.getElementById('totalMessages').textContent = msgs.length; // Replaced by bookings card
        }

        if (bookingsResult.status === 'fulfilled') {
            const bookings = await bookingsResult.value.json();
            const bookingsEl = document.getElementById('totalBookings');
            if (bookingsEl) bookingsEl.textContent = bookings.length;
        } else {
            console.error("Bookings failed:", bookingsResult.reason);
            const bookingsEl = document.getElementById('totalBookings');
            if (bookingsEl) bookingsEl.textContent = '-';
        }

    } catch (e) {
        console.error("Error loading stats:", e);
        showToast("Error loading some dashboard data.");
    }
}

// --- Tours Management (Cards) ---
async function loadTours() {
    const container = document.getElementById('toursTableBody');
    container.innerHTML = '<p>Loading tours...</p>';

    const res = await fetchAPI('/tours/admin');
    const tours = await res.json();

    container.innerHTML = tours.map(tour => `
        <div class="item-card">
            <div class="card-img">
                <img src="${tour.images && tour.images.length > 0 ? (tour.images[0].startsWith('http') ? tour.images[0] : BASE_URL + '/' + tour.images[0]) : 'assets/img/placeholder.jpg'}" alt="${tour.title}">
                <div style="position:absolute; top:10px; right:10px; display:flex; flex-direction:column; gap:5px; align-items:flex-end;">
                  ${tour.isFeatured ? '<span style="background:var(--primary-lime); color:#000; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold;">Featured</span>' : ''}
                  ${tour.isSeasonalDeal ? `<span style="background:#ff7675; color:#fff; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold;">Seasonal</span>` : ''}
                </div>
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span><i class="fa fa-map-marker-alt"></i> ${tour.location}</span>
                    <span style="color:var(--primary-lime); font-weight:600;">
                       ${tour.discountPrice ? `<span style="text-decoration:line-through; color:var(--text-gray); font-size:0.8rem; margin-right:5px;">₹${tour.price}</span>₹${tour.discountPrice}` : `₹${tour.price}`}
                    </span>
                </div>
                <h4>${tour.title}</h4>
                <div style="font-size:0.8rem; color:var(--text-gray); margin-bottom:10px;">
                    ${tour.category} / ${tour.subCategory || '-'}
                </div>
                <div class="card-actions">
                    <button class="btn-icon edit" onclick="editTour('${tour._id}')" title="Edit"><i class="fa fa-pencil"></i></button>
                    <button class="btn-icon delete" onclick="deleteTour('${tour._id}')" title="Delete"><i class="fa fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

window.deleteTour = async (id) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;
    const res = await fetchAPI(`/tours/admin/${id}`, { method: 'DELETE' });
    if (res.ok) {
        showToast('Tour deleted successfully');
        loadTours();
        loadStats();
    }
};

// Initialize Tour Quill
var tourQuill = new Quill('#tour-editor-container', {
    theme: 'snow',
    placeholder: 'Detailed tour itinerary...'
});

window.openAddTourModal = () => {
    document.getElementById('tourForm').reset();
    document.getElementById('tourId').value = '';
    tourQuill.root.innerHTML = ''; // Clear Editor
    document.getElementById('tourCategory').value = '';
    document.getElementById('tourCategory').dispatchEvent(new Event('change')); // Reset subcat

    document.getElementById('tourModalTitle').textContent = 'Add New Tour';
    document.getElementById('tourModal').style.display = 'block';
};

window.editTour = async (id) => {
    const res = await fetchAPI(`/tours/${id}`);
    const tour = await res.json();

    document.getElementById('tourId').value = tour._id;
    document.getElementById('tourTitle').value = tour.title;
    document.getElementById('tourPrice').value = tour.price;
    document.getElementById('tourDuration').value = tour.duration;

    // Set Category & SubCategory
    if (tour.category) {
        document.getElementById('tourCategory').value = tour.category;
        document.getElementById('tourCategory').dispatchEvent(new Event('change')); // Trigger populate
        if (tour.subCategory) {
            document.getElementById('tourSubCategory').value = tour.subCategory;
        }
    }

    // Set Quill content
    tourQuill.root.innerHTML = tour.description || '';

    // Note: We cannot set file input value programmatically for security reasons
    // But we could show existing images if we wanted to (omitted for brevity as per plan)

    document.getElementById('tourFeatured').value = tour.isFeatured;
    document.getElementById('tourSeasonalDeal').value = tour.isSeasonalDeal || 'false';
    document.getElementById('tourDiscountPrice').value = tour.discountPrice || '';
    document.getElementById('tourOfferLabel').value = tour.offerLabel || '';
    document.getElementById('tourSeason').value = tour.season || 'All Season';

    document.getElementById('tourModalTitle').textContent = 'Edit Tour';
    document.getElementById('tourModal').style.display = 'block';
};

// --- Dependent Dropdown Logic ---
const subCategories = {
    'Domestic': ['Kashmir', 'Ladakh', 'Andaman', 'Other'],
    'International': ['Dubai', 'Thailand', 'Bali', 'Other']
};

document.getElementById('tourCategory').addEventListener('change', function () {
    const category = this.value;
    const subCatSelect = document.getElementById('tourSubCategory');
    subCatSelect.innerHTML = '<option value="">Select Sub Category</option>';

    if (category && subCategories[category]) {
        subCategories[category].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subCatSelect.appendChild(option);
        });
    }
});

document.getElementById('tourForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('tourId').value;
    const fileInput = document.getElementById('tourImageInput');

    // Create FormData
    const formData = new FormData();
    formData.append('title', document.getElementById('tourTitle').value);
    formData.append('location', document.getElementById('tourLocation').value);
    formData.append('price', document.getElementById('tourPrice').value);
    formData.append('duration', document.getElementById('tourDuration').value);
    formData.append('description', tourQuill.root.innerHTML); // Get HTML from Quill
    formData.append('category', document.getElementById('tourCategory').value);
    formData.append('subCategory', document.getElementById('tourSubCategory').value);
    formData.append('isFeatured', document.getElementById('tourFeatured').value);
    formData.append('isSeasonalDeal', document.getElementById('tourSeasonalDeal').value);
    formData.append('discountPrice', document.getElementById('tourDiscountPrice').value);
    formData.append('offerLabel', document.getElementById('tourOfferLabel').value);
    formData.append('season', document.getElementById('tourSeason').value);

    // Append images
    if (fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('images', fileInput.files[i]);
        }
    }

    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `/tours/admin/${id}` : '/tours/admin';

    try {
        const res = await fetchAPI(endpoint, {
            method,
            body: formData
        });

        if (res.ok) {
            showToast(id ? 'Tour updated' : 'Tour added');
            document.getElementById('tourModal').style.display = 'none';
            loadTours();
            loadStats(); // Refresh stats/recent activity
        } else {
            const err = await res.json();
            alert('Error: ' + err.message);
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("Failed to save tour.");
    }
});

// --- Blogs Management (Cards + Image Upload + WYSIWYG) ---
async function loadBlogs() {
    const container = document.getElementById('blogsTableBody');
    container.innerHTML = '<p>Loading blogs...</p>';

    const res = await fetchAPI('/blogs');
    const blogs = await res.json();

    container.innerHTML = blogs.map(blog => `
        <div class="item-card">
            <div class="card-img">
                <img src="${blog.image ? (blog.image.startsWith('http') ? blog.image : BASE_URL + '/' + blog.image) : 'assets/img/placeholder.jpg'}" alt="${blog.title}">
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span><i class="fa fa-calendar"></i> ${new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span><i class="fa fa-user"></i> ${blog.author}</span>
                </div>
                <h4>${blog.title}</h4>
                <div class="card-actions">
                    <button class="btn-icon edit" onclick="editBlog('${blog._id}')" title="Edit"><i class="fa fa-pencil"></i></button>
                    <button class="btn-icon delete" onclick="deleteBlog('${blog._id}')" title="Delete"><i class="fa fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

window.deleteBlog = async (id) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    const res = await fetchAPI(`/blogs/${id}`, { method: 'DELETE' });
    if (res.ok) {
        showToast('Blog deleted successfully');
        loadBlogs();
        loadStats();
    }
};

window.openAddBlogModal = () => {
    document.getElementById('blogForm').reset();
    document.getElementById('blogId').value = '';
    document.getElementById('blogImagePreview').style.display = 'none';
    quill.root.innerHTML = ''; // Clear Editor
    document.getElementById('blogModalTitle').textContent = 'Add New Blog';
    document.getElementById('blogModal').style.display = 'block';
};

window.editBlog = async (id) => {
    const res = await fetchAPI(`/blogs/${id}`);
    const blog = await res.json();

    document.getElementById('blogId').value = blog._id;
    document.getElementById('blogTitle').value = blog.title;

    // Show existing image preview if available
    if (blog.image) {
        const preview = document.getElementById('blogImagePreview');
        preview.src = blog.image.startsWith('http') ? blog.image : BASE_URL + '/' + blog.image;
        preview.style.display = 'block';
    }

    // Set Quill content
    quill.root.innerHTML = blog.content;
    document.getElementById('blogTags').value = blog.tags.join(', ');

    document.getElementById('blogModalTitle').textContent = 'Edit Blog';
    document.getElementById('blogModal').style.display = 'block';
};

// Handle File Selection Preview
document.getElementById('blogImage').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('blogImagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('blogId').value;
    const fileInput = document.getElementById('blogImage');

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', document.getElementById('blogTitle').value);
    formData.append('content', quill.root.innerHTML); // Get HTML from Quill
    formData.append('tags', document.getElementById('blogTags').value);

    // Append image only if selected (for update, if not selected, backend keeps old one)
    if (fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
    }

    // For updates, we usually PUT to /blogs/:id
    // For creates, POST to /blogs
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `/blogs/${id}` : '/blogs';

    try {
        const res = await fetchAPI(endpoint, {
            method,
            body: formData
            // No Content-Type header here, fetch adds it with boundary for FormData
        });

        if (res.ok) {
            showToast(id ? 'Blog updated' : 'Blog created');
            document.getElementById('blogModal').style.display = 'none';
            loadBlogs();
        } else {
            const err = await res.json();
            alert('Error: ' + err.message);
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("Failed to submit blog. See console.");
    }
});

// --- Message Management (List) ---
async function loadMessages() {
    const container = document.getElementById('messagesTableBody');
    container.innerHTML = '<p>Loading messages...</p>';

    const res = await fetchAPI('/messages');
    const msgs = await res.json();

    container.innerHTML = msgs.map(msg => `
        <div class="message-item" onclick="viewMessage('${msg._id}')" style="position: relative; padding-right: 50px;">
            <div class="msg-sender">
                <div class="sender-avatar">${msg.name.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="msg-subject">${msg.name}</div>
                    <div class="msg-date">${msg.email}</div>
                </div>
            </div>
            <div class="msg-info">
                <div class="msg-subject">${msg.subject || 'No Subject'}</div>
                <div class="msg-text text-muted">${msg.message.substring(0, 50)}...</div>
            </div>
            <div class="msg-date">${new Date(msg.createdAt).toLocaleDateString()}</div>
            <button class="btn-icon delete" onclick="deleteMessage('${msg._id}', event)" title="Delete" 
                style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); z-index: 10;">
                <i class="fa fa-trash"></i>
            </button>
        </div>
    `).join('');
}

window.deleteMessage = async (id, event) => {
    event.stopPropagation(); // Prevent opening the modal
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
        const res = await fetchAPI(`/messages/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Message deleted successfully');
            loadMessages();
            loadStats(); // Update stats counters
        } else {
            alert('Failed to delete message');
        }
    } catch (error) {
        console.error("Error deleting message:", error);
        alert("Error deleting message");
    }
};

window.viewMessage = async (id) => {
    // Quick hack: re-fetch all to find one (since we don't have getById public/admin split sorted out perfectly yet)
    // Optimization: could pass full object or store in global var
    const res = await fetchAPI('/messages');
    const msgs = await res.json();
    const msg = msgs.find(m => m._id === id);

    if (msg) {
        document.getElementById('msgFrom').textContent = msg.name;
        document.getElementById('msgEmail').textContent = msg.email;
        document.getElementById('msgSubject').textContent = msg.subject || 'No Subject';
        document.getElementById('msgBody').textContent = msg.message;
        document.getElementById('messageModal').style.display = 'block';
    }
};

// Modal Helper
window.closeModal = (id) => {
    document.getElementById(id).style.display = 'none';
};

window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
};
// --- Bookings Logic ---
async function loadBookings() {
    try {
        const response = await fetchAPI('/bookings/admin');
        const bookings = await response.json();
        const tbody = document.getElementById('bookingsTableBody');
        tbody.innerHTML = '';

        bookings.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-white"><strong>${b.tourTitle}</strong></td>
                <td>
                    <div class="text-white">${b.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-gray)">${b.email} | ${b.phone}</div>
                </td>
                <td class="text-white">${b.departureDate}</td>
                <td class="text-white">${b.persons}</td>
                <td class="text-white">₹${b.totalPrice.toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="viewBookingDetails('${b._id}')" title="View Details"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteBooking('${b._id}')" title="Delete Permanent"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Load Bookings Error:", err);
        showToast("Error loading bookings");
    }
}

async function viewBookingDetails(id) {
    try {
        const response = await fetch(`${API_BASE}/bookings/admin`); // We already have the list, but let's find the item
        const bookings = await response.json();
        const b = bookings.find(item => item._id === id);

        if (!b) return;

        // Use the existing messageModal or create a new one? Let's use messageModal structure for now
        document.getElementById('msgFrom').textContent = b.name;
        document.getElementById('msgEmail').textContent = b.email;
        document.getElementById('msgSubject').textContent = `Booking for ${b.tourTitle}`;
        document.getElementById('msgBody').innerHTML = `
            <div class="booking-details-modal">
                <p><strong>Phone:</strong> ${b.phone}</p>
                <p><strong>Tour:</strong> ${b.tourTitle}</p>
                <p><strong>Departure Date:</strong> ${b.departureDate}</p>
                <p><strong>Persons:</strong> ${b.persons}</p>
                <p><strong>Total Price:</strong> ₹${b.totalPrice.toLocaleString()}</p>
                <p><strong>Submission Date:</strong> ${new Date(b.createdAt).toLocaleDateString()}</p>
            </div>
        `;
        document.getElementById('messageModal').style.display = 'block';
    } catch (err) {
        console.error("View Details Error:", err);
        showToast("Error loading details");
    }
}


async function deleteBooking(id) {
    if (!confirm('Are you sure you want to DELETE this booking PERMANENTLY? This cannot be undone.')) return;

    try {
        await fetchAPI(`/bookings/${id}`, {
            method: 'DELETE'
        });
        showToast('Booking deleted');
        loadBookings();
    } catch (err) {
        console.error("Delete Booking Error:", err);
        showToast("Error deleting booking");
    }
}

// --- Subscribers Management ---
async function loadSubscribers() {
    try {
        const res = await fetchAPI('/subscribers');
        const subscribers = await res.json();
        const tbody = document.getElementById('subscribersTableBody');
        if (!tbody) return;

        tbody.innerHTML = subscribers.map(s => `
            <tr>
                <td class="text-white">${s.email}</td>
                <td class="text-white">${new Date(s.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSubscriber('${s._id}')" title="Delete"><i class="fa fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

        const totalSubscribersEl = document.getElementById('totalSubscribers');
        if (totalSubscribersEl) totalSubscribersEl.textContent = subscribers.length;

    } catch (err) {
        console.error("Load Subscribes Error:", err);
        showToast("Error loading subscribers");
    }
}

window.deleteSubscriber = async (id) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    try {
        const res = await fetchAPI(`/subscribers/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Subscriber deleted');
            loadSubscribers();
            if (document.getElementById('totalSubscribers')) {
                // Refresh stats if we are on dashboard or have the counter
                loadStats();
            }
        }
    } catch (err) {
        console.error("Delete Subscriber Error:", err);
        showToast("Error deleting subscriber");
    }
};
