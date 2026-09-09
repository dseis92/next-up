# Manual Tests — E3 Dealbreaker Engine

## Test Execution

**Feature**: E3 — Dealbreaker Engine
**Related Spec**: E3_DEALBREAKER_ENGINE_SPEC.md

**Approved E3 Code SHA**: `8f4ba113c02adddbc014c44510ea1142ba5f3328`

**Migration**: `20260908000006` APPLIED

**Programmatic Verification**: PASS

**Manual Browser Execution**: PARTIAL (required merge-gate tests only)

**Tester**: Human tester
**Date**: 2026-09-09
**Runtime**: LOCAL FEATURE BRANCH + REMOTE SUPABASE

**Required Local Browser Merge-Gate**: PASS

**Production Smoke**: PASS

**Comprehensive Optional/Manual Cases**: NOT FULLY EXECUTED

---

## Pre-Test Requirements

1. Apply E3 migration: `supabase/migrations/20260908000006_create_user_dealbreakers.sql`
2. Have test account with authenticated access
3. Have test jobs with varying compensation/arrangement/type data

---

## Settings Tests

### DB-SET-001: Initial Empty State

**Objective**: Verify dealbreaker settings load empty for new user

**Steps**:
1. Log in as test user with no saved dealbreakers
2. Navigate to `/settings`
3. Click "Dealbreakers"
4. Observe form state

**Expected**:
- Minimum salary field is empty
- Salary disclosure checkbox is unchecked
- No work arrangements selected
- No employment types selected
- No errors displayed

---

### DB-SET-002: Save Minimum Salary

**Objective**: Verify minimum salary preference saves

**Steps**:
1. Navigate to `/settings/dealbreakers`
2. Enter "120000" in minimum salary field
3. Click "Save changes"
4. Observe result

**Expected**:
- Success (navigates back to `/settings`)
- No error message

**Verification**:
- Navigate back to `/settings/dealbreakers`
- Minimum salary field shows "120000"

---

### DB-SET-003: Save Salary Disclosure

**Objective**: Verify salary disclosure requirement saves

**Steps**:
1. Navigate to `/settings/dealbreakers`
2. Check "Require salary disclosure"
3. Click "Save changes"

**Expected**:
- Success
- Preference persists on reload

---

### DB-SET-004: Save Work Arrangements

**Objective**: Verify work arrangement preferences save

**Steps**:
1. Navigate to `/settings/dealbreakers`
2. Select "Remote" and "Hybrid"
3. Click "Save changes"

**Expected**:
- Both selections persist on reload

---

### DB-SET-005: Save Employment Types

**Objective**: Verify employment type preferences save

**Steps**:
1. Navigate to `/settings/dealbreakers`
2. Select "Full-time" and "Contract"
3. Click "Save changes"

**Expected**:
- Both selections persist on reload

---

### DB-SET-006: Clear All Dealbreakers

**Objective**: Verify clearing all preferences

**Steps**:
1. Set at least one preference
2. Click "Clear all dealbreakers"
3. Confirm dialog
4. Observe result

**Expected**:
- All form fields reset to empty/unchecked
- Preferences removed from database

---

### DB-SET-007: Account Isolation

**Objective**: Verify RLS prevents cross-user access

**Steps**:
1. Log in as User A
2. Set dealbreaker preferences
3. Log out
4. Log in as User B
5. Navigate to `/settings/dealbreakers`

