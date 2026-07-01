const prisma = require('../utils/prisma');

// @desc    Get pastor availability calendar records
// @route   GET /api/availability
// @access  Private
const getAvailability = async (req, res) => {
  let whereClause = {};

  if (req.user.role === 'PASTOR') {
    whereClause.pastorId = req.user.id;
  } else if (req.user.role === 'FIELD_SECRETARY') {
    whereClause.pastor = {
      OR: [
        { district: { fieldId: req.user.fieldId } },
        { localChurch: { district: { fieldId: req.user.fieldId } } }
      ]
    };
  }

  try {
    const records = await prisma.availability.findMany({
      where: whereClause,
      include: {
        pastor: {
          select: { name: true, email: true }
        }
      },
      orderBy: { date: 'asc' }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log or schedule pastor availability
// @route   POST /api/availability
// @access  Private (PASTOR)
const setAvailability = async (req, res) => {
  const { date, status, notes } = req.body;

  if (req.user.role !== 'PASTOR') {
    return res.status(403).json({ message: 'Only pastors can log availability check parameters.' });
  }

  try {
    const record = await prisma.availability.create({
      data: {
        pastorId: req.user.id,
        date: new Date(date),
        status: status || 'AVAILABLE',
        notes
      }
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAvailability,
  setAvailability
};
