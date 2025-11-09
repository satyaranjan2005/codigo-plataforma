const { PrismaClient } = require('@prisma/client');
const { sendCaseStudyReleaseEmail } = require('./resend');

const prisma = new PrismaClient();

/**
 * Configuration for case study release email
 * UPDATE THIS DATE AND TIME WHEN YOU WANT TO SEND THE EMAILS
 */
const CASE_STUDY_RELEASE_CONFIG = {
  // Set your desired date and time here (in ISO 8601 format or JavaScript Date)
  // Example: new Date('2025-01-15T10:00:00') for January 15, 2025 at 10:00 AM
  releaseDateTime: new Date('2025-11-11T22:00:00'), // November 11, 2025 at 10:00 PM
  // Timezone offset in hours (e.g., +5.5 for IST, -5 for EST)
  timezoneOffset: 0, // CHANGE THIS IF NEEDED (0 for UTC)
  
  // Enable/disable the scheduler
  enabled: true, // Set to false to disable the scheduler
};

/**
 * Send case study release emails to all team members
 * This function fetches all teams and their members, then sends personalized emails
 */
async function sendCaseStudyReleaseEmails() {
  console.log('========================================');
  console.log('Starting Case Study Release Email Campaign');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('========================================');

  try {
    // Fetch all teams with their members and student details
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            student: {
              select: {
                sic_no: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (teams.length === 0) {
      console.log('No teams found. Skipping email campaign.');
      return { ok: true, sent: 0, total: 0, message: 'No teams found' };
    }

    console.log(`Found ${teams.length} team(s)`);

    // Prepare email data for all team members
    const emailPromises = [];
    let totalMembers = 0;

    for (const team of teams) {
      if (!team.members || team.members.length === 0) {
        console.log(`Team "${team.team_name}" (ID: ${team.id}) has no members. Skipping.`);
        continue;
      }

      // Find the team leader
      const leaderMember = team.members.find(m => m.role === 'LEADER');
      const leaderSic = leaderMember?.sic_no;

      for (const member of team.members) {
        if (!member.student || !member.student.email) {
          console.log(`Member ${member.sic_no} in team "${team.team_name}" has no email. Skipping.`);
          continue;
        }

        const emailData = {
          sic_no: member.student.sic_no,
          name: member.student.name,
          email: member.student.email,
          teamName: team.team_name,
          teamId: team.id,
          isLeader: member.sic_no === leaderSic,
        };

        emailPromises.push(sendCaseStudyReleaseEmail(emailData));
        totalMembers++;
      }
    }

    console.log(`Sending emails to ${totalMembers} team member(s)...`);
    console.log('Rate limit: 2 emails per second');

    // Send emails with rate limiting: 2 emails per second
    const EMAILS_PER_SECOND = 2;
    const BATCH_SIZE = EMAILS_PER_SECOND;
    const DELAY_MS = 1000; // 1 second delay between batches

    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Process emails in batches
    for (let i = 0; i < emailPromises.length; i += BATCH_SIZE) {
      const batch = emailPromises.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(emailPromises.length / BATCH_SIZE);

      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)...`);

      // Send batch in parallel
      const batchResults = await Promise.allSettled(batch);
      const batchFulfilled = batchResults.filter((r) => r.status === "fulfilled").map((r) => r.value);
      const batchRejected = batchResults.filter((r) => r.status === "rejected");

      // Count results
      successCount += batchFulfilled.filter(r => r.ok).length;
      skippedCount += batchFulfilled.filter(r => r.skipped).length;
      failedCount += batchFulfilled.filter(r => !r.ok && !r.skipped).length + batchRejected.length;

      console.log(`Batch ${batchNumber} complete: ${batchFulfilled.filter(r => r.ok).length} sent, ${batchFulfilled.filter(r => r.skipped).length} skipped, ${batchFulfilled.filter(r => !r.ok && !r.skipped).length + batchRejected.length} failed`);

      // Wait before processing next batch (except for the last batch)
      if (i + BATCH_SIZE < emailPromises.length) {
        console.log(`Waiting ${DELAY_MS}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    console.log('========================================');
    console.log('Email Campaign Results:');
    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`📊 Total: ${totalMembers}`);
    console.log('========================================');

    return {
      ok: successCount > 0,
      sent: successCount,
      skipped: skippedCount,
      failed: failedCount,
      total: totalMembers,
    };
  } catch (err) {
    console.error('Error in sendCaseStudyReleaseEmails:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Calculate time until scheduled release
 */
function getTimeUntilRelease() {
  const now = new Date();
  const releaseTime = new Date(CASE_STUDY_RELEASE_CONFIG.releaseDateTime);
  
  // Apply timezone offset
  releaseTime.setHours(releaseTime.getHours() + CASE_STUDY_RELEASE_CONFIG.timezoneOffset);
  
  const timeUntil = releaseTime.getTime() - now.getTime();
  return { timeUntil, releaseTime };
}

/**
 * Schedule the case study release email campaign
 * This function sets up a timer to automatically send emails at the configured date/time
 */
function scheduleCaseStudyReleaseEmails() {
  if (!CASE_STUDY_RELEASE_CONFIG.enabled) {
    console.log('📧 Case study release email scheduler is DISABLED in configuration.');
    return null;
  }

  const { timeUntil, releaseTime } = getTimeUntilRelease();

  if (timeUntil <= 0) {
    console.log('⚠️  Scheduled release time has already passed!');
    console.log(`   Scheduled: ${releaseTime.toISOString()}`);
    console.log(`   Current:   ${new Date().toISOString()}`);
    console.log('   Please update CASE_STUDY_RELEASE_CONFIG.releaseDateTime to a future date.');
    return null;
  }

  // Convert milliseconds to human-readable format
  const days = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

  console.log('📧 Case Study Release Email Scheduler');
  console.log('========================================');
  console.log(`Scheduled for: ${releaseTime.toISOString()}`);
  console.log(`Current time:  ${new Date().toISOString()}`);
  console.log(`Time until release: ${days}d ${hours}h ${minutes}m`);
  console.log('========================================');

  // Schedule the email campaign
  const timeout = setTimeout(async () => {
    console.log('🚀 Scheduled time reached! Sending case study release emails...');
    await sendCaseStudyReleaseEmails();
    console.log('✅ Email campaign completed.');
  }, timeUntil);

  console.log('✅ Email scheduler started successfully.');
  console.log('   The emails will be sent automatically at the scheduled time.');
  console.log('   Keep the server running to ensure delivery.');

  // Return the timeout ID so it can be cleared if needed
  return timeout;
}

/**
 * Manually trigger the case study release email campaign (for testing)
 */
async function triggerCaseStudyReleaseEmailsNow() {
  console.log('🔧 Manually triggering case study release emails...');
  return await sendCaseStudyReleaseEmails();
}

module.exports = {
  scheduleCaseStudyReleaseEmails,
  triggerCaseStudyReleaseEmailsNow,
  sendCaseStudyReleaseEmails,
  CASE_STUDY_RELEASE_CONFIG,
};
