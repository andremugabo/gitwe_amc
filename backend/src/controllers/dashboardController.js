const prisma = require('../utils/prisma');

// Helper to resolve scope constraints
const getScopedLocationIds = async (user) => {
  if (user.role === 'UNION_ADMIN') {
    return { global: true };
  }
  if (user.role === 'FIELD_SECRETARY') {
    // Get all district IDs and church IDs in this field
    const districts = await prisma.district.findMany({
      where: { fieldId: user.fieldId },
      select: { id: true }
    });
    const districtIds = districts.map(d => d.id);

    const churches = await prisma.localChurch.findMany({
      where: { districtId: { in: districtIds } },
      select: { id: true }
    });
    const churchIds = churches.map(c => c.id);

    return { global: false, districtIds, churchIds };
  }
  if (user.role === 'PASTOR') {
    let churchIds = [];
    let districtIds = [];
    if (user.districtId) {
      districtIds = [user.districtId];
      const churches = await prisma.localChurch.findMany({
        where: { districtId: user.districtId },
        select: { id: true }
      });
      churchIds = churches.map(c => c.id);
    } else if (user.localChurchId) {
      churchIds = [user.localChurchId];
    }
    return { global: false, districtIds, churchIds };
  }
  return { global: false, churchIds: [user.localChurchId || ''] };
};

// @desc    Get dashboard metrics based on role and locations scope
// @route   GET /api/dashboard/stats
// @access  Private (All Roles)
const getDashboardStats = async (req, res) => {
  try {
    const scope = await getScopedLocationIds(req.user);
    
    // Core statistics containers
    let metrics = {};
    let recentActivities = [];
    let extraData = {};

    // 1. UNION ADMIN DASHBOARD VIEW
    if (req.user.role === 'UNION_ADMIN') {
      const totalMembers = await prisma.member.count({ where: { status: 'ACTIVE' } });
      const totalElders = await prisma.user.count({ where: { role: 'ELDER' } });
      const totalPastors = await prisma.user.count({ where: { role: 'PASTOR' } });
      const totalCourses = await prisma.course.count();
      const totalEnrollments = await prisma.courseEnrollment.count();
      const completedEnrollments = await prisma.courseEnrollment.count({ where: { status: 'COMPLETED' } });

      metrics = {
        totalMembers,
        totalElders,
        totalPastors,
        totalCourses,
        totalEnrollments,
        completedEnrollments
      };

      recentActivities = await prisma.activity.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true } } }
      });

      // Get recent course registrations
      extraData.recentEnrollments = await prisma.courseEnrollment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          course: { select: { title: true } },
          elder: { select: { name: true } }
        }
      });
    }

    // 2. FIELD SECRETARY DASHBOARD VIEW
    else if (req.user.role === 'FIELD_SECRETARY') {
      const totalMembers = await prisma.member.count({
        where: { status: 'ACTIVE', localChurchId: { in: scope.churchIds } }
      });
      const totalElders = await prisma.user.count({
        where: { role: 'ELDER', localChurchId: { in: scope.churchIds } }
      });
      const totalPastors = await prisma.user.count({
        where: { role: 'PASTOR', district: { fieldId: req.user.fieldId } }
      });
      const totalCourses = await prisma.course.count();
      const totalEnrollments = await prisma.courseEnrollment.count({
        where: { elder: { localChurchId: { in: scope.churchIds } } }
      });
      const completedEnrollments = await prisma.courseEnrollment.count({
        where: { status: 'COMPLETED', elder: { localChurchId: { in: scope.churchIds } } }
      });

      metrics = {
        totalMembers,
        totalElders,
        totalPastors,
        totalCourses,
        totalEnrollments,
        completedEnrollments
      };

      // Scoped activities
      recentActivities = await prisma.activity.findMany({
        take: 5,
        where: {
          user: {
            OR: [
              { localChurchId: { in: scope.churchIds } },
              { districtId: { in: scope.districtIds } },
              { fieldId: req.user.fieldId }
            ]
          }
        },
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true } } }
      });

      extraData.recentEnrollments = await prisma.courseEnrollment.findMany({
        take: 5,
        where: { elder: { localChurchId: { in: scope.churchIds } } },
        orderBy: { createdAt: 'desc' },
        include: {
          course: { select: { title: true } },
          elder: { select: { name: true } }
        }
      });
    }

    // 3. PASTOR DASHBOARD VIEW
    else if (req.user.role === 'PASTOR') {
      const totalMembers = await prisma.member.count({
        where: { status: 'ACTIVE', localChurchId: { in: scope.churchIds } }
      });
      const totalElders = await prisma.user.count({
        where: { role: 'ELDER', localChurchId: { in: scope.churchIds } }
      });
      const totalEnrollments = await prisma.courseEnrollment.count({
        where: { elder: { localChurchId: { in: scope.churchIds } } }
      });
      const completedEnrollments = await prisma.courseEnrollment.count({
        where: { status: 'COMPLETED', elder: { localChurchId: { in: scope.churchIds } } }
      });

      metrics = {
        totalMembers,
        totalElders,
        totalEnrollments,
        completedEnrollments
      };

      recentActivities = await prisma.activity.findMany({
        take: 5,
        where: { user: { localChurchId: { in: scope.churchIds } } },
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true } } }
      });
    }

    // 4. CHURCH ELDER (TRAINEE) DASHBOARD VIEW
    else if (req.user.role === 'ELDER') {
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { elderId: req.user.id },
        include: { course: true }
      });

      const totalEnrollments = enrollments.length;
      const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length;

      // Calculate attendance rate
      const totalAttendance = await prisma.courseAttendance.count({
        where: { elderId: req.user.id }
      });
      const presentAttendance = await prisma.courseAttendance.count({
        where: { elderId: req.user.id, isPresent: true }
      });

      const attendanceRate = totalAttendance > 0 
        ? Math.round((presentAttendance / totalAttendance) * 100) 
        : 100;

      metrics = {
        totalEnrollments,
        completedEnrollments,
        attendanceRate
      };

      extraData.enrollments = enrollments;

      // Recent session attendance
      extraData.recentAttendance = await prisma.courseAttendance.findMany({
        take: 5,
        where: { elderId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            include: { course: { select: { title: true } } }
          }
        }
      });
    }

    res.json({
      role: req.user.role,
      metrics,
      recentActivities,
      extraData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