**Expected**:
- User B sees empty form (not User A's preferences)

---

## Evaluation Logic Tests

### DB-EVAL-001: Minimum Salary Conflict

**Objective**: Verify conflict when job max < user min

**Test Data**:
- User minimum: $150,000
- Job: $100,000 - $140,000 yearly

**Expected**: CONFLICT

---

### DB-EVAL-002: Minimum Salary Pass

**Objective**: Verify pass when job min >= user min

**Test Data**:
- User minimum: $100,000
- Job: $110,000 - $150,000 yearly

**Expected**: PASS

---

### DB-EVAL-003: Minimum Salary Unknown (Range Overlap)

**Objective**: Verify unknown when range overlaps floor

**Test Data**:
- User minimum: $120,000
- Job: $100,000 - $150,000 yearly

**Expected**: UNKNOWN

---

### DB-EVAL-004: Salary Disclosure Conflict

**Objective**: Verify conflict when salary not listed

**Test Data**:
- User requires disclosure: Yes
- Job: No salary information

**Expected**: CONFLICT

---

### DB-EVAL-005: Work Arrangement Conflict

**Objective**: Verify conflict when arrangement not allowed

**Test Data**:
- User allows: Remote only
- Job: On-site

**Expected**: CONFLICT

---

### DB-EVAL-006: Employment Type Conflict

**Objective**: Verify conflict when type not allowed

**Test Data**:
- User allows: Full-time only
- Job: Contract

**Expected**: CONFLICT

---

## Job Detail Integration

### DB-DETAIL-001: Dealbreaker Section Displays

**Objective**: Verify dealbreaker findings appear on Job Detail

**Setup**:
- Set at least one dealbreaker preference
- View a job that triggers a conflict

**Expected**:
- "Your dealbreakers" section appears
- Conflict count shown
- Individual findings listed with icons
- Explanations are clear and factual

---

### DB-DETAIL-002: No Preferences Set

**Objective**: Verify behavior when user has no dealbreakers

**Setup**:
- Clear all dealbreaker preferences
- View any job

**Expected**:
- No dealbreaker section displayed (or shows "No active rules")

---

### DB-DETAIL-003: All Pass State

**Objective**: Verify display when all rules pass

**Setup**:
- Set preferences that job satisfies
- View matching job

**Expected**:
- "Your dealbreakers" section shows
- "No dealbreaker conflicts found"
- Individual findings show green checkmarks

---

## Matching Independence

### DB-MATCH-001: Match Score Unchanged

**Objective**: Verify dealbreakers don't change match percentage

**Steps**:
1. View a job, note match percentage
2. Navigate to `/settings/dealbreakers`
3. Set preferences that would conflict with that job
4. Return to same job detail

**Expected**:
- Match percentage is identical
- Dealbreaker conflict appears separately
- Match score unaffected

---

### DB-MATCH-002: Apply Still Works

**Objective**: Verify Apply functionality with dealbreaker conflict

**Setup**:
- Job has dealbreaker conflict

**Expected**:
- Apply button still functional
- No blocking behavior
- User remains in control

---

### DB-MATCH-003: Save Still Works

**Objective**: Verify Save functionality with dealbreaker conflict

**Setup**:
- Job has dealbreaker conflict

**Expected**:
- Save button still functional
- Job saves normally

---

## Error Handling

### DB-ERROR-001: Storage Load Failure

**Objective**: Verify safe error state when preferences fail to load

**Simulation**: Network failure / RLS error

**Expected**:
- Error message displayed
- No fake "No conflicts" state
- Match scoring still works
- Page doesn't crash

---

### DB-ERROR-002: Storage Save Failure

**Objective**: Verify retry on save failure

**Steps**:
1. Set preferences
2. Simulate save failure
3. Observe behavior

**Expected**:
- Error message displayed
- Form state preserved (unsaved edits remain)
- Retry button or ability to try again

---

## Frozen Systems

### DB-FREEZE-001: Discover Unchanged

**Objective**: Verify Discover has no E3 integration

**Steps**:
1. Navigate to `/discover`
2. Swipe through jobs

**Expected**:
- No dealbreaker badges
- No dealbreaker UI
- Discover behavior unchanged

---

### DB-FREEZE-002: Deck Unchanged

**Objective**: Verify Opportunity Deck has no E3 integration

**Steps**:
1. Navigate to `/explore`
2. Switch to Deck mode
3. Swipe through jobs

**Expected**:
- No dealbreaker controls
- No dealbreaker badges
- Deck functionality unchanged

---

### DB-FREEZE-003: Compare Unchanged

**Objective**: Verify Opportunity Compare has no E3 integration

**Steps**:
1. Select 2+ jobs for comparison
2. Open comparison page

**Expected**:
- No dealbreaker section
- Compare functionality unchanged

---

## Console/Network Tests

### DB-CONSOLE-001: No Errors

**Objective**: Verify clean console during normal flow

**Steps**:
1. Open DevTools Console
2. Navigate settings → dealbreakers → save → view jobs
3. Observe console

**Expected**:
- No React errors
- No Supabase errors
- No undefined errors

---

### DB-NETWORK-001: Single Preferences Load

**Objective**: Verify no N+1 preference loading

**Steps**:
1. Open DevTools Network tab
2. Navigate to page with multiple jobs (e.g., Saved)
3. Count dealbreaker preference requests

**Expected**:
- ONE preference load per page
- NOT one per job card

---

## Accessibility

### DB-A11Y-001: Keyboard Navigation

**Objective**: Verify settings form is keyboard accessible

**Steps**:
1. Navigate to `/settings/dealbreakers` using only keyboard
2. Tab through form fields
3. Toggle checkboxes with Space
4. Submit with Enter

**Expected**:
- All controls accessible
- Logical tab order
- Visible focus indicators

---

### DB-A11Y-002: Screen Reader Labels

**Objective**: Verify screen reader support

**Tools**: VoiceOver (macOS) or NVDA (Windows)

**Expected**:
- Form labels announced
- Checkbox states announced
- Error messages announced

---

## Mobile Tests

### DB-MOBILE-001: Settings Layout

**Objective**: Verify settings form on mobile

**Steps**:
1. Open `/settings/dealbreakers` on mobile device or viewport < 640px
2. Fill out form

**Expected**:
- Form readable and usable
- Inputs properly sized
- No horizontal scroll
- Buttons accessible

---

## Settings Error Handling Tests

### DB-SET-ERR-001: Load Failure Handling

**Objective**: Verify load failure prevents unsafe overwrite

**Steps**:
1. Simulate database error during preference load (disconnect network or use browser dev tools to block request)
2. Navigate to `/settings/dealbreakers`
3. Observe error state

**Expected**:
- Error message displays
- Retry button appears
- Save/Clear buttons are disabled
- Form inputs remain editable but cannot be saved

---

### DB-SET-ERR-002: Retry After Load Failure

**Objective**: Verify retry mechanism works

**Steps**:
1. Trigger load failure (as above)
2. Restore network/database access
3. Click "Retry" button

**Expected**:
- Loading state appears
- Preferences load successfully
- Error clears
- Save/Clear buttons become enabled

---

### DB-SET-VAL-001: Negative Salary Validation

**Objective**: Verify negative salary is rejected

**Steps**:
1. Navigate to `/settings/dealbreakers`
2. Enter "-50000" in minimum salary
3. Click "Save changes"

**Expected**:
- Error message: "Minimum salary cannot be negative."
- Preferences not saved
- Form remains in edit mode

---

### DB-SET-VAL-002: Non-Numeric Salary Validation

**Objective**: Verify non-numeric salary is rejected

**Steps**:
1. Enter "abc" or "100k" in minimum salary field
2. Click "Save changes"

**Expected**:
- Error message: "Minimum salary must be a valid number."
- Preferences not saved

---

### DB-SET-VAL-003: Excessive Salary Validation

**Objective**: Verify database range check

**Steps**:
1. Enter "99999999999" (exceeds max)
2. Click "Save changes"

**Expected**:
- Error message about maximum allowed value
- Preferences not saved

---

## Performance and N+1 Tests

### DB-PERF-001: Explore List Single Preference Load

**Objective**: Verify Explore LIST mode loads preferences once, not per card

**Steps**:
1. Open browser dev tools Network tab
2. Navigate to `/explore`
3. Ensure List mode is active
4. Observe network requests

**Expected**:
- ONE request to load user dealbreaker preferences
- NO additional preference requests per job card
- All dealbreaker badges render correctly

---

### DB-PERF-002: Saved Jobs Single Preference Load

**Objective**: Verify Saved page loads preferences once

**Steps**:
1. Open browser dev tools Network tab
2. Navigate to `/saved`
3. Observe network requests

**Expected**:
- ONE auth.getUser() call
- ONE dealbreaker preferences load
- NO per-card preference requests
- All badges render correctly

---

### DB-PERF-003: Job Detail Single Preference Load

**Objective**: Verify Job Detail loads preferences once

**Steps**:
1. Open browser dev tools Network tab
2. Navigate to any `/jobs/[id]`
3. Observe network requests

**Expected**:
- ONE dealbreaker preferences load
- Findings section renders correctly
- No repeated preference fetches

---

## Surface Integration Tests

### DB-SURF-001: Explore List Badge Display

**Objective**: Verify dealbreaker badges appear in Explore LIST view

**Steps**:
1. Set dealbreaker: Minimum salary 150000, Require disclosure
2. Navigate to `/explore`
3. Ensure LIST mode active
4. Find a job with salary < 150000 OR no salary listed

**Expected**:
- Job card shows match score badge
- Job card shows dealbreaker conflict/unknown badge next to match score
- Badge colors: conflict = red/warning, unknown = muted
- Badge shows conflict/unknown count

---

### DB-SURF-002: Saved Jobs Badge Display

**Objective**: Verify dealbreaker badges appear on Saved jobs

**Steps**:
1. Save a job that conflicts with dealbreakers
2. Navigate to `/saved`
3. Locate saved job card

**Expected**:
- Match score displayed (or incomplete profile message)
- Dealbreaker badge displayed next to match score
- Badge accurately reflects evaluation

---

### DB-SURF-003: Job Detail Findings Display

**Objective**: Verify dealbreaker findings appear in Job Detail

**Steps**:
1. Set multiple dealbreakers
2. Navigate to job detail for job with conflicts
3. Scroll to dealbreaker section

**Expected**:
- Dedicated dealbreaker findings card appears
- Section shows after match breakdown
- Individual rule findings listed with icons:
  - Pass: green checkmark
  - Conflict: red/warning triangle
  - Unknown: help circle
- Clear explanations for each finding

---

### DB-SURF-004: No Dealbreaker Badge When Inactive

**Objective**: Verify badge does not appear when no dealbreakers set

**Steps**:
1. Clear all dealbreakers (or use account with none set)
2. Navigate to Explore/Saved/Job Detail
3. Observe job cards/detail

**Expected**:
- NO dealbreaker badge appears
- Match score still displays normally
- No "inactive" or "no dealbreakers" message cluttering UI

---

### DB-SURF-005: Cross-Surface Consistency

**Objective**: Verify same job shows same dealbreaker result everywhere

**Steps**:
1. Set specific dealbreakers
2. Find job ID that triggers conflict
3. View job in:
   - Explore List
   - Saved (if saved)
   - Job Detail

**Expected**:
- SAME dealbreaker evaluation status across all surfaces
- SAME conflict/unknown counts
- Consistent badge display
- Consistent findings explanations

---

## Error Isolation Tests

### DB-ISO-001: Dealbreaker Load Error Does Not Break Job Display

**Objective**: Verify dealbreaker failure does not crash surfaces

**Steps**:
1. Simulate dealbreaker preference load failure (block network to user_dealbreakers endpoint)
2. Navigate to `/explore`
3. Observe job display

**Expected**:
- Jobs still load and display
- Match scores still appear
- NO dealbreaker badges appear (graceful degradation)
- No JavaScript errors in console
- Page remains functional

---

### DB-ISO-002: Invalid Preference Data Handling

**Objective**: Verify app handles malformed dealbreaker data

**Steps**:
1. Using DB admin, insert invalid work_arrangement value (e.g., "invalid_value")
2. Navigate to surfaces

**Expected**:
- App does not crash
- Either: preferences validation error, OR: invalid value ignored
- Migration constraints prevent this in production

---

### DB-SET-VAL-DECIMAL-001: Decimal Input Validation

**Objective**: Verify decimal salary input is rejected

**Steps**:
1. Navigate to `/settings/dealbreakers`
2. Enter "100000.5" in minimum salary
3. Click "Save changes"

**Expected**:
- Validation error: "Minimum salary must be a whole number (no decimals)."
- No database write
- Form remains in edit state

---

### DB-SALARY-EST-001: Estimated Salary Minimum

**Objective**: Verify estimated salary returns UNKNOWN for minimum salary rule

**Steps**:
1. Set dealbreaker: minimum salary $150,000
2. Find job with `salary_is_estimated = true` and range that would normally pass/conflict
3. View job dealbreaker evaluation

**Expected**:
- Minimum salary rule outcome: UNKNOWN
- Explanation contains "estimated"

---

### DB-SALARY-EST-002: Estimated Salary Disclosure

**Objective**: Verify estimated salary returns CONFLICT for disclosure requirement

**Steps**:
1. Set dealbreaker: require salary disclosure
2. Find job with salary present AND `salary_is_estimated = true`
3. View job dealbreaker evaluation

**Expected**:
- Salary disclosure outcome: CONFLICT
- Explanation: "Compensation is estimated rather than disclosed."

---

### DB-SAVED-INCOMPLETE-001: Saved Incomplete Profile Independence

**Objective**: Verify dealbreaker badge displays independently of match profile completeness

**Steps**:
1. Have incomplete matching profile (missing skills/experience/etc)
2. Set active dealbreaker (e.g., minimum salary)
3. Save job that conflicts with dealbreaker
4. Navigate to `/saved`

**Expected**:
- "Finish your profile to see your match" message displays
- AND dealbreaker conflict badge displays separately
- Both messages visible simultaneously

---

### DB-DETAIL-PREF-ERROR-001: Job Detail Preference Load Error

**Objective**: Verify dealbreaker preference load failure is isolated

**Steps**:
1. Simulate dealbreaker preference load failure (block network to `user_dealbreakers`)
2. Navigate to `/jobs/[id]`
3. Observe page functionality

**Expected**:
- "Dealbreaker preferences unavailable." displays in dealbreaker section
- Match score still displays normally
- Save button still works
- Apply button still works
- AI explanation section unaffected
- Job facts/details render normally

---

### DB-NULL-EVIDENCE-001: Null Evidence Handling

**Objective**: Verify null work arrangement/employment type returns UNKNOWN

**Steps**:
1. Using DB admin, set job `work_arrangement = NULL` or `employment_type = NULL`
2. Set corresponding dealbreaker restriction
3. View job evaluation

**Expected**:
- Affected rule outcome: UNKNOWN
- No crash
- Explanation indicates missing/unspecified data

---

## Document Information

**Created**: 2026-09-08
**Updated**: 2026-09-08 (trust semantics validation tests added)
**Feature**: E3 — Dealbreaker Engine
**Migration**: `20260908000006_create_user_dealbreakers.sql`
**Status**: NOT YET EXECUTED — PENDING INDEPENDENT REVIEW
