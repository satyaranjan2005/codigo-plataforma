const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('./_auth_middleware');

// Create a team and add members
// POST /teams
// body: { team_name: string, members: [sic_no, ...] }
router.post('/', authenticate, async (req, res, next) => {
      console.log('Creating team with data:', req.body);
  try {
    const { team_name, members } = req.body || {};
    const requester = req.authUser && req.authUser.sic_no;

    if (!team_name) return res.status(400).json({ error: 'team_name is required' });
    if (!requester) return res.status(401).json({ error: 'Unauthorized' });

    const memberList = Array.isArray(members) ? members.map(String) : [];
    if (!memberList.includes(requester)) memberList.unshift(requester);

    // Deduplicate while preserving order
    const seen = new Set();
    const uniqueMembers = [];
    for (const s of memberList) {
      if (!seen.has(s)) {
        seen.add(s);
        uniqueMembers.push(s);
      }
    }

    if (uniqueMembers.length === 0) return res.status(400).json({ error: 'No team members provided' });

    // Validate all students exist
    const students = await prisma.student.findMany({ where: { sic_no: { in: uniqueMembers } }, select: { sic_no: true } });
    const found = new Set(students.map(s => s.sic_no));
    const missing = uniqueMembers.filter(s => !found.has(s));
    if (missing.length) return res.status(404).json({ error: 'Some students not found', missing });

    // Ensure none are already in a team
    const existing = await prisma.teamMember.findMany({ where: { sic_no: { in: uniqueMembers } } });
    if (existing.length) {
      return res.status(409).json({ error: 'Some students are already in a team', already: existing.map(e => e.sic_no) });
    }

    // Create team and team members transactionally
    const result = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({ data: { team_name, problem_id: null } });

      const memberCreates = uniqueMembers.map((sic) => {
        const role = String(sic) === String(requester) ? 'LEADER' : 'MEMBER';
        return tx.teamMember.create({ data: { team_id: team.id, sic_no: sic, role } });
      });

      const teamMembers = await Promise.all(memberCreates);
      return { team, teamMembers };
    });

    return res.status(201).json({ message: 'Team created', ...result });
  } catch (err) {
    if (err && err.code === 'P2002') return res.status(409).json({ error: 'Unique constraint violated', meta: err.meta });
    console.error('Error creating team:', err);
    return next(err);
  }
});

// POST /teams/:id/register - register a problem statement for a team
// body: { problem_id: number }
router.post('/:id/register', authenticate, async (req, res, next) => {
  try {
    const teamId = Number(req.params.id);
    const problemId = Number(req.body && (req.body.problem_id ?? req.body.problemId ?? req.body.id));
    if (!Number.isInteger(teamId)) return res.status(400).json({ error: 'Invalid team id' });
    if (!Number.isInteger(problemId)) return res.status(400).json({ error: 'Missing or invalid problem_id in body' });

    const auth = req.authUser || {};
    const requesterRole = String((auth.role || '').toUpperCase());

    // Load team with members
    const team = await prisma.team.findUnique({ where: { id: teamId }, include: { members: true } });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // If the team already has a problem assigned, only ADMIN/SUPERADMIN can change it
    if (team.problem_id && !['ADMIN', 'SUPERADMIN'].includes(requesterRole)) {
      return res.status(403).json({ error: 'Team already registered for a problem. Only ADMIN/SUPERADMIN can change it.' });
    }

    // Check permission: leader of the team or ADMIN/SUPERADMIN
    const requesterSic = String(auth.sic_no || '');
    const isLeader = team.members.some((m) => String(m.sic_no) === requesterSic && String(m.role).toUpperCase() === 'LEADER');
    if (!isLeader && !['ADMIN', 'SUPERADMIN'].includes(requesterRole)) {
      return res.status(403).json({ error: 'Forbidden: only the team leader or an admin can register the team for a problem' });
    }

    // Ensure problem exists
    const problem = await prisma.problemStatement.findUnique({ where: { id: problemId } });
    if (!problem) return res.status(404).json({ error: 'ProblemStatement not found' });

    // Attempt to assign the problem to the team. The DB has a unique constraint on Team.problem_id,
    // so if another team already registered for this problem, Prisma will throw a P2002 unique constraint error.
    try {
      const updated = await prisma.team.update({ where: { id: teamId }, data: { problem_id: problemId }, include: { members: { include: { student: true } }, problemStatement: true } });
      return res.json({ message: 'Team registered for problem', team: updated });
    } catch (err) {
      // Prisma unique constraint for problem_id
      if (err && err.code === 'P2002') {
        return res.status(409).json({ error: 'ProblemStatement already registered by another team' });
      }
      throw err;
    }
  } catch (err) {
    console.error('Error registering team for problem:', err);
    return next(err);
  }
});

