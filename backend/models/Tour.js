const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    category: {
      type: String,
      enum: ['Domestic', 'International'],
      required: true
    },
    subCategory: {
      type: String,
      required: false
    },
    itinerary: [{
      day: Number,
      title: String,
      activity: String
    }],
    images: {
      type: [String]
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tour", tourSchema);
