/**
 * Standardized React Router mock patterns for Vitest
 */

import { vi } from 'vitest';

/**
 * Creates mock router hooks
 */
export const createMockRouterHooks = () => {
  const mockNavigate = vi.fn();
  const mockUseParams = vi.fn();
  const mockUseLocation = vi.fn();

  return {
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
    useLocation: mockUseLocation,
    // Expose the mocks for assertions
    mocks: {
      navigate: mockNavigate,
      useParams: mockUseParams,
      useLocation: mockUseLocation
    }
  };
};

/**
 * Default params for testing
 */
export const createMockParams = (overrides = {}) => ({
  userId: 'testUserId',
  tableId: 'testTableId',
  ...overrides
});
