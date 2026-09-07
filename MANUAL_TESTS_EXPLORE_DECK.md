# Manual Test Requirements — Explore Opportunity Deck

This document records manual test requirements for the Explore Opportunity Deck feature that cannot be automatically tested with the current infrastructure.

## Test Environment Setup

1. Navigate to `/explore`
2. Ensure user is authenticated
3. Ensure profile is complete (for scored matches)
4. Switch to Deck mode via mode selector
5. Open browser DevTools Network tab to observe requests

---

## A. View Mode Switching

**Test ID**: DECK-MODE-001
**Objective**: Verify List/Deck mode selector works correctly

**Steps**:
1. Load `/explore` page (defaults to List mode)
2. Verify List mode shows job cards in vertical list
3. Click "Deck" button
4. Verify Deck mode shows swipe card stack
5. Click "List" button
6. Verify List mode returns

**Expected Result**:
- Default mode is List
- Mode selector correctly switches views
- Filters remain active across mode changes
- Search query remains active across mode changes
- No page reload required

---

## B. Mobile Swipe Left (Pass)

**Test ID**: DECK-SWIPE-001
**Objective**: Verify touch swipe left triggers Pass

**Steps**:
1. Open `/explore` in mobile browser or responsive mode
2. Switch to Deck mode
3. Swipe left on current card
4. Observe card animation and network request

**Expected Result**:
- Card animates left with rotation
- Red "PASS" indicator appears during swipe
- ONE POST request to pass the job
- Card exits and next card appears
- Undo toast appears with job title
- Progress counter advances

---

## C. Mobile Swipe Right (Save)

**Test ID**: DECK-SWIPE-002
**Objective**: Verify touch swipe right triggers Save

**Steps**:
1. Open Deck mode on mobile
2. Swipe right on current card
3. Observe card animation and network request

**Expected Result**:
- Card animates right with rotation
- Green "SAVE" indicator appears during swipe
- ONE POST request to save the job
- Card exits and next card appears
- Undo toast appears
- Progress counter advances

---

## D. Desktop Button Actions

**Test ID**: DECK-BTN-001
**Objective**: Verify desktop Pass/Save buttons work

**Steps**:
1. Open Deck mode on desktop
2. Click Pass (X) button
3. Observe action
4. Advance to next card
5. Click Save (Heart) button
6. Observe action

**Expected Result**:
- Pass button triggers same behavior as swipe left
- Save button triggers same behavior as swipe right
- Buttons are disabled during pending actions
- Accessible labels present

---

## E. Keyboard Navigation

**Test ID**: DECK-KEY-001
**Objective**: Verify keyboard shortcuts work

**Steps**:
1. Open Deck mode
2. Focus page (click outside any input)
3. Press ArrowLeft key
4. Observe Pass action
5. Press Undo to return
6. Press ArrowRight key
7. Observe Save action
8. Press Undo to return
9. Press Enter key
10. Observe navigation to Job Detail

**Expected Result**:
- ArrowLeft → Pass
- ArrowRight → Save
- Enter → Job Detail navigation
- Shortcuts disabled when input focused
- Shortcuts disabled during pending actions

---

## F. Details Navigation

**Test ID**: DECK-NAV-001
**Objective**: Verify "View full details" button navigates correctly

**Steps**:
1. Open Deck mode
2. Click "View full details" button on current card
3. Observe navigation

**Expected Result**:
- Navigates to `/jobs/[id]` for current job
- Job Detail page loads with correct job
- Overall score matches Deck score for same job
- Back button returns to Explore

---

## G. Save Persistence

**Test ID**: DECK-SAVE-001
**Objective**: Verify Save action persists correctly

**Steps**:
1. Note current job ID in Deck
2. Click Save (or swipe right)
3. Wait for success
4. Navigate to `/saved`
5. Verify job appears in Saved list

**Expected Result**:
- Job appears in Saved immediately
- Score in Saved matches score in Deck
- Job is excluded from future Deck sessions

