# Future Features & Enhancements

This document tracks potential features and improvements for future development.

## Planned Features

### Edit History & Metadata
**Status:** In Progress
**Priority:** Medium

Track when and who edits table names and issue titles.

**Implementation:**
```javascript
{
    title: "Issue name",
    created: "2025-10-24T15:00:00Z",
    createdBy: "userId123",
    lastEdited: "2025-10-24T16:30:00Z",
    lastEditedBy: "userId456"
}
```

**Display:**
- Show "Edited by [name] • [time ago]" for recent edits (< 24h)
- Show "Edited by [name] • [date/time]" for older edits
- Display as subtitle under title or in tooltip

**Effort:** Small
**Value:** Medium (transparency and accountability)

---

## Under Consideration

### Jira Integration: Sprint & Issue Sync
**Priority:** High
**Requested:** 2025-10-25
**Status:** Under Consideration

Allow Point With Me to connect with Jira Cloud so users can import their current sprint and automatically populate pointing tables with active issues.

**Motivation:**
- Reduce manual entry of tickets during pointing sessions
- Keep sprint boards synchronized between Jira and Point With Me
- Improve team visibility on story point progress and status
- Streamline sprint planning workflow

**Core Requirements:**
1. Authenticate securely with Jira Cloud
2. Fetch all available sprints for the selected board
3. Populate a table of issues from the current or selected sprint
4. Default filter: status = "To Do"
5. Support customizable filters (e.g., "In Progress," "Blocked," or custom labels)
6. Display issue fields:
   - Key (e.g., PS-1234)
   - Summary
   - Assignee
   - Status
   - Story Points
   - Sprint Name
   - Updated Date
7. Provide refresh and pagination handling

**Technical Implementation:**

*API Integration:*
- Use Jira REST API v3 (`/rest/api/3/search`)
- Agile API for sprints (`/rest/agile/1.0/board/{boardId}/sprint`)
- JQL query example:
  ```jql
  project = "PBM" AND sprint = "Current Sprint" AND status = "To Do"
  ```

*Authentication Options:*
- **Option 1 (Simple):** Basic Auth with API token for single shared Jira
- **Option 2 (Multi-user):** OAuth 2.0 (3LO) via Atlassian Developer Console
- Secure credentials via Firebase environment variables or Cloud Functions backend
- Use Axios or Fetch with encoded `Authorization: Basic` header

*Data Handling:*
- Cache fetched results in Firebase for 15 minutes
- Refresh automatically or via manual "Sync with Jira" button
- Store Jira issue mapping to maintain sync state

**UI/UX Features:**
- Dropdown for selecting sprint (from available sprints)
- Table view with dynamic filter dropdown for status
- "Sync with Jira" button to manually trigger re-fetch
- Visual indicators for sync status (last synced timestamp)
- Loading states during API calls
- Error handling for authentication failures

**Data Structure:**
```javascript
{
  jiraIntegration: {
    [tableId]: {
      connected: true,
      boardId: "123",
      lastSynced: "timestamp",
      selectedSprint: "Sprint 42",
      filters: {
        status: ["To Do", "In Progress"]
      },
      issues: {
        [issueKey]: {
          key: "PS-1234",
          summary: "Issue title",
          assignee: "John Doe",
          status: "To Do",
          storyPoints: 5,
          sprintName: "Sprint 42",
          updated: "timestamp",
          jiraUrl: "https://..."
        }
      }
    }
  }
}
```

**Security Considerations:**
- Never store Jira credentials in client-side code
- Use Firebase Cloud Functions as proxy for API calls
- Implement rate limiting to avoid Jira API throttling
- Validate all user input for JQL queries
- Use HTTPS only for all API communications

**Future Enhancements:**
- Push story point updates from Point With Me back to Jira (bi-directional sync)
- Auto-detect when a sprint changes in Jira and prompt users to update
- Team-level analytics comparing Jira story points vs Point With Me estimates
- Support for multiple Jira instances per team
- Webhook integration for real-time updates
- Support for Jira Server (in addition to Cloud)
- Custom field mapping configuration

**Effort:** Large
**Value:** Very High (major workflow improvement)

**Implementation Phases:**
1. **Phase 1 (MVP):** Read-only integration with basic auth, manual sync
2. **Phase 2:** OAuth 2.0, auto-refresh, better filtering
3. **Phase 3:** Bi-directional sync, webhooks, analytics

**Dependencies:**
- Firebase Cloud Functions (for secure API proxy)
- Jira Cloud instance with API access
- Atlassian Developer Console app registration (for OAuth)

---

### Granular Edit Permissions
**Priority:** Low
**Requested:** Session 2025-10-24

Allow issue creators to edit their own issues (not just table owner).

