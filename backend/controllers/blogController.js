const Blog = require("../models/Blog");
const path = require("path");

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private (Admin only)
exports.createBlog = async (req, res) => {
    try {
        const { title, content, author, tags } = req.body;
        let image = req.body.image; // in case URL is sent

        // Prevent rapid duplicate submissions: if a blog with same title
        // was created within the last 30 seconds, reject as duplicate.
        if (title) {
            const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
            const existing = await Blog.findOne({
                title: title.trim(),
                createdAt: { $gt: thirtySecondsAgo }
            });
            if (existing) {
                return res.status(409).json({ message: 'Duplicate submission detected' });
            }
        }

        if (req.file) {
            // multer-storage-cloudinary sets a remote URL (starts with http)
            if (req.file.path && String(req.file.path).startsWith("http")) {
                image = req.file.path;
            } else if (req.file.filename) {
                // multer diskStorage: store a relative path under uploads/
                image = path.join('uploads', req.file.filename).replace(/\\/g, '/');
            } else if (req.file.path) {
                // fallback: extract filename from absolute path
                const filename = path.basename(req.file.path);
                image = path.join('uploads', filename).replace(/\\/g, '/');
            }
        }

        // If tags are sent as a string (from admin form), split them into an array
        let processedTags = tags;
        if (typeof tags === 'string') {
            processedTags = tags.split(',').map(t => t.trim()).filter(t => t !== '');
        }

        const blog = await Blog.create({
            title,
            content,
            author,
            tags: processedTags,
            image
        });
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getAllBlogs = async (req, res) => {
    try {
        const { tag, limit } = req.query;
        let query = {};

        if (tag) {
            // Trim the tag to handle potential whitespace issues from URL encoding
            const cleanTag = tag.trim();
            query.tags = { $in: [cleanTag] };
        }

        const blogLimit = limit ? parseInt(limit) : 0;
        const blogs = await Blog.find(query).sort({ createdAt: -1 }).limit(blogLimit);
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin only)
exports.updateBlog = async (req, res) => {
    try {
        const { title, content, author, tags } = req.body;
        // If tags are sent as a string, split them into an array
        let processedTags = tags;
        if (typeof tags === 'string') {
            processedTags = tags.split(',').map(t => t.trim()).filter(t => t !== '');
        }

        let updateData = { title, content, author, tags: processedTags };

        if (req.file) {
            if (req.file.path && String(req.file.path).startsWith("http")) {
                updateData.image = req.file.path;
            } else if (req.file.filename) {
                updateData.image = path.join('uploads', req.file.filename).replace(/\\/g, '/');
            } else if (req.file.path) {
                const filename = path.basename(req.file.path);
                updateData.image = path.join('uploads', filename).replace(/\\/g, '/');
            }
        } else if (req.body.image) {
            updateData.image = req.body.image;
        }

        const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin only)
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
