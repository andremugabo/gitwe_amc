const prisma = require('../utils/prisma');
const sendEmail = require('../utils/sendEmail');
const { broadcast } = require('../utils/websocket');
const { 
  getCourseScheduledTemplate, 
  getElderEnrolledTemplate, 
  getRecommendationTemplate, 
  getCertificateIssuedTemplate 
} = require('../utils/emailTemplates');

// Helper to filter elders based on role scoping
const getScopedElderIds = async (user) => {
  if (user.role === 'UNION_ADMIN') {
    const elders = await prisma.user.findMany({ where: { role: 'ELDER' }, select: { id: true } });
    return elders.map(e => e.id);
  }
  if (user.role === 'FIELD_SECRETARY') {
    // Elders in the secretary's field
    const localChurchesInField = await prisma.localChurch.findMany({
      where: { district: { fieldId: user.fieldId } },
      select: { id: true }
    });
    const churchIds = localChurchesInField.map(lc => lc.id);
    const elders = await prisma.user.findMany({
      where: { role: 'ELDER', localChurchId: { in: churchIds } },
      select: { id: true }
    });
    return elders.map(e => e.id);
  }
  if (user.role === 'PASTOR') {
    // Elders in the pastor's district/church
    let whereClause = { role: 'ELDER' };
    if (user.districtId) {
      whereClause.localChurch = { districtId: user.districtId };
    } else if (user.localChurchId) {
      whereClause.localChurchId = user.localChurchId;
    }
    const elders = await prisma.user.findMany({
      where: whereClause,
      select: { id: true }
    });
    return elders.map(e => e.id);
  }
  return [user.id]; // Elder sees only themselves
};

