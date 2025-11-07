#!/usr/bin/env node
/**
 * Script: addSuperadmin.js
 * Usage:
 *  node scripts/addSuperadmin.js
 *  node scripts/addSuperadmin.js --sic_no 23bcsn72 --name "Satya R" --email satya@example.com --phone 9999999990 --password pass123 --yes
 *
 * Adds a single SUPERADMIN user to the Student table.
 * Prompts for details if not provided via CLI args.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const minimist = require('minimist');
const readline = require('readline');

const prisma = new PrismaClient();

// Default user details - modify these values as needed
const DEFAULT_USER = {
  sic_no: '23bcsn72',
  name: 'Satya R',
  email: 'satya@example.com',
  phone_no: '9999999990',
  password: 'satya@satya',
  role: 'SUPERADMIN',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  const argv = minimist(process.argv.slice(2), { alias: { h: 'help' } });

  if (argv.help) {
    console.log('Usage: node scripts/addSuperadmin.js [--sic_no X --name "Y" --email Z --phone P --password W --yes]');
    console.log('Adds a SUPERADMIN user to the Student table.');
    process.exit(0);
  }

  const confirm = Boolean(argv.yes || argv.y);

  let sic_no = argv.sic_no || argv.sic || DEFAULT_USER.sic_no;
  let name = argv.name || DEFAULT_USER.name;
  let email = argv.email || DEFAULT_USER.email;
  let phone_no = argv.phone_no || argv.phone || DEFAULT_USER.phone_no;
  let password = argv.password || DEFAULT_USER.password;

  // Prompt for missing fields (only if defaults are also empty)
  if (!sic_no) sic_no = await prompt('Enter SIC number: ');
  if (!name) name = await prompt('Enter full name: ');
  if (!email) email = await prompt('Enter email: ');
  if (!phone_no) phone_no = await prompt('Enter phone number (optional, press Enter to skip): ');
  if (!password) password = await prompt('Enter password: ');

  if (!sic_no || !name || !email || !password) {
    console.error('Error: sic_no, name, email, and password are required.');
    rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }

  // Calculate year from sic_no
  const sicStr = String(sic_no);
  if (sicStr.length < 2) {
    console.error('Error: Invalid sic_no (too short).');
    rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }

  const yearEnumMap = { 25: 'FIRST', 24: 'SECOND', 23: 'THIRD', 22: 'FOURTH' };
  const yearPrefix = sicStr.slice(0, 2);
  const yearEnum = yearEnumMap[yearPrefix];

  if (!yearEnum) {
    console.error(`Error: Invalid sic_no prefix for year calculation. Allowed: 25, 24, 23, 22. Got: ${yearPrefix}`);
    rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('\n=== User Details ===');
  console.log(`SIC: ${sic_no}`);
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Phone: ${phone_no || 'N/A'}`);
  console.log(`Year: ${yearEnum}`);
  console.log(`Role: SUPERADMIN`);

  if (!confirm) {
    const answer = await prompt('\nAdd this user? (yes/no): ');
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      rl.close();
      await prisma.$disconnect();
      process.exit(0);
    }
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.student.create({
      data: {
        sic_no,
        name,
        email,
        phone_no: phone_no || null,
        password: hashed,
        role: 'SUPERADMIN',
        year: yearEnum,
      },
      select: { sic_no: true, name: true, email: true, role: true, year: true },
    });

    console.log('\n✓ SUPERADMIN user created successfully:');
    console.log(user);
    rl.close();
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    if (err.code === 'P2002') {
      const target = err.meta && err.meta.target ? err.meta.target.join(', ') : 'field';
      console.error(`\nError: Unique constraint failed on ${target}. User may already exist.`);
    } else {
      console.error('\nError creating user:', err.message || err);
    }
    rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