// GET /teams - list teams (with optional pagination)
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 1000);
    const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);
    const teamsRaw = await prisma.team.findMany({ skip: offset, take: limit, include: { members: { include: { student: true } }, problemStatement: true } });
    const count = await prisma.team.count();

    const teams = teamsRaw.map((team) => ({
      id: team.id,
      team_name: team.team_name,
      problemStatement: team.problemStatement
        ? {
            id: team.problemStatement.id,
            title: team.problemStatement.title,
            description: team.problemStatement.description || null,
          }
        : null,
      members: (team.members || []).map((m) => ({
        role: m.role,
        name: m.student?.name || null,
        sic_no: m.sic_no,
        phone_no: m.student?.phone_no || null,
      })),
    }));

    return res.json({ count, teams });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// GET /teams/eligible-members - list students who are not ADMIN/SUPERADMIN and not in any team
router.get('/eligible-members', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 1000);
    const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);

    const where = {
      role: { notIn: ['ADMIN', 'SUPERADMIN'] },
      teams: { none: {} },
    };

    const [users, count] = await Promise.all([
      prisma.student.findMany({ where, skip: offset, take: limit, orderBy: { name: 'asc' }, select: { sic_no: true, name: true, email: true, phone_no: true, year: true, role: true } }),
      prisma.student.count({ where }),
    ]);

    return res.json({ count, users });
  } catch (err) {
    console.error('Error fetching eligible members:', err);
    return next(err);
  }
});

// GET /teams/eligible-members/search?q=... - search eligible members by name, sic_no or email
router.get('/eligible-members/search', async (req, res, next) => {
  try {
    const q = (req.query.q || req.query.name || '').trim();
    if (!q) return res.status(400).json({ error: 'Missing search query (q or name)' });

    const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 1000);
    const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);

    const where = {
      role: { notIn: ['ADMIN', 'SUPERADMIN'] },
      teams: { none: {} },
      OR: [
        { name: { contains: q } },
        { sic_no: { contains: q } },
        { email: { contains: q } },
      ],
    };

    const [users, count] = await Promise.all([
      prisma.student.findMany({ where, skip: offset, take: limit, orderBy: { name: 'asc' }, select: { sic_no: true, name: true, email: true, phone_no: true, year: true, role: true } }),
      prisma.student.count({ where }),
    ]);

    return res.json({ count, users });
  } catch (err) {
    console.error('Error searching eligible members:', err);
    return next(err);
  }
});

// GET /teams/member/:sic_no - get the team details for a student by their sic_no
// Note: `sic_no` is unique in TeamMember, so this returns the single team the student belongs to
router.get('/member/:sic_no', async (req, res, next) => {
  try {
    const sic_no = String(req.params.sic_no || '').trim();
    if (!sic_no) return res.status(400).json({ error: 'Missing sic_no parameter' });

    // Find the teamMember by sic_no and include the team with members and problemStatement
    const membership = await prisma.teamMember.findUnique({ where: { sic_no }, include: { team: { include: { members: { include: { student: true } }, problemStatement: true } } } });

    if (!membership || !membership.team) return res.status(404).json({ error: 'Student is not a member of any team' });

    const team = membership.team;

    const members = (team.members || []).map((m) => ({
      role: m.role,
      name: m.student?.name || null,
      sic_no: m.sic_no,
      phone_no: m.student?.phone_no || null,
    }));

    const problemStatement = team.problemStatement
      ? {
          id: team.problemStatement.id,
          title: team.problemStatement.title,
          description: team.problemStatement.description || null,
        }
      : null;

    return res.json({
      id: team.id,
      team_name: team.team_name,
      problemStatement,
      members,
    });
  } catch (err) {
    console.error('Error fetching team by member sic_no:', err);
    return next(err);
  }
});

// GET /teams/:id - get a single team with members
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const team = await prisma.team.findUnique({
      where: { id },
      include: { members: { include: { student: true } }, problemStatement: true },
    });

    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Map members to the requested shape: role, name, sic_no, phone_no
    const members = (team.members || []).map((m) => ({
      role: m.role,
      name: m.student?.name || null,
      sic_no: m.sic_no,
      phone_no: m.student?.phone_no || null,
    }));

    const problemStatement = team.problemStatement
      ? {
          id: team.problemStatement.id,
          title: team.problemStatement.title,
          description: team.problemStatement.description || null,
        }
      : null;

    return res.json({
      id: team.id,
      team_name: team.team_name,
      problemStatement,
      members,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = router;
