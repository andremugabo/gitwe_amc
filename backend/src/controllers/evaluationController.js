const prisma = require('../utils/prisma');

// @desc    Submit training evaluation feedback
// @route   POST /api/evaluations
// @access  Private (ELDER)
const createEvaluation = async (req, res) => {
  const { courseId, contentRating, teacherRating, materialsRating, comments } = req.body;

  if (req.user.role !== 'ELDER') {
    return res.status(403).json({ message: 'Only certified elders can submit evaluations.' });
  }

  try {
    const evaluation = await prisma.evaluation.create({
      data: {
        elderId: req.user.id,
        courseId,
        contentRating: parseInt(contentRating),
        teacherRating: parseInt(teacherRating),
        materialsRating: parseInt(materialsRating),
        comments
      }
    });

    res.status(201).json(evaluation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get training evaluations (scoped)
// @route   GET /api/evaluations
// @access  Private (UNION_ADMIN, FIELD_SECRETARY)
const getEvaluations = async (req, res) => {
  if (req.user.role !== 'UNION_ADMIN' && req.user.role !== 'FIELD_SECRETARY') {
    return res.status(403).json({ message: 'Not authorized to read evaluation reports.' });
  }

  let whereClause = {};

  if (req.user.role === 'FIELD_SECRETARY') {
    whereClause.elder = {
      localChurch: {
        district: {
          fieldId: req.user.fieldId
        }
      }
    };
  }

  try {
    const evaluations = await prisma.evaluation.findMany({
      where: whereClause,
      include: {
        elder: {
          select: { name: true, email: true }
        },
        course: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvaluation,
  getEvaluations
};