---

## H. Pass Persistence

**Test ID**: DECK-PASS-001
**Objective**: Verify Pass action persists correctly

**Steps**:
1. Note current job ID in Deck
2. Click Pass (or swipe left)
3. Wait for success
4. Refresh `/explore` and switch to Deck mode
5. Verify passed job does not appear in Deck

**Expected Result**:
- Job does not reappear in Deck
- Job is excluded from candidates
- Job still appears in List mode (List shows all, Deck shows unreviewed)

---

## I. Undo Save

**Test ID**: DECK-UNDO-001
**Objective**: Verify Undo reverses Save action

**Steps**:
1. Save a job in Deck mode
2. Observe Undo toast appears
3. Click "Undo" in toast
4. Observe result

**Expected Result**:
- ONE DELETE request to unsave job
- Deck returns to saved job (index decreases)
- Job reappears as current card
- Undo toast disappears
- Can re-save or pass the job

---

## J. Undo Pass

**Test ID**: DECK-UNDO-002
**Objective**: Verify Undo reverses Pass action

**Steps**:
1. Pass a job in Deck mode
2. Observe Undo toast appears
3. Click "Undo" in toast before it disappears
4. Observe result

**Expected Result**:
- ONE DELETE request to undo pass
- Deck returns to passed job
- Job reappears as current card
- Can re-pass or save the job

---

## K. Rapid Duplicate Input Prevention

**Test ID**: DECK-DUP-001
**Objective**: Verify rapid clicks only trigger one action

**Steps**:
1. Open Deck mode
2. Rapidly click Save button 5 times in quick succession
3. Observe network requests

**Expected Result**:
- Only ONE save request is sent
- Buttons disabled during pending action
- Card advances once
- No duplicate saves created

---

## L. Failed Persistence Recovery

**Test ID**: DECK-ERR-001
**Objective**: Verify save/pass failure shows safe error

**Steps**:
*This requires simulating network failure (DevTools offline mode)*

1. Open Deck mode
2. Set DevTools to offline
3. Click Save
4. Observe error handling

**Expected Result**:
- Card does NOT advance on failure
- Error toast appears: "Failed to save job. Please try again."
- User can retry when online
- No duplicate action on retry

---

## M. Filter Changes Update Deck

**Test ID**: DECK-FILTER-001
**Objective**: Verify filter changes reset Deck candidates

**Steps**:
1. Open Deck mode with 10+ jobs
2. Note current job
3. Change work arrangement filter
4. Observe Deck candidates update

**Expected Result**:
- Deck resets to new filtered candidates
- Index resets to 0
- Already saved/passed jobs remain excluded
- Progress counter reflects new filtered count

---

## N. Search Changes Update Deck

**Test ID**: DECK-SEARCH-001
**Objective**: Verify search query updates Deck candidates

**Steps**:
1. Open Deck mode
2. Enter search query
3. Observe Deck updates

**Expected Result**:
- Deck shows only jobs matching search
- Deck resets to start
- Search works same as in List mode

---

## O. Empty Filtered State

**Test ID**: DECK-EMPTY-001
**Objective**: Verify empty filter result shows appropriate message

**Steps**:
1. Open Deck mode
2. Apply restrictive filters that match zero jobs
3. Observe empty state

**Expected Result**:
- Shows EmptyState component
- Message: "No jobs found"
- Description: "Try adjusting your filters or search terms"
- No swipe cards shown

---

## P. Deck Exhausted State

**Test ID**: DECK-EXHAUST-001
**Objective**: Verify deck exhaustion shows appropriate message

**Steps**:
1. Open Deck mode with few remaining candidates
2. Review all jobs (save or pass each)
3. Observe final state

**Expected Result**:
- Shows: "Deck cleared"
- Message: "You've reviewed every opportunity matching these filters."
- Button: "View all jobs"
- Clicking button switches to List mode

---

## Q. Incomplete Profile Behavior

