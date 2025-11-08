# Team Creation Email Notification Feature

## Overview

When a team is created in the Codigo Plataforma, all team members (including the team leader) receive an email notification with team details, member list, and their role designation.

## Implementation Details

### Backend Changes

#### 1. New Email Function: `sendTeamCreationEmail`

**Location**: `Backend/utils/resend.js`

**Function Signature**:
```javascript
async function sendTeamCreationEmail(teamData, leaderSic)
```

**Parameters**:
- `teamData` (Object):
  - `teamId` (number): The team's ID
  - `teamName` (string): The team's name
  - `members` (Array): Array of team members with:
    - `sic_no` (string): Student's SIC number
    - `name` (string): Student's name
    - `email` (string): Student's email address
    - `role` (string): Team role ('LEADER' or 'MEMBER')
- `leaderSic` (string): SIC number of the team leader

**Return Value**:
```javascript
{
  ok: boolean,           // True if all emails sent successfully
  partial: boolean,      // True if some (but not all) emails sent
  results: Array,        // Detailed results for each email
  sent: number,          // Number of successfully sent emails
  total: number          // Total number of emails attempted
}
```

**Features**:
- ✅ Sends individual emails to each team member
- ✅ Differentiates content between leader and members
- ✅ Includes complete team roster with roles
- ✅ Uses `Promise.allSettled` for robust parallel email sending
- ✅ Returns detailed success/failure statistics
- ✅ Gracefully handles missing API key (logs to console)
- ✅ Matches the styling of `sendWelcomeEmail` for consistency

#### 2. Team Route Integration

**Location**: `Backend/routes/Team.js`

**Modified Route**: `POST /teams`

**Changes**:
1. Imported `sendTeamCreationEmail` from `../utils/resend`
2. After successful team creation, fetches full student details (including emails)
3. Sends emails asynchronously without blocking the API response
4. Catches and logs any email errors

**Code Flow**:
```javascript
// 1. Create team and members (transaction)
const result = await prisma.$transaction(async (tx) => {
  // Create team and team members
});

// 2. Fetch student details with emails
const membersWithDetails = await prisma.student.findMany({
  where: { sic_no: { in: uniqueMembers } },
  select: { sic_no: true, name: true, email: true }
});

// 3. Prepare email data
const emailData = {
  teamId: result.team.id,
  teamName: result.team.team_name,
  members: membersWithDetails.map(/* ... */)
};

// 4. Send emails (async, non-blocking)
sendTeamCreationEmail(emailData, requester).catch(err => {
  console.error('Failed to send team creation emails:', err);
});

// 5. Return response immediately
return res.status(201).json({ message: 'Team created', ...result });
```

### Email Template

#### Email Content

**Subject**: `Team "[Team Name]" Created - Codigo Plataforma`

**Personalized Greeting**:
- For team leaders: "Congratulations! You have successfully created the team..."
- For team members: "You have been added to the team..."

**Information Displayed**:
1. **Team Name**: Prominently displayed in a styled info box
2. **Team ID**: Unique identifier for the team
3. **User's Role**: Visual badge indicating "Team Leader" or "Team Member"
4. **Team Members Table**: Complete roster with:
   - Name
   - SIC Number
   - Role (with leader highlighted)

**Call-to-Action**:
- "Go to Dashboard" button linking to `/dashboard`
- Different messaging for leaders (manage team) vs members (view team)

**Footer**:
- Support contact information
- Team signature
- Copyright notice

#### Styling

The email uses responsive HTML with inline CSS:
- **Colors**: Purple gradient (`#667eea` to `#764ba2`) matching brand
- **Layout**: Centered card with max-width 600px
- **Typography**: System font stack for compatibility
- **Responsive**: Mobile-friendly design
- **Accessibility**: Proper heading hierarchy and semantic HTML

### Error Handling

The implementation includes robust error handling:

1. **Input Validation**:
   ```javascript
   if (!teamId || !teamName || !members || !Array.isArray(members) || members.length === 0) {
     console.error("Invalid team data provided");
     return { ok: false, error: "Invalid team data" };
   }
   ```

2. **Missing API Key**:
   - Logs email payload to console
   - Returns `{ ok: false, skipped: true }`
   - Allows development without Resend account

3. **Individual Email Failures**:
   - Uses `Promise.allSettled` to prevent one failure from blocking others
   - Returns detailed results for each email
   - Logs errors for debugging

4. **Non-blocking Execution**:
   - Email sending doesn't block API response
   - Errors are caught and logged, but don't affect team creation success

## Usage Example

### API Request

