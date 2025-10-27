# Jira Integration Setup Guide

This guide explains how to set up and use the Jira integration feature in pointwith.me.

## Overview

The Jira integration allows you to:
- Import issues from Jira into poker tables for estimation
- Push final story point estimates back to Jira
- Track which issues are synced with Jira
- Configure custom field mapping for story points

## Prerequisites

1. A Jira Cloud account (Cloud only, Data Center not currently supported)
2. Admin access to create an Atlassian OAuth app
3. Permissions to read and write issues in your Jira instance

## Setup Instructions

**IMPORTANT:** Atlassian OAuth 2.0 apps only support a single callback URL. You must create **separate apps** for development and production environments.

### Step 1: Create Two Atlassian OAuth 2.0 Apps

You'll need to create two separate OAuth apps:

#### App 1: Development

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console)
2. Click **Create** → **OAuth 2.0 integration**
3. Give your app a name: **"PointPal (Development)"**
4. Click **Create**

#### App 2: Production

1. In the same console, create another app
2. Click **Create** → **OAuth 2.0 integration**
3. Give your app a name: **"PointPal"** or **"PointPal (Production)"**
4. Click **Create**

### Step 2: Configure OAuth Settings for Both Apps

**For BOTH apps**, configure the following:

1. In app settings, click **Permissions**
2. Add **Jira API** and configure these scopes:
   - `read:jira-work` - Read Jira project and issue data
   - `write:jira-work` - Update Jira issues
   - `read:jira-user` - Read user information
   - `offline_access` - Get refresh tokens for long-term access

3. Click **Settings** in the left sidebar
4. Under **Authorization**, add the callback URL:
   - **Development app**: `http://localhost:8888/settings/jira/callback`
   - **Production app**: `https://pointpal.app/settings/jira/callback`

5. Save the **Client ID** and **Client Secret** for each app

### Step 3: Configure Local Environment Variables

1. Create a `.env` file in your project root (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Add your **DEVELOPMENT** Jira OAuth credentials to `.env`:
   ```bash
   VITE_JIRA_CLIENT_ID=your_dev_client_id_here
   VITE_JIRA_CLIENT_SECRET=your_dev_client_secret_here
   VITE_JIRA_REDIRECT_URI=http://localhost:8888/settings/jira/callback
   ```

3. Restart your development server:
   ```bash
   pnpm dev
   ```

### Step 4: Configure Production Environment Variables (Netlify)

1. Go to your [Netlify Dashboard](https://app.netlify.com/)
2. Select your site (pointpal.app)
3. Navigate to: **Site configuration** → **Environment variables**
4. Add the following variables using your **PRODUCTION** app credentials:

   | Key | Value |
   |-----|-------|
   | `VITE_JIRA_CLIENT_ID` | Your production app's Client ID |
   | `VITE_JIRA_CLIENT_SECRET` | Your production app's Client Secret |
   | `VITE_JIRA_REDIRECT_URI` | `https://pointpal.app/settings/jira/callback` |

5. **Deploy your site** for the changes to take effect:
   - Option A: Go to **Deploys** → **Trigger deploy** → **Deploy site**
   - Option B: Push a new commit to trigger automatic deployment

> **Note:** Environment variable changes require a new deployment to take effect. Simply saving the variables is not enough.

### Step 5: Connect Your Jira Account

1. Go to **Settings** in the app
2. Find the **Jira Integration** section
3. Click **Connect to Jira**
4. You'll be redirected to Atlassian to authorize access
5. Grant permissions and you'll be redirected back
6. Configure your **Story Points Field** from the dropdown

## Usage

### Importing Issues

**From Dashboard:**
1. Click **Import from Jira**
2. Select a JQL query preset or enter custom JQL
3. Preview the issues
4. Click **Import** to create a poker table

**From Poker Table:**
1. Open an existing poker table
2. Click **Import from Jira**
3. Select issues to import into the current table

### Estimating Issues

1. Estimate issues normally using the poker planning interface
2. Lock the issue when voting is complete
3. The final score will be ready to sync

### Pushing Estimates to Jira

**Batch Update:**
1. Click **Push Estimates to Jira** in the poker table header
2. All estimated issues will be updated in Jira
3. View the sync summary showing successes/failures

**Individual Issue:**
1. Click the **Sync** button on a specific issue
2. The estimate will be pushed immediately

### Sync Status

Issues show their sync status:
- ✓ **Synced** - Estimate successfully pushed to Jira
- ⏳ **Pending** - Waiting to be synced
- ❌ **Error** - Sync failed (hover for details)
- **Never Synced** - No sync attempted yet

## Story Points Field Configuration

Jira uses custom fields for story points, and the field ID varies by organization.

Common field names:
- "Story Points"
- "Story point estimate"
- "Estimate"

**To find your field:**
1. Go to Settings → Jira Integration
2. Your connected Jira site should show available custom fields
3. Select the field that corresponds to your story points
4. Save the configuration

**Manual field lookup (if needed):**
1. Open a Jira issue in your browser
2. Open DevTools → Network tab
3. Look for API calls to `/rest/api/3/issue/{key}`
4. Find the field that contains your story points (e.g., `customfield_10016`)

## JQL Query Examples

**Current Sprint:**
```jql
sprint in openSprints() AND type in (Story, Task, Bug) ORDER BY rank
```

**Unestimated Backlog:**
```jql
project = PROJ AND "Story Points" is EMPTY AND status in (Backlog, "To Do") ORDER BY priority DESC
```

**My Assigned Issues:**
```jql
assignee = currentUser() AND resolution = Unresolved ORDER BY priority DESC
```

**Recent Issues:**
```jql
created >= -7d ORDER BY created DESC
```

## Troubleshooting

### Connection Issues

**"Invalid OAuth state"**
- Clear your browser cache and try again
- Make sure you're completing the OAuth flow within 10 minutes

**"No accessible Jira sites found"**
- Verify you have access to at least one Jira Cloud site
- Check that your OAuth scopes are configured correctly

**"Failed to refresh access token"**
- Your refresh token may have expired
- Disconnect and reconnect your Jira account

### Sync Issues

**"Permission denied"**
- Verify you have edit permissions on the Jira issues
- Check that the story points field is editable

**"Field not found"**
- Reconfigure your story points field in Settings
- Verify the field exists in your Jira project

**"Rate limit exceeded"**
- Jira API has rate limits
- Wait a few minutes and try again
- Reduce the number of issues synced at once

### General Tips

- **Token Expiry**: Access tokens are automatically refreshed. If you see auth errors, try disconnecting and reconnecting.
- **Multiple Sites**: If you have multiple Jira sites, the integration currently uses the first accessible site.
- **Permissions**: You need write access to update issues. Read-only users can import but not sync estimates.

## Security Considerations

- OAuth tokens are stored in Firebase and are encrypted
- Tokens are never stored in localStorage or exposed to the client beyond what's necessary
- Refresh tokens allow long-term access without re-authentication
- You can disconnect at any time from Settings

## API Rate Limits

Atlassian enforces rate limits:
- **Read operations**: ~1000 requests per hour
- **Write operations**: ~600 requests per hour

The app implements:
- Automatic backoff on rate limit errors
- Batched updates to minimize API calls
- Caching of issue data

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Atlassian's [OAuth documentation](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/)
3. Open an issue on GitHub

## Future Enhancements

Planned features:
- Support for multiple Jira sites
- Real-time bidirectional sync
- Import epics and subtasks with hierarchy
- Custom field mapping for more fields
- Sprint selection for import
- Issue filtering by project, status, assignee
