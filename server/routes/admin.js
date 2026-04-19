const express = require('express');
const router = express.Router();
const { getNgos, getAllUsers, verifyNgo, restrictNgo, getStats, getAdminDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/ngos', getNgos);
router.get('/users', getAllUsers);
router.get('/stats', getStats);
router.put('/ngos/:id/verify', verifyNgo);
router.put('/ngos/:id/restrict', restrictNgo);

module.exports = router;
