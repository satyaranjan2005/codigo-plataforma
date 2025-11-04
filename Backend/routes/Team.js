const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('./_auth_middleware');

// Create a team and add members
// POST /teams
// body: { team_name: string, members: [sic_no, ...] }
router.post('/', authenticate, async (req, res, next) => {
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

// GET /teams - list teams (with optional pagination)
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 1000);
    const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);
    const teams = await prisma.team.findMany({ skip: offset, take: limit, include: { members: { include: { student: true } }, problemStatement: true } });
    const count = await prisma.team.count();
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

// GET /teams/:id - get a single team with members
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const team = await prisma.team.findUnique({ where: { id }, include: { members: { include: { student: true } }, problemStatement: true } });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    return res.json({ team });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = router;
