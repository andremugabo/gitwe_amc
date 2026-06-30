const prisma = require('../utils/prisma');

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { title, description, category, memberId } = req.body;

  try {
    const document = await prisma.document.create({
      data: {
        title: title || req.file.originalname,
        description,
        category,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype.includes('pdf') ? 'PDF' : 'IMAGE',
        memberId: memberId || null
      }
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const { memberId, category } = req.query;
    
    let where = {};
    if (memberId) where.memberId = memberId;
    if (category) where.category = category;

    const documents = await prisma.document.findMany({
      where,
      include: {
        member: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Admin)
const deleteDocument = async (req, res) => {
  try {
    // Note: In real app, we should also delete the file from the filesystem
    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument
};
