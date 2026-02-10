const express = require("express");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createTour,
  getAllToursAdmin,
  getAllToursPublic,
  getTourById,
  updateTour,
  deleteTour
} = require("../controllers/tourController");

const router = express.Router();

/* ========= ADMIN ROUTES ========= */
// Upload multiple images (max 5)
// Basic CRUD
router.post("/admin", auth, upload.array("images", 5), createTour);
router.get("/admin", auth, getAllToursAdmin);
router.put("/admin/:id", auth, upload.array("images", 5), updateTour);
router.delete("/admin/:id", auth, deleteTour);

/* ========= PUBLIC ROUTES ========= */
router.get("/", getAllToursPublic);
router.get("/:id", getTourById);

module.exports = router;
