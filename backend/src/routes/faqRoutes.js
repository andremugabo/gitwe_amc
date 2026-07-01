const express = require('express');
const router = express.Router();
const { getFaqs, createFaq, deleteFaq } = require('../controllers/faqController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /faqs:
 *   get:
 *     summary: Retrieve all FAQ records
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of FAQs
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, getFaqs);

/**
 * @swagger
 * /faqs:
 *   post:
 *     summary: Create a new FAQ (Admin only)
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, answer]
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: FAQ created
 *       403:
 *         description: Forbidden — Admin privilege required
 */
router.post('/', protect, createFaq);

/**
 * @swagger
 * /faqs/{id}:
 *   delete:
 *     summary: Delete a FAQ record (Admin only)
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', protect, deleteFaq);

module.exports = router;
