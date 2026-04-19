const express = require('express');
const router = express.Router();
const { getNgoDashboardStats } = require('../controllers/ngosController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('ngo'), getNgoDashboardStats);

module.exports = router;
