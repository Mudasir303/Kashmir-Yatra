document.addEventListener("DOMContentLoaded", function () {
    const blogContainer = document.getElementById("blog-container");

    if (!blogContainer) return;

    async function fetchLatestBlogs() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/blogs?limit=3`);
            if (!response.ok) throw new Error("Failed to fetch blogs");

            const blogs = await response.json();
            renderBlogs(blogs);
        } catch (error) {
            console.error("Error fetching blogs:", error);
            blogContainer.innerHTML = '<div class="col-12 text-center"><p>Error loading latest blogs.</p></div>';
        }
    }

    function renderBlogs(blogs) {
        if (blogs.length === 0) {
            blogContainer.innerHTML = '<div class="col-12 text-center"><p>No blogs found.</p></div>';
            return;
        }

        const blogHtml = blogs.map((blog, index) => {
            const date = new Date(blog.createdAt);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
            const delay = (index * 0.2 + 0.3).toFixed(1);

            return `
                <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay="${delay}s">
                    <div class="news-box-items-4">
                        <div class="news-img">
                            <img src="${blog.image || 'assets/img/news/news-11.jpg'}" alt="${blog.title}" style="height: 250px; object-fit: cover; width: 100%;">
                            <ul class="post-date">
                                <li>${day}</li>
                                <li>${month}</li>
                            </ul>
                        </div>
                        <div class="news-content">
                            <ul>
                                <li> <b>By</b> ${blog.author || 'Admin'}</li>
                                <li><b>${blog.comments?.length || 0}</b> Comments</li>
                            </ul>
                            <h3><a href="news-details.html?id=${blog._id}">${blog.title}</a></h3>
                            <p>${blog.content.substring(0, 100)}...</p>
                            <a href="news-details.html?id=${blog._id}" class="link-btn">Continue Reading <i class="far fa-long-arrow-right"></i></a>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        blogContainer.innerHTML = blogHtml;

        // Re-initialize WOW animations if present
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }
    }

    fetchLatestBlogs();
});
