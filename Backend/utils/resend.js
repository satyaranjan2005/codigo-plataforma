const { Resend } = require('resend');

// sendWelcomeEmail(to, name, sic_no)
// Uses RESEND_API_KEY from environment. If not provided, logs the email to console.
function createClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function sendWelcomeEmail(toEmail, name, sic_no) {
  const client = createClient();

  const from = "Codigo Plataforma <codigoplataforma@resend.dev>";
  const subject = process.env.WELCOME_SUBJECT || 'Welcome to the Codigo Plataforma';

  const appUrl = process.env.FRONTEND_URL || 'https://codigo-plataforma.example.com';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@codigo-plataforma.example.com';
  const logo ='./logo.svg';

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Codigo Plataforma</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:320px;">
          <tr>
            <td align="center" style="padding:24px 12px;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 8px 20px rgba(17,24,39,0.06);">
                <tr style="background:linear-gradient(90deg,#0ea5e9,#6366f1);color:#fff;">
                  <td style="padding:20px 24px;display:flex;align-items:center;gap:12px;">
                    ${logo ? `<img src="${logo}" alt="Codigo" width="48" height="48" style="display:block;border-radius:6px;"/>` : ''}
                    <div style="font-size:18px;font-weight:700;">Codigo Plataforma</div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 32px 16px 32px;">
                    <h1 style="margin:0 0 12px 0;font-size:22px;color:#0f172a;">Welcome${name ? `, ${name}` : ''} 👋</h1>
                    <p style="margin:0 0 18px 0;color:#475569;line-height:1.5;">Thanks for joining Codigo Plataforma. We're excited to have you on board. Below are your account details — keep them safe.</p>

                    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0;border-collapse:collapse;">
                      <tr>
                        <td style="padding:10px 12px;background:#f8fafc;border:1px solid #eef2ff;width:30%;font-weight:600;color:#0f172a;">SIC Number</td>
                        <td style="padding:10px 12px;border:1px solid #eef2ff;background:#ffffff;color:#0f172a;">${sic_no || '—'}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px;background:#f8fafc;border:1px solid #eef2ff;font-weight:600;color:#0f172a;">Email</td>
                        <td style="padding:10px 12px;border:1px solid #eef2ff;background:#ffffff;color:#0f172a;">${toEmail}</td>
                      </tr>
                    </table>

                    <div style="text-align:left;margin-top:6px;">
                      <a href="${appUrl}" style="display:inline-block;padding:10px 16px;background:#0ea5e9;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Go to Codigo Plataforma</a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 32px 28px 32px;color:#64748b;font-size:13px;background:#fbfdff;">
                    <p style="margin:0 0 8px 0;">If you didn't create this account, please contact us immediately at <a href="mailto:${supportEmail}" style="color:#0ea5e9;text-decoration:none;">${supportEmail}</a>.</p>
                    <p style="margin:6px 0 0 0;color:#94a3b8;">Thanks —<br/>The Codigo Plataforma Team</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 24px;background:#0f172a;color:#94a3b8;font-size:12px;text-align:center;">
                    <div style="max-width:520px;margin:0 auto;">© ${new Date().getFullYear()} Codigo Plataforma. <span style="opacity:.9">All rights reserved.</span></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (!client) {
    // For local/dev without RESEND_API_KEY, just log the email payload
    console.log('RESEND_API_KEY not set — skipping email. Payload: ', { toEmail, subject, html });
    return { ok: false, skipped: true };
  }

  try {
    const resp = await client.emails.send({
      from,
      to: [toEmail],
      subject,
      html,
    });
    console.log('sendWelcomeEmail sent:', resp);
    return { ok: true, data: resp };
  } catch (err) {
    console.error('sendWelcomeEmail error:', err);
    return { ok: false, error: err };
  }
}

module.exports = { sendWelcomeEmail };

// Send a team invite/confirmation email with an approval link
async function sendTeamInvite(toEmail, name, proposalId, approverSic) {
  const client = createClient();
  const from = "Codigo Plataforma <codigoplataforma@resend.dev>";
  const subject = process.env.TEAM_INVITE_SUBJECT || 'You have been invited to join a team';
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const approveUrl = `${appUrl}/teams/proposals/${proposalId}/approve?sic=${encodeURIComponent(approverSic)}`;

  const html = `
    <p>Hi ${name || 'there'},</p>
    <p>You have been invited to join a team on Codigo Plataforma. Please <a href="${approveUrl}">click here to approve</a> or visit the platform to respond to the invite.</p>
    <p>If you did not expect this, ignore this email.</p>
  `;

  if (!client) {
    console.log('RESEND_API_KEY not set — skipping team invite email. Payload:', { toEmail, subject, html, approveUrl });
    return { ok: false, skipped: true };
  }

  try {
    const resp = await client.emails.send({ from, to: [toEmail], subject, html });
    console.log('sendTeamInvite sent:', resp);
    return { ok: true, data: resp };
  } catch (err) {
    console.error('sendTeamInvite error:', err);
    return { ok: false, error: err };
  }
}

module.exports = { sendWelcomeEmail, sendTeamInvite };