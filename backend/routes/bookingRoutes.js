const express = require('express');
const router = express.Namespace ? express.Namespace() : express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');

router.post('/', bookingController.createBooking);
router.get('/admin', auth, bookingController.getAllBookings);
router.patch('/:id', auth, bookingController.updateStatus);
router.delete('/:id', auth, bookingController.deleteBooking);

module.exports = router;
