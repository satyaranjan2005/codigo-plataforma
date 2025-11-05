const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const authRouter = require('./routes/Auth');
const userRouter = require('./routes/User');
const teamRouter = require('./routes/Team');
const problemRouter = require('./routes/casestudy');

const prisma = new PrismaClient();

const app = express();
const PORT = 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Mount auth routes
app.use('/auth', authRouter);
// Mount user routes
app.use('/users', userRouter);
// Mount team CRUD/routes (creates, members etc.)
app.use('/teams', teamRouter);
// Mount problem statement routes
app.use('/problems', problemRouter);

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Express server running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});