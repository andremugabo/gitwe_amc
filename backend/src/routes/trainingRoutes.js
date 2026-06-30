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
  getNotifications
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getCourses)
  .post(protect, authorize('UNION_ADMIN'), createCourse);

router.get('/recommend/list', protect, getRecommendations);
router.post('/recommend', protect, authorize('PASTOR'), recommendElder);
router.post('/register', protect, authorize('UNION_ADMIN', 'FIELD_SECRETARY'), registerElder);
router.post('/certificate', protect, authorize('UNION_ADMIN'), issueCertificate);
router.get('/notifications', protect, getNotifications);

router.route('/:id')
  .get(protect, getCourseById);

router.post('/:id/material', protect, authorize('UNION_ADMIN'), addCourseMaterial);
router.post('/:id/session', protect, authorize('UNION_ADMIN', 'FIELD_SECRETARY'), createSession);
router.post('/session/:sessionId/attendance', protect, authorize('UNION_ADMIN', 'FIELD_SECRETARY'), markAttendance);

module.exports = router;
