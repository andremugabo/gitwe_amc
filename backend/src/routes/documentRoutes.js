const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  deleteDocument
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('file'), uploadDocument);

router.route('/:id')
  .delete(protect, authorize('SUPER_ADMIN'), deleteDocument);

module.exports = router;
