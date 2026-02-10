const urlParams = new URLSearchParams(window.location.search);
const blogId = urlParams.get('id');

const API_BASE = CONFIG.API_BASE_URL;

async function loadBlogDetails() {
    if (!blogId) return;

    try {
        const res = await fetch(`${API_BASE}/blogs/${blogId}`);
        if (!res.ok) throw new Error('Blog not found');
        const blog = await res.json();

        document.getElementById('blogTitle').textContent = blog.title;
        document.getElementById('blogAuthor').innerHTML = `<i class="far fa-user-circle"></i> ${blog.author}`;

        if (blog.createdAt) {
            const date = new Date(blog.createdAt).toLocaleDateString();
            document.getElementById('blogDate').textContent = date;
        }

        // Handle Image
        const imgEl = document.getElementById('blogImage');
        if (imgEl && blog.image) {
            imgEl.src = blog.image;
            imgEl.style.display = 'block';
        } else if (imgEl) {
            imgEl.style.display = 'none';
        }

        // Handle Tags
        const tagsContainer = document.getElementById('singleBlogTags');
        if (tagsContainer && blog.tags && blog.tags.length > 0) {
            const tagsHtml = blog.tags.map(tag => `<a href="news.html?tag=${tag}">${tag}</a>`).join('');
            tagsContainer.innerHTML = tagsHtml;
        } else if (tagsContainer) {
            tagsContainer.innerHTML = '<p>No tags</p>';
        }

        document.getElementById('blogContent').innerHTML = blog.content;

    } catch (err) {
        console.error(err);
        document.getElementById('blogContent').innerHTML = '<p>Error loading blog details.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadBlogDetails);
