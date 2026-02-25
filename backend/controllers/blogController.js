const Blog = require("../models/Blog");

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private (Admin only)
exports.createBlog = async (req, res) => {
    try {
        const { title, content, author, tags } = req.body;
        let image = req.body.image; // in case URL is sent

        if (req.file) {
            image = req.file.path;
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
            updateData.image = req.file.path;
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
