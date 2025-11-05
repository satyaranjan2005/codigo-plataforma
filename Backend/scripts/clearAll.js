#!/usr/bin/env node
/**
 * Script: clearAll.js
 * Usage:
 *  node scripts/clearAll.js --yes [--reset]
 *
 * This will delete all rows from tables in the correct order to satisfy FK
 * constraints: TeamMember -> Team -> ProblemStatement -> Student
 *
 * If --reset is passed, the script will also reset AUTO_INCREMENT for each table (MySQL).
 */

const { PrismaClient } = require('@prisma/client');
const minimist = require('minimist');

async function main() {
  const prisma = new PrismaClient();
  const argv = minimist(process.argv.slice(2), { alias: { h: 'help' } });

  if (argv.help) {
    console.log('Usage: node scripts/clearAll.js --yes [--reset]');
    process.exit(0);
  }

  const confirm = Boolean(argv.yes || argv.y);
  const reset = Boolean(argv.reset || argv.r);

  try {
    // Dry-run counts
    const counts = await Promise.all([
      prisma.teamMember.count(),
      prisma.team.count(),
      prisma.problemStatement.count(),
      prisma.student.count(),
    ]);

    const [teamMemberCount, teamCount, problemCount, studentCount] = counts;
    console.log('Counts (dry-run):');
    console.log(`  TeamMember: ${teamMemberCount}`);
    console.log(`  Team:       ${teamCount}`);
    console.log(`  Problem:    ${problemCount}`);
    console.log(`  Student:    ${studentCount}`);

    if (!confirm) {
      console.log('\nDry run only. Add --yes to perform deletion.');
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log('\nProceeding to delete all rows...');

    // Perform deletions in a transaction (order matters for FK constraints)
    await prisma.$transaction([
      prisma.teamMember.deleteMany({}),
      prisma.team.deleteMany({}),
      prisma.problemStatement.deleteMany({}),
      prisma.student.deleteMany({}),
    ]);

    console.log('All rows deleted successfully.');

    if (reset) {
      console.log('Resetting AUTO_INCREMENT for MySQL tables...');
      const tables = ['TeamMember', 'Team', 'ProblemStatement', 'Student'];
      // Prisma model names map to table names by default lower-case? Use lowercase underscore? 
      // We'll attempt to reset common MySQL table names using the actual table names from schema: Team, TeamMember, ProblemStatement, Student
      // Note: Prisma may create tables with the same names; adjust if your DB uses different naming.
      const sqlTables = ['team_member', 'team', 'problem_statement', 'student'];
      for (const t of sqlTables) {
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`);
          console.log(`Reset AUTO_INCREMENT on ${t}`);
        } catch (err) {
          console.warn(`Could not reset AUTO_INCREMENT on ${t}:`, err.message || err);
        }
      }
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error clearing tables:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
