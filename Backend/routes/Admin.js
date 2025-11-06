const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('./_auth_middleware');

// Middleware to ensure only SUPERADMIN can access admin routes
function requireSuperAdmin(req, res, next) {
  const auth = req.authUser || {};
  const role = String((auth.role || '').toUpperCase());
  if (role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Forbidden: SUPERADMIN access required' });
  }
  return next();
}

// GET /admin/activities - show recent activities (registrations, team creations, problem assignments)
router.get('/activities', authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 200);

    // Fetch recent students (registrations) - assuming students table doesn't have createdAt, we'll order by sic_no desc as proxy
    const recentStudents = await prisma.student.findMany({
      take: limit,
      orderBy: { sic_no: 'desc' },
      select: { sic_no: true, name: true, email: true, role: true, year: true },
    });

    // Fetch recent teams
    const recentTeams = await prisma.team.findMany({
      take: limit,
      orderBy: { id: 'desc' },
      include: { members: { include: { student: true } }, problemStatement: true },
    });

    // Map teams to activity format
    const teamActivities = recentTeams.map((team) => ({
      type: 'team_created',
      id: team.id,
      team_name: team.team_name,
      members: (team.members || []).map((m) => ({ sic_no: m.sic_no, name: m.student?.name, role: m.role })),
      problemStatement: team.problemStatement ? { id: team.problemStatement.id, title: team.problemStatement.title } : null,
    }));

    // Fetch teams with problem assignments (where problem_id is not null) as separate activity type
    const assignedTeams = await prisma.team.findMany({
      where: { problem_id: { not: null } },
      take: limit,
      orderBy: { id: 'desc' },
      include: { problemStatement: true },
    });

    const assignmentActivities = assignedTeams.map((team) => ({
      type: 'problem_assigned',
      team_id: team.id,
      team_name: team.team_name,
      problemStatement: team.problemStatement ? { id: team.problemStatement.id, title: team.problemStatement.title } : null,
    }));

    // Combine all activities (in a real app you'd merge and sort by timestamp)
    const activities = {
      recentStudents: recentStudents.slice(0, 20),
      recentTeams: teamActivities.slice(0, 20),
      recentAssignments: assignmentActivities.slice(0, 20),
    };

    return res.json(activities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    return next(err);
  }
});

// GET /admin/performance - show performance metrics and statistics
router.get('/performance', authenticate, requireSuperAdmin, async (req, res, next) => {
  try {
    const startTime = Date.now();

    // Fetch counts in parallel
    const [
      totalStudents,
      totalTeams,
      totalProblems,
      studentsInTeams,
      teamsWithProblems,
      studentsByRole,
      studentsByYear,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.team.count(),
      prisma.problemStatement.count(),
      prisma.teamMember.count(),
      prisma.team.count({ where: { problem_id: { not: null } } }),
      prisma.student.groupBy({ by: ['role'], _count: { role: true } }),
      prisma.student.groupBy({ by: ['year'], _count: { year: true } }),
    ]);

    // Calculate derived metrics
    const studentsWithoutTeams = totalStudents - studentsInTeams;
    const teamsWithoutProblems = totalTeams - teamsWithProblems;
    const availableProblems = totalProblems - teamsWithProblems;

    // Calculate query execution time
    const queryTime = Date.now() - startTime;

    // Role distribution
    const roleDistribution = {};
    studentsByRole.forEach((r) => {
      roleDistribution[r.role] = r._count.role;
    });

    // Year distribution
    const yearDistribution = {};
    studentsByYear.forEach((y) => {
      yearDistribution[y.year] = y._count.year;
    });

    const metrics = {
      overview: {
        totalStudents,
        totalTeams,
        totalProblems,
        studentsInTeams,
        studentsWithoutTeams,
        teamsWithProblems,
        teamsWithoutProblems,
        availableProblems,
      },
      distribution: {
        byRole: roleDistribution,
        byYear: yearDistribution,
      },
      health: {
        dbQueryTime: `${queryTime}ms`,
        status: queryTime < 1000 ? 'healthy' : queryTime < 3000 ? 'degraded' : 'slow',
      },
      nodejs: {
        uptime: `${Math.floor(process.uptime())}s`,
        memoryUsage: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`,
        },
        cpuUsage: {
          user: `${Math.round(process.cpuUsage().user / 1000)}ms`,
          system: `${Math.round(process.cpuUsage().system / 1000)}ms`,
        },
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    return res.json(metrics);
  } catch (err) {
    console.error('Error fetching performance metrics:', err);
    return next(err);
  }
});

module.exports = router;
