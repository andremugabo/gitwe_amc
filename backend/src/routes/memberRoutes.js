const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getMembers)
  .post(protect, authorize('SUPER_ADMIN', 'PASTOR', 'CLERK'), createMember);

router.route('/:id')
  .get(protect, getMemberById)
  .put(protect, authorize('SUPER_ADMIN', 'PASTOR', 'CLERK'), updateMember)
  .delete(protect, authorize('SUPER_ADMIN'), deleteMember);

module.exports = router;
