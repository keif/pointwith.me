# Table Cleanup Function Setup

This document explains how to set up and use the automated table cleanup function.

## Overview

The `cleanup-old-tables.ts` function automatically deletes poker tables that have been inactive for 90 days or more. This helps:
- Keep the database clean and efficient
- Reduce Firebase storage costs
- Maintain user privacy (GDPR compliance)

## How It Works

1. **Activity Tracking**: Every table has a `lastActivity` timestamp that updates when:
   - The table is created
   - A user joins the table
   - (You can add more triggers as needed)

2. **Scheduled Cleanup**: The function runs daily at 2:00 AM UTC and:
   - Queries all tables in the database
   - Identifies tables where `lastActivity` is older than 90 days
   - Deletes those tables and all associated data (issues, votes, participants)

## Setup Requirements

### 1. Firebase Service Account

You need a Firebase service account with admin privileges:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely

### 2. Environment Variables

Add the following environment variable to your Netlify site:

```bash
FIREBASE_SERVICE_ACCOUNT='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}'
```

**IMPORTANT**:
- This must be the entire JSON content as a single-line string
- Keep this secret and never commit it to your repository
- Add it via Netlify UI: Site Settings → Environment Variables

### 3. Set Up External Cron Service (Free!)

This function uses manual triggers instead of Netlify's built-in scheduler, so **no paid plan required**!

Trigger the cleanup by making a POST request:
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/cleanup-old-tables
```

#### Recommended Free Cron Services:

**Option A: cron-job.org** (Recommended - Easiest)
1. Go to [cron-job.org](https://cron-job.org) and create a free account
2. Create a new cron job:
   - **URL**: `https://your-site.netlify.app/.netlify/functions/cleanup-old-tables`
   - **HTTP Method**: POST
   - **Schedule**: Daily at 2:00 AM (or your preferred time)
3. Save and enable the job

**Option B: GitHub Actions** (If you want control in your repo)
Create `.github/workflows/cleanup-tables.yml`:
```yaml
name: Cleanup Old Tables
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2:00 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cleanup Function
        run: |
          curl -X POST https://your-site.netlify.app/.netlify/functions/cleanup-old-tables
```

**Option C: EasyCron**
1. Go to [EasyCron](https://www.easycron.com) and create account
2. Add cron job with URL above
3. Set schedule (daily recommended)

**Option D: Your Own Server**
Add to your crontab:
```bash
0 2 * * * curl -X POST https://your-site.netlify.app/.netlify/functions/cleanup-old-tables
```

## Testing

To test the cleanup function locally:

1. **Set environment variable**:
   ```bash
   export FIREBASE_SERVICE_ACCOUNT='<your-json-here>'
   ```

2. **Run Netlify Dev**:
   ```bash
   pnpm dev
   ```

3. **Trigger the function**:
   ```bash
   curl -X POST http://localhost:8888/.netlify/functions/cleanup-old-tables
   ```

4. **Check the response**:
   ```json
   {
     "message": "Cleanup completed successfully",
     "deleted": 5,
     "cutoffDate": "2024-07-31T02:00:00.000Z"
   }
   ```

## Monitoring

After deployment, monitor the function:

1. **Netlify Functions Dashboard**: Check execution logs
2. **Firebase Console**: Verify tables are being deleted
3. **Function Logs**: Check for errors or warnings

## Customization

### Change Retention Period

Edit `RETENTION_DAYS` in `cleanup-old-tables.ts`:

```typescript
const RETENTION_DAYS = 90; // Change this value
```

### Change Schedule

Update your external cron service schedule:
- **cron-job.org**: Edit the job schedule in your dashboard
- **GitHub Actions**: Update the cron expression in `.github/workflows/cleanup-tables.yml`
- **Your server**: Update your crontab schedule

### Activity Tracking (Already Implemented)

The following user actions automatically update `lastActivity`:
- ✅ Table creation
- ✅ User joins table
- ✅ Issue creation
- ✅ Jira issue import
- ✅ Voting on issues
- ✅ Editing issue titles

To add more triggers, call `updateLastActivity()` in the PokerTable component.

## Troubleshooting

### Function Fails with "FIREBASE_SERVICE_ACCOUNT is required"
- Make sure you've added the environment variable in Netlify
- Redeploy after adding the variable

### Function Runs But Doesn't Delete Tables
- Check that tables actually have `lastActivity` timestamps
- Old tables created before this feature may only have `created` timestamps
- The function falls back to `created` if `lastActivity` is missing

### Tables Deleted Too Soon / Too Late
- Verify the `RETENTION_DAYS` value
- Check the server time matches your expectations (function runs on UTC)
- Ensure `lastActivity` is being updated correctly

## Security Considerations

- Never commit the service account JSON to version control
- Use Netlify environment variables (they're encrypted at rest)
- The service account has admin access - protect it carefully
- Consider using Firebase Security Rules to restrict what the service account can do
- Audit the cleanup logs regularly

## Support

If you encounter issues:
1. Check Netlify function logs
2. Verify environment variables are set correctly
3. Test locally first before deploying
4. Review Firebase security rules
