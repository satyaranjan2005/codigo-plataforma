/**
 * Manual trigger script for case study release emails
 * Use this to test the email campaign without waiting for the scheduled time
 * 
 * Usage:
 *   node scripts/triggerCaseStudyEmails.js
 */

require('dotenv').config();
const { triggerCaseStudyReleaseEmailsNow } = require('../utils/emailScheduler');

async function main() {
  console.log('================================');
  console.log('Manual Case Study Email Trigger');
  console.log('================================\n');

  console.log('⚠️  WARNING: This will send emails to ALL team members!');
  console.log('   Make sure you want to do this before proceeding.\n');

  // Give a 5-second countdown to cancel
  console.log('Starting in 5 seconds... (Press Ctrl+C to cancel)');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('4...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('3...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('2...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('1...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('🚀 Sending emails now!\n');

  try {
    const result = await triggerCaseStudyReleaseEmailsNow();
    
    console.log('\n================================');
    console.log('Final Results:');
    console.log('================================');
    console.log('Status:', result.ok ? '✅ Success' : '❌ Failed');
    if (result.sent !== undefined) {
      console.log(`Sent: ${result.sent}/${result.total}`);
      console.log(`Skipped: ${result.skipped || 0}`);
      console.log(`Failed: ${result.failed || 0}`);
    }
    if (result.error) {
      console.error('Error:', result.error);
    }
    console.log('================================\n');

    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

main();
