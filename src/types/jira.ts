/**
 * Jira Integration Type Definitions
 */

// Jira Configuration stored in Firebase for each user
export interface JiraConfig {
  cloudId: string; // Atlassian Cloud ID for the site
  accessToken: string; // OAuth 2.0 access token (should be encrypted)
  refreshToken: string; // OAuth 2.0 refresh token (should be encrypted)
  site: string; // Jira site name (e.g., "mycompany.atlassian.net")
  expiresAt: number; // Timestamp when access token expires
  storyPointsFieldId: string; // Custom field ID for story points (e.g., "customfield_10016")
  connectedAt: string; // ISO timestamp when connection was established
  lastSyncedAt?: string; // ISO timestamp of last successful sync
}

// Jira Issue data structure
export interface JiraIssue {
  id: string; // Jira internal ID
  key: string; // Issue key (e.g., "PROJ-123")
  summary: string; // Issue title/summary
  description?: string; // Issue description (can be null/empty)
  jiraUrl: string; // Full URL to issue in Jira
  storyPoints?: number; // Current story point estimate
  status?: string; // Issue status (e.g., "To Do", "In Progress")
  assignee?: string; // Assignee display name
  priority?: string; // Priority level
  issueType?: string; // Issue type (e.g., "Story", "Bug")
  projectKey?: string; // Project key
  projectName?: string; // Project name
}

// OAuth token response from Atlassian
export interface JiraOAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // Seconds until expiration
  token_type: string; // Usually "Bearer"
  scope: string; // Granted scopes
}

// Atlassian accessible resources (sites)
export interface JiraAccessibleResource {
  id: string; // Cloud ID
  url: string; // Site URL
  name: string; // Site name
  scopes: string[]; // Available scopes
  avatarUrl?: string; // Site avatar
}

// Jira custom field definition
export interface JiraCustomField {
  id: string; // Field ID (e.g., "customfield_10016")
  name: string; // Field name (e.g., "Story Points")
  type: string; // Field type (e.g., "number")
  schema?: {
    type: string;
    custom?: string;
    customId?: number;
  };
}

// JQL query preset
export interface JQLPreset {
  label: string;
  description: string;
  jql: string;
}

// Issue sync status
export type JiraSyncStatus = 'synced' | 'pending' | 'error' | 'never_synced';

// Jira sync result for batch operations
export interface JiraSyncResult {
  issueKey: string;
  success: boolean;
  error?: string;
}

// Batch sync summary
export interface JiraBatchSyncSummary {
  total: number;
  successful: number;
  failed: number;
  results: JiraSyncResult[];
}

// Error types
export interface JiraApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string>;
}

// OAuth state for CSRF protection
export interface JiraOAuthState {
  state: string; // Random string
  returnUrl: string; // Where to redirect after auth
  timestamp: number; // When state was created
}

// Jira project metadata
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
}

// Jira sprint metadata (for Scrum projects)
export interface JiraSprint {
  id: number;
  name: string;
  state: 'future' | 'active' | 'closed';
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  originBoardId?: number;
}

// Export preset JQL queries
export const JQL_PRESETS: JQLPreset[] = [
  {
    label: 'Current Sprint',
    description: 'All issues in the current active sprint',
    jql: 'sprint in openSprints() AND type in (Story, Task, Bug) ORDER BY rank',
  },
  {
    label: 'Backlog (Unestimated)',
    description: 'Backlog items without story point estimates',
    jql: 'project = {PROJECT} AND "Story Points" is EMPTY AND status in (Backlog, "To Do") ORDER BY priority DESC',
  },
  {
    label: 'Assigned to Me',
    description: 'Issues currently assigned to you',
    jql: 'assignee = currentUser() AND resolution = Unresolved ORDER BY priority DESC',
  },
  {
    label: 'Recent Issues',
    description: 'Issues created in the last 7 days',
    jql: 'created >= -7d ORDER BY created DESC',
  },
];
