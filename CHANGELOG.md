# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-27

### Added - Jira Integration (Complete 3-Phase Implementation)

#### Phase 1: OAuth Authentication
- Jira OAuth 2.0 integration with Atlassian
- Secure token management with automatic refresh
- Netlify Functions proxy for CORS-free API calls
- Connection status indicators in Settings
- Support for multiple Jira sites

#### Phase 2: Issue Import
- Import issues from Jira using JQL queries
- Pre-built JQL presets (Current Sprint, Backlog, Assigned to Me, Recent Issues)
- Custom JQL query support with validation
- Issue preview with checkbox selection
- Import to new poker tables from Dashboard
- Import to existing poker tables
- Jira metadata tracking (issue key, ID, URL)

#### Phase 3: Story Points Sync
- Visual Jira link indicators on issue cards with external link icons
- Batch sync button to push all story points to Jira at once
- Individual sync buttons on each issue card for granular control
- Non-destructive sync (only updates story points field)
- Progress tracking with toast notifications
- Comprehensive error handling and validation
- Automatic token refresh before API calls
- Clear UI messaging that only story points are synced

### Fixed
- HTTP 410 error from deprecated Jira API endpoint (migrated to `/rest/api/3/search/jql`)
- Token expiration issues with automatic refresh via `getValidConfig()`
- Firebase permission errors for Jira metadata fields
- JQL syntax errors in Backlog preset
- Dynamic import errors and improved error handling
- Netlify Dev infinite loop configuration issue

### Changed
- Updated default dev server to use `netlify dev` for function support
- Configured Vite to use port 5173 (avoiding conflicts)
- Set Netlify Dev to run on port 8888 for consistent Jira OAuth redirects
- Enhanced Settings page with clearer Jira integration documentation

### Technical Improvements
- Added `batchUpdateStoryPoints` service for efficient API calls
- Implemented `getValidConfig()` hook method for automatic token refresh
- Updated Firebase database rules to allow Jira metadata fields
- Added comprehensive error logging to Netlify Functions
- Improved type safety with Jira-related TypeScript interfaces

---

## [Unreleased]

### Planned Features
See [FUTURE_FEATURES.md](./FUTURE_FEATURES.md) for upcoming enhancements.

---

## Previous Releases

### Earlier Development
- Rebranded to PointPal.app
- Added Terms of Service and Privacy Policy pages
- Microsoft OAuth preparation (pending Azure AD setup)
- Core poker planning functionality
- Real-time voting and collaboration features
- Firebase Realtime Database integration
- User authentication and session management
