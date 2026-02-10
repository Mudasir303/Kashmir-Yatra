const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const upload = require("../middleware/uploadMiddleware");

const {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
} = require("../controllers/blogController");

/* ========= PUBLIC ROUTES ========= */
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

/* ========= ADMIN ROUTES ========= */
router.post("/", auth, upload.single("image"), createBlog);
router.put("/:id", auth, upload.single("image"), updateBlog);
router.delete("/:id", auth, deleteBlog);

module.exports = router;