**Current Behavior:**
- Only table owner can edit issue titles
- Firebase rules allow any authenticated user to update issues
- UI restricts editing to owner only

**Proposed Behavior:**
- Track `createdBy` field on issues
- Allow editing if: `isTableOwner || issue.createdBy === currentUser.uid`
- More flexible for collaborative teams

**Considerations:**
- Adds complexity to permission logic
- Need to track issue creator
- May cause confusion (who can edit what?)
- Monitor user feedback before implementing

**Effort:** Small
**Value:** Medium (improved collaboration)

---

### Client-Side Input Validation
**Priority:** Medium
**Requested:** Previous sessions

Add immediate validation feedback before Firebase operations.

**Current State:**
- Validation happens on save (Firebase rules enforce)
- Users see errors only after attempting to save

**Improvements Needed:**
- Real-time character count display (e.g., "45/100")
- Inline validation messages
- Prevent submission if invalid
- Better UX with immediate feedback

**Files:**
- `src/components/Dashboard/PokerTableNameForm.jsx`
- `src/components/PokerTable/IssueNameForm.jsx`
- Inline editing components (already have maxLength)

**Example:**
```javascript
<div className="flex items-center justify-between">
    <input maxLength={100} />
    <span className="text-sm text-gray-500">{value.length}/100</span>
</div>
```

**Effort:** Small
**Value:** High (better UX)

---

### Environment-Aware Logging Utility
**Priority:** Low
**Requested:** Previous sessions

Clean up production console logs with environment-aware logging.

**Current State:**
- `console.log` and `console.error` everywhere
- Debug logs visible in production

**Proposed Solution:**
Create `src/utils/logger.js`:
```javascript
export const logger = {
    debug: (...args) => {
        if (import.meta.env.DEV) {
            console.log(...args);
        }
    },
    error: (...args) => {
        if (import.meta.env.DEV) {
            console.error(...args);
        }
        // Optional: Send to error tracking service
    },
    info: (...args) => {
        console.info(...args);
    }
};
```

**Migration:**
- Replace `console.log` with `logger.debug`
- Replace `console.error` with `logger.error`
- Keep important logs as `logger.info`

**Effort:** Medium (requires updating many files)
**Value:** Medium (cleaner production logs)

---

### Rate Limiting & Abuse Prevention
**Priority:** Low
**Status:** Monitoring

Protect against spam and abuse.

**Current State:**
- No rate limiting
- No bot protection
- Relies on Firebase costs as natural limiter

**Options:**
1. **Firebase App Check** - Bot protection
2. **Security Rules Rate Limiting** - Per-user quotas
3. **Monitoring First** - Watch for abuse patterns before implementing

**Decision:** Monitor usage patterns first, implement if abuse detected

**Effort:** Medium
**Value:** Low (unless abuse occurs)

---

### Issue Title Editing in Multiple Locations
**Priority:** Low
**Status:** ✅ Completed (Session 2025-10-24)

~~Add inline editing to issue list on main table page~~

**Completed Features:**
- ✅ Table name editing (hover-revealed icon)
- ✅ Issue title editing in modal view
- ✅ Issue title editing in list view
- ✅ Keyboard shortcuts (Enter/Escape)
- ✅ Client-side validation

---

## Performance Optimization Ideas

### Bundle Size Analysis
**Priority:** Low

Analyze and optimize bundle size.

**Tasks:**
- Run bundle size analysis
- Investigate code splitting opportunities
- Verify tree-shaking working correctly
- Consider lazy loading for routes

**Effort:** Medium
**Value:** Medium (faster load times)

---

### Firebase Read Optimization
**Priority:** Low

Optimize Firebase realtime database reads.

**Current State:**
- `onValue` listeners on entire table
- Re-renders on any change

**Potential Improvements:**
- More granular listeners
- Pagination for large issue lists
- Debounce rapid updates

**Decision:** Wait for performance issues before optimizing

**Effort:** Medium
**Value:** Low (unless scaling issues occur)

---

## User Experience Enhancements

### Undo Functionality
**Priority:** Low

Add undo capability for destructive actions.

**Actions to Support:**
- Delete issue
- Delete table
- Edit title (with history)

**Implementation:**
- Toast with "Undo" button (5s timeout)
- Keep deleted data in memory briefly
- Restore on undo

**Effort:** Medium
**Value:** Medium (safety net for users)

---

### Keyboard Navigation
**Priority:** Low

Add keyboard shortcuts for power users.

**Potential Shortcuts:**
- `?` - Show keyboard shortcuts help
- `n` - New issue
- `Esc` - Close modal
- `e` - Edit current item
- Arrow keys - Navigate issues

**Effort:** Medium
**Value:** Low (nice to have)

---

### Dark Mode
**Priority:** Low

