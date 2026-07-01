const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Retrieve system configurations
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings mapping object
 *   put:
 *     summary: Save configurations (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);

module.exports = router;
