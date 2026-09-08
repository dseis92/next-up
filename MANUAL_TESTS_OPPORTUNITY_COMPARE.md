# Manual Tests — E2 Opportunity Compare

## Test Execution

**Feature**: E2 — Opportunity Compare
**Related Spec**: E2_OPPORTUNITY_COMPARE_SPEC.md
**Related Commit**: TBD

---

## Selection Tests

### 1. Explore List Compare Selection

**Test ID**: COMP-SELECT-EXPLORE-001
**Objective**: Verify compare selection from Explore List

**Steps**:
1. Navigate to /explore
2. Ensure in List mode (not Deck)
3. Click "Compare" on job A
4. Observe button state change
5. Click "Compare" on job B
6. Observe compare tray appears
7. Verify tray shows 2/4
8. Click "Compare opportunities" in tray
9. Verify navigation to /compare with job A and B

**Expected Result**:
- Compare button changes to "Comparing" with checkmark
- Tray appears after 2nd selection
- Tray shows correct count
- Compare page loads both jobs
- Jobs display correct deterministic scores

---

### 2. Saved Compare Selection

**Test ID**: COMP-SELECT-SAVED-001
**Objective**: Verify compare selection from Saved

**Steps**:
1. Save at least 2 jobs
2. Navigate to /saved
3. Click "Compare" on saved job A
4. Click "Compare" on saved job B
5. Verify tray appears
6. Click "Compare opportunities"

**Expected Result**:
- Compare button toggles correctly
- Tray displays saved job selections
- Compare page opens with correct jobs

---

### 3. Job Detail Compare Selection

**Test ID**: COMP-SELECT-DETAIL-001
**Objective**: Verify compare selection from Job Detail

**Steps**:
1. Open job detail page for job A
2. Click "Compare" in header
3. Navigate back to Explore or Saved
4. Select job B for comparison
5. Open comparison

**Expected Result**:
- Job Detail compare button shows selected state
- Selection persists across navigation
- Compare page includes job from detail view

---

### 4. Selection Persistence Across Navigation

**Test ID**: COMP-SELECT-PERSIST-001
**Objective**: Verify selection survives navigation

**Steps**:
1. In Explore, select job A for compare
2. Navigate to Saved
3. Verify job A still selected (if also saved)
4. Select job B for compare
5. Navigate to job C detail page
6. Navigate back to Explore
7. Verify compare tray still shows jobs A and B

**Expected Result**:
- Selection persists during browser session
- Tray remains visible across page navigations
- Selection count correct

---

### 5. Fifth Job Prevention

**Test ID**: COMP-SELECT-MAX-001
**Objective**: Verify max 4 job enforcement

**Steps**:
1. Select 4 jobs for comparison
2. Verify tray shows 4/4
3. Attempt to click "Compare" on a fifth job
4. Observe button state

**Expected Result**:
- Compare button disabled on all other jobs
- Message displayed: "You can compare up to 4 opportunities."
- Fifth job cannot be added

---

### 6. Remove From Comparison

**Test ID**: COMP-SELECT-REMOVE-001
**Objective**: Verify removing job from comparison

**Steps**:
1. Select 3 jobs for comparison
2. Click × button on second job in tray
3. Verify tray updates to 2/4
4. Verify compare buttons update
5. Open comparison
6. Verify only 2 jobs displayed

**Expected Result**:
- Job removed from tray
- Count decrements
- Compare button on removed job becomes "Compare" again
- Comparison page reflects removal

---

### 7. Clear Comparison

**Test ID**: COMP-SELECT-CLEAR-001
**Objective**: Verify clearing all selections

**Steps**:
1. Select 3 jobs for comparison
2. Click "Clear comparison" in compare page header
3. Verify redirection to /explore
4. Verify compare tray no longer visible
5. Verify all "Comparing" buttons reset to "Compare"

**Expected Result**:
- All selections cleared
- Tray disappears
- User returns to Explore
- All buttons reset

---

## Compare Page Tests

### 8. Two-Job Comparison

**Test ID**: COMP-VIEW-TWO-001
**Objective**: Verify comparing 2 jobs

**Steps**:
1. Select exactly 2 jobs
2. Open comparison
3. Verify both job summaries display
4. Verify match scores section
5. Verify compensation section
6. Verify lifestyle section
7. Verify skills section
8. Verify strengths/concerns section

**Expected Result**:
- Both jobs displayed side-by-side
- All sections populate correctly
- Scores match other surfaces
- Mobile: horizontal scroll works

