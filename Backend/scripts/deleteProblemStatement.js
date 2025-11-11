#!/usr/bin/env node
/**
 * Delete Problem Statement Script
 * Usage:
 *  node scripts/deleteProblemStatement.js <problem_id> --yes
 *
 * Example:
 *  node scripts/deleteProblemStatement.js 7 --yes
 *
 * By default it performs a dry-run and shows what will be deleted.
 */

const { PrismaClient } = require('@prisma/client');
const minimist = require('minimist');

const prisma = new PrismaClient();

async function main() {
  const argv = minimist(process.argv.slice(2));
  const apply = Boolean(argv.yes || argv.y);
  const problemId = argv._[0];

  if (!problemId) {
    console.error('Error: Please provide a problem statement ID.');
    console.log('Usage: node scripts/deleteProblemStatement.js <problem_id> --yes');
    console.log('Example: node scripts/deleteProblemStatement.js 7 --yes');
    process.exit(1);
  }

  const id = parseInt(problemId, 10);
  if (isNaN(id)) {
    console.error('Error: Problem ID must be a valid number.');
    process.exit(1);
  }

  try {
    // Find the problem statement
    const problem = await prisma.problemStatement.findUnique({
      where: { id },
      include: {
        teams: {
          select: {
            id: true,
            team_name: true,
          }
        }
      }
    });

    if (!problem) {
      console.error(`Error: Problem statement with ID ${id} not found.`);
      process.exit(1);
    }

    console.log('========================================');
    console.log('Problem Statement Details:');
    console.log('========================================');
    console.log(`ID: ${problem.id}`);
    console.log(`Title: ${problem.title}`);
    console.log(`Description: ${problem.description || '(none)'}`);
    console.log(`Teams assigned: ${problem.teams.length}`);
    
    if (problem.teams.length > 0) {
      console.log('\nTeams that will be affected:');
      problem.teams.forEach(team => {
        console.log(`  - ${team.team_name} (ID: ${team.id})`);
      });
      console.log('\nNote: These teams will have their problem_id set to NULL.');
    }

    console.log('========================================');

    if (!apply) {
      console.log('\nDry run complete. Add --yes to perform deletion.');
      await prisma.$disconnect();
      return;
    }

    console.log('\nDeleting problem statement...');

    // First, update all teams to remove the problem assignment
    if (problem.teams.length > 0) {
      const updateResult = await prisma.team.updateMany({
        where: { problem_id: id },
        data: { problem_id: null }
      });
      console.log(`Updated ${updateResult.count} team(s) to remove problem assignment.`);
    }

    // Now delete the problem statement
    await prisma.problemStatement.delete({
      where: { id }
    });

    console.log(`✅ Problem statement "${problem.title}" (ID: ${id}) deleted successfully.`);
    console.log('========================================');

  } catch (err) {
    console.error('Error during deletion:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
