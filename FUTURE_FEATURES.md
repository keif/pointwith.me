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
