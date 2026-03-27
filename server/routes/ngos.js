const express = require('express');
const router = express.Router();
const { getNgos, getNgo } = require('../controllers/ngosController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNgos);
router.get('/:id', protect, getNgo);

module.exports = router;
