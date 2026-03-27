const express = require('express');
const router = express.Router();
const {
  createRequest,
  getIncomingRequests,
  getMyRequests,
  acceptRequest,
  rejectRequest,
} = require('../controllers/requestsController');
const { protect } = require('../middleware/auth');
const { verifiedNgo } = require('../middleware/verifiedNgo');

router.use(protect, verifiedNgo);

router.post('/', createRequest);
router.get('/incoming', getIncomingRequests);
router.get('/mine', getMyRequests);
router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);

module.exports = router;
