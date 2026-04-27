const express = require('express');
const router = express.Router();
const { getNgos, getNgo, updateMyNgoProfile } = require('../controllers/ngosController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getNgos);
router.put('/me', protect, authorize('ngo'), updateMyNgoProfile);
router.get('/:id', protect, getNgo);

module.exports = router;
