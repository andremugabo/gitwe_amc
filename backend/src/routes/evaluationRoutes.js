const express = require('express');
const router = express.Router();
const { createEvaluation, getEvaluations } = require('../controllers/evaluationController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /evaluations:
 *   post:
 *     summary: Submit a training course evaluation (Elders only)
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, contentRating, teacherRating, materialsRating]
 *             properties:
 *               courseId:
 *                 type: string
 *               contentRating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               teacherRating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               materialsRating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Evaluation submitted successfully
 *       403:
 *         description: Forbidden — Elder account required
 */
router.post('/', protect, createEvaluation);

/**
 * @swagger
 * /evaluations:
 *   get:
 *     summary: Retrieve training evaluations feedback lists (Admin and Field Secretary only)
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of evaluation reports
 *       403:
 *         description: Forbidden
 */
router.get('/', protect, getEvaluations);

module.exports = router;
