const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  deleteDocument
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents (supports filters by memberId and category)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *         description: Filter documents by member ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by document category
 *     responses:
 *       200:
 *         description: List of documents
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               memberId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: No file uploaded or validation error
 */
router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('file'), uploadDocument);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document (SUPER_ADMIN only)
 *     tags: [Documents]
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
 *         description: Document deleted successfully
 *       403:
 *         description: Insufficient permissions
 */
router.route('/:id')
  .delete(protect, authorize('SUPER_ADMIN'), deleteDocument);

module.exports = router;
