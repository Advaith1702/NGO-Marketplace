const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getMyListings,
  updateListing,
  deleteListing,
} = require('../controllers/listingsController');
const { protect } = require('../middleware/auth');
const { verifiedNgo } = require('../middleware/verifiedNgo');

router.get('/', protect, getListings);
router.get('/mine', protect, verifiedNgo, getMyListings);
router.post('/', protect, verifiedNgo, createListing);
router.put('/:id', protect, verifiedNgo, updateListing);
router.delete('/:id', protect, verifiedNgo, deleteListing);

module.exports = router;
