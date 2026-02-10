const API_BASE_SIDEBAR = CONFIG.API_BASE_URL;

async function loadSidebar() {
    try {
        const response = await fetch(`${API_BASE_SIDEBAR}/blogs`);
        if (!response.ok) throw new Error('Failed to fetch blogs for sidebar');

        const blogs = await response.json();

        // 1. Recent Posts (Top 3)
        const recentContainer = document.getElementById('recentPostsContainer');
        if (recentContainer) {
            recentContainer.innerHTML = '';
            const recentBlogs = blogs.slice(0, 3);

            recentBlogs.forEach(blog => {
                const date = new Date(blog.createdAt).toLocaleDateString();
                const imageSrc = blog.image || 'assets/img/placeholder.jpg';

                const html = `
                <div class="single-post-item">
                    <div class="thumb bg-cover" style="background-image: url('${imageSrc}');"></div>
                    <div class="post-content">
                        <h5><a href="news-details.html?id=${blog._id}">${blog.title}</a></h5>
                        <div class="post-date">
                            <i class="far fa-calendar-alt"></i> ${date}
                        </div>
                    </div>
                </div>`;
                recentContainer.insertAdjacentHTML('beforeend', html);
            });
        }

        // 2. Tags
        const tagsContainer = document.getElementById('tagsContainer');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            const allTags = new Set();
            blogs.forEach(blog => {
                if (blog.tags && Array.isArray(blog.tags)) {
                    blog.tags.forEach(tag => allTags.add(tag.trim()));
                } else if (typeof blog.tags === 'string') {
                    // Handle comma separated string if backend returns that (though schema says array)
                    blog.tags.split(',').forEach(tag => allTags.add(tag.trim()));
                }
            });

            if (allTags.size === 0) {
                tagsContainer.innerHTML = '<span>No tags</span>';
            } else {
                allTags.forEach(tag => {
                    if (tag) {
                        const html = `<a href="news.html?tag=${encodeURIComponent(tag)}">${tag}</a>`;
                        tagsContainer.insertAdjacentHTML('beforeend', html);
                    }
                });
            }
        }

    } catch (error) {
        console.error('Sidebar Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadSidebar);
