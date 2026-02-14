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
            const imageSrc = blog.image || 'assets/img/news/post-1.jpg';

            // Create snippets from content (strip HTML)
            const tmpDiv = document.createElement("div");
            tmpDiv.innerHTML = blog.content;
            const plainText = tmpDiv.textContent || tmpDiv.innerText || "";
            const snippet = plainText.substring(0, 150) + '...';

            const blogHTML = `
            <div class="col-xl-4 col-lg-6 col-md-6 mb-4">
                <div class="single-blog-post h-100 d-flex flex-column">
                    <div class="post-featured-thumb bg-cover" style="background-image: url('${imageSrc}'); height: 250px; flex-shrink: 0;"></div>
                    <div class="post-content d-flex flex-column flex-grow-1">
                        <div class="post-meta">
                            <span><i class="fal fa-user"></i> ${blog.author}</span>
                            <span><i class="fal fa-calendar-alt"></i> ${date}</span>
                        </div>
                        <h2>
                            <a href="news-details.html?id=${blog._id}">
                                ${blog.title}
                            </a>
                        </h2>
                        <p class="flex-grow-1">
                            ${snippet}
                        </p>
                        <a href="news-details.html?id=${blog._id}" class="theme-btn mt-auto line-height">
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
