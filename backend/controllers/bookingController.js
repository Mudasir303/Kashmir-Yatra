const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const emailService = require('../utils/emailService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
    try {
        const { tourId, name, email, phone, departureDate, persons } = req.body;

        // 1. Get Tour details for Title and Price
        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        const totalPrice = tour.price * persons;

        // 2. Save to Database
        const booking = await Booking.create({
            tour: tourId,
            tourTitle: tour.title,
            name,
            email,
            phone,
            departureDate,
            persons,
            totalPrice
        });

        // 3. Send Emails (Admin & User)
        // Admin Email
        const adminEmailOptions = {
            to: process.env.EMAIL_USER,
            subject: `New Booking Request: ${tour.title} from ${name}`,
            html: `
                <h3>New Tour Booking Request</h3>
                <p><strong>Tour:</strong> ${tour.title}</p>
                <p><strong>Traveler:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Departure Date:</strong> ${departureDate}</p>
                <p><strong>Persons:</strong> ${persons}</p>
                <p><strong>Total Price Estimate:</strong> ₹${totalPrice}</p>
                <hr>
                <p><strong>Action Required:</strong> Please contact the customer directly via email or phone to confirm this booking and arrange payment details.</p>
            `,
        };

        // User Confirmation
        const userEmailOptions = {
            to: email,
            subject: `Booking Request Received - ${tour.title} | Kashmir Yatra`,
            html: `
                <h3>Thank you for your booking request, ${name}!</h3>
                <p>We have received your request for <strong>${tour.title}</strong>.</p>
                <p><strong>Details:</strong></p>
                <ul>
                    <li>Date: ${departureDate}</li>
                    <li>Persons: ${persons}</li>
                    <li>Estimate: ₹${totalPrice}</li>
                </ul>
                <p>Our team will contact you shortly on ${phone} to confirm the details and payment.</p>
                <br>
                <p>Best Regards,</p>
                <p>Team Kashmir Yatra</p>
            `,
        };

        // Send emails in background
        emailService.sendEmail(adminEmailOptions).catch(err => console.error("Admin Email Error:", err));
        emailService.sendEmail(userEmailOptions).catch(err => console.error("User Email Error:", err));

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id
// @access  Private/Admin
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Email Notification to Traveler on status change
        if (status === 'Confirmed' || status === 'Cancelled') {
            const statusEmailOptions = {
                to: booking.email,
                subject: `Booking ${status} - ${booking.tourTitle} | Kashmir Yatra`,
                html: `
                    <h3>Your Booking is now ${status}!</h3>
                    <p>Dear ${booking.name},</p>
                    <p>Your booking for <strong>${booking.tourTitle}</strong> has been <strong>${status}</strong>.</p>
                    ${status === 'Confirmed' ? `
                        <p>We are excited to have you on board! Our team will reach out soon with further itinerary details and preparation tips.</p>
                    ` : `
                        <p>We regret that your booking could not be confirmed at this time. If you have any questions, please contact our support team.</p>
                    `}
                    <br>
                    <p>Best Regards,</p>
                    <p>Team Kashmir Yatra</p>
                `,
            };
            emailService.sendEmail(statusEmailOptions).catch(err => console.error("Status Update Email Error:", err));
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
