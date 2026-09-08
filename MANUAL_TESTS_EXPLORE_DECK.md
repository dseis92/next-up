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

## W. Swipe Failure Recovery

**Test ID**: DECK-SWIPE-FAIL-001
**Objective**: Verify card returns to center on persistence failure

**Steps**:
*Requires simulating offline mode or network failure*

1. Open Deck mode
2. Set DevTools to offline
3. Swipe right (save)
4. Observe card behavior

**Expected Result**:
- Card animates during swipe
- Persistence fails
- Card snaps back to center
- Current job remains visible
- Error toast appears
- Deck does NOT advance
- User can retry when online

---

## X. Next Card After Swipe

**Test ID**: DECK-NEXT-001
**Objective**: Verify next card appears correctly after successful swipe

**Steps**:
1. Open Deck with multiple jobs
2. Swipe right (save) successfully
3. Observe next card

**Expected Result**:
- Current card exits
- Next card appears centered and fully visible
- Next card is interactive
- Match score displays correctly
- No visual artifacts from previous card

---

## Y. Mode Toggle Consistency

**Test ID**: DECK-TOGGLE-001
**Objective**: Verify reviewed jobs don't reappear after mode toggle

**Steps**:
1. Open Deck mode
2. Save job A
3. Pass job B
4. Switch to List mode
5. Switch back to Deck mode
6. Observe candidates

**Expected Result**:
- Job A does not appear in Deck
- Job B does not appear in Deck
- Job A still appears in List mode (List shows all)
- Job B still appears in List mode
- Deck shows only unreviewed jobs

---

## Z. Filter Reset Consistency

**Test ID**: DECK-FILTER-RESET-001
**Objective**: Verify reviewed jobs remain excluded after filter changes

**Steps**:
1. Open Deck mode
2. Save job A
3. Change work arrangement filter
4. Observe Deck candidates

**Expected Result**:
- If job A matches new filter, it remains excluded from Deck
- Reviewed status persists across filter changes
- Deck resets to new filtered candidates
- Index resets to 0

---

## AA. Deck Auxiliary Load Failure

**Test ID**: DECK-AUX-FAIL-001
**Objective**: Verify safe error when saved/passed data fails to load

**Steps**:
*Requires simulating saved_jobs/passed_jobs query failure*

1. Simulate network failure for auxiliary queries only
2. Load /explore page
3. Switch to Deck mode

**Expected Result**:
- List mode works normally
- Deck shows error message: "Unable to load your Opportunity Deck right now."
- "Return to List" button appears
- No cards shown based on empty Sets
- No "Deck cleared" message
- No raw Supabase errors

---

## AB. Keyboard Button Semantics

**Test ID**: DECK-KEY-BTN-001
**Objective**: Verify keyboard shortcuts don't hijack button behavior

**Steps**:
1. Open Deck mode
2. Tab to Save button (focus visible)
3. Press Enter
4. Observe action
5. Tab to Pass button
6. Press Enter
7. Tab to Details button
8. Press Enter

**Expected Result**:
- Save button + Enter = Save action (normal button behavior)
- Pass button + Enter = Pass action (normal button behavior)
- Details button + Enter = Navigate to details (normal button behavior)
- Deck region (when focused) + ArrowLeft = Pass
- Deck region (when focused) + ArrowRight = Save
- Deck region (when focused) + Enter = Details

---

## AC. Reduced Motion Active Card

**Test ID**: DECK-A11Y-RM-001
**Objective**: Verify active card respects reduced motion

**Steps**:
1. Enable "Reduce motion" in OS settings
2. Open Deck mode
3. Swipe card left/right
4. Observe animations

**Expected Result**:
- Card rotation disabled or minimal
- Exit animation very short or instant
- Save/Pass indicators remain visible
- Background card not shown (already implemented)
- Functionality intact

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
| DECK-SWIPE-FAIL-001 | | | | |
| DECK-NEXT-001 | | | | |
| DECK-TOGGLE-001 | | | | |
| DECK-FILTER-RESET-001 | | | | |
| DECK-AUX-FAIL-001 | | | | |
| DECK-KEY-BTN-001 | | | | |
| DECK-A11Y-RM-001 | | | | |

---

## AD. Undo Survives Save

**Test ID**: DECK-UNDO-SAVE-001
**Objective**: Verify Undo remains available after Save action

**Steps**:
1. Open Deck mode with multiple jobs
2. Note current job A
3. Click Save (or swipe right)
4. Observe next job B appears
5. Verify Undo toast remains visible
6. Click Undo

**Expected Result**:
- After saving A, Undo toast appears and remains visible
- Job B appears as current card
- Undo button/toast functional
- Clicking Undo restores job A as current card
- lastAction preserved until Undo completes

---

## AE. Undo Survives Pass

**Test ID**: DECK-UNDO-PASS-001
**Objective**: Verify Undo remains available after Pass action

**Steps**:
1. Open Deck mode
2. Note current job A
3. Click Pass (or swipe left)
4. Observe next job B appears
5. Verify Undo toast visible
6. Click Undo

**Expected Result**:
- After passing A, Undo toast appears
- Job B appears as current
- Undo restores job A
- lastAction cleared only after successful undo

---

## AF. Next Card State Isolation

**Test ID**: DECK-ISOLATION-001
**Objective**: Verify next card does not inherit previous card's exit state

**Steps**:
1. Open Deck mode with jobs A and B
2. Swipe right to save A
3. Observe A exits right
4. Observe B appears

