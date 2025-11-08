const { Resend } = require("resend");

// sendWelcomeEmail(to, name, sic_no)
// Uses RESEND_API_KEY from environment. If not provided, logs the email to console.
function createClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function sendWelcomeEmail(toEmail, name, sic_no) {
  const client = createClient();

  const from = "Codigo Plataforma <info@codigoplataforma.tech>";
  const subject =
    process.env.WELCOME_SUBJECT || "Welcome to the Codigo Plataforma";

  const appUrl =
    process.env.FRONTEND_URL || "https://codigoplataforma.tech";
  const supportEmail = "siliconcodingclub@gmail.com";
  const logo = "./logo.svg";

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Welcome to Codigo Plataforma</title>
    <!-- Google Font -->
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
      :root{
        --bg:#f7f7f8;
        --card:#ffffff;
        --text:#0f172a;
        --muted:#64748b;
        --orange-500:#f97316; /* primary */
        --orange-400:#ff9a56;
        --orange-600:#dd5b00;
        --radius:12px;
      }
      html,body{height:100%;margin:0}
      body{
        font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
        background:linear-gradient(180deg,var(--bg),#ffffff);
        color:var(--text);
        -webkit-font-smoothing:antialiased;
        -moz-osx-font-smoothing:grayscale;
        padding:32px 16px;
      }
      .center{max-width:720px;margin:0 auto}
      .card{background:var(--card);border-radius:var(--radius);box-shadow:0 10px 30px rgba(16,24,40,0.08);overflow:hidden}
      .header{
        display:flex;align-items:center;gap:14px;padding:20px 24px;background:linear-gradient(90deg,var(--orange-600),var(--orange-500));color:#fff
      }
  .logo{display:flex;align-items:center;gap:12px}
      .brand{font-weight:700;font-size:18px;letter-spacing:0.2px}
      .body{padding:28px 32px}
      h1{margin:0 0 12px 0;font-size:22px}
      p.lead{margin:0 0 18px 0;color:var(--muted);line-height:1.5}
      .details{width:100%;border-collapse:collapse;margin-top:16px}
      .details td{padding:12px;border:1px solid #eef2e9}
      .label{background:#fff7f2;color:var(--text);font-weight:600;width:34%}
      .cta{display:inline-block;margin-top:16px;padding:12px 18px;background:var(--orange-500);color:#fff;border-radius:8px;text-decoration:none;font-weight:600}
  .muted{color:var(--muted);font-size:13px}
  .footer{padding:16px 24px;background:#fbfbfb;color:var(--muted);font-size:13px;text-align:center}
  .support-link{color:var(--orange-600);text-decoration:none}
  .footer-note{margin-top:8px;color:var(--muted)}
  .copyright{margin-top:10px;color:#9aa3b2;font-size:12px}
      @media (max-width:640px){
        .center{padding:0 8px}
        .body{padding:20px}
        .header{padding:16px}
      }
    </style>
  </head>
  <body>
    <div class="center">
      <div class="card" role="article" aria-label="Welcome email">
        <div class="header">
          <div class="logo">
            <div class="brand">Codigo Plataforma</div>
          </div>
        </div>

        <div class="body">
          <h1>Welcome${name ? `, ${name}` : ""} 👋</h1>
          <p class="lead">Thanks for joining Codigo Plataforma. We're happy to have you — below are your account details. Keep them safe and reach out if you need help.</p>

          <table class="details" role="table">
            <tr>
              <td class="label">SIC Number</td>
              <td>${sic_no || "—"}</td>
            </tr>
            <tr>
              <td class="label">Email</td>
              <td>${toEmail}</td>
            </tr>
          </table>

          <a class="cta" href="${appUrl}" role="button">Go to Codigo Plataforma</a>
        </div>

        <div class="footer">
          <div class="muted">If you didn't create this account, please contact us at <a href="mailto:${supportEmail}" class="support-link">${supportEmail}</a>.</div>
          <div class="footer-note">Thanks — The Codigo Plataforma Team</div>
          <div class="copyright">© ${new Date().getFullYear()} Codigo Plataforma. All rights reserved.</div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  if (!client) {
    // For local/dev without RESEND_API_KEY, just log the email payload
    console.log("RESEND_API_KEY not set — skipping email. Payload: ", {
      toEmail,
      subject,
      html,
    });
    return { ok: false, skipped: true };
  }

  try {
    const resp = await client.emails.send({
      from,
      to: [toEmail],
      subject,
      html,
    });
    console.log("sendWelcomeEmail sent:", resp);
    return { ok: true, data: resp };
  } catch (err) {
    console.error("sendWelcomeEmail error:", err);
    return { ok: false, error: err };
  }
}

/**
 * Send team creation email to all team members
 * @param {Object} teamData - Team information
 * @param {number} teamData.teamId - Team ID
 * @param {string} teamData.teamName - Team name
 * @param {Array} teamData.members - Array of team members with {sic_no, name, email, role}
 * @param {string} leaderSic - SIC number of the team leader
 * @returns {Promise<{ok: boolean, data?: any, error?: any, results?: Array}>}
 */
async function sendTeamCreationEmail(teamData, leaderSic) {
  const { teamId, teamName, members } = teamData;
  
  if (!teamId || !teamName || !members || !Array.isArray(members) || members.length === 0) {
    console.error("Invalid team data provided to sendTeamCreationEmail");
    return { ok: false, error: "Invalid team data" };
  }

  const client = createClient();
  const from = "Codigo Plataforma <info@codigoplataforma.tech>";
  const appUrl = process.env.FRONTEND_URL || "https://codigoplataforma.tech";
  const supportEmail = "siliconcodingclub@gmail.com";

  // Send individual email to each team member
  const emailPromises = members.map(async (member) => {
    const { sic_no, name, email, role } = member;
    const isLeader = String(sic_no) === String(leaderSic);
    const subject = `Team "${teamName}" Created - Codigo Plataforma`;

    // Build member list HTML
    const memberListHtml = members
      .map((m) => {
        const mIsLeader = String(m.sic_no) === String(leaderSic);
        const roleLabel = mIsLeader ? '<strong style="color: #4f46e5;">Leader</strong>' : 'Member';
        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.name || m.sic_no}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${m.sic_no}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${roleLabel}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
    <style>
      /* Design tokens */
      :root{
        --bg-start: #fff7ed;
        --bg-end: #fff3e0;
        --card-bg: #ffffff;
        --text: #1f2937;
        --muted: #4b5563;
        --orange-600: #dd5b00;
        --orange-500: #f97316;
        --radius: 12px;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background: linear-gradient(135deg, var(--bg-start) 0%, var(--bg-end) 100%);
        color: var(--text);
      }
      .wrapper {
        min-height: 100vh;
        padding: 40px 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .container {
        max-width: 600px;
        width: 100%;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(90deg, var(--orange-600) 0%, var(--orange-500) 100%);
        color: #ffffff;
        padding: 36px 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      .content {
        padding: 40px 30px;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 20px;
      }
      .message {
        font-size: 15px;
        line-height: 1.6;
        color: #4b5563;
        margin-bottom: 25px;
      }
      .info-box {
        background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
        border-left: 4px solid var(--orange-500);
      }
      .info-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6b7280;
        margin-bottom: 8px;
        font-weight: 600;
      }
      .info-value {
        font-size: 18px;
        font-weight: 700;
        color: #111827;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 14px;
      }
      table thead {
        background-color: #f9fafb;
      }
      table th {
        padding: 12px 8px;
        text-align: left;
        font-weight: 600;
        color: #374151;
        border-bottom: 2px solid #e5e7eb;
      }
      table td {
        padding: 8px;
        border-bottom: 1px solid #e5e7eb;
        color: #4b5563;
      }
      .cta {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 28px;
        background: linear-gradient(90deg,var(--orange-600),var(--orange-500));
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 10px;
        font-weight: 700;
        font-size: 15px;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
        box-shadow: 0 6px 18px rgba(249,115,22,0.12);
      }
      .cta:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(249,115,22,0.16); }
      .cta:focus-visible { outline: 3px solid rgba(249,115,22,0.18); outline-offset: 3px; }
      .footer {
        padding: 30px;
        background-color: #f9fafb;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
        line-height: 1.6;
      }
      .muted {
        margin-bottom: 12px;
      }
      .support-link {
        color: var(--orange-600);
        text-decoration: none;
        font-weight: 600;
      }
      .footer-note {
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
      }
      .copyright {
        font-size: 12px;
        color: #9ca3af;
      }
      .role-badge {
        display: inline-block;
        padding: 4px 12px;
        background-color: var(--orange-500);
        color: #ffffff;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        margin-top: 8px;
      }

      /* Accessibility: skip link (visually hidden until focused) */
      .skip-link{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden}
      .skip-link:focus, .skip-link:active{position:static;display:block;padding:8px 12px;margin:12px auto;border-radius:6px;background:#111;color:#fff;width:auto;left:auto;height:auto;overflow:visible}

      /* utility */
      .info-label--spaced{margin-top:15px}
    </style>
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="wrapper">
  <main class="container" id="main-content" role="main">
        <div class="header">
          <h1>🎉 Team Created Successfully!</h1>
        </div>

        <div class="content">
          <div class="greeting">Hello ${name || sic_no},</div>

          <div class="message">
            ${isLeader 
              ? `Congratulations! You have successfully created the team <strong>"${teamName}"</strong>. As the team leader, you can now manage your team and register for problem statements.`
              : `You have been added to the team <strong>"${teamName}"</strong>. Welcome aboard!`
            }
          </div>

              <div class="info-box">
                <div class="info-label">Team Name</div>
                <div class="info-value">${teamName}</div>
                <div class="info-label info-label--spaced">Team ID</div>
                <div class="info-value">#${teamId}</div>
                <div class="role-badge">${isLeader ? 'Team Leader' : 'Team Member'}</div>
              </div>

          <div class="message">
            <strong>Team Members:</strong>
          </div>

          <table role="table" aria-label="Team members">
            <thead>
              <tr>
                <th>Name</th>
                <th>SIC Number</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              ${memberListHtml}
            </tbody>
          </table>

          <div class="message">
            ${isLeader
              ? 'After the release of the case study, you can register your team and collaborate with your team members.'
              : 'After the release of the case study, your team leader will be able to register the team. You can view the case study after its release.'
            }
          </div>

          <a class="cta" href="${appUrl}/event" role="button">Go to Dashboard</a>
        </div>

        <div class="footer">
          <div class="muted">If you have any questions or need assistance, contact us at <a href="mailto:${supportEmail}" class="support-link">${supportEmail}</a>.</div>
          <div class="footer-note">Thanks — The Codigo Plataforma Team</div>
          <div class="copyright">© ${new Date().getFullYear()} Codigo Plataforma. All rights reserved.</div>
        </div>
      </main>
    </div>
  </body>
</html>
    `;

    if (!client) {
      console.log("RESEND_API_KEY not set — skipping team email. Payload: ", {
        toEmail: email,
        subject,
      });
      return { ok: false, skipped: true, member: sic_no };
    }

    try {
      const resp = await client.emails.send({
        from,
        to: [email],
        subject,
        html,
      });
      console.log(`Team creation email sent to ${email}:`, resp);
      return { ok: true, data: resp, member: sic_no };
    } catch (err) {
      console.error(`Error sending team creation email to ${email}:`, err);
      return { ok: false, error: err, member: sic_no };
    }
  });

  try {
    const results = await Promise.allSettled(emailPromises);
    const fulfilled = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    const rejected = results.filter((r) => r.status === "rejected");

    const allSuccess = fulfilled.every((r) => r.ok);
    const someSuccess = fulfilled.some((r) => r.ok);

    console.log(`Team creation emails: ${fulfilled.filter(r => r.ok).length}/${members.length} sent successfully`);

    if (rejected.length > 0) {
      console.error("Some team creation emails were rejected:", rejected);
    }

    return {
      ok: allSuccess,
      partial: someSuccess && !allSuccess,
      results: fulfilled,
      sent: fulfilled.filter(r => r.ok).length,
      total: members.length
    };
  } catch (err) {
    console.error("Error in sendTeamCreationEmail:", err);
    return { ok: false, error: err };
  }
}

/**
 * Send case study release announcement email to all team members
 * @param {Object} member - Member information
 * @param {string} member.sic_no - Student's SIC number
 * @param {string} member.name - Student's name
 * @param {string} member.email - Student's email
 * @param {string} member.teamName - Team name
 * @param {number} member.teamId - Team ID
 * @param {boolean} member.isLeader - Whether the member is team leader
 * @returns {Promise<{ok: boolean, data?: any, error?: any}>}
 */
async function sendCaseStudyReleaseEmail(member) {
  const { sic_no, name, email, teamName, teamId, isLeader } = member;
  
  if (!email || !teamName) {
    console.error("Invalid member data provided to sendCaseStudyReleaseEmail");
    return { ok: false, error: "Invalid member data" };
  }

  const client = createClient();
  const from = "Codigo Plataforma <info@codigoplataforma.tech>";
  const subject = "🚀 Case Studies Released - Register Your Team Now!";
  const appUrl = process.env.FRONTEND_URL || "https://codigoplataforma.tech";
  const supportEmail = "siliconcodingclub@gmail.com";

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #1f2937;
      }
      .wrapper {
        min-height: 100vh;
        padding: 40px 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .container {
        max-width: 600px;
        width: 100%;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(90deg, #dd5b00 0%, #f97316 100%);
        color: #ffffff;
        padding: 40px 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      .header .emoji {
        font-size: 48px;
        margin-bottom: 10px;
      }
      .content {
        padding: 40px 30px;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 20px;
      }
      .message {
        font-size: 15px;
        line-height: 1.6;
        color: #4b5563;
        margin-bottom: 25px;
      }
      .highlight-box {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
        border-left: 4px solid #f59e0b;
      }
      .highlight-box strong {
        color: #92400e;
        font-size: 16px;
      }
      .info-box {
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
        border-left: 4px solid #f97316;
      }
      .info-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6b7280;
        margin-bottom: 8px;
        font-weight: 600;
      }
      .info-value {
        font-size: 18px;
        font-weight: 700;
        color: #111827;
      }
      .info-label--spaced{margin-top:15px}
      .divider{height:1px;background:#eef2f6;margin:18px 0;border-radius:2px}
  .cta:focus-visible{outline:3px solid rgba(249,115,22,0.18);outline-offset:3px}
      .cta {
        display: inline-block;
        margin-top: 20px;
        padding: 16px 40px;
        background: linear-gradient(90deg, #dd5b00 0%, #f97316 100%);
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        transition: transform 0.2s;
        box-shadow: 0 6px 18px rgba(249,115,22,0.12);
      }
      .cta:hover {
        transform: translateY(-2px);
      }
      .features {
        background: #f9fafb;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .features ul {
        margin: 10px 0;
        padding-left: 20px;
      }
      .features li {
        margin: 8px 0;
        color: #4b5563;
      }
      .footer {
        padding: 30px;
        background-color: #f9fafb;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
        line-height: 1.6;
      }
      .muted {
        margin-bottom: 12px;
      }
      .support-link {
        color: #f97316;
        text-decoration: none;
        font-weight: 600;
      }
      .footer-note {
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
      }
      .copyright {
        font-size: 12px;
        color: #9ca3af;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>Case Studies Are Now Live!</h1>
        </div>

        <div class="content">
          <div class="greeting">Hello ${name || sic_no},</div>

          <div class="message">
            Exciting news! The case studies for Codigo Plataforma are now officially released. 
            ${isLeader 
              ? `As the leader of team <strong>"${teamName}"</strong>, you can now register your team for a case study.`
              : `Your team <strong>"${teamName}"</strong> can now register for a case study. Contact your team leader to get started.`
            }
          </div>

          <div class="highlight-box">
            <strong>⚡ Action Required</strong><br/>
            ${isLeader 
              ? 'Register your team for a case study before slots fill up!'
              : 'Coordinate with your team leader to select and register for a case study.'
            }
          </div>

          <div class="info-box">
            <div class="info-label">Your Team</div>
            <div class="info-value">${teamName}</div>
            <div class="info-label info-label--spaced">Team ID</div>
            <div class="info-value">#${teamId}</div>
          </div>

          <div class="message">
            <strong>What's Next?</strong>
          </div>

          <div class="features">
            <ul>${featuresListHtml || (isLeader ? '<li>Browse available case studies on the website</li><li>Discuss with your team members and select a case study</li><li>Register your team before slots are filled</li><li>Start working on your solution</li>' : '<li>View available case studies on the website</li><li>Discuss options with your team</li><li>Support your team leader in the selection process</li><li>Prepare to collaborate on your chosen case study</li>')}</ul>
          </div>

          <div class="message">
            ${isLeader 
              ? 'Click the button below to view and register for case studies. Don\'t wait — popular case studies fill quickly!'
              : 'Visit the dashboard to see all available case studies and discuss with your team.'
            }
          </div>

          <a class="cta" href="${appUrl}/event" role="button" aria-label="${isLeader ? 'Register your team for a case study' : 'View case studies on the dashboard'}" rel="noopener">
            ${isLeader ? 'Register Your Case Study Now' : 'View Case Studies'}
          </a>
        </div>

        <div class="footer">
          <div class="muted">Need help? Contact us at <a href="mailto:${supportEmail}" class="support-link">${supportEmail}</a>.</div>
          <div class="footer-note">Good luck — The Codigo Plataforma Team</div>
          <div class="copyright">© ${new Date().getFullYear()} Codigo Plataforma. All rights reserved.</div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  if (!client) {
    console.log("RESEND_API_KEY not set — skipping case study release email. Payload: ", {
      toEmail: email,
      subject,
    });
    return { ok: false, skipped: true, member: sic_no };
  }

  try {
    const resp = await client.emails.send({
      from,
      to: [email],
      subject,
      html,
    });
    console.log(`Case study release email sent to ${email}:`, resp);
    return { ok: true, data: resp, member: sic_no };
  } catch (err) {
    console.error(`Error sending case study release email to ${email}:`, err);
    return { ok: false, error: err, member: sic_no };
  }
}

/**
 * Send role promotion email to user when promoted to ADMIN or SUPERADMIN
 * @param {Object} userData - User information
 * @param {string} userData.sic_no - Student's SIC number
 * @param {string} userData.name - Student's name
 * @param {string} userData.email - Student's email
 * @param {string} userData.newRole - New role (ADMIN or SUPERADMIN)
 * @param {string} userData.oldRole - Previous role (MEMBER)
 * @returns {Promise<{ok: boolean, data?: any, error?: any}>}
 */
async function sendRolePromotionEmail(userData) {
  const { sic_no, name, email, newRole, oldRole } = userData;
  
  if (!email || !newRole) {
    console.error("Invalid user data provided to sendRolePromotionEmail");
    return { ok: false, error: "Invalid user data" };
  }

  const client = createClient();
  const from = "Codigo Plataforma <info@codigoplataforma.tech>";
  const isSuperAdmin = String(newRole).toUpperCase() === 'SUPERADMIN';
  const subject = `🎉 You've Been Promoted to ${isSuperAdmin ? 'Super Admin' : 'Admin'} - Codigo Plataforma`;
  const appUrl = process.env.FRONTEND_URL || "https://codigoplataforma.tech";
  const supportEmail = "siliconcodingclub@gmail.com";

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
    <style>
      :root{
        --bg-start:#fff7ed;
        --bg-end:#fff3e0;
        --card:#ffffff;
        --text:#1f2937;
        --muted:#6b7280;
        --orange-500:#f97316;
        --orange-600:#dd5b00;
        --accent:#f59e0b;
        --radius:12px;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background: linear-gradient(135deg, var(--bg-start) 0%, var(--bg-end) 100%);
        color: var(--text);
      }
      .wrapper {
        min-height: 100vh;
        padding: 40px 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .container {
        max-width: 600px;
        width: 100%;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(90deg, var(--orange-600) 0%, var(--orange-500) 100%);
        color: #ffffff;
        padding: 36px 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      .content {
        padding: 40px 30px;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 20px;
      }
      .message {
        font-size: 15px;
        line-height: 1.6;
        color: #4b5563;
        margin-bottom: 25px;
      }
      .promotion-box {
        background: linear-gradient(135deg, #fff7ed 0%, #fff3e0 100%);
        border-radius: 8px;
        padding: 22px;
        margin: 22px 0;
        border-left: 4px solid var(--orange-500);
        text-align: center;
      }
      .role-transition {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 10px;
      }
      .old-role {
        text-decoration: line-through;
        color: #9ca3af;
      }
      .new-role {
        font-size: 24px;
        font-weight: 700;
        color: var(--orange-600);
        margin-top: 5px;
      }
      .info-box {
        background: #f9fafb;
        border-radius: 8px;
        padding: 18px;
        margin: 22px 0;
        border-left: 4px solid var(--orange-500);
      }
      .info-title {
        font-size: 16px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 15px;
      }
      .permissions-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .permissions-list li {
        padding: 8px 0;
        color: #4b5563;
        display: flex;
        align-items: center;
      }
      .permissions-list li:before {
        content: "\2713";
        margin-right: 10px;
        font-size: 14px;
        color: var(--orange-600);
        display:inline-block;width:18px;text-align:center
      }
      .cta {
        display: inline-block;
        margin-top: 18px;
        padding: 14px 36px;
        background: linear-gradient(90deg,var(--orange-600),var(--orange-500));
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 15px;
        transition: transform 0.16s ease, box-shadow 0.16s ease;
        box-shadow: 0 8px 24px rgba(249,115,22,0.12);
      }
      .cta:hover{transform:translateY(-3px)}
      .warning-box {
        background: #fef3c7;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        border-left: 4px solid #f59e0b;
      }
      .warning-box strong {
        color: #92400e;
      }
      .footer {
        padding: 30px;
        background-color: #f9fafb;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
        line-height: 1.6;
      }
      .muted {
        margin-bottom: 12px;
      }
      .support-link {
        color: var(--orange-600);
        text-decoration: none;
        font-weight: 600;
      }
      .arrow{font-size:20px;margin:6px 0;color:var(--muted)}
      .footer-note {
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
      }
      .copyright {
        font-size: 12px;
        color: #9ca3af;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>Congratulations on Your Promotion!</h1>
        </div>

        <div class="content">
          <div class="greeting">Hello ${name || sic_no},</div>

          <div class="message">
            We're excited to inform you that you have been promoted to <strong>${isSuperAdmin ? 'Super Admin' : 'Admin'}</strong> on Codigo Plataforma! 
            This is a significant responsibility, and we trust you to help manage and enhance the platform.
          </div>

          <div class="promotion-box">
            <div class="role-transition">Your Role</div>
            <div class="old-role">${oldRole || 'MEMBER'}</div>
            <div class="arrow">↓</div>
            <div class="new-role">${isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}</div>
          </div>

          <div class="info-box">
            <div class="info-title">${isSuperAdmin ? 'Your Super Admin Privileges' : 'Your Admin Privileges'}</div>
            ${isSuperAdmin ? '<ul class="permissions-list"><li>Full system access and control</li><li>Manage all users and their roles</li><li>Create and manage admin accounts</li><li>Manage teams, members, and case studies</li><li>Access to all administrative features</li><li>System configuration and settings</li></ul>' : '<ul class="permissions-list"><li>Manage teams and team members</li><li>Oversee case study registrations</li><li>Access administrative dashboard</li><li>Support and assist users</li></ul>'}
          </div>

          <div class="warning-box">
            <strong>⚠️ Important Reminder:</strong><br/>
            With great power comes great responsibility. Please use your administrative privileges wisely and maintain the integrity of the platform.
          </div>

          <div class="message">
            Access the admin dashboard to start managing the platform and check participant registrations. If you have any questions about your new responsibilities, don't hesitate to reach out to our support team.
          </div>

          <a class="cta" href="${appUrl}/dashboard" role="button">
            Go to Admin Dashboard
          </a>
        </div>

        <div class="footer">
          <div class="muted">Questions about your new role? Contact us at <a href="mailto:${supportEmail}" class="support-link">${supportEmail}</a>.</div>
          <div class="footer-note">Welcome to the team — The Codigo Plataforma Team</div>
          <div class="copyright">© ${new Date().getFullYear()} Codigo Plataforma. All rights reserved.</div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  if (!client) {
    console.log("RESEND_API_KEY not set — skipping role promotion email. Payload: ", {
      toEmail: email,
      subject,
    });
    return { ok: false, skipped: true, user: sic_no };
  }

  try {
    const resp = await client.emails.send({
      from,
      to: [email],
      subject,
      html,
    });
    console.log(`Role promotion email sent to ${email}:`, resp);
    return { ok: true, data: resp, user: sic_no };
  } catch (err) {
    console.error(`Error sending role promotion email to ${email}:`, err);
    return { ok: false, error: err, user: sic_no };
  }
}

module.exports = { sendWelcomeEmail, sendTeamCreationEmail, sendCaseStudyReleaseEmail, sendRolePromotionEmail };
