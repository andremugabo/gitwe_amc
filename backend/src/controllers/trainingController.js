const prisma = require('../utils/prisma');

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
      targetUsers.map(u => 
        prisma.notification.create({
          data: {
            title: 'New Training Scheduled',
            message: `A new course "${title}" has been scheduled starting on ${startDate || 'TBD'}. Please notify and recommend eligible elders.`,
            type: 'SYSTEM',
            recipientId: u.id
          }
        })
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
    await prisma.notification.create({
      data: {
        title: 'Enrolled in Training Course',
        message: `You have been registered for the course. Go to your dashboard to access course materials.`,
        type: 'SYSTEM',
        recipientId: elderId
      }
    });

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
      notifyTargets.map(t =>
        prisma.notification.create({
          data: {
            title: 'Training Recommendation',
            message: `Pastor ${req.user.name} recommended Elder Gasana Silas for the program: "${courseName}".`,
            type: 'SYSTEM',
            recipientId: t.id
          }
        })
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
    await prisma.notification.create({
      data: {
        title: 'Certificate Issued!',
        message: `Congratulations! Your certificate is now ready for download in your dashboard.`,
        type: 'SYSTEM',
        recipientId: elderId
      }
    });

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
  getNotifications
};
