const prisma = require('../utils/prisma');

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Private
const getFaqs = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a FAQ
// @route   POST /api/faqs
// @access  Private (UNION_ADMIN)
const createFaq = async (req, res) => {
  const { question, answer, category } = req.body;

  if (req.user.role !== 'UNION_ADMIN') {
    return res.status(403).json({ message: 'Only Union Administrators can manage FAQs.' });
  }

  try {
    const faq = await prisma.faq.create({
      data: { question, answer, category: category || 'General' }
    });
    res.status(201).json(faq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a FAQ
// @route   DELETE /api/faqs/:id
// @access  Private (UNION_ADMIN)
const deleteFaq = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'UNION_ADMIN') {
    return res.status(403).json({ message: 'Only Union Administrators can manage FAQs.' });
  }

  try {
    await prisma.faq.delete({ where: { id } });
    res.json({ message: 'FAQ removed successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getFaqs,
  createFaq,
  deleteFaq
};
