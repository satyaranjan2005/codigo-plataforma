#!/usr/bin/env node
/**
 * Seed script for development/testing
 * Usage:
 *  node scripts/seed.js --yes
 *
 * By default it performs a dry-run and prints what will be created.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const minimist = require('minimist');

const prisma = new PrismaClient();

async function main() {
  const argv = minimist(process.argv.slice(2));
  const apply = Boolean(argv.yes || argv.y);

const students = [
    { sic_no: '23bcsn72', name: 'Satya R', email: 'satya@example.com', phone_no: '9999999990', password: 'satya@satya', role: 'SUPERADMIN', year: 'FOURTH' },
    { sic_no: '23bcsn01', name: 'Admin User', email: 'admin@example.com', phone_no: '9999999991', password: 'adminpass', role: 'ADMIN', year: 'FOURTH' },
    { sic_no: '23bcsn02', name: 'Alice Student', email: 'alice@example.com', phone_no: '9999999992', password: 'alicepass', role: 'MEMBER', year: 'SECOND' },
    { sic_no: '23bcsn03', name: 'Bob Student', email: 'bob@example.com', phone_no: '9999999993', password: 'bobpass', role: 'MEMBER', year: 'SECOND' },
    { sic_no: '23bcsn04', name: 'Carol Student', email: 'carol@example.com', phone_no: '9999999994', password: 'carolpass', role: 'MEMBER', year: 'FIRST' },

    // Additional students
    { sic_no: '23bcsn05', name: 'David Kumar', email: 'david@example.com', phone_no: '9999999995', password: 'davidpass', role: 'MEMBER', year: 'THIRD' },
    { sic_no: '23bcsn06', name: 'Eve Sharma', email: 'eve@example.com', phone_no: '9999999996', password: 'evepass', role: 'MEMBER', year: 'SECOND' },
    { sic_no: '23bcsn07', name: 'Frank Lee', email: 'frank@example.com', phone_no: '9999999997', password: 'frankpass', role: 'MEMBER', year: 'FIRST' },
    { sic_no: '23bcsn08', name: 'Grace Patel', email: 'grace@example.com', phone_no: '9999999998', password: 'gracepass', role: 'MEMBER', year: 'THIRD' },
    { sic_no: '23bcsn09', name: 'Hannah Roy', email: 'hannah@example.com', phone_no: '9999999999', password: 'hannahpass', role: 'MEMBER', year: 'SECOND' },
    { sic_no: '23bcsn10', name: 'Ian Wright', email: 'ian@example.com', phone_no: '9999999900', password: 'ianpass', role: 'MEMBER', year: 'FOURTH' },
    { sic_no: '23bcsn11', name: 'Jaya Singh', email: 'jaya@example.com', phone_no: '9999999901', password: 'jayapass', role: 'ADMIN', year: 'THIRD' },
];

  const problems = [
    { title: 'Optimize Supply Chain' },
    { title: 'AI Chatbot for Support' },
    { title: 'Green Energy Dashboard' },
  ];

  const teams = [
    { team_name: 'Team Alpha', members: ['23bcsn02', '23bcsn03'] },
    { team_name: 'Team Beta', members: ['23bcsn04'] },
  ];

  console.log('Seed script dry-run. Use --yes to apply changes.\n');

  // Show planned operations
  console.log(`Students to ensure: ${students.map(s => s.sic_no).join(', ')}`);
  console.log(`Problem statements to ensure: ${problems.map(p => p.title).join(' | ')}`);
  console.log(`Teams to create: ${teams.map(t => t.team_name).join(', ')}`);

  if (!apply) {
    console.log('\nDry run complete. Add --yes to perform seeding.');
    await prisma.$disconnect();
    return;
  }

  try {
    // Create or update students
    for (const s of students) {
      const hashed = await bcrypt.hash(s.password, 8);
      await prisma.student.upsert({
        where: { sic_no: s.sic_no },
        update: { name: s.name, email: s.email, phone_no: s.phone_no, password: hashed, role: s.role, year: s.year },
        create: { sic_no: s.sic_no, name: s.name, email: s.email, phone_no: s.phone_no, password: hashed, role: s.role, year: s.year },
      });
      console.log(`Upserted student ${s.sic_no}`);
    }

    // Create problems if not exists
    const createdProblems = [];
    for (const p of problems) {
      let found = await prisma.problemStatement.findFirst({ where: { title: p.title } });
      if (!found) {
        found = await prisma.problemStatement.create({ data: { title: p.title, description: p.description || null } });
        console.log(`Created problem: ${p.title} (id=${found.id})`);
      } else {
        console.log(`Problem exists: ${p.title} (id=${found.id})`);
      }
      createdProblems.push(found);
    }

    // Create teams and members transactionally
    for (let i = 0; i < teams.length; i++) {
      const t = teams[i];
      const existing = await prisma.team.findFirst({ where: { team_name: t.team_name } });
      let teamRecord;
      if (!existing) {
        teamRecord = await prisma.team.create({ data: { team_name: t.team_name, problem_id: null } });
        console.log(`Created team ${teamRecord.team_name} (id=${teamRecord.id})`);
      } else {
        teamRecord = existing;
        console.log(`Team exists ${teamRecord.team_name} (id=${teamRecord.id})`);
      }

      // Add members; assign first member as LEADER if member exists
      for (let mi = 0; mi < t.members.length; mi++) {
        const sic = t.members[mi];
        const role = mi === 0 ? 'LEADER' : 'MEMBER';
        // Delete existing membership if any (to ensure role)
        await prisma.teamMember.deleteMany({ where: { sic_no: sic } });
        await prisma.teamMember.create({ data: { team_id: teamRecord.id, sic_no: sic, role } });
        console.log(`Added member ${sic} to team ${teamRecord.team_name} as ${role}`);
      }
    }

    console.log('\nSeeding complete.');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
