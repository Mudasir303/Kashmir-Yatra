const API_BASE = CONFIG.API_BASE_URL;
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
        if (target === 'messages') loadMessages();
    });
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
});

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
            fetchAPI('/messages')
        ]);

        const [toursResult, blogsResult, msgsResult] = results;
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
        } else {
            console.error("Blogs failed:", blogsResult.reason);
            document.getElementById('totalBlogs').textContent = '-';
        }

        if (msgsResult.status === 'fulfilled') {
            const msgs = await msgsResult.value.json();
            document.getElementById('totalMessages').textContent = msgs.length;
        } else {
            console.error("Messages failed:", msgsResult.reason);
            document.getElementById('totalMessages').textContent = '-';
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
                <img src="${tour.images[0] || 'assets/img/placeholder.jpg'}" alt="${tour.title}">
                ${tour.isFeatured ? '<span style="position:absolute; top:10px; right:10px; background:var(--primary-lime); color:#000; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold;">Featured</span>' : ''}
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span><i class="fa fa-map-marker-alt"></i> ${tour.location}</span>
                    <span style="color:var(--primary-lime); font-weight:600;">₹${tour.price}</span>
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
                <img src="${blog.image || 'assets/img/placeholder.jpg'}" alt="${blog.title}">
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
        preview.src = blog.image;
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
        <div class="message-item" onclick="viewMessage('${msg._id}')">
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
        </div>
    `).join('');
}

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
