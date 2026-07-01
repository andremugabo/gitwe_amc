const express = require('express');
const router = express.Router();
const { 
  getTrainerCourses, 
  getCourseTrainees, 
  markTraineeAttendance, 
  createCourseTest, 
  getTestResults, 
  getTrainerEvaluations 
} = require('../controllers/trainerController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /trainer/courses:
 *   get:
 *     summary: Retrieve courses assigned to the logged-in trainer
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned courses
 *       403:
 *         description: Forbidden — Trainer role required
 */
router.get('/courses', protect, getTrainerCourses);

/**
 * @swagger
 * /trainer/courses/{courseId}/trainees:
 *   get:
 *     summary: Retrieve list of elders enrolled in an assigned course
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of course trainees
 *       403:
 *         description: Forbidden
 */
router.get('/courses/:courseId/trainees', protect, getCourseTrainees);

/**
 * @swagger
 * /trainer/attendance:
 *   post:
 *     summary: Log/save trainee attendance records for a course session
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, sessionId, attendanceRecords]
 *             properties:
 *               courseId:
 *                 type: string
 *               sessionId:
 *                 type: string
 *               attendanceRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [elderId, status]
 *                   properties:
 *                     elderId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PRESENT, ABSENT]
 *     responses:
 *       201:
 *         description: Attendance records saved successfully
 *       403:
 *         description: Forbidden
 */
router.post('/attendance', protect, markTraineeAttendance);

/**
 * @swagger
 * /trainer/tests:
 *   post:
 *     summary: Create a test for an assigned course
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, questions, courseId]
 *             properties:
 *               title:
 *                 type: string
 *               questions:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Test created
 *       403:
 *         description: Forbidden
 */
router.post('/tests', protect, createCourseTest);

/**
 * @swagger
 * /trainer/results:
 *   get:
 *     summary: Retrieve test submissions and scores for trainer's courses
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test results
 *       403:
 *         description: Forbidden
 */
router.get('/results', protect, getTestResults);

/**
 * @swagger
 * /trainer/evaluations:
 *   get:
 *     summary: Retrieve evaluation feedbacks for courses taught by this trainer
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of course evaluation logs
 *       403:
 *         description: Forbidden
 */
router.get('/evaluations', protect, getTrainerEvaluations);

module.exports = router;
