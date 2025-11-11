#!/usr/bin/env node
require('dotenv').config();
const readline = require('readline');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Update password for a user
 * @param {string} sic_no - Student's SIC number
 * @param {string} newPassword - New password (plain text, will be hashed)
 */
async function updatePassword(sic_no, newPassword) {
  try {
    // Check if user exists
    const user = await prisma.student.findUnique({ 
      where: { sic_no },
      select: { sic_no: true, name: true, email: true }
    });

    if (!user) {
      console.error(`❌ Student with SIC number '${sic_no}' not found.`);
      process.exitCode = 2;
      return;
    }

    console.log(`\n📋 User found:`);
    console.log(`   SIC: ${user.sic_no}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}\n`);

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password
    await prisma.student.update({
      where: { sic_no },
      data: { password: hashedPassword },
    });

    console.log('✅ Password updated successfully!\n');
  } catch (err) {
    console.error('❌ Error updating password:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Prompt for password input (hidden)
 */
function promptPassword(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Hide password input
    const stdin = process.stdin;
    stdin.on('data', (char) => {
      char = char.toString();
      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.pause();
          break;
        default:
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(prompt + '*'.repeat(rl.line.length));
          break;
      }
    });

    rl.question(prompt, (password) => {
      rl.close();
      console.log(); // New line after password input
      resolve(password);
    });
  });
}

/**
 * Main function with confirmation
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Show usage if no arguments
  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         Update User Password Script                        ║
╚════════════════════════════════════════════════════════════╝

Usage:
  node updatePassword.js <sic_no> [options]

Options:
  --password <password>    Specify password directly (not recommended)
  --yes, -y                Skip confirmation prompt

Examples:
  # Interactive mode (recommended - prompts for password)
  node updatePassword.js 23bcsn72

  # With confirmation skip
  node updatePassword.js 23bcsn72 --yes

  # With password in command (NOT RECOMMENDED - visible in history)
  node updatePassword.js 23bcsn72 --password newPass123 --yes

Notes:
  - Passwords are hashed using bcrypt before storing
  - Use interactive mode to avoid exposing passwords in command history
  - The user will be able to log in with the new password immediately
    `);
    process.exit(0);
  }

  const sic_no = args[0];
  
  // Check if password provided via flag
  const passwordFlagIndex = args.indexOf('--password');
  let newPassword;

  if (passwordFlagIndex !== -1 && args[passwordFlagIndex + 1]) {
    newPassword = args[passwordFlagIndex + 1];
    console.log('⚠️  Warning: Providing password via command line is not secure!');
  } else {
    // Interactive password prompt
    newPassword = await promptPassword('Enter new password: ');
    
    if (!newPassword || newPassword.trim().length === 0) {
      console.error('❌ Password cannot be empty.');
      process.exit(1);
    }

    const confirmPassword = await promptPassword('Confirm new password: ');
    
    if (newPassword !== confirmPassword) {
      console.error('❌ Passwords do not match.');
      process.exit(1);
    }
  }

  // Confirm before updating
  if (args.includes('--yes') || args.includes('-y')) {
    await updatePassword(sic_no, newPassword);
  } else {
    const rl = readline.createInterface({ 
      input: process.stdin, 
      output: process.stdout 
    });

    rl.question(`\n⚠️  Update password for student '${sic_no}'? (yes/no) `, async (answer) => {
      rl.close();
      if (answer.trim().toLowerCase() === 'yes' || answer.trim().toLowerCase() === 'y') {
        await updatePassword(sic_no, newPassword);
      } else {
        console.log('❌ Aborted.');
        process.exit(0);
      }
    });
  }
}

// Run the script
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
