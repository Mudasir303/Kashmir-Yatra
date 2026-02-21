const Tour = require("../models/Tour");

/**
 * ADMIN: Create tour
 */
exports.createTour = async (req, res) => {
  try {
    console.log("Create Tour Request Body:", req.body);
    console.log("Create Tour Request Files:", req.files);

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      const fullBaseUrl = `${req.protocol}://${req.get('host')}`;
      imagePaths = req.files.map(file => `${fullBaseUrl}/uploads/${file.filename}`);
    }

    // Parse other fields if they come as strings (Multipart/Form-Data sends everything as string)
    const tourData = {
      ...req.body,
      images: imagePaths
    };

    if (req.body.itinerary && typeof req.body.itinerary === 'string') {
      try {
        tourData.itinerary = JSON.parse(req.body.itinerary);
      } catch (e) {
        console.error("Error parsing itinerary:", e);
      }
    }

    const tour = await Tour.create(tourData);
    res.status(201).json(tour);
  } catch (err) {
    res.status(500).json({
      message: err.message,
      receivedBody: req.body,
      receivedFiles: req.files ? req.files.length : 'undefined'
    });
  }
};

/**
 * ADMIN: Get all tours
 */
exports.getAllToursAdmin = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUBLIC: Get all tours
 * Query Params: ?category=Domestic or ?category=International
 */
exports.getAllToursPublic = async (req, res) => {
  try {
    const { category, isSeasonalDeal } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (isSeasonalDeal === 'true') {
      filter.isSeasonalDeal = true;
    }

    const tours = await Tour.find(filter).sort({ createdAt: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUBLIC: Get single tour by ID
 */
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ADMIN: Update tour
 */
exports.updateTour = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.itinerary && typeof updateData.itinerary === 'string') {
      try {
        updateData.itinerary = JSON.parse(updateData.itinerary);
      } catch (e) {
        console.error("Error parsing itinerary:", e);
      }
    }

    // If new files are uploaded, update images array
    if (req.files && req.files.length > 0) {
      const fullBaseUrl = `${req.protocol}://${req.get('host')}`;
      const imagePaths = req.files.map(file => `${fullBaseUrl}/uploads/${file.filename}`);
      updateData.images = imagePaths;
    }

    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!tour)
      return res.status(404).json({ message: "Tour not found" });

    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ADMIN: Delete tour
 */
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour)
      return res.status(404).json({ message: "Tour not found" });

    res.json({ message: "Tour deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
