const express = require("express");
const { adminLogin, registerAdmin } = require("../controllers/authController");
const router = express.Router();

router.post("/admin/login", adminLogin);
router.post("/admin/register", registerAdmin);

module.exports = router;
