const path = require("path");
const Tour = require("../models/Tour");

const uploadDirName = "uploads";

const normalizeImagePaths = (files) => {
  if (!files || files.length === 0) return [];
  return files.map(file => {
    if (file.path && file.path.includes(`${uploadDirName}`) && file.filename) {
      return `${uploadDirName}/${file.filename}`;
    }
    return file.path;
  });
};

/**
 * ADMIN: Create tour
 */
exports.createTour = async (req, res) => {
  try {
    console.log("Create Tour Request Body:", req.body);
    console.log("Create Tour Request Files:", req.files);

    const tourData = {
      ...req.body,
      images: normalizeImagePaths(req.files)
    };

    if (tourData.price === '') tourData.price = null;
    if (tourData.discountPrice === '') tourData.discountPrice = null;

    tourData.isFeatured = tourData.isFeatured === 'true' || tourData.isFeatured === true;
    tourData.isSeasonalDeal = tourData.isSeasonalDeal === 'true' || tourData.isSeasonalDeal === true;

    if (tourData.price !== null && typeof tourData.price === 'string') {
      tourData.price = Number(tourData.price) || null;
    }
    if (tourData.discountPrice !== null && typeof tourData.discountPrice === 'string') {
      tourData.discountPrice = Number(tourData.discountPrice) || null;
    }

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
    // Sanitize updateData: convert empty strings to null or remove them for optional numeric fields
    if (updateData.price === '') updateData.price = null;
    if (updateData.discountPrice === '') updateData.discountPrice = null;

    if (updateData.itinerary && typeof updateData.itinerary === 'string') {
      try {
        updateData.itinerary = JSON.parse(updateData.itinerary);
      } catch (e) {
        console.error("Error parsing itinerary:", e);
      }
    }

    let finalImages = undefined;

    if (req.body.existingImages !== undefined) {
      let keptImages = [];
      if (typeof req.body.existingImages === 'string') {
        try {
          keptImages = JSON.parse(req.body.existingImages);
        } catch (e) {
          if (req.body.existingImages.trim() !== "") {
            keptImages = [req.body.existingImages];
          }
        }
      } else if (Array.isArray(req.body.existingImages)) {
        keptImages = req.body.existingImages;
      }
      finalImages = keptImages;
    }

    // If new files are uploaded, append them or override if existingImages not provided
    if (req.files && req.files.length > 0) {
      const newImagePaths = normalizeImagePaths(req.files);
      if (finalImages === undefined) {
        finalImages = newImagePaths;
      } else {
        finalImages = [...finalImages, ...newImagePaths];
      }
    }

    if (finalImages !== undefined) {
      updateData.images = finalImages;
    }
    delete updateData.existingImages;

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
