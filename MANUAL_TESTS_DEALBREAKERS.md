# Manual Tests — E3 Dealbreaker Engine

## Test Execution

**Feature**: E3 — Dealbreaker Engine
**Related Spec**: E3_DEALBREAKER_ENGINE_SPEC.md

**Implementation Status**: PENDING INDEPENDENT REVIEW

**Migration Status**: CREATED, NOT YET APPLIED REMOTELY

**Important**: Remote database migration has NOT been applied. These tests require the E3 migration to be applied first.

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

## Document Information

**Created**: 2026-09-08
**Feature**: E3 — Dealbreaker Engine
**Migration**: `20260908000006_create_user_dealbreakers.sql`
**Status**: NOT YET EXECUTED — PENDING INDEPENDENT REVIEW
