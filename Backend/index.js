const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const authRouter = require('./routes/Auth');
const userRouter = require('./routes/User');
const teamRouter = require('./routes/Team');
const problemRouter = require('./routes/casestudy');
const adminRouter = require('./routes/Admin');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { scheduleCaseStudyReleaseEmails } = require('./utils/emailScheduler');

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mount auth routes
app.use('/auth', authRouter);
// Mount user routes
app.use('/users', userRouter);
// Mount team CRUD/routes (creates, members etc.)
app.use('/teams', teamRouter);
// Mount problem statement routes
app.use('/problems', problemRouter);
// Mount admin routes
app.use('/admin', adminRouter);

// Health check
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        status: 'ok', 
        message: 'Express server running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler - must come after all routes
app.use(notFoundHandler);

// Centralized error handler - must be last middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    prisma.$disconnect().then(() => {
        console.log('Database connection closed');
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Start the case study release email scheduler
    scheduleCaseStudyReleaseEmails();
});