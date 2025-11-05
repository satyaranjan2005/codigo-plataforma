#!/usr/bin/env node
/**
 * Script: unassignProblem.js
 * Usage:
 *  node scripts/unassignProblem.js --problemId 5 [--yes]
 *  node scripts/unassignProblem.js --teamId 3 [--yes]
 *  node scripts/unassignProblem.js --all [--yes]
 *
 * This script will clear the problem assignment by setting Team.problem_id = null
 * for the selected rows. The relation is stored on the Team side in the schema,
 * so we update Team records rather than ProblemStatement.
 */

const { PrismaClient } = require('@prisma/client');
const minimist = require('minimist');

async function main() {
  const prisma = new PrismaClient();
  const argv = minimist(process.argv.slice(2), { alias: { h: 'help' } });

  if (argv.help) {
    console.log('Usage: node scripts/unassignProblem.js --problemId <id> | --teamId <id> | --all [--yes]');
    process.exit(0);
  }

  const confirm = Boolean(argv.yes || argv.y);
  const problemId = argv.problemId || argv.problem_id || argv.p;
  const teamId = argv.teamId || argv.team_id || argv.t;
  const all = argv.all || false;

  if (!problemId && !teamId && !all) {
    console.error('Error: specify --problemId or --teamId or --all');
    process.exit(1);
  }

  console.log('Running unassignProblem with options:', { problemId, teamId, all, confirm });

  if (!confirm) {
    console.log('Dry run: pass --yes to perform the operation.');
    // Show what would be done
    if (all) {
      const count = await prisma.team.count({ where: { problem_id: { not: null } } });
      console.log(`Teams with assigned problems: ${count}`);
    } else if (problemId) {
      const count = await prisma.team.count({ where: { problem_id: Number(problemId) } });
      console.log(`Teams assigned to problem ${problemId}: ${count}`);
    } else if (teamId) {
      const team = await prisma.team.findUnique({ where: { id: Number(teamId) }, select: { id: true, team_name: true, problem_id: true } });
      if (!team) console.log(`Team ${teamId} not found`);
      else console.log(`Team ${teamId} (${team.team_name}) currently has problem_id=${team.problem_id}`);
    }
    await prisma.$disconnect();
    process.exit(0);
  }

  try {
    if (all) {
      const res = await prisma.team.updateMany({ where: { problem_id: { not: null } }, data: { problem_id: null } });
      console.log(`Cleared problem assignment on ${res.count} teams.`);
      await prisma.$disconnect();
      process.exit(0);
    }

    if (problemId) {
      const res = await prisma.team.updateMany({ where: { problem_id: Number(problemId) }, data: { problem_id: null } });
      console.log(`Cleared problem assignment for problem ${problemId} on ${res.count} teams.`);
      await prisma.$disconnect();
      process.exit(0);
    }

    if (teamId) {
      const updated = await prisma.team.update({ where: { id: Number(teamId) }, data: { problem_id: null } });
      console.log(`Cleared problem assignment for team ${teamId} (now problem_id=${updated.problem_id}).`);
      await prisma.$disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error('Error while unassigning problem(s):', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
