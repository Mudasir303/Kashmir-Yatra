const API_BASE = CONFIG.API_BASE_URL;

async function loadBlogs() {
    try {
        const response = await fetch(`${API_BASE}/blogs`);
        if (!response.ok) throw new Error('Failed to fetch blogs');

        const blogs = await response.json();
        const container = document.getElementById('blogListContainer');
        container.innerHTML = ''; // Clear loading text

        if (blogs.length === 0) {
            container.innerHTML = '<p>No blogs found.</p>';
            return;
        }

        blogs.forEach(blog => {
            const date = new Date(blog.createdAt).toLocaleDateString();
            const BASE_URL = CONFIG.API_BASE_URL.replace('/api', '');
            const imageSrc = blog.image
                ? (blog.image.startsWith('http') ? blog.image : `${BASE_URL}/${blog.image}`)
                : 'assets/img/news/post-1.jpg';

            // Create snippets from content (strip HTML correctly with spacing)
            const tmpDiv = document.createElement("div");
            tmpDiv.innerHTML = blog.content.replace(/<\/p>|<\/h\d>|<br\s*\/?>/gi, '$& ');
            const plainText = tmpDiv.textContent || tmpDiv.innerText || "";
            const snippet = plainText.trim().substring(0, 150) + '...';

            const blogHTML = `
            <div class="col-xl-4 col-lg-6 col-md-6 mb-4">
                <div class="single-blog-post">
                    <div class="post-content pb-0">
                        <div class="post-meta">
                            <span><i class="fal fa-user"></i> ${blog.author}</span>
                            <span><i class="fal fa-calendar-alt"></i> ${date}</span>
                        </div>
                        <h2>
                            <a href="news-details.html?id=${blog._id}">
                                ${blog.title}
                            </a>
                        </h2>
                    </div>
                    <div class="post-featured-thumb">
                        <img src="${imageSrc}" alt="${blog.title}">
                    </div>
                    <div class="post-content pt-3">
                        <p>
                            ${snippet}
                        </p>
                        <a href="news-details.html?id=${blog._id}" class="theme-btn mt-auto">
                            <span>Read More</span> <i class="far fa-long-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>`;

            container.insertAdjacentHTML('beforeend', blogHTML);
        });

    } catch (error) {
        console.error('Error loading blogs:', error);
        document.getElementById('blogListContainer').innerHTML = '<p>Error loading blogs.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadBlogs);
