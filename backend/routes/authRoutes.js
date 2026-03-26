const express = require("express");
const { adminLogin, registerAdmin, forgotPassword, resetPassword } = require("../controllers/authController");
const router = express.Router();

router.post("/admin/login", adminLogin);
router.post("/admin/register", registerAdmin);
router.post("/admin/forgot-password", forgotPassword);
router.post("/admin/reset-password", resetPassword);

module.exports = router;