---

### 9. Four-Job Comparison

**Test ID**: COMP-VIEW-FOUR-001
**Objective**: Verify comparing max 4 jobs

**Steps**:
1. Select 4 jobs
2. Open comparison
3. Verify all 4 job summaries
4. Verify comparison matrix readable
5. Test mobile horizontal scroll

**Expected Result**:
- 4 jobs displayed
- Matrix remains usable
- Mobile: smooth horizontal navigation
- All jobs accessible

---

### 10. Direct Compare URL

**Test ID**: COMP-URL-DIRECT-001
**Objective**: Verify direct /compare?jobs=id1,id2,id3 URL

**Steps**:
1. Manually construct /compare?jobs=<id1>,<id2>
2. Open URL directly
3. Verify jobs load correctly
4. Verify match scores calculated for current user

**Expected Result**:
- Jobs load from URL parameters
- Current user's deterministic scores shown
- Page functions normally

---

### 11. Malformed Compare URL

**Test ID**: COMP-URL-MALFORMED-001
**Objective**: Verify handling of malformed URL

**Steps**:
1. Try /compare?jobs= (empty)
2. Try /compare?jobs=invalid-id
3. Try /compare?jobs=id1 (only 1)
4. Try /compare?jobs=id1,id2,id3,id4,id5,id6 (>4)

**Expected Result**:
- Empty: Shows empty state
- Invalid: Shows empty state or missing job message
- Only 1: Shows "select at least one more" state
- >4: Takes first 4 unique IDs

---

### 12. Missing Job Handling

**Test ID**: COMP-URL-MISSING-001
**Objective**: Verify handling when selected job no longer exists

**Steps**:
1. Select 3 jobs for comparison
2. Note the job IDs in URL
3. Manually replace one ID with non-existent ID
4. Load the URL

**Expected Result**:
- Notice displays: "One opportunity is no longer available."
- Remaining 2 jobs still compare successfully
- No crash or blank page

---

### 13. Database Load Failure

**Test ID**: COMP-ERROR-DB-001
**Objective**: Verify handling of database errors

**Steps**:
1. Open DevTools Network tab
2. Block all Supabase requests
3. Try to open comparison
4. Observe error handling

**Expected Result**:
- Loading state displays first
- Safe error message: "Unable to load comparison right now."
- "Return to Explore" button provided
- No raw PostgREST errors exposed

---

## Deterministic Score Tests

### 14. Same Score As Job Detail

**Test ID**: COMP-SCORE-DETAIL-001
**Objective**: Verify compare scores match Job Detail

**Steps**:
1. Open job A detail page
2. Note overall_score, qualification_score, lifestyle_score
3. Add job A to comparison
4. Add job B to comparison
5. Open comparison page
6. Verify job A scores in comparison match Job Detail exactly

**Expected Result**:
- Overall match: identical
- Qualification: identical
- Lifestyle: identical
- Component scores: identical

---

### 15. Same Score As Explore

**Test ID**: COMP-SCORE-EXPLORE-001
**Objective**: Verify compare scores match Explore List

**Steps**:
1. In Explore List, note job A's match percentage
2. Add job A to comparison
3. Add job B
4. Open comparison
5. Verify job A score matches Explore

**Expected Result**:
- Compare page overall match = Explore badge percentage
- No score drift between surfaces

---

### 16. Incomplete Profile Handling

**Test ID**: COMP-PROFILE-INCOMPLETE-001
**Objective**: Verify incomplete profile behavior

**Steps**:
1. Use test account with incomplete profile
2. Attempt to compare 2 jobs
3. Observe comparison page

**Expected Result**:
- No fake 0% scores
- Incomplete profile message displays
- Job facts (title, company, salary) still visible where appropriate
- Match sections show incomplete state, not zero

---

## Comparison Features

### 17. Difference Mode

**Test ID**: COMP-DIFF-MODE-001
**Objective**: Verify Differences Only mode

**Steps**:
1. Compare 2 jobs with same employment type
2. Click "Differences only"
3. Verify employment type row hidden
4. Verify differing rows remain visible
5. Click "All details"
6. Verify all rows return

**Expected Result**:
- Identical values hidden in Differences mode
- Differing values always shown
- Toggle works correctly

---

### 18. Balanced Lens

**Test ID**: COMP-LENS-BALANCED-001
**Objective**: Verify Balanced lens (default)

**Steps**:
1. Open comparison
2. Verify default lens is Balanced
3. Observe section order

