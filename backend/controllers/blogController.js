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

        const blog = await Blog.create({
            title,
            content,
            author,
            tags,
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
        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        const blogs = await Blog.find().sort({ createdAt: -1 }).limit(limit);
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
        let updateData = { title, content, author, tags };

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
