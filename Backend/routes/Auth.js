const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendWelcomeEmail } = require("../utils/resend");

// Registration route
router.post("/register", async (req, res, next) => {
  console.log(req.body);
  try {
    const { name, sic_no, email, phone_no, password, role } = req.body;

    // Basic validation
    if (!name || !sic_no || !email || !password) {
      console.error("Missing required fields");
      return res
        .status(400)
        .json({
          error: "Missing required fields: name, sic_no, email, password",
        });
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
    if (!mappedRole)
      return res
        .status(400)
        .json({ error: "Invalid role. Allowed: member, admin, superadmin" });

    // Calculate year enum from sic_no prefix
    const sicStr = String(sic_no || "");
    if (sicStr.length < 2) {
      console.error("Invalid sic_no");
      return res.status(400).json({ error: "Invalid sic_no" });
    }

    // Map prefix to Year enum value (adjust mapping as your institution uses)
    // Map prefixes to Year enum *names* (strings). Passing the enum name string is
    // accepted by Prisma Client and avoids reliance on the generated `Prisma` namespace.
    const yearEnumMap = {
      25: "FIRST",
      24: "SECOND",
      23: "THIRD",
      22: "FOURTH",
    };
    const yearPrefix = sicStr.slice(0, 2);
    const yearEnum = yearEnumMap[yearPrefix];
    if (!yearEnum) {
      console.error("Invalid sic_no prefix for year calculation");
      return res
        .status(400)
        .json({
          error:
            "Invalid sic_no prefix for year calculation. Allowed prefixes: 25, 24, 23, 22",
        });
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

    return res.status(201).json({ message: "Registered", token, student });
  } catch (err) {
    // Handle unique constraint errors
    if (err.code === "P2002") {
      const target = err.meta && err.meta.target ? err.meta.target : "field";
      return res
        .status(409)
        .json({ error: `Unique constraint failed: ${target}` });
    }
    console.error(err);
    return next(err);
  }
});
// Login route
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.error("Missing email or password");
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await prisma.student.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("User not found");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        sic_no: user.sic_no,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || "please-change-this-secret"
    );

    const { password: _p, ...userSafe } = user;
    return res.json({ message: "Logged in", token, user: userSafe });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = router;
