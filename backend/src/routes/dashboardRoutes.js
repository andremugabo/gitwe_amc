const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// Allow all authorized roles to query their specific dashboard stats
router.get('/stats', protect, authorize('UNION_ADMIN', 'FIELD_SECRETARY', 'PASTOR', 'ELDER'), getDashboardStats);

module.exports = router;
