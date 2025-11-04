#!/usr/bin/env node
require('dotenv').config();
const readline = require('readline');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setRole(sic_no, role) {
  try {
    const user = await prisma.student.findUnique({ where: { sic_no } });
    if (!user) {
      console.error(`Student with sic_no '${sic_no}' not found.`);
      process.exitCode = 2;
      return;
    }

    console.log(`Current role for ${sic_no}: ${user.role}`);
    const updated = await prisma.student.update({
      where: { sic_no },
      data: { role },
      select: { sic_no: true, name: true, email: true, role: true },
    });

    console.log('Updated:', updated);
  } catch (err) {
    console.error('Error updating role:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

function confirmAndRun(sic_no, role) {
  const args = process.argv.slice(2);
  if (args.includes('--yes') || args.includes('-y')) {
    return setRole(sic_no, role);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(`Are you sure you want to set role='${role}' for student '${sic_no}'? (yes/no) `, (answer) => {
    rl.close();
    if (answer.trim().toLowerCase() === 'yes' || answer.trim().toLowerCase() === 'y') {
      setRole(sic_no, role);
    } else {
      console.log('Aborted.');
      process.exit(0);
    }
  });
}

// Defaults per user's request
const DEFAULT_SIC = '23bcsn72';
const DEFAULT_ROLE = 'SUPERADMIN';

const argv = require('minimist')(process.argv.slice(2));
const sic = argv.sic || argv.s || DEFAULT_SIC;
const role = (argv.role || argv.r || DEFAULT_ROLE).toUpperCase();

confirmAndRun(sic, role);
