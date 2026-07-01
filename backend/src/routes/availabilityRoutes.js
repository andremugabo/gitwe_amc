const express = require('express');
const router = express.Router();
const { getAvailability, setAvailability } = require('../controllers/availabilityController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /availability:
 *   get:
 *     summary: Retrieve pastor availability calendar details
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of availability calendar slots
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, getAvailability);

/**
 * @swagger
 * /availability:
 *   post:
 *     summary: Log/schedule availability status (Pastors only)
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, status]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, BUSY]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Availability slot logged
 *       403:
 *         description: Forbidden
 */
router.post('/', protect, setAvailability);

module.exports = router;
