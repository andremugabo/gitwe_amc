const prisma = require('../utils/prisma');

// @desc    Get all members
// @route   GET /api/members
// @access  Private
const getMembers = async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { documents: true, attendance: true }
        }
      }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
const getMemberById = async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        documents: true,
        attendance: { take: 10, orderBy: { date: 'desc' } },
        tithes: { take: 10, orderBy: { date: 'desc' } }
      }
    });

    if (member) {
      res.json(member);
    } else {
      res.status(404).json({ message: 'Member not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create member
// @route   POST /api/members
// @access  Private (Clerk/Pastor/Admin)
const createMember = async (req, res) => {
  const { firstName, lastName, email, phone, gender, dateOfBirth, address } = req.body;

  try {
    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address
      }
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
const updateMember = async (req, res) => {
  try {
    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete/Archive member
// @route   DELETE /api/members/:id
// @access  Private (Admin)
const deleteMember = async (req, res) => {
  try {
    // We typically archive instead of deleting
    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' }
    });
    res.json({ message: 'Member archived successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
};
