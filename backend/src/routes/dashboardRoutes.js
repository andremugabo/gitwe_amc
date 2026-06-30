const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get role-scoped dashboard metrics
 *     description: Returns metrics, recent activities, and extra data scoped to the authenticated user's role (UNION_ADMIN sees global, FIELD_SECRETARY sees their field, PASTOR sees their district, ELDER sees their own enrollments).
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics object containing role, metrics, recentActivities, and extraData
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/stats', protect, authorize('UNION_ADMIN', 'FIELD_SECRETARY', 'PASTOR', 'ELDER'), getDashboardStats);

module.exports = router;
