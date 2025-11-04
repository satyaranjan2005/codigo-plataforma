const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('./_auth_middleware');

// Create a team and add members
// POST /teams
// body: { team_name: string, members: [sic_no, ...], problem_id?: number }
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { team_name, members, problem_id } = req.body || {};
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

    // Per workflow: start with no problem assigned. Ensure problem_id is null on create.

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

    // Create a proposal instead of creating the team immediately.
    // Members must approve; once all approve we'll finalize the Team.
    const { sendTeamInvite } = require('../utils/resend');

    const proposal = await prisma.teamProposal.create({
      data: {
        team_name,
        proposer_sic: requester,
        // members will be created next
      },
    });

    // Create proposal members, mark proposer as approved automatically
    const memberCreates = uniqueMembers.map((sic) => {
      return prisma.teamProposalMember.create({ data: { proposal_id: proposal.id, sic_no: sic, approved: String(sic) === String(requester) } });
    });
    const proposalMembers = await Promise.all(memberCreates);

    // Notify members (except proposer) via email (if configured)
    const notified = [];
    for (const pm of proposalMembers) {
      if (String(pm.sic_no) === String(requester)) continue;
      try {
        const student = await prisma.student.findUnique({ where: { sic_no: pm.sic_no } });
        if (student && student.email) {
          await sendTeamInvite(student.email, student.name, proposal.id, pm.sic_no);
          notified.push(pm.sic_no);
        }
      } catch (e) {
        console.warn('Failed to notify', pm.sic_no, e && e.message);
      }
    }

    return res.status(201).json({ message: 'Team proposal created', proposal: { id: proposal.id, team_name: proposal.team_name }, proposalMembers, notified });
  } catch (err) {
    // handle unique constraint gracefully
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
// optional query: ?limit=100&offset=0
router.get('/eligible-members', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 1000);
    const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);

    // Find students whose role is not ADMIN or SUPERADMIN and who have no TeamMember records
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

// --- Proposal endpoints ---
// GET /teams/proposals/:id - view proposal and member approvals
router.get('/proposals/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const proposal = await prisma.teamProposal.findUnique({ where: { id }, include: { members: { include: { student: true } }, proposer: true } });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    return res.json({ proposal });
  } catch (err) {
    console.error('Error fetching proposal:', err);
    return next(err);
  }
});

// POST /teams/proposals/:id/approve - approve a proposal as a member
router.post('/proposals/:id/approve', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sic = req.authUser.sic_no;
    let pm = null;
    try {
      pm = await prisma.teamProposalMember.findUnique({ where: { proposal_id_sic_no: { proposal_id: id, sic_no: sic } }, include: { proposal: true } });
    } catch (e) {
      pm = null;
    }
    if (!pm) return res.status(404).json({ error: 'No pending invitation for this user on the proposal' });

    if (pm.approved) return res.status(400).json({ error: 'Already approved' });

    // mark approved
    const updated = await prisma.teamProposalMember.update({ where: { id: pm.id }, data: { approved: true, approvedAt: new Date() } });

    // Check if all members approved; if so, finalize the Team
    const others = await prisma.teamProposalMember.findMany({ where: { proposal_id: id } });
    const allApproved = others.every(m => m.approved || m.id === updated.id);

    if (allApproved) {
      // finalize: create Team and TeamMember rows inside transaction, then remove proposal
      const finalizeResult = await prisma.$transaction(async (tx) => {
        const proposal = await tx.teamProposal.findUnique({ where: { id }, include: { members: true } });
        const team = await tx.team.create({ data: { team_name: proposal.team_name, problem_id: null } });
        const memberCreates = proposal.members.map((m) => tx.teamMember.create({ data: { team_id: team.id, sic_no: m.sic_no, role: m.sic_no === proposal.proposer_sic ? 'LEADER' : 'MEMBER' } }));
        const teamMembers = await Promise.all(memberCreates);
        // clean up proposal members and proposal
        await tx.teamProposalMember.deleteMany({ where: { proposal_id: id } });
        await tx.teamProposal.delete({ where: { id } });
        return { team, teamMembers };
      });

      return res.json({ message: 'Approved and team finalized', team: finalizeResult.team, teamMembers: finalizeResult.teamMembers });
    }

    return res.json({ message: 'Approved', updated });
  } catch (err) {
    console.error('Error approving proposal:', err);
    return next(err);
  }
});

// POST /teams/proposals/:id/reject - reject the invitation/proposal
router.post('/proposals/:id/reject', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sic = req.authUser.sic_no;
    let pm = null;
    try {
      pm = await prisma.teamProposalMember.findUnique({ where: { proposal_id_sic_no: { proposal_id: id, sic_no: sic } } });
    } catch (e) {
      pm = null;
    }
    if (!pm) return res.status(404).json({ error: 'No invitation found for this user' });

    if (pm.approved) return res.status(400).json({ error: 'Already approved previously; cannot reject' });

    // mark proposal status REJECTED
    await prisma.teamProposal.update({ where: { id }, data: { status: 'REJECTED' } });
    return res.json({ message: 'You have rejected the proposal' });
  } catch (err) {
    console.error('Error rejecting proposal:', err);
    return next(err);
  }
});

module.exports = router;
