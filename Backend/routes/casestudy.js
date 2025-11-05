const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('./_auth_middleware');

// GET / - list problem statements (public)
router.get('/', async (req, res, next) => {
	try {
		const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 1000);
		const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);
		const [items, count] = await Promise.all([
			prisma.problemStatement.findMany({ skip: offset, take: limit, orderBy: { id: 'desc' } }),
			prisma.problemStatement.count(),
		]);
		return res.json({ count, items });
	} catch (err) {
		console.error('Error listing problem statements:', err);
		return next(err);
	}
});

	// GET /available - list problem statements not assigned to any team (public)
	router.get('/available', async (req, res, next) => {
		try {
			const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 1000);
			const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);

			// Relation filter: problemStatement.team is null means no team has registered it
			const where = { team: { is: null } };

			const [items, count] = await Promise.all([
				prisma.problemStatement.findMany({ where, skip: offset, take: limit, orderBy: { id: 'desc' } }),
				prisma.problemStatement.count({ where }),
			]);

			return res.json({ count, items });
		} catch (err) {
			console.error('Error listing available problem statements:', err);
			return next(err);
		}
	});

// GET /:id - get single problem statement
router.get('/:id', async (req, res, next) => {
	try {
		const id = Number(req.params.id);
		if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
		const ps = await prisma.problemStatement.findUnique({ where: { id } });
		if (!ps) return res.status(404).json({ error: 'ProblemStatement not found' });
		return res.json(ps);
	} catch (err) {
		console.error('Error fetching problem statement:', err);
		return next(err);
	}
});

// POST / - create a problem statement (ADMIN/SUPERADMIN only)
router.post('/', authenticate, async (req, res, next) => {
	try {
        console.log('Creating problem statement with body:', req.body);
		const auth = req.authUser || {};
		const role = String((auth.role || '').toUpperCase());
		if (!['ADMIN', 'SUPERADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden: admin access required' });

		const { title } = req.body || {};
		if (!title) return res.status(400).json({ error: 'Missing title' });

		const created = await prisma.problemStatement.create({ data: { title: String(title) } });
		return res.status(201).json({ message: 'ProblemStatement created', problemStatement: created });
	} catch (err) {
		console.error('Error creating problem statement:', err);
		return next(err);
	}
});

// PATCH /:id - update a problem statement (ADMIN/SUPERADMIN only)
router.patch('/:id', authenticate, async (req, res, next) => {
	try {
		const auth = req.authUser || {};
		const role = String((auth.role || '').toUpperCase());
		if (!['ADMIN', 'SUPERADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden: admin access required' });

		const id = Number(req.params.id);
		if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

		const { title, description } = req.body || {};
		const data = {};
		if (title !== undefined) data.title = String(title);
		if (description !== undefined) data.description = description;

		const updated = await prisma.problemStatement.update({ where: { id }, data }).catch((err) => {
			if (err.code === 'P2025') return null;
			throw err;
		});
		if (!updated) return res.status(404).json({ error: 'ProblemStatement not found' });
		return res.json({ message: 'Updated', problemStatement: updated });
	} catch (err) {
		console.error('Error updating problem statement:', err);
		return next(err);
	}
});

// DELETE /:id - delete a problem statement (ADMIN/SUPERADMIN only)
router.delete('/:id', authenticate, async (req, res, next) => {
	try {
		const auth = req.authUser || {};
		const role = String((auth.role || '').toUpperCase());
		if (!['ADMIN', 'SUPERADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden: admin access required' });

		const id = Number(req.params.id);
		if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

		const deleted = await prisma.problemStatement.delete({ where: { id } }).catch((err) => {
			if (err.code === 'P2025') return null;
			throw err;
		});
		if (!deleted) return res.status(404).json({ error: 'ProblemStatement not found' });
		return res.status(204).send();
	} catch (err) {
		console.error('Error deleting problem statement:', err);
		return next(err);
	}
});

module.exports = router;
