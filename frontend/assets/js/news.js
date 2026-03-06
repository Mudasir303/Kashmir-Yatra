const API_BASE = CONFIG.API_BASE_URL;

async function loadBlogs() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const tag = urlParams.get('tag');

        // Update Title/Breadcrumb/SEO if tag is present
        if (tag) {
            const heading = document.querySelector('.page-heading h1');
            const breadcrumb = document.querySelector('.breadcrumb-items li:last-child');

            // UI Improvement: Truncate excessively long tag names for layout integrity
            const displayTag = tag.length > 30 ? tag.substring(0, 27) + '...' : tag;

            if (heading) heading.textContent = `Blogs: ${displayTag}`;
            if (breadcrumb) breadcrumb.textContent = `Tag: ${displayTag}`;

            // SEO Improvements: Dynamically update page title and meta description
            // Use truncated title for browser tab clarity
            document.title = `${displayTag} Blogs - Kashmir Yatra`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', `Explore our travel blogs and expert guides related to ${tag}. Stay updated with the latest from Kashmir Yatra.`);
            }
        }

        let fetchUrl = `${API_BASE}/blogs`;
        if (tag) {
            fetchUrl += `?tag=${encodeURIComponent(tag)}`;
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Failed to fetch blogs');

        const blogs = await response.json();
        const container = document.getElementById('blogListContainer');
        container.innerHTML = ''; // Clear loading text

        if (blogs.length === 0) {
            container.innerHTML = `<div class="col-12 text-center p-5">
                <i class="far fa-search-minus fa-3x mb-3 text-muted"></i>
                <p class="h4">No blogs found ${tag ? `for tag "${tag}"` : ''}.</p>
                <a href="news.html" class="theme-btn mt-3"><span>View All Blogs</span></a>
            </div>`;
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
            tmpDiv.innerHTML = (blog.content || "").replace(/<\/p>|<\/h\d>|<br\s*\/?>/gi, '$& ');
            const plainText = tmpDiv.textContent || tmpDiv.innerText || "";
            const snippet = plainText.trim().substring(0, 150) + '...';

            const titleWords = blog.title ? blog.title.trim().split(/\s+/) : [];
            const displayTitle = titleWords.length > 9 ? titleWords.slice(0, 9).join(' ') + '...' : blog.title;

            const blogHTML = `
            <div class="col-xl-4 col-lg-6 col-md-6 mb-4">
                <div class="single-blog-post h-100 d-flex flex-column">
                    <div class="post-content pb-0">
                        <div class="post-meta">
                            <span><i class="fal fa-user"></i> ${blog.author || 'Admin'}</span>
                            <span><i class="fal fa-calendar-alt"></i> ${date}</span>
                        </div>
                        <h2 class="h5">
                            <a href="news-details.html?id=${blog._id}">
                                ${displayTitle}
                            </a>
                        </h2>
                    </div>
                    <div class="post-featured-thumb" style="height: 200px; overflow: hidden;">
                        <img src="${imageSrc}" alt="${blog.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="post-content pt-3 d-flex flex-column flex-grow-1">
                        <p class="mb-4">
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
        document.getElementById('blogListContainer').innerHTML = '<p class="text-center p-5">Error loading blogs. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadBlogs);
