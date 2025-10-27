/**
 * useJiraAuth Hook
 *
 * Manages Jira OAuth authentication state and provides methods for
 * connecting/disconnecting Jira integration.
 */

import { useState, useEffect, useCallback } from 'react';
import { ref, get, set, remove } from 'firebase/database';
import { auth, db as firebaseDb } from '@/firebase';
import type { JiraConfig } from '@/types/jira';
import * as jiraAuth from '@/services/jiraAuth';
import { testConnection } from '@/services/jira';

interface UseJiraAuthReturn {
  isConnected: boolean;
  isLoading: boolean;
  config: JiraConfig | null;
  error: string | null;
  connect: () => void;
  disconnect: () => Promise<void>;
  refreshConfig: () => Promise<void>;
  updateConfig: (updates: Partial<JiraConfig>) => Promise<void>;
}

/**
 * Hook for managing Jira authentication
 */
export const useJiraAuth = (): UseJiraAuthReturn => {
  const [config, setConfig] = useState<JiraConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = auth.auth.currentUser;

  /**
   * Get Firebase reference for user's Jira config
   */
  const getConfigRef = useCallback(() => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return ref(firebaseDb.db, `users/${currentUser.uid}/jiraConfig`);
  }, [currentUser]);

  /**
   * Load Jira config from Firebase
   */
  const loadConfig = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const configRef = getConfigRef();
      const snapshot = await get(configRef);

      if (snapshot.exists()) {
        const data = snapshot.val() as JiraConfig;

        // Check if token is expired and needs refresh
        if (jiraAuth.isTokenExpired(data.expiresAt)) {
          console.log('Access token expired, refreshing...');
          try {
            const tokens = await jiraAuth.refreshAccessToken(data.refreshToken);
            const updatedConfig: JiraConfig = {
              ...data,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresAt: jiraAuth.calculateExpirationTimestamp(tokens.expires_in),
            };

            // Save refreshed tokens
            await set(configRef, updatedConfig);
            setConfig(updatedConfig);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            setError('Your Jira connection has expired. Please reconnect.');
            setConfig(null);
          }
        } else {
          setConfig(data);
        }
      } else {
        setConfig(null);
      }
    } catch (err) {
      console.error('Error loading Jira config:', err);
      setError('Failed to load Jira configuration');
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, getConfigRef]);

  /**
   * Load config on mount and when user changes
   */
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  /**
   * Initiate OAuth connection flow
   */
  const connect = useCallback(() => {
    setError(null);
    try {
      jiraAuth.initiateOAuthFlow();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start OAuth flow';
      setError(errorMessage);
      console.error('Error initiating OAuth:', err);
    }
  }, []);

  /**
   * Disconnect Jira integration
   */
  const disconnect = useCallback(async () => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      const configRef = getConfigRef();
      await remove(configRef);
      setConfig(null);
      setError(null);
    } catch (err) {
      console.error('Error disconnecting Jira:', err);
      setError('Failed to disconnect Jira');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, getConfigRef]);

  /**
   * Refresh config from Firebase (useful after OAuth callback)
   */
  const refreshConfig = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  /**
   * Update Jira config (e.g., story points field)
   */
  const updateConfig = useCallback(async (updates: Partial<JiraConfig>) => {
    if (!currentUser || !config) {
      throw new Error('No active Jira connection');
    }

    try {
      const updatedConfig: JiraConfig = {
        ...config,
        ...updates,
      };

      const configRef = getConfigRef();
      await set(configRef, updatedConfig);
      setConfig(updatedConfig);
    } catch (err) {
      console.error('Error updating Jira config:', err);
      setError('Failed to update Jira configuration');
      throw err;
    }
  }, [currentUser, config, getConfigRef]);

  return {
    isConnected: config !== null && !jiraAuth.isTokenExpired(config.expiresAt),
    isLoading,
    config,
    error,
    connect,
    disconnect,
    refreshConfig,
    updateConfig,
  };
};

/**
 * Hook for handling OAuth callback
 */
export const useJiraOAuthCallback = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = auth.auth.currentUser;

  /**
   * Process OAuth callback with code and state
   */
  const processCallback = useCallback(async (code: string, state: string): Promise<boolean> => {
    if (!currentUser) {
      setError('User not authenticated');
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Validate OAuth state
      const oauthState = jiraAuth.validateOAuthState(state);
      if (!oauthState) {
        throw new Error('Invalid OAuth state. Please try connecting again.');
      }

      // Exchange code for tokens
      const tokens = await jiraAuth.exchangeCodeForTokens(code);

      // Get accessible resources (Jira sites)
      const resources = await jiraAuth.getAccessibleResources(tokens.access_token);

      if (resources.length === 0) {
        throw new Error('No accessible Jira sites found. Please check your permissions.');
      }

      // Use first resource (or let user select if multiple)
      const resource = resources[0];

      // Test connection
      const connectionTest = await testConnection(resource.id, tokens.access_token);
      if (!connectionTest.success) {
        throw new Error('Failed to connect to Jira. Please check your permissions.');
      }

      // Create and save config
      const config: JiraConfig = {
        cloudId: resource.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        site: resource.url,
        expiresAt: jiraAuth.calculateExpirationTimestamp(tokens.expires_in),
        storyPointsFieldId: '', // Will be configured in settings
        connectedAt: new Date().toISOString(),
      };

      const configRef = ref(firebaseDb.db, `users/${currentUser.uid}/jiraConfig`);
      await set(configRef, config);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete OAuth flow';
      setError(errorMessage);
      console.error('OAuth callback error:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser]);

  return {
    isProcessing,
    error,
    processCallback,
  };
};
