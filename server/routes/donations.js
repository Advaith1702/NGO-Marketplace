const express = require('express');
const router = express.Router();
const { createDonation, getMyDonations, getReceivedDonations } = require('../controllers/donationsController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('donor'), createDonation);
router.get('/mine', protect, authorize('donor'), getMyDonations);
router.get('/received', protect, authorize('ngo'), getReceivedDonations);

module.exports = router;