**Expected Result**:
- Only A exits with animation
- B appears centered and fresh
- B does not inherit A's exit motion or state
- B's motion values start at zero

---

## AG. Swipe Persistence Before Animation

**Test ID**: DECK-PERSIST-FIRST-001
**Objective**: Verify persistence completes before exit animation

**Steps**:
1. Open Deck mode
2. Open DevTools Network tab
3. Swipe right on current card
4. Observe network request timing vs animation

**Expected Result**:
- Persistence POST request starts immediately
- If persistence fails, card snaps back to center
- If persistence succeeds, card animates out
- Deck does NOT advance until animation completes
- Network request visible before animation finishes

---

## AH. Deck Advance After Animation

**Test ID**: DECK-ADVANCE-AFTER-001
**Objective**: Verify deck advances only after exit animation completes

**Steps**:
1. Open Deck mode with jobs A and B
2. Swipe right on A
3. Watch carefully during animation

**Expected Result**:
- A remains the rendered card during exit animation
- B does NOT appear until A's animation completes
- Deck currentIndex updates after animation
- lastAction recorded after animation
- Undo available after animation completes

---

## AI. Filter After Review

**Test ID**: DECK-FILTER-REVIEW-001
**Objective**: Verify reviewed jobs stay excluded after filter changes

**Steps**:
1. Open Deck mode
2. Save job A
3. Change work arrangement filter
4. Observe Deck candidates

**Expected Result**:
- Job A remains excluded from Deck
- Deck shows only unreviewed jobs matching new filter
- Reviewed status persists across filter changes

---

## AJ. Focus Visibility

**Test ID**: DECK-FOCUS-VIS-001
**Objective**: Verify keyboard focus is visible on Deck region

**Steps**:
1. Open Deck mode
2. Press Tab to focus Deck region
3. Observe focus indicator

**Expected Result**:
- Deck region shows visible focus ring when focused via keyboard
- Focus ring uses brand color
- Focus ring has appropriate contrast
- Focus indicator does not show on mouse click (focus-visible behavior)

---

## AK. Rapid Mixed Input During Exit

**Test ID**: DECK-RACE-001
**Objective**: Verify interaction lock prevents duplicate actions during swipe exit animation

**Steps**:
1. Open Deck mode with job A
2. Swipe right to save A
3. Immediately after persistence begins/succeeds, rapidly attempt:
   - Click Pass button
   - Click Save button again
   - Press ArrowLeft
   - Press ArrowRight
   - Attempt to drag card

**Expected Result**:
- Exactly ONE save action persisted for job A
- No duplicate save recorded
- No pass action on job A
- Buttons disabled during exit animation
- Keyboard shortcuts ignored during animation
- Drag disabled during animation
- Job B appears once after A's animation completes
- One finalization only

---

## AL. Filter During Exit Animation

**Test ID**: DECK-FILTER-EXIT-001
**Objective**: Verify filter changes during swipe exit remain safe

**Steps**:
1. Open Deck mode
2. Swipe right to save job A
3. Immediately after persistence succeeds but before animation completes:
   - Change work arrangement filter

**Expected Result**:
- Job A persisted correctly
- Job A excluded from new filtered Deck
- Deck rebuilds with new filter
- Deck does not remain stuck disabled
- No false Undo action created if animation interrupted
- Safe state recovery

---

## AM. Set Synchronized After Persistence

**Test ID**: DECK-SET-SYNC-001
**Objective**: Verify Set updates immediately after successful persistence

**Steps**:
1. Open Deck mode
2. Note job A
3. Swipe right to save A
4. Immediately after persistence succeeds (before animation completes):
   - Change filter to force Deck rebuild

**Expected Result**:
- savedJobIds Set updated before filter change
- Job A excluded from rebuilt Deck
- No race condition where A reappears
- Database and Set state consistent

---

## AN. Failed Persistence Lock Release

**Test ID**: DECK-FAIL-LOCK-001
**Objective**: Verify lock released after failed persistence

**Steps**:
1. Open Deck mode
2. Set DevTools to offline
3. Swipe right to save job A
4. Observe persistence failure
5. Observe UI state

**Expected Result**:
- Card snaps back to center
- Error toast appears
- Buttons become enabled again
- Keyboard shortcuts work again
- Drag enabled again
- Action retryable
- No duplicate lock state

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
| DECK-SWIPE-FAIL-001 | | | | |
| DECK-NEXT-001 | | | | |
| DECK-TOGGLE-001 | | | | |
| DECK-FILTER-RESET-001 | | | | |
| DECK-AUX-FAIL-001 | | | | |
| DECK-KEY-BTN-001 | | | | |
| DECK-A11Y-RM-001 | | | | |
| DECK-UNDO-SAVE-001 | | | | |
| DECK-UNDO-PASS-001 | | | | |
| DECK-ISOLATION-001 | | | | |
| DECK-PERSIST-FIRST-001 | | | | |
| DECK-ADVANCE-AFTER-001 | | | | |
| DECK-FILTER-REVIEW-001 | | | | |
| DECK-FOCUS-VIS-001 | | | | |
| DECK-RACE-001 | | | | |
| DECK-FILTER-EXIT-001 | | | | |
| DECK-SET-SYNC-001 | | | | |
| DECK-FAIL-LOCK-001 | | | | |

---

**Document Version**: 1.3
**Last Updated**: 2026-09-07
**Feature**: E1 — Explore Opportunity Deck
**Related Commit**: TBD
