import { Handler } from '@netlify/functions';

interface JiraApiRequest {
  cloudId: string;
  accessToken: string;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

/**
 * Generic Netlify Function to proxy Jira API requests
 * This handles all CORS issues by making requests server-side
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

    const { cloudId, accessToken, endpoint, method = 'GET', body } = JSON.parse(event.body) as JiraApiRequest;

    if (!cloudId || !accessToken || !endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters: cloudId, accessToken, endpoint' }),
      };
    }

    const url = `https://api.atlassian.com/ex/jira/${cloudId}${endpoint}`;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    // Handle 204 No Content
    if (response.status === 204) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({}),
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data.errorMessages?.join(', ') || data.message || 'Jira API request failed',
          details: data,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Jira API proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};