Add dark theme support.

**Implementation:**
- Tailwind dark mode classes
- User preference stored in localStorage
- System preference detection
- Toggle button in header

**Effort:** Medium
**Value:** Medium (popular feature)

---

## Mobile Optimization

### Touch Gestures
**Priority:** Low

Improve mobile experience with touch gestures.

**Ideas:**
- Swipe to delete issue
- Pull to refresh
- Swipe between issues
- Long press for options

**Effort:** Large
**Value:** Medium (better mobile UX)

---

### Responsive Improvements
**Priority:** Low

Further optimize for mobile devices.

**Current State:**
- Basic responsiveness with Tailwind
- Works on mobile but could be better

**Improvements:**
- Optimize voting cards layout
- Better modal experience on small screens
- Collapsible sections
- Bottom sheet for actions

**Effort:** Medium
**Value:** Medium (mobile traffic dependent)

---

## Team Collaboration Features

### Retro Board
**Priority:** Medium
**Requested:** 2025-10-24

Add a retrospective board feature for team reflection and continuous improvement.

**Sections:**
- **Start** - What should we start doing?
- **Stop** - What should we stop doing?
- **Continue** - What should we keep doing?
- **Action Items** - Concrete next steps from the retro

**Key Features:**
- Create retro boards similar to poker tables
- Real-time collaboration (multiple users adding cards simultaneously)
- Anonymous or attributed cards (user preference)
- Voting/liking on cards to prioritize
- Group similar cards together
- Convert discussions into action items
- Export retro results

**Implementation Considerations:**
- Reuse existing table/room infrastructure
- Card creation similar to issue creation
- Drag-and-drop for grouping cards
- Action item tracking with owner assignment
- Timer for time-boxed activities
- Facilitator role (like table owner)

**Data Structure:**
```javascript
{
  retroBoards: {
    [ownerId]: {
      [boardId]: {
        boardName: "Sprint 42 Retro",
        created: "timestamp",
        owner: "userId",
        sections: {
          start: {
            [cardId]: {
              text: "Daily standups",
              author: "userId" | "anonymous",
              votes: ["userId1", "userId2"],
              created: "timestamp"
            }
          },
          stop: { /* similar */ },
          continue: { /* similar */ },
          actionItems: {
            [itemId]: {
              text: "Set up CI/CD pipeline",
              owner: "userId",
              dueDate: "timestamp",
              status: "pending" | "in-progress" | "done",
              created: "timestamp"
            }
          }
        }
      }
    }
  }
}
```

**Effort:** Large
**Value:** High (adds major new capability beyond planning poker)

**Phases:**
1. **MVP** - Basic card creation in start/stop/continue sections
2. **Enhanced** - Voting, grouping, anonymous mode
3. **Advanced** - Action item tracking, export, timer features

---

### Real-Time Cursors
**Priority:** Very Low

Show where other users are clicking/editing.

**Implementation:**
- Firebase presence system
- Cursor position tracking
- User avatars at cursor location

**Effort:** Large
**Value:** Low (cool but not essential)

---

### Chat/Comments
**Priority:** Low

Add discussion capability to issues.

**Features:**
- Comments on issues
- @mentions
- Real-time updates
- Markdown support

**Effort:** Large
**Value:** Medium (depends on use case)

---

### Issue Templates
**Priority:** Low

Pre-defined issue templates for common scenarios.

**Examples:**
- User Story template
- Bug Report template
- Spike/Research template
- Custom templates

**Effort:** Medium
**Value:** Low (workflow dependent)

---

## Analytics & Insights

### Voting Analytics
**Priority:** Low

Track and display voting patterns.

**Metrics:**
- Average estimation time
- Consensus rate (how often votes match)
- User participation rates
- Historical trends

**Effort:** Large
**Value:** Low (nice insight but not core)

---

### Export Functionality
**Priority:** Low

Export session data for record-keeping.

**Formats:**
- CSV
- JSON
- PDF report
- Markdown

**Data:**
- All issues with votes
- Final scores
- Timestamps
- Participants

**Effort:** Medium
**Value:** Medium (depends on workflow)

---

## Notes

- Features are prioritized based on effort vs. value
- "Low priority" doesn't mean not valuable, just not urgent
- User feedback should drive prioritization
- Monitor production usage to identify real needs
- Keep features simple and focused

## Contributing Ideas

Have a feature idea? Consider:
1. **Does it solve a real problem?** - Avoid feature creep
2. **Is it aligned with the core purpose?** - Planning poker estimation
3. **What's the effort vs. value?** - Be realistic about complexity
4. **Can it be done simply?** - Start with MVP version

Add suggestions to this document with:
- Clear description
- Use case / problem it solves
- Rough effort estimate
- Expected value/benefit