**Test ID**: DECK-PROFILE-001
**Objective**: Verify incomplete profile shows correct message in Deck

**Steps**:
1. Use account with incomplete profile
2. Navigate to `/explore`
3. Switch to Deck mode

**Expected Result**:
- Shows IncompleteProfileMessage component
- Message: "Finish your profile to see your match"
- No fake 0% scores
- No swipe cards shown
- Same behavior as List mode for incomplete profile

---

## R. Mobile Layout Responsiveness

**Test ID**: DECK-MOBILE-001
**Objective**: Verify Deck works on mobile viewport

**Steps**:
1. Open `/explore` on mobile device or resize to 375px width
2. Switch to Deck mode
3. Test swipe, buttons, and navigation

**Expected Result**:
- Cards fill mobile viewport appropriately
- Text is readable
- Buttons are touch-friendly (min 44px target)
- No horizontal overflow
- Match badge clearly visible
- Skills badges wrap appropriately

---

## S. Desktop Layout Responsiveness

**Test ID**: DECK-DESKTOP-001
**Objective**: Verify Deck works on desktop viewport

**Steps**:
1. Open `/explore` on desktop (1920px+ width)
2. Switch to Deck mode
3. Observe layout

**Expected Result**:
- Card is centered and max-width constrained
- Readable and polished
- Background card visible if present
- No awkward stretching

---

## T. Reduced Motion Support

**Test ID**: DECK-A11Y-001
**Objective**: Verify prefers-reduced-motion is respected

**Steps**:
1. Enable "Reduce motion" in OS settings
2. Open Deck mode
3. Observe animations

**Expected Result**:
- Background card preview not shown (or minimal motion)
- Swipe animations simplified or disabled
- Functionality remains intact
- No jarring motion

---

## U. List Mode Regression Check

**Test ID**: DECK-REG-001
**Objective**: Verify List mode remains unchanged

**Steps**:
1. Open `/explore` in List mode (default)
2. Verify search works
3. Verify filters work
4. Verify job cards clickable
5. Verify results count accurate
6. Verify incomplete profile handling

**Expected Result**:
- List mode behavior identical to pre-E1
- No visual regressions
- No functional regressions
- Search, filters, navigation work as before

---

## V. N+1 Query Prevention

**Test ID**: DECK-PERF-001
**Objective**: Verify Deck loads saved/passed state once, not per job

**Steps**:
1. Open `/explore` and switch to Deck mode
2. Observe Network tab for saved_jobs and passed_jobs queries

**Expected Result**:
- ONE query for saved_jobs on page load
- ONE query for passed_jobs on page load
- NO per-card queries
- Deck filters in-memory from loaded sets

---

## Test Execution Log

| Test ID | Date | Tester | Pass/Fail | Notes |
|---------|------|--------|-----------|-------|
| DECK-MODE-001 | | | | |
| DECK-SWIPE-001 | | | | |
| DECK-SWIPE-002 | | | | |
| DECK-BTN-001 | | | | |
| DECK-KEY-001 | | | | |
| DECK-NAV-001 | | | | |
| DECK-SAVE-001 | | | | |
| DECK-PASS-001 | | | | |
| DECK-UNDO-001 | | | | |
| DECK-UNDO-002 | | | | |
| DECK-DUP-001 | | | | |
| DECK-ERR-001 | | | | |
| DECK-FILTER-001 | | | | |
| DECK-SEARCH-001 | | | | |
| DECK-EMPTY-001 | | | | |
| DECK-EXHAUST-001 | | | | |
| DECK-PROFILE-001 | | | | |
| DECK-MOBILE-001 | | | | |
| DECK-DESKTOP-001 | | | | |
| DECK-A11Y-001 | | | | |
| DECK-REG-001 | | | | |
| DECK-PERF-001 | | | | |

---

**Document Version**: 1.0
**Last Updated**: 2026-09-07
**Feature**: E1 — Explore Opportunity Deck
**Related Commit**: TBD
