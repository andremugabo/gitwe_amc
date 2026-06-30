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

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Get all church members (supports search and status filter)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by first name, last name, or email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, ARCHIVED]
 *         description: Filter by member status
 *     responses:
 *       200:
 *         description: List of members
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Create a new church member record
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jean
 *               lastName:
 *                 type: string
 *                 example: Habimana
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Insufficient permissions
 */
router.route('/')
  .get(protect, getMembers)
  .post(protect, authorize('SUPER_ADMIN', 'PASTOR', 'CLERK'), createMember);

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Get a single member by ID (includes documents, attendance, tithes)
 *     tags: [Members]
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
 *         description: Member details
 *       404:
 *         description: Member not found
 *   put:
 *     summary: Update a member record
 *     tags: [Members]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member updated
 *       400:
 *         description: Validation error
 *   delete:
 *     summary: Archive (soft-delete) a member record
 *     tags: [Members]
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
 *         description: Member archived successfully
 *       403:
 *         description: Insufficient permissions (SUPER_ADMIN only)
 */
router.route('/:id')
  .get(protect, getMemberById)
  .put(protect, authorize('SUPER_ADMIN', 'PASTOR', 'CLERK'), updateMember)
  .delete(protect, authorize('SUPER_ADMIN'), deleteMember);

module.exports = router;