```bash
POST /teams
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "team_name": "The Innovators",
  "members": ["SIC001", "SIC002", "SIC003"]
}
```

### API Response

```json
{
  "message": "Team created",
  "team": {
    "id": 1,
    "team_name": "The Innovators",
    "problem_id": null
  },
  "teamMembers": [
    {
      "team_id": 1,
      "sic_no": "SIC001",
      "role": "LEADER"
    },
    {
      "team_id": 1,
      "sic_no": "SIC002",
      "role": "MEMBER"
    },
    {
      "team_id": 1,
      "sic_no": "SIC003",
      "role": "MEMBER"
    }
  ]
}
```

### Emails Sent

- **SIC001** receives email as team leader
- **SIC002** receives email as team member
- **SIC003** receives email as team member

Each email is personalized with:
- Recipient's name in greeting
- Their specific role (leader/member)
- Complete team roster
- Role-appropriate call-to-action message

## Testing

### Manual Testing

1. **Create a Team**:
   ```bash
   curl -X POST http://localhost:3000/teams \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "team_name": "Test Team",
       "members": ["SIC001", "SIC002"]
     }'
   ```

2. **Check Console Logs**:
   - If `RESEND_API_KEY` is not set, email payloads will be logged
   - If API key is set, check for "Team creation email sent to..." logs

3. **Check Email Inbox**:
   - Each member should receive an email
   - Verify leader email has "Team Leader" badge
   - Verify member emails have "Team Member" badge

### Development Mode (Without Resend API Key)

Without `RESEND_API_KEY` set in `.env`, the function will:
1. Log the email payload to console
2. Return `{ ok: false, skipped: true }`
3. Not actually send emails

This allows development and testing without requiring a Resend account.

### Production Testing

With `RESEND_API_KEY` set:
1. Emails are sent via Resend API
2. Check Resend dashboard for delivery status
3. Monitor console logs for success/failure messages
4. Return value includes success statistics

## Environment Variables

### Required

- `RESEND_API_KEY`: Your Resend API key (optional for development)

### Used in Email

- `FRONTEND_URL`: Base URL for dashboard links (default: `http://localhost:3000`)
- `SUPPORT_EMAIL`: Support contact email (default: `support@codigoplataforma.tech`)

### Email Configuration

Emails are sent from: `Codigo Plataforma <info@codigoplataforma.tech>`

Make sure this sender address is verified in your Resend account.

## Benefits

1. **Immediate Notification**: Team members are instantly notified of team creation
2. **Clear Role Communication**: Members immediately know if they're the leader
3. **Team Transparency**: Complete member list visible to all team members
4. **Easy Access**: Direct link to dashboard for quick action
5. **Professional Appearance**: Branded, responsive email design
6. **Reliable Delivery**: Parallel sending with detailed failure tracking

## Future Enhancements

Potential improvements to consider:

1. **Email Preferences**: Allow users to opt-out of team notifications
2. **Rich Notifications**: Add team logo or avatar
3. **Calendar Integration**: Include .ics file for events
4. **Digest Mode**: Batch notifications for multiple team changes
5. **SMS Notifications**: Parallel SMS for critical updates
6. **Email Analytics**: Track open rates and click-through rates
7. **Team Updates**: Notify when members join/leave or problem is assigned

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set in `.env`
2. **Verify Sender**: Ensure `info@codigoplataforma.tech` is verified in Resend
3. **Check Logs**: Look for error messages in console
4. **Test Resend**: Send a test email via Resend dashboard
5. **Rate Limits**: Check if you've exceeded Resend API limits

### Wrong Recipient

1. **Check Student Data**: Verify student emails in database
2. **Check Member List**: Ensure correct SIC numbers passed to API
3. **Check Logs**: Review "Team creation email sent to..." logs

### Styling Issues

1. **Email Client**: Some clients may not support all CSS
2. **Inline Styles**: All critical styles are inlined for compatibility
3. **Test Clients**: Test in Gmail, Outlook, Apple Mail, etc.

### Performance Concerns

1. **Async Execution**: Emails are sent asynchronously (non-blocking)
2. **Parallel Sending**: Uses `Promise.allSettled` for concurrent sends
3. **Response Time**: API responds immediately, emails sent in background

## Related Files

- `Backend/utils/resend.js` - Email utility functions
- `Backend/routes/Team.js` - Team creation route
- `Backend/prisma/schema.prisma` - Database schema
- `Backend/.env.example` - Environment variable template

## Documentation

For more information, see:
- [Main README](./README.md)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Resend Documentation](https://resend.com/docs)

---

**Last Updated**: January 2025  
**Author**: Codigo Plataforma Team
