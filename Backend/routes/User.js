const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware: authenticate JWT and attach user to req.authUser
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = String(authHeader).split(' ');
  const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : parts[0];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'please-change-this-secret');
    req.authUser = decoded;
    return next();
  } catch (err) {
    console.error('JWT verify failed', err && err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// GET /users - list students (admin only)
// Query: ?limit=50&offset=0&role=MEMBER
router.get('/', authenticate, async (req, res, next) => {
  try {
    // const auth = req.authUser || {};
    // if (!auth.role || !['ADMIN', 'SUPERADMIN'].includes(String(auth.role).toUpperCase())) {
    //   return res.status(403).json({ error: 'Forbidden: admin access required' });
    // }

    const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 1000);
    const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);

    const where = {};
    if (req.query.role) {
      where.role = String(req.query.role).toUpperCase();
    }

    const [users, count] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          sic_no: true,
          name: true,
          email: true,
          phone_no: true,
          role: true,
          year: true,
        },
      }),
      prisma.student.count({ where }),
    ]);

    return res.json({ count, users });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// GET /users/search?name=... - search users by name (admin only)
router.get('/search', authenticate, async (req, res, next) => {
  try {
    // Allow MEMBER, ADMIN and SUPERADMIN roles to search
    const auth = req.authUser || {};
    if (!auth.role || !['MEMBER', 'ADMIN', 'SUPERADMIN'].includes(String(auth.role).toUpperCase())) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    const q = (req.query.name || req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Missing search query (name or q)' });

    const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 1000);
    const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);

    // Build where clause: case-insensitive contains on name
    const where = {
      // Remove `mode: 'insensitive'` — not supported by this Prisma connector version.
      // Rely on DB collation for case-insensitive matching (MySQL default is often ci).
      name: { contains: q },
    };
    if (req.query.role) {
      where.role = String(req.query.role).toUpperCase();
    }

    const [users, count] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          sic_no: true,
          name: true,
          email: true,
          phone_no: true,
          role: true,
          year: true,
        },
      }),
      prisma.student.count({ where }),
    ]);

    return res.json({ count, users });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// GET /users/:sic_no - get details for a particular user (allowed for MEMBER/ADMIN/SUPERADMIN)
router.get('/:sic_no', authenticate, async (req, res, next) => {
  try {
    const auth = req.authUser || {};
    if (!auth.role || !['MEMBER', 'ADMIN', 'SUPERADMIN'].includes(String(auth.role).toUpperCase())) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    const sic = String(req.params.sic_no || '').trim();
    if (!sic) return res.status(400).json({ error: 'Missing sic_no parameter' });

    // Basic user info (exclude password)
    const user = await prisma.student.findUnique({
      where: { sic_no: sic },
      select: { sic_no: true, name: true, email: true, phone_no: true, role: true, year: true },
    });
    if (!user) return res.status(404).json({ error: 'Student not found' });

    // Find the team membership (if any) and include team details
    const membership = await prisma.teamMember.findUnique({ where: { sic_no: sic }, include: { team: { include: { problemStatement: true, members: { include: { student: true } } } } } });

    let team = null;
    if (membership && membership.team) {
      const t = membership.team;
      team = {
        id: t.id,
        team_name: t.team_name,
        problemStatement: t.problemStatement ? { id: t.problemStatement.id, title: t.problemStatement.title, description: t.problemStatement.description || null } : null,
        members: (t.members || []).map((m) => ({ role: m.role, name: m.student?.name || null, sic_no: m.sic_no, phone_no: m.student?.phone_no || null })),
      };
    }

    return res.json({ user, team });
  } catch (err) {
    console.error('Error fetching user details:', err);
    return next(err);
  }
});


