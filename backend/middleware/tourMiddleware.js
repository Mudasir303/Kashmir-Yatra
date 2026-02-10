module.exports.validateTour = (req, res, next) => {
  const { title, location, price, duration } = req.body;

  if (!title || !location || !price || !duration) {
    return res.status(400).json({
      message: "Title, location, price and duration are required"
    });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({
      message: "Price must be a valid number"
    });
  }

  next();
};
