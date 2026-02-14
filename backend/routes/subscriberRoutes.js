const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');
const auth = require('../middleware/authMiddleware');

router.post('/', subscriberController.subscribe);
router.get('/', auth, subscriberController.getAllSubscribers);
router.delete('/:id', auth, subscriberController.deleteSubscriber);

module.exports = router;
