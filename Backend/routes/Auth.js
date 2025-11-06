const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendWelcomeEmail } = require("../utils/resend");
const { asyncHandler } = require("../middleware/errorHandler");
const { 
  BadRequestError, 
  UnauthorizedError, 
  ConflictError,
  ValidationError 
} = require("../utils/errors");
const { 
  validateRequired, 
  isValidEmail, 
  isValidPhone 
} = require("../utils/validators");

// Registration route
router.post("/register", asyncHandler(async (req, res, next) => {
  console.log(req.body);
  
  const { name, sic_no, email, phone_no, password, role } = req.body;

  // Validate required fields
  validateRequired(req.body, ['name', 'sic_no', 'email', 'password']);

  // Validate email format
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }

  // Validate phone if provided
  if (phone_no && !isValidPhone(phone_no)) {
    throw new ValidationError('Invalid phone number format');
  }

  // Validate password strength (basic)
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }

  // role mapping and validation
  const roleMap = {
    member: "MEMBER",
    admin: "ADMIN",
    superadmin: "SUPERADMIN",
  };
  const mappedRole = role
    ? roleMap[String(role).toLowerCase()]
    : roleMap.member;
  
  if (!mappedRole) {
    throw new BadRequestError('Invalid role. Allowed: member, admin, superadmin');
  }

  // Calculate year enum from sic_no prefix
  const sicStr = String(sic_no || "");
  if (sicStr.length < 2) {
    throw new BadRequestError('Invalid sic_no format');
  }

  // Map prefix to Year enum value (adjust mapping as your institution uses)
  const yearEnumMap = {
    25: "FIRST",
    24: "SECOND",
    23: "THIRD",
    22: "FOURTH",
  };
  const yearPrefix = sicStr.slice(0, 2);
  const yearEnum = yearEnumMap[yearPrefix];
  
  if (!yearEnum) {
    throw new BadRequestError(
      'Invalid sic_no prefix for year calculation. Allowed prefixes: 25, 24, 23, 22'
    );
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Create student (pass the enum value, not an Int)
  const student = await prisma.student.create({
    data: {
      sic_no,
      name,
      email,
      phone_no,
      password: hashed,
      role: mappedRole,
      year: yearEnum,
    },
    select: {
      sic_no: true,
      name: true,
      email: true,
      phone_no: true,
      role: true,
      year: true,
    },
  });

  // Send welcome email (fire-and-forget)
  if (student && student.email) {
    sendWelcomeEmail(student.email, student.name, student.sic_no)
      .then((r) => {
        if (!r.ok) console.warn("Welcome email not sent or skipped", r);
      })
      .catch((e) => console.error("Welcome email error", e));
  }

  // Create JWT for the newly registered student
  const token = jwt.sign(
    {
      sic_no: student.sic_no,
      email: student.email,
      role: student.role,
      name: student.name,
    },
    process.env.JWT_SECRET || "please-change-this-secret",
    { expiresIn: "7d" }
  );

  return res.status(201).json({ 
    success: true,
    message: "Registered successfully", 
    token, 
    student 
  });
}));

// Login route
router.post("/login", asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Validate required fields
  validateRequired(req.body, ['email', 'password']);
  
  // Validate email format
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }

  const user = await prisma.student.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = jwt.sign(
    {
      sic_no: user.sic_no,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET || "please-change-this-secret",
    { expiresIn: "7d" }
  );

  const { password: _p, ...userSafe } = user;
  
  return res.json({ 
    success: true,
    message: "Logged in successfully", 
    token, 
    user: userSafe 
  });
}));

module.exports = router;