**Expected Result**:
- Default: Balanced selected
- Order: Match → Compensation → Lifestyle → Skills → Strengths
- Scores unchanged

---

### 19. Compensation Lens

**Test ID**: COMP-LENS-COMP-001
**Objective**: Verify Compensation lens

**Steps**:
1. Open comparison
2. Click "Compensation" lens
3. Observe section reordering

**Expected Result**:
- Compensation section appears first
- Scores unchanged (no new calculations)
- Presentation order changed only

---

### 20. Lifestyle Lens

**Test ID**: COMP-LENS-LIFESTYLE-001
**Objective**: Verify Lifestyle lens

**Steps**:
1. Open comparison
2. Click "Lifestyle" lens
3. Verify lifestyle section emphasized

**Expected Result**:
- Lifestyle section appears earlier
- Scores unchanged
- Work arrangement, location prominent

---

### 21. Qualification Lens

**Test ID**: COMP-LENS-QUAL-001
**Objective**: Verify Qualification lens

**Steps**:
1. Open comparison
2. Click "Qualification" lens
3. Verify skills, experience emphasized

**Expected Result**:
- Match and skills sections appear first
- Scores unchanged
- Focus on qualification factors

---

### 22. Salary Comparison With Missing Data

**Test ID**: COMP-SALARY-MISSING-001
**Objective**: Verify salary handling when some jobs lack salary

**Steps**:
1. Compare job A (with salary) and job B (no salary)
2. Observe compensation section

**Expected Result**:
- Job A shows salary amount
- Job B shows "Not disclosed"
- Missing salary not treated as $0
- Job A not incorrectly labeled "best" if comparison invalid

---

### 23. Leader Indicators - Tie

**Test ID**: COMP-LEADER-TIE-001
**Objective**: Verify tie handling

**Steps**:
1. Compare 2 jobs with same overall match score
2. Observe leader indicators

**Expected Result**:
- No single "winner" declared
- Both jobs may show tie indicator
- Or no leader badge displayed

---

### 24. Leader Indicators - Clear Leader

**Test ID**: COMP-LEADER-CLEAR-001
**Objective**: Verify leader badges

**Steps**:
1. Compare jobs with distinct overall scores
2. Verify "Top match" badge on highest
3. Verify leader indicators for other dimensions

**Expected Result**:
- Highest overall match: "Top match" badge
- Leader indicators transparent and derived from displayed values
- Ties handled gracefully

---

## Accessibility Tests

### 25. Keyboard Navigation

**Test ID**: COMP-A11Y-KEYBOARD-001
**Objective**: Verify keyboard accessibility

**Steps**:
1. Navigate comparison using Tab key
2. Toggle lenses with Enter/Space
3. Navigate to "View details" buttons
4. Activate with Enter

**Expected Result**:
- All interactive elements keyboard accessible
- Focus indicators visible
- Logical tab order

---

### 26. Screen Reader Labels

**Test ID**: COMP-A11Y-SCREEN-001
**Objective**: Verify screen reader support

**Steps**:
1. Enable screen reader (VoiceOver/NVDA)
2. Navigate comparison tray
3. Navigate comparison matrix

**Expected Result**:
- Compare toggle has aria-pressed state
- Remove buttons have job-specific labels
- Tray communicates selection count
- Table headers announced correctly

---

## Mobile Tests

### 27. Mobile Two-Column

**Test ID**: COMP-MOBILE-TWO-001
**Objective**: Verify 2-job mobile comparison

**Steps**:
1. Open comparison on mobile device (< 640px)
2. Compare 2 jobs
3. Verify layout readable
4. Test horizontal scrolling if needed

**Expected Result**:
- 2 jobs easy to compare on phone
- Text readable (not microscopic)
- Job headers clear
- Bottom navigation usable

---

### 28. Mobile Four-Column Scroll

**Test ID**: COMP-MOBILE-FOUR-001
**Objective**: Verify 4-job mobile horizontal navigation

**Steps**:
1. On mobile, compare 4 jobs
2. Swipe/scroll horizontally through job columns
3. Verify all 4 accessible

**Expected Result**:
- Horizontal scroll smooth
- All 4 jobs accessible
- Row labels remain visible/sticky
- No broken overflow

---

## Regression Tests

### 29. Discover Unchanged

**Test ID**: COMP-REGRESS-DISCOVER-001
**Objective**: Verify Discover remains untouched

**Steps**:
1. Navigate to /discover
2. Verify no "Compare" button visible
3. Swipe, pass, save, apply
4. Verify Discover functionality unchanged

