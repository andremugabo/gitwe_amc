const express = require('express');
const router = express.Router();
const {
  getCourses,
  createCourse,
  getCourseById,
  addCourseMaterial,
  registerElder,
  recommendElder,
  getRecommendations,
  createSession,
  markAttendance,
  issueCertificate,
  getNotifications,
  getCourseMaterials,
  getTraineeTests,
  submitTest
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /training:
 *   get:
 *     summary: Get all training courses
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses with enrollment/session/material counts
 *   post:
 *     summary: Schedule a new training course (UNION_ADMIN only)
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Sabbath School Leadership
 *               description:
 *                 type: string
 *               topics:
 *                 type: string
 *                 example: Hermeneutics, Church Policy
 *               location:
 *                 type: string
 *                 example: Gitwe Campus
 *               duration:
 *                 type: string
 *                 example: 3 Days
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Course created and notifications sent
 *       403:
 *         description: Insufficient permissions
 */
router.route('/')
  .get(protect, getCourses)
  .post(protect, authorize('UNION_ADMIN'), createCourse);

/**
 * @swagger
 * /training/recommend/list:
 *   get:
 *     summary: Get elder recommendations (scoped by role)
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommendations with pastor and elder details
 */
router.get('/recommend/list', protect, getRecommendations);

/**
 * @swagger
 * /training/materials:
 *   get:
 *     summary: Get course materials (scoped for elder courses if role is ELDER)
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of course materials
 */
router.get('/materials', protect, getCourseMaterials);

/**
 * @swagger
 * /training/recommend:
 *   post:
 *     summary: Recommend an elder for a training course (PASTOR only)
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseName, elderId]
 *             properties:
 *               courseName:
 *                 type: string
 *               elderId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recommendation submitted
 *       403:
 *         description: Elder not under this pastor's care
 */
router.post('/recommend', protect, authorize('PASTOR'), recommendElder);

/**
 * @swagger
 * /training/register:
 *   post:
 *     summary: Register/enroll an elder in a course
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, elderId]
 *             properties:
 *               courseId:
 *                 type: string
 *               elderId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Elder enrolled successfully
 *       400:
 *         description: Elder already enrolled or invalid course
 *       403:
 *         description: Not authorized to register elders outside your scope
 */
router.post('/register', protect, authorize('UNION_ADMIN', 'FIELD_SECRETARY'), registerElder);

/**
 * @swagger
 * /training/certificate:
 *   post:
 *     summary: Issue a digital certificate to an elder (UNION_ADMIN only)
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, elderId]
 *             properties:
 *               courseId:
 *                 type: string
 *               elderId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [COMPLETED, FAILED]
 *                 default: COMPLETED
 *     responses:
 *       200:
 *         description: Certificate issued with QR code
 *       400:
 *         description: Invalid enrollment
 */
router.post('/certificate', protect, authorize('UNION_ADMIN'), issueCertificate);

/**
 * @swagger
 * /training/notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications ordered by most recent
 */
router.get('/notifications', protect, getNotifications);

/**
 * @swagger
 * /training/{id}:
 *   get:
 *     summary: Get course details by ID (role-scoped enrollments)
 *     tags: [Training]
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
 *         description: Full course details with materials, sessions, and enrollments
 *       404:
 *         description: Course not found
 */
router.route('/:id')
  .get(protect, getCourseById);

/**
 * @swagger
 * /training/{id}/material:
 *   post:
 *     summary: Add course material (UNION_ADMIN only)
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, fileUrl]
 *             properties:
 *               title:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileType:
 *                 type: string
 *                 default: PDF
 *     responses:
 *       201:
 *         description: Material added
 */
router.post('/:id/material', protect, authorize('UNION_ADMIN'), addCourseMaterial);

/**
 * @swagger
 * /training/{id}/session:
 *   post:
 *     summary: Create a lecture session for a course
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               topic:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session created
 */
router.post('/:id/session', protect, authorize('UNION_ADMIN', 'FIELD_SECRETARY'), createSession);

/**
 * @swagger
 * /training/session/{sessionId}/attendance:
 *   post:
 *     summary: Record attendance for a session
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [attendance]
 *             properties:
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     elderId:
 *                       type: string
 *                     isPresent:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Attendance updated successfully
 *       403:
 *         description: Cannot mark attendance for elders outside your scope
 */
router.post('/session/:sessionId/attendance', protect, authorize('UNION_ADMIN', 'FIELD_SECRETARY'), markAttendance);

// Trainee tests routes
router.get('/tests/list', protect, getTraineeTests);
router.post('/tests/:testId/submit', protect, submitTest);

module.exports = router;
