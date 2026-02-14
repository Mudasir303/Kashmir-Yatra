const Subscriber = require('../models/Subscriber');

// @desc    Add new subscriber
// @route   POST /api/subscribers
// @access  Public
exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Check if already subscribed
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ message: "Email is already subscribed" });
        }

        const newSubscriber = await Subscriber.create({ email });
        res.status(201).json({ message: "Subscribed successfully!", subscriber: newSubscriber });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all subscribers
// @route   GET /api/subscribers
// @access  Private/Admin
exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ createdAt: -1 });
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a subscriber
// @route   DELETE /api/subscribers/:id
// @access  Private/Admin
exports.deleteSubscriber = async (req, res) => {
    try {
        const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
        if (!subscriber) {
            return res.status(404).json({ message: "Subscriber not found" });
        }
        res.json({ message: "Subscriber deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