**Expected Result**:
- No compare control in Discover
- Discover behavior identical to before E2

---

### 30. Explore Deck Unchanged (E1)

**Test ID**: COMP-REGRESS-DECK-001
**Objective**: Verify E1 Deck remains untouched

**Steps**:
1. Navigate to /explore
2. Switch to Deck mode
3. Verify no "Compare" control appears
4. Swipe right (save)
5. Swipe left (pass)
6. Click undo
7. Verify Deck functions normally

**Expected Result**:
- No compare integration in Deck
- E1 functionality unchanged
- Swipe, undo, progression all work

---

### 31. Session Restoration

**Test ID**: COMP-SESSION-RESTORE-001
**Objective**: Verify session persistence

**Steps**:
1. Select 2 jobs for comparison
2. Refresh the browser
3. Navigate to Explore

**Expected Result**:
- Selection persists across refresh
- Compare tray reappears with selections
- Session-based (not permanent localStorage)

---

### 32. Browser Back/Forward

**Test ID**: COMP-NAVIGATION-BACK-001
**Objective**: Verify browser navigation

**Steps**:
1. Select jobs and open comparison
2. Click "Back to Explore"
3. Click browser back button
4. Click browser forward button

**Expected Result**:
- Back/forward navigation works
- Comparison state preserved
- No broken navigation loops

---

### 33. Console Errors

**Test ID**: COMP-ERROR-CONSOLE-001
**Objective**: Verify no console errors

**Steps**:
1. Open DevTools console
2. Navigate through full compare flow
3. Select, deselect, compare, clear
4. Observe console

**Expected Result**:
- No React rendering errors
- No undefined.status errors
- No PostgREST errors
- No RLS errors

---

### 34. Network Behavior

**Test ID**: COMP-NETWORK-PERF-001
**Objective**: Verify no N+1 queries

**Steps**:
1. Open DevTools Network tab
2. Select 3 jobs for comparison
3. Open comparison page
4. Count Supabase/PostgREST requests
5. Count matching-profile requests

**Expected Result**:
- One batch job query (getJobsByIds)
- One profile hydration (~7 matching-profile requests)
- No per-job profile loading
- Efficient query pattern

---

## Test Execution Log

| Test ID | Date | Tester | Status | Notes |
|---------|------|--------|--------|-------|
| COMP-SELECT-EXPLORE-001 | | | | |
| COMP-SELECT-SAVED-001 | | | | |
| COMP-SELECT-DETAIL-001 | | | | |
| COMP-SELECT-PERSIST-001 | | | | |
| COMP-SELECT-MAX-001 | | | | |
| COMP-SELECT-REMOVE-001 | | | | |
| COMP-SELECT-CLEAR-001 | | | | |
| COMP-VIEW-TWO-001 | | | | |
| COMP-VIEW-FOUR-001 | | | | |
| COMP-URL-DIRECT-001 | | | | |
| COMP-URL-MALFORMED-001 | | | | |
| COMP-URL-MISSING-001 | | | | |
| COMP-ERROR-DB-001 | | | | |
| COMP-SCORE-DETAIL-001 | | | | |
| COMP-SCORE-EXPLORE-001 | | | | |
| COMP-PROFILE-INCOMPLETE-001 | | | | |
| COMP-DIFF-MODE-001 | | | | |
| COMP-LENS-BALANCED-001 | | | | |
| COMP-LENS-COMP-001 | | | | |
| COMP-LENS-LIFESTYLE-001 | | | | |
| COMP-LENS-QUAL-001 | | | | |
| COMP-SALARY-MISSING-001 | | | | |
| COMP-LEADER-TIE-001 | | | | |
| COMP-LEADER-CLEAR-001 | | | | |
| COMP-A11Y-KEYBOARD-001 | | | | |
| COMP-A11Y-SCREEN-001 | | | | |
| COMP-MOBILE-TWO-001 | | | | |
| COMP-MOBILE-FOUR-001 | | | | |
| COMP-REGRESS-DISCOVER-001 | | | | |
| COMP-REGRESS-DECK-001 | | | | |
| COMP-SESSION-RESTORE-001 | | | | |
| COMP-NAVIGATION-BACK-001 | | | | |
| COMP-ERROR-CONSOLE-001 | | | | |
| COMP-NETWORK-PERF-001 | | | | |

---

**Document Version**: 1.0
**Last Updated**: 2026-09-07
**Feature**: E2 — Opportunity Compare
**Related Commit**: TBD
