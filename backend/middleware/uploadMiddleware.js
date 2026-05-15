const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

let upload;

const hasCloudinaryConfig =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
    try {
        const { CloudinaryStorage } = require("multer-storage-cloudinary");
        const cloudinary = require("cloudinary").v2;

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const storage = new CloudinaryStorage({
            cloudinary,
            params: {
                folder: "kashmir-yatra",
                allowed_formats: ["jpg", "png", "jpeg", "webp"],
                public_id: (req, file) => Date.now() + "-" + Math.round(Math.random() * 1e9),
            },
        });
        upload = multer({ storage });
    } catch (err) {
        upload = null;
    }
}

if (!upload) {
    const storage = multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            cb(null, filename);
        },
    });

    upload = multer({ storage });
}

module.exports = upload;
