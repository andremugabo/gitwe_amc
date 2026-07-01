const prisma = require('../utils/prisma');

// Helper to check if trainer is assigned to the course
const verifyCourseTrainer = async (courseId, trainerId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { trainerId: true }
  });
  return course && course.trainerId === trainerId;
};

// @desc    Get courses assigned to the logged-in trainer
// @route   GET /api/trainer/courses
// @access  Private (TRAINER)
const getTrainerCourses = async (req, res) => {
  if (req.user.role !== 'TRAINER') {
    return res.status(403).json({ message: 'Access denied. Trainers only.' });
  }

  try {
    const courses = await prisma.course.findMany({
      where: { trainerId: req.user.id },
      include: {
        _count: {
          select: { enrollments: true, sessions: true, tests: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get elders enrolled in an assigned course
// @route   GET /api/trainer/courses/:courseId/trainees
// @access  Private (TRAINER)
const getCourseTrainees = async (req, res) => {
  const { courseId } = req.params;

  if (req.user.role !== 'TRAINER') {
    return res.status(403).json({ message: 'Access denied. Trainers only.' });
  }

  const isAssigned = await verifyCourseTrainer(courseId, req.user.id);
  if (!isAssigned) {
    return res.status(403).json({ message: 'Not authorized. You are not the trainer for this course.' });
  }

  try {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId },
      include: {
        elder: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    const trainees = enrollments.map(e => e.elder);
    res.json(trainees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark attendance for a course session
// @route   POST /api/trainer/attendance
// @access  Private (TRAINER)
const markTraineeAttendance = async (req, res) => {
  const { courseId, sessionId, attendanceRecords } = req.body; // [{ elderId, status }]

  if (req.user.role !== 'TRAINER') {
    return res.status(403).json({ message: 'Access denied. Trainers only.' });
  }

  const isAssigned = await verifyCourseTrainer(courseId, req.user.id);
  if (!isAssigned) {
    return res.status(403).json({ message: 'Not authorized. You are not the trainer for this course.' });
  }

  try {
    // Delete existing attendance records for this session to prevent duplicates
    await prisma.courseAttendance.deleteMany({
      where: { sessionId }
    });

    const records = await Promise.all(
      attendanceRecords.map(rec =>
        prisma.courseAttendance.create({
          data: {
            sessionId,
            elderId: rec.elderId,
            status: rec.status // "PRESENT", "ABSENT"
          }
        })
      )
    );

    res.status(201).json({ message: 'Attendance records saved successfully.', records });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a test for a course
// @route   POST /api/trainer/tests
// @access  Private (TRAINER)
const createCourseTest = async (req, res) => {
  const { title, questions, courseId } = req.body;

  if (req.user.role !== 'TRAINER') {
    return res.status(403).json({ message: 'Access denied. Trainers only.' });
  }

  const isAssigned = await verifyCourseTrainer(courseId, req.user.id);
  if (!isAssigned) {
    return res.status(403).json({ message: 'Not authorized. You are not the trainer for this course.' });
  }

  try {
    const test = await prisma.test.create({
      data: {
        title,
        questions: typeof questions === 'string' ? questions : JSON.stringify(questions),
        courseId
      }
    });
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get course test results
// @route   GET /api/trainer/results
// @access  Private (TRAINER)
const getTestResults = async (req, res) => {
  if (req.user.role !== 'TRAINER') {
    return res.status(403).json({ message: 'Access denied. Trainers only.' });
  }

  try {
    const results = await prisma.testResult.findMany({
      where: {
        test: {
          course: { trainerId: req.user.id }
        }
      },
      include: {
        test: {
          select: { title: true, courseId: true, questions: true }
        },
        elder: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade/evaluate a trainee's test submission
// @route   POST /api/trainer/results/:resultId/grade
// @access  Private (TRAINER)
const gradeTestResult = async (req, res) => {
  const { resultId } = req.params;
  const { score, status, feedback } = req.body;

  if (req.user.role !== 'TRAINER') {
    return res.status(403).json({ message: 'Access denied. Trainers only.' });
  }

  try {
    const result = await prisma.testResult.findUnique({
      where: { id: resultId },
      include: { test: { include: { course: true } } }
    });

    if (!result) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    if (result.test.course.trainerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized. You are not the trainer for this course.' });
    }

    const updatedResult = await prisma.testResult.update({
      where: { id: resultId },
      data: {
        score: parseInt(score),
        status: status || (parseInt(score) >= 50 ? 'PASSED' : 'FAILED'),
        feedback
      }
    });

    res.json(updatedResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get evaluations for courses assigned to this trainer
// @route   GET /api/trainer/evaluations
// @access  Private (TRAINER)
const getTrainerEvaluations = async (req, res) => {
  if (req.user.role !== 'TRAINER') {
    return res.status(403).json({ message: 'Access denied. Trainers only.' });
  }

  try {
    const evaluations = await prisma.evaluation.findMany({
      where: {
        course: { trainerId: req.user.id }
      },
      include: {
        course: { select: { title: true } },
        elder: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTrainerCourses,
  getCourseTrainees,
  markTraineeAttendance,
  createCourseTest,
  getTestResults,
  gradeTestResult,
  getTrainerEvaluations
};