// DELETE /users/:sic_no - delete a user (ADMIN/SUPERADMIN or the user themself)
router.delete('/:sic_no', authenticate, async (req, res, next) => {
  try {
    const auth = req.authUser || {};
    const targetSic = req.params.sic_no;
    if (!targetSic) return res.status(400).json({ error: 'Missing sic_no parameter' });

    const isSelf = auth.sic_no && String(auth.sic_no) === String(targetSic);
    const role = String((auth.role || '').toUpperCase());
    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(role);

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    // Remove team memberships first to avoid FK constraint
    await prisma.teamMember.deleteMany({ where: { sic_no: targetSic } });

    // Delete the student
    const deleted = await prisma.student.delete({ where: { sic_no: targetSic } }).catch((err) => {
      // If record not found, return 404
      if (err.code === 'P2025') return null; // Prisma 'Record to delete does not exist.'
      throw err;
    });

    if (!deleted) return res.status(404).json({ error: 'Student not found' });

    return res.status(204).send();
  } catch (err) {
    console.error('Error deleting user:', err);
    return next(err);
  }
});

// PATCH /users/:sic_no/role - update a user's role
// Body: { role: 'MEMBER' | 'ADMIN' | 'SUPERADMIN' }
router.patch('/:sic_no/role', authenticate, async (req, res, next) => {
  try {
    console.log('Update role request body:', req.params.sic_no);
    const auth = req.authUser || {};
    const targetSic = req.params.sic_no;
    const newRole = (req.body && req.body.role) ? String(req.body.role).toUpperCase() : null;

    if (!targetSic) return res.status(400).json({ error: 'Missing sic_no parameter' });
    if (!newRole || !['MEMBER', 'ADMIN', 'SUPERADMIN'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role. Allowed: MEMBER, ADMIN, SUPERADMIN' });
    }

    const requesterRole = String((auth.role || '').toUpperCase());

    // Only ADMIN or SUPERADMIN may change roles. ADMIN cannot assign SUPERADMIN.
    if (!['ADMIN', 'SUPERADMIN'].includes(requesterRole)) {
      console.log('Forbidden role change attempt by:', requesterRole);
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    if (requesterRole === 'ADMIN' && newRole === 'SUPERADMIN') {
      return res.status(403).json({ error: 'Forbidden: ADMIN cannot assign SUPERADMIN' });
    }

    // Update the student's role
    const updated = await prisma.student.update({
      where: { sic_no: targetSic },
      data: { role: newRole },
      select: { sic_no: true, name: true, email: true, phone_no: true, role: true, year: true },
    }).catch((err) => {
      if (err.code === 'P2025') return null;
      throw err;
    });

    if (!updated) return res.status(404).json({ error: 'Student not found' });

    return res.json({ message: 'Role updated', user: updated });
  } catch (err) {
    console.error('Error updating role:', err);
    return next(err);
  }
});

// POST /users/:sic_no/demote - demote an ADMIN to MEMBER
router.post('/:sic_no/demote', authenticate, async (req, res, next) => {
  console.log('Demote user request for sic_no:', req.params.sic_no);
  try {
    const auth = req.authUser || {};
    const targetSic = req.params.sic_no;
    if (!targetSic) return res.status(400).json({ error: 'Missing sic_no parameter' });

    // fetch current user data
    const targetUser = await prisma.student.findUnique({ where: { sic_no: targetSic } });
    if (!targetUser) return res.status(404).json({ error: 'Student not found' });

    const requesterRole = String((auth.role || '').toUpperCase());
    const requesterSic = String(auth.sic_no);

    // Only SUPERADMIN can demote other ADMINs. An ADMIN may demote themselves.
    if (requesterSic !== String(targetSic) && requesterRole !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Forbidden: only SUPERADMIN can demote other admins' });
    }

    // Target must be ADMIN to demote
    if (String(targetUser.role).toUpperCase() !== 'ADMIN') {
      return res.status(400).json({ error: 'Target user is not an ADMIN' });
    }

    // Prevent demoting a SUPERADMIN by mistake (shouldn't reach here because role check above)
    if (String(targetUser.role).toUpperCase() === 'SUPERADMIN') {
      return res.status(403).json({ error: 'Cannot demote a SUPERADMIN' });
    }

    const updated = await prisma.student.update({
      where: { sic_no: targetSic },
      data: { role: 'MEMBER' },
      select: { sic_no: true, name: true, email: true, phone_no: true, role: true, year: true },
    });

    return res.json({ message: 'User demoted to MEMBER', user: updated });
  } catch (err) {
    console.error('Error demoting user:', err);
    return next(err);
  }
});

module.exports = router;

