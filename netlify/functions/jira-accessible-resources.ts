import { Handler } from '@netlify/functions';

const ATLASSIAN_RESOURCES_URL = 'https://api.atlassian.com/oauth/token/accessible-resources';

interface AccessibleResourcesRequest {
  accessToken: string;
}

/**
 * Netlify Function to fetch accessible Jira resources
 * This must run server-side to avoid CORS issues
 */
export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing request body' }),
      };
    }

    const { accessToken } = JSON.parse(event.body) as AccessibleResourcesRequest;

    if (!accessToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing access token' }),
      };
    }

    const response = await fetch(ATLASSIAN_RESOURCES_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Failed to get accessible resources: ${response.statusText}`,
          details: errorText,
        }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Jira accessible resources error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};
