/**
 * Jira API Service
 *
 * Handles interactions with Jira REST API v3 for fetching and updating issues.
 * Reference: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
 */

import type {
  JiraIssue,
  JiraCustomField,
  JiraProject,
  JiraApiError,
  JiraBatchSyncSummary,
  JiraSyncResult
} from '@/types/jira';

/**
 * Base URL for Jira Cloud API
 */
const getJiraApiUrl = (cloudId: string): string => {
  return `https://api.atlassian.com/ex/jira/${cloudId}`;
};

/**
 * Make an authenticated request to Jira API via Netlify Function proxy
 * This avoids CORS issues by making the request server-side
 */
const makeJiraRequest = async <T>(
  cloudId: string,
  accessToken: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch('/.netlify/functions/jira-api-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cloudId,
      accessToken,
      endpoint,
      method: options.method || 'GET',
      body: options.body ? JSON.parse(options.body as string) : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: JiraApiError = {
      statusCode: response.status,
      message: errorData.error || response.statusText,
      errors: errorData.details?.errors,
    };
    throw error;
  }

  return response.json();
};

/**
 * Fetch issues from Jira using JQL query
 *
 * @param cloudId - Atlassian cloud ID
 * @param accessToken - OAuth access token
 * @param jql - JQL query string
 * @param maxResults - Maximum number of results (default 50)
 */
export const fetchJiraIssues = async (
  cloudId: string,
  accessToken: string,
  jql: string,
  maxResults: number = 50
): Promise<JiraIssue[]> => {
  interface SearchResponse {
    issues: Array<{
      id: string;
      key: string;
      self: string;
      fields: {
        summary: string;
        description?: string | null;
        status?: { name: string };
        assignee?: { displayName: string };
        priority?: { name: string };
        issuetype?: { name: string };
        project?: { key: string; name: string };
        [key: string]: unknown;
      };
    }>;
    total: number;
  }

  const params = new URLSearchParams({
    jql,
    maxResults: maxResults.toString(),
    fields: 'summary,description,status,assignee,priority,issuetype,project',
  });

  const response = await makeJiraRequest<SearchResponse>(
    cloudId,
    accessToken,
    `/rest/api/3/search?${params.toString()}`
  );

  return response.issues.map(issue => ({
    id: issue.id,
    key: issue.key,
    summary: issue.fields.summary,
    description: issue.fields.description || undefined,
    jiraUrl: issue.self.replace(/\/rest\/api\/3\/issue\/.*/, `/browse/${issue.key}`),
    status: issue.fields.status?.name,
    assignee: issue.fields.assignee?.displayName,
    priority: issue.fields.priority?.name,
    issueType: issue.fields.issuetype?.name,
    projectKey: issue.fields.project?.key,
    projectName: issue.fields.project?.name,
  }));
};

/**
 * Fetch a single issue by key or ID
 */
export const fetchJiraIssue = async (
  cloudId: string,
  accessToken: string,
  issueKeyOrId: string,
  storyPointsFieldId?: string
): Promise<JiraIssue> => {
  interface IssueResponse {
    id: string;
    key: string;
    self: string;
    fields: {
      summary: string;
      description?: string | null;
      status?: { name: string };
      assignee?: { displayName: string };
      priority?: { name: string };
      issuetype?: { name: string };
      project?: { key: string; name: string };
      [key: string]: unknown;
    };
  }

  const response = await makeJiraRequest<IssueResponse>(
    cloudId,
    accessToken,
    `/rest/api/3/issue/${issueKeyOrId}`
  );

  const storyPoints = storyPointsFieldId
    ? (response.fields[storyPointsFieldId] as number | undefined)
    : undefined;

  return {
    id: response.id,
    key: response.key,
    summary: response.fields.summary,
    description: response.fields.description || undefined,
    jiraUrl: response.self.replace(/\/rest\/api\/3\/issue\/.*/, `/browse/${response.key}`),
    storyPoints,
    status: response.fields.status?.name,
    assignee: response.fields.assignee?.displayName,
    priority: response.fields.priority?.name,
    issueType: response.fields.issuetype?.name,
    projectKey: response.fields.project?.key,
    projectName: response.fields.project?.name,
  };
};

/**
 * Update story points for a Jira issue
 *
 * @param cloudId - Atlassian cloud ID
 * @param accessToken - OAuth access token
 * @param issueKey - Jira issue key (e.g., "PROJ-123")
 * @param storyPointsFieldId - Custom field ID for story points
 * @param points - Story point value to set
 */
export const updateIssueStoryPoints = async (
  cloudId: string,
  accessToken: string,
  issueKey: string,
  storyPointsFieldId: string,
  points: number | null
): Promise<void> => {
  await makeJiraRequest(
    cloudId,
    accessToken,
    `/rest/api/3/issue/${issueKey}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        fields: {
          [storyPointsFieldId]: points,
        },
      }),
    }
  );
};

/**
 * Batch update story points for multiple issues
 */
export const batchUpdateStoryPoints = async (
  cloudId: string,
  accessToken: string,
  storyPointsFieldId: string,
  updates: Array<{ issueKey: string; points: number | null }>
): Promise<JiraBatchSyncSummary> => {
  const results: JiraSyncResult[] = [];

  for (const update of updates) {
    try {
      await updateIssueStoryPoints(
        cloudId,
        accessToken,
        update.issueKey,
        storyPointsFieldId,
        update.points
      );
      results.push({ issueKey: update.issueKey, success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        issueKey: update.issueKey,
        success: false,
        error: errorMessage,
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    total: updates.length,
    successful,
    failed,
    results,
  };
};

/**
 * Get available custom fields for story points configuration
 */
export const getCustomFields = async (
  cloudId: string,
  accessToken: string
): Promise<JiraCustomField[]> => {
  const response = await makeJiraRequest<JiraCustomField[]>(
    cloudId,
    accessToken,
    '/rest/api/3/field'
  );

  // Filter to only numeric custom fields (likely story points)
  return response.filter(field =>
    field.id.startsWith('customfield_') &&
    (field.schema?.type === 'number' || field.name.toLowerCase().includes('story') || field.name.toLowerCase().includes('point'))
  );
};

/**
 * Get projects accessible to the user
 */
export const getProjects = async (
  cloudId: string,
  accessToken: string
): Promise<JiraProject[]> => {
  interface ProjectsResponse {
    values: JiraProject[];
  }

  const response = await makeJiraRequest<ProjectsResponse>(
    cloudId,
    accessToken,
    '/rest/api/3/project/search'
  );

  return response.values;
};

/**
 * Test Jira connection by fetching current user info
 */
export const testConnection = async (
  cloudId: string,
  accessToken: string
): Promise<{ success: boolean; user?: { displayName: string; emailAddress: string } }> => {
  try {
    interface MyselfResponse {
      displayName: string;
      emailAddress: string;
    }

    const user = await makeJiraRequest<MyselfResponse>(
      cloudId,
      accessToken,
      '/rest/api/3/myself'
    );

    return { success: true, user };
  } catch (error) {
    console.error('Jira connection test failed:', error);
    return { success: false };
  }
};

/**
 * Build Jira issue URL from site and key
 */
export const buildJiraUrl = (site: string, issueKey: string): string => {
  // Remove protocol and trailing slash from site
  const cleanSite = site.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${cleanSite}/browse/${issueKey}`;
};

/**
 * Validate JQL query syntax
 */
export const validateJQL = async (
  cloudId: string,
  accessToken: string,
  jql: string
): Promise<{ valid: boolean; errors?: string[] }> => {
  try {
    interface ValidateResponse {
      errors?: Array<{ message: string }>;
    }

    const response = await makeJiraRequest<ValidateResponse>(
      cloudId,
      accessToken,
      '/rest/api/3/jql/parse',
      {
        method: 'POST',
        body: JSON.stringify({ queries: [jql] }),
      }
    );

    if (response.errors && response.errors.length > 0) {
      return {
        valid: false,
        errors: response.errors.map(e => e.message),
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: ['Failed to validate JQL query'],
    };
  }
};