// 1. Get all courses
const getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { enrollments: true, sessions: true, materials: true }
        }
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Create Course (Union Admin only)
const createCourse = async (req, res) => {
  const { title, description, topics, location, duration, startDate, endDate } = req.body;

  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        topics,
        location,
        duration,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    // Notify all Pastors and Field Secretaries system-wide
    const targetUsers = await prisma.user.findMany({
      where: {
        role: { in: ['FIELD_SECRETARY', 'PASTOR'] }
      }
    });

    // Create notifications in batch
    await Promise.all(
      targetUsers.map(u => {
        broadcast('NOTIFICATION', {
          recipientId: u.id,
          title: 'New Training Scheduled',
          message: `A new course "${title}" has been scheduled starting on ${startDate || 'TBD'}.`
        });
        return prisma.notification.create({
          data: {
            title: 'New Training Scheduled',
            message: `A new course "${title}" has been scheduled starting on ${startDate || 'TBD'}. Please notify and recommend eligible elders.`,
            type: 'SYSTEM',
            recipientId: u.id
          }
        });
      })
    );

    // Send actual emails system-wide to Pastors & Field Secretaries
    await Promise.all(
      targetUsers.map(u => 
        sendEmail({
          to: u.email,
          subject: `New Training Scheduled: ${title}`,
          text: `A new course "${title}" has been scheduled starting on ${startDate || 'TBD'}.`,
          html: getCourseScheduledTemplate(u.name, title, startDate, location, duration)
        }).catch(err => console.error('Failed to send course scheduled email to', u.email, err.message))
      )
    );

    // Audit trail
    await prisma.activity.create({
      data: {
        action: 'COURSE_CREATED',
        description: `Scheduled course "${title}"`,
        userId: req.user.id
      }
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 3. Get Course details by ID
const getCourseById = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        materials: true,
        sessions: {
          include: {
            attendance: {
              include: {
                elder: { select: { name: true, email: true } }
              }
            }
          },
          orderBy: { date: 'asc' }
        },
        enrollments: {
          include: {
            elder: { 
              select: { 
                id: true, 
                name: true, 
                email: true, 
                localChurch: { select: { name: true } } 
              } 
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Role-based scoping of enrollment list
    if (req.user.role === 'FIELD_SECRETARY') {
      const allowedElders = await getScopedElderIds(req.user);
      course.enrollments = course.enrollments.filter(e => allowedElders.includes(e.elderId));
    } else if (req.user.role === 'PASTOR') {
      const allowedElders = await getScopedElderIds(req.user);
      course.enrollments = course.enrollments.filter(e => allowedElders.includes(e.elderId));
    } else if (req.user.role === 'ELDER') {
      // Elder only sees their own enrollment status
      course.enrollments = course.enrollments.filter(e => e.elderId === req.user.id);
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Add course material (Union Admin only)
const addCourseMaterial = async (req, res) => {
  const { title, fileUrl, fileType } = req.body;
  const courseId = req.params.id;

  try {
    const material = await prisma.courseMaterial.create({
      data: {
        title,
        fileUrl,
        fileType: fileType || 'PDF',
        courseId
      }
    });
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 5. Register an elder for a course
const registerElder = async (req, res) => {
  const { courseId, elderId } = req.body;

  try {
    // Verification checks based on role scope
    if (req.user.role === 'FIELD_SECRETARY') {
      const allowedElders = await getScopedElderIds(req.user);
      if (!allowedElders.includes(elderId)) {
        return res.status(403).json({ message: 'Not authorized to register elders outside your Field.' });
      }
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        elderId,
        status: 'ENROLLED'
      }
    });

    // Notify the elder
    broadcast('NOTIFICATION', {
      recipientId: elderId,
      title: 'Enrolled in Training Course',
      message: `You have been registered for the course. Go to your dashboard to access course materials.`
    });

    await prisma.notification.create({
      data: {
        title: 'Enrolled in Training Course',
        message: `You have been registered for the course. Go to your dashboard to access course materials.`,
        type: 'SYSTEM',
        recipientId: elderId
      }
    });

    // Send actual email notification to the elder
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    const elder = await prisma.user.findUnique({ where: { id: elderId } });
    if (elder && elder.email && course) {
      await sendEmail({
        to: elder.email,
        subject: `Enrolled in Training Course: ${course.title}`,
        text: `You have been registered for the course "${course.title}".`,
        html: getElderEnrolledTemplate(elder.name, course.title, course.startDate, course.location)
      }).catch(err => console.error('Failed to send elder enrollment email:', err.message));
    }

    // Audit log
    await prisma.activity.create({
      data: {
        action: 'ELDER_ENROLLED',
        description: `Enrolled elder ID ${elderId} into course ID ${courseId}`,
        userId: req.user.id
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(400).json({ message: 'Elder already enrolled or invalid course.' });
  }
};

// 6. Recommend an elder for a course (Pastor only)
const recommendElder = async (req, res) => {
  const { courseName, elderId, notes } = req.body;

  try {
    // Verify this elder is supervised by this pastor
    const allowedElders = await getScopedElderIds(req.user);
    if (!allowedElders.includes(elderId)) {
      return res.status(403).json({ message: 'This elder is not under your pastoral care.' });
    }

    const elder = await prisma.user.findUnique({ where: { id: elderId } });
    if (!elder) {
      return res.status(404).json({ message: 'Elder not found' });
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        courseName,
        pastorId: req.user.id,
        elderId,
        notes
      }
    });

    // Notify Field Secretary and Union Admin
    const unionAdmins = await prisma.user.findMany({ where: { role: 'UNION_ADMIN' } });
    const localChurch = await prisma.user.findUnique({
      where: { id: elderId },
      select: { localChurch: { select: { district: { select: { fieldId: true } } } } }
    });
    
    let fieldSecs = [];
    if (localChurch?.localChurch?.district?.fieldId) {
      fieldSecs = await prisma.user.findMany({
        where: { role: 'FIELD_SECRETARY', fieldId: localChurch.localChurch.district.fieldId }
      });
    }

    const notifyTargets = [...unionAdmins, ...fieldSecs];

    await Promise.all(
      notifyTargets.map(t => {
        broadcast('NOTIFICATION', {
          recipientId: t.id,
          title: 'Training Recommendation',
          message: `Pastor ${req.user.name} recommended Elder ${elder.name} for the program: "${courseName}".`
        });
        return prisma.notification.create({
          data: {
            title: 'Training Recommendation',
            message: `Pastor ${req.user.name} recommended Elder ${elder.name} for the program: "${courseName}".`,
            type: 'SYSTEM',
            recipientId: t.id
          }
        });
      })
    );

    // Send actual email notifications to Field Secretaries and Union Admins
    await Promise.all(
      notifyTargets.map(t =>
        sendEmail({
          to: t.email,
          subject: 'Training Recommendation Submitted',
          text: `Pastor ${req.user.name} recommended Elder ${elder.name} for the program: "${courseName}".`,
          html: getRecommendationTemplate(t.name, req.user.name, elder.name, courseName, notes)
        }).catch(err => console.error('Failed to send recommendation email to', t.email, err.message))
      )
    );

    res.status(201).json(recommendation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 7. Get recommendations (Scoped)
const getRecommendations = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'PASTOR') {
      where.pastorId = req.user.id;
    } else if (req.user.role === 'FIELD_SECRETARY') {
      // Recommendations for elders in their field
      const scopedElders = await getScopedElderIds(req.user);
      where.elderId = { in: scopedElders };
    }

    const recs = await prisma.recommendation.findMany({
      where,
      include: {
        pastor: { select: { name: true } },
        elder: { select: { name: true, localChurch: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(recs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Create session
const createSession = async (req, res) => {
  const { date, topic } = req.body;
  const courseId = req.params.id;

  try {
    const session = await prisma.courseSession.create({
      data: {
        courseId,
        date: date ? new Date(date) : new Date(),
        topic
      }
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 9. Record attendance for session
const markAttendance = async (req, res) => {
  const { attendance } = req.body; // array of { elderId, isPresent }
  const sessionId = req.params.sessionId;

  try {
    // Validate permission boundaries
    if (req.user.role === 'FIELD_SECRETARY') {
      const allowedElders = await getScopedElderIds(req.user);
      const invalidEntries = attendance.filter(a => !allowedElders.includes(a.elderId));
      if (invalidEntries.length > 0) {
        return res.status(403).json({ message: 'Cannot mark attendance for elders outside your Field.' });
      }
    }

    await Promise.all(
      attendance.map(att => 
        prisma.courseAttendance.upsert({
          where: {
            sessionId_elderId: { sessionId, elderId: att.elderId }
          },
          update: {
            isPresent: att.isPresent
          },
          create: {
            sessionId,
            elderId: att.elderId,
            isPresent: att.isPresent
          }
        })
      )
    );

    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 10. Issue Digital Certificate with QR code
const issueCertificate = async (req, res) => {
  const { courseId, elderId, status } = req.body; // status: COMPLETED or FAILED

  try {
    const qrCodeValue = `VERIFY-CERTIFICATE-${courseId}-${elderId}-${Date.now()}`;
    const certificateUrl = `/uploads/certificates/${courseId}-${elderId}.pdf`; // Mock PDF path

    const enrollment = await prisma.courseEnrollment.update({
      where: {
        courseId_elderId: { courseId, elderId }
      },
      data: {
        status: status || 'COMPLETED',
        certificateUrl,
        certificateQrCode: qrCodeValue,
        certifiedAt: new Date()
      }
    });

    // Notify the elder
    broadcast('NOTIFICATION', {
      recipientId: elderId,
      title: 'Certificate Issued!',
      message: `Congratulations! Your certificate is now ready for download in your dashboard.`
    });

    await prisma.notification.create({
      data: {
        title: 'Certificate Issued!',
        message: `Congratulations! Your certificate is now ready for download in your dashboard.`,
        type: 'SYSTEM',
        recipientId: elderId
      }
    });

    // Send actual email certificate notification to the elder
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    const elder = await prisma.user.findUnique({ where: { id: elderId } });
    if (elder && elder.email && course && status !== 'FAILED') {
      await sendEmail({
        to: elder.email,
        subject: `Digital Certificate Issued: ${course.title}`,
        text: `Congratulations! Your certificate for "${course.title}" has been issued.`,
        html: getCertificateIssuedTemplate(elder.name, course.title, qrCodeValue)
      }).catch(err => console.error('Failed to send certificate email:', err.message));
    }

    res.json(enrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 11. Get notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 12. Get course materials scoped by role (Elder sees enrolled course materials only)
const getCourseMaterials = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === 'ELDER') {
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { elderId: req.user.id },
        select: { courseId: true }
      });
      const enrolledCourseIds = enrollments.map(e => e.courseId);
      whereClause.courseId = { in: enrolledCourseIds };
    }

    const materials = await prisma.courseMaterial.findMany({
      where: whereClause,
      include: {
        course: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 13. Get all tests available for courses enrolled by the elder
// @route   GET /api/training/tests
// @access  Private (ELDER)
const getTraineeTests = async (req, res) => {
  if (req.user.role !== 'ELDER') {
    return res.status(403).json({ message: 'Access denied. Elders only.' });
  }

  try {
    // Find elder's enrolled courses
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { elderId: req.user.id },
      select: { courseId: true }
    });

    const enrolledCourseIds = enrollments.map(e => e.courseId);

    // Find tests for those courses
    const tests = await prisma.test.findMany({
      where: { courseId: { in: enrolledCourseIds } },
      include: {
        course: { select: { title: true } },
        results: {
          where: { elderId: req.user.id }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 14. Submit answers for a course test
// @route   POST /api/training/tests/:testId/submit
// @access  Private (ELDER)
const submitTest = async (req, res) => {
  const { testId } = req.params;
  const { answers } = req.body;

  if (req.user.role !== 'ELDER') {
    return res.status(403).json({ message: 'Access denied. Elders only.' });
  }

  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { course: true }
    });

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Verify elder is enrolled in the course for this test
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        courseId_elderId: {
          courseId: test.courseId,
          elderId: req.user.id
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in the course for this test.' });
    }

    // Check if already submitted
    const existingResult = await prisma.testResult.findUnique({
      where: {
        testId_elderId: {
          testId,
          elderId: req.user.id
        }
      }
    });

    if (existingResult) {
      return res.status(400).json({ message: 'You have already submitted this test.' });
    }

    // Create a new TestResult (submission) with PENDING status
    const result = await prisma.testResult.create({
      data: {
        testId,
        elderId: req.user.id,
        answers: typeof answers === 'string' ? answers : JSON.stringify(answers),
        score: null, // Ungraded yet
        status: 'PENDING'
      }
    });

    // Notify the trainer
    if (test.course.trainerId) {
      broadcast('NOTIFICATION', {
        recipientId: test.course.trainerId,
        title: 'New Test Submission',
        message: `Elder ${req.user.name} submitted answers for test "${test.title}"`
      });

      await prisma.notification.create({
        data: {
          title: 'New Test Submission',
          message: `Elder ${req.user.name} submitted answers for test "${test.title}". Go to prepare tests to grade it.`,
          type: 'SYSTEM',
          recipientId: test.course.trainerId
        }
      });
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  createCourse,
  getCourseById,
  addCourseMaterial,
  registerElder,
  recommendElder,
  getRecommendations,
  createSession,
  markAttendance,
  issueCertificate,
  getNotifications,
  getCourseMaterials,
  getTraineeTests,
  submitTest
};
