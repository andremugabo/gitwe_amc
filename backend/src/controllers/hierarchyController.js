const prisma = require('../utils/prisma');

// @desc    Get all locations hierarchy (unions, fields, districts, local churches)
// @route   GET /api/hierarchy
// @access  Public
const getHierarchy = async (req, res) => {
  try {
    const unions = await prisma.union.findMany({ orderBy: { name: 'asc' } });
    const fields = await prisma.field.findMany({ orderBy: { name: 'asc' } });
    const districts = await prisma.district.findMany({ orderBy: { name: 'asc' } });
    const localChurches = await prisma.localChurch.findMany({ orderBy: { name: 'asc' } });

    res.json({
      unions,
      fields,
      districts,
      localChurches
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHierarchy };
