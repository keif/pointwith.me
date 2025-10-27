/**
 * Jira OAuth 2.0 Authentication Service
 *
 * Handles OAuth flow with Atlassian for Jira integration.
 * Reference: https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/
 */

import type {
  JiraOAuthTokenResponse,
  JiraAccessibleResource,
  JiraOAuthState
} from '@/types/jira';

const ATLASSIAN_AUTH_URL = 'https://auth.atlassian.com/authorize';
const ATLASSIAN_TOKEN_URL = 'https://auth.atlassian.com/oauth/token';
const ATLASSIAN_RESOURCES_URL = 'https://api.atlassian.com/oauth/token/accessible-resources';

const OAUTH_SCOPES = [
  'read:jira-work',
  'write:jira-work',
  'read:jira-user',
  'offline_access', // For refresh tokens
].join(' ');

/**
 * Generate a random state string for CSRF protection
 */
export const generateOAuthState = (): JiraOAuthState => {
  const state = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    state,
    returnUrl: window.location.pathname,
    timestamp: Date.now(),
  };
};

/**
 * Store OAuth state in sessionStorage for validation after redirect
 */
export const storeOAuthState = (oauthState: JiraOAuthState): void => {
  sessionStorage.setItem('jira_oauth_state', JSON.stringify(oauthState));
};

/**
 * Retrieve and validate OAuth state from sessionStorage
 */
export const validateOAuthState = (state: string): JiraOAuthState | null => {
  const storedState = sessionStorage.getItem('jira_oauth_state');
  if (!storedState) {
    return null;
  }

  try {
    const oauthState: JiraOAuthState = JSON.parse(storedState);

    // Validate state matches
    if (oauthState.state !== state) {
      console.error('OAuth state mismatch');
      return null;
    }

    // Validate state isn't too old (10 minutes)
    const maxAge = 10 * 60 * 1000;
    if (Date.now() - oauthState.timestamp > maxAge) {
      console.error('OAuth state expired');
      return null;
    }

    return oauthState;
  } catch (error) {
    console.error('Failed to validate OAuth state:', error);
    return null;
  } finally {
    // Clear state after validation attempt
    sessionStorage.removeItem('jira_oauth_state');
  }
};

/**
 * Initiate OAuth 2.0 flow by redirecting to Atlassian
 */
export const initiateOAuthFlow = (): void => {
  const clientId = import.meta.env.VITE_JIRA_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_JIRA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('Jira OAuth configuration missing. Set VITE_JIRA_CLIENT_ID and VITE_JIRA_REDIRECT_URI.');
  }

  const oauthState = generateOAuthState();
  storeOAuthState(oauthState);

  const params = new URLSearchParams({
    audience: 'api.atlassian.com',
    client_id: clientId,
    scope: OAUTH_SCOPES,
    redirect_uri: redirectUri,
    state: oauthState.state,
    response_type: 'code',
    prompt: 'consent',
  });

  window.location.href = `${ATLASSIAN_AUTH_URL}?${params.toString()}`;
};

/**
 * Exchange authorization code for access and refresh tokens
 */
export const exchangeCodeForTokens = async (
  code: string
): Promise<JiraOAuthTokenResponse> => {
  const clientId = import.meta.env.VITE_JIRA_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_JIRA_CLIENT_SECRET;
  const redirectUri = import.meta.env.VITE_JIRA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Jira OAuth configuration missing.');
  }

  const response = await fetch(ATLASSIAN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to exchange code for tokens: ${error.error_description || response.statusText}`);
  }

  return response.json();
};

/**
 * Refresh an expired access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<JiraOAuthTokenResponse> => {
  const clientId = import.meta.env.VITE_JIRA_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_JIRA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Jira OAuth configuration missing.');
  }

  const response = await fetch(ATLASSIAN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to refresh access token: ${error.error_description || response.statusText}`);
  }

  return response.json();
};

/**
 * Get accessible Jira sites/cloud IDs for the authenticated user
 */
export const getAccessibleResources = async (
  accessToken: string
): Promise<JiraAccessibleResource[]> => {
  const response = await fetch(ATLASSIAN_RESOURCES_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get accessible resources: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Calculate token expiration timestamp from expires_in seconds
 */
export const calculateExpirationTimestamp = (expiresInSeconds: number): number => {
  return Date.now() + (expiresInSeconds * 1000);
};

/**
 * Check if an access token is expired or about to expire (within 5 minutes)
 */
export const isTokenExpired = (expiresAt: number): boolean => {
  const bufferTime = 5 * 60 * 1000; // 5 minutes
  return Date.now() >= (expiresAt - bufferTime);
};
