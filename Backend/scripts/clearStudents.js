#!/usr/bin/env node
require('dotenv').config();
const readline = require('readline');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearStudents() {
  try {
    console.log('Deleting all TeamMember records (to avoid FK constraint)...');
    const deletedMembers = await prisma.teamMember.deleteMany();
    console.log(`Deleted TeamMember records: ${deletedMembers.count}`);

    console.log('Deleting all Student records...');
    const deletedStudents = await prisma.student.deleteMany();
    console.log(`Deleted Student records: ${deletedStudents.count}`);

    console.log('Done.');
  } catch (err) {
    console.error('Error while clearing students:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

function confirmAndRun() {
  const args = process.argv.slice(2);
  if (args.includes('--yes') || args.includes('-y')) {
    return clearStudents();
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('This will DELETE all students (and team memberships). Are you sure? (yes/no) ', (answer) => {
    rl.close();
    if (answer.trim().toLowerCase() === 'yes' || answer.trim().toLowerCase() === 'y') {
      clearStudents();
    } else {
      console.log('Aborted.');
      process.exit(0);
    }
  });
}

confirmAndRun();
