#!/usr/bin/env node
/**
 * Script: nullifyAllProblems.js
 * Usage:
 *  node scripts/nullifyAllProblems.js --yes
 *
 * Clears all `problem_id` values on the Team table (sets to null).
 * Requires --yes to perform the operation to avoid accidental data loss.
 */

const { PrismaClient } = require('@prisma/client');
const minimist = require('minimist');

async function main() {
  const prisma = new PrismaClient();
  const argv = minimist(process.argv.slice(2), { alias: { h: 'help' } });

  if (argv.help) {
    console.log('Usage: node scripts/nullifyAllProblems.js --yes');
    process.exit(0);
  }

  const confirm = Boolean(argv.yes || argv.y);
  if (!confirm) {
    const count = await prisma.team.count({ where: { problem_id: { not: null } } });
    console.log(`Teams with assigned problems: ${count}`);
    console.log('Dry run: add --yes to actually clear all problem assignments.');
    await prisma.$disconnect();
    process.exit(0);
  }

  try {
    const res = await prisma.team.updateMany({ where: { problem_id: { not: null } }, data: { problem_id: null } });
    console.log(`Cleared problem assignment on ${res.count} teams.`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error clearing problem assignments:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
