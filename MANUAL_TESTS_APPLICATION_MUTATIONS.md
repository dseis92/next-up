# Manual Test Requirements — Application Detail Mutations

This document records manual test requirements for Application Detail page mutation behavior that cannot be automatically tested with the current infrastructure.

## Test Environment Setup

1. Navigate to an existing application detail page: `/applications/[id]`
2. Ensure application has loaded successfully
3. Open browser DevTools Network tab to observe requests

---

## A. Prevent Duplicate Note Creation

**Test ID**: APP-MUT-001
**Objective**: Verify rapid clicks on "Add Note" only create one note

**Steps**:
1. Type "Test note" in the note input field
2. Click the "+" (Add) button rapidly 3-5 times in quick succession
3. Observe the notes list

**Expected Result**:
- Only ONE note appears in the list
- Network tab shows only ONE POST request to create the note
- Input field is cleared

**Actual Failure Mode (if bug exists)**:
- Multiple identical notes appear
- Multiple POST requests sent

---

## B. Successful Write + Failed Refresh Does Not Report Write Failure

**Test ID**: APP-MUT-002
**Objective**: Verify mutation success is not conflated with refresh failure

**Setup**:
This test requires simulating a network failure AFTER the write succeeds. Since this is hard to reproduce in real conditions, document the expected behavior:

**Expected Behavior**:
- If `createApplicationNote()` succeeds but a hypothetical `getApplicationNotes()` refresh fails:
  - The created note MUST appear in the UI (via local state update)
  - The input MUST be cleared
  - NO error toast saying "Failed to add note"
  - User should NOT attempt retry (which would create duplicate)

**Current Implementation**:
- Write success updates local state directly via `setNotes(prev => [createdNote, ...prev])`
- No refresh call after write
- Retry is NOT possible on success

**Status**: ✓ Architecture prevents this failure mode

---

## C. Prevent Duplicate Stage Changes

**Test ID**: APP-MUT-003
**Objective**: Verify rapid stage button clicks only trigger one mutation

**Steps**:
1. Click any stage button (e.g., "Interview")
2. Immediately click it again or click another stage button multiple times rapidly
3. Observe network requests and timeline events

**Expected Result**:
- Only ONE stage change request is sent
- Stage buttons are disabled during the request
- Only ONE new event appears in timeline
- Application stage updates once

**Actual Failure Mode (if bug exists)**:
- Multiple stage change requests
- Multiple timeline events created
- Race conditions on application state

---

## D. Prevent Duplicate Edit Save

**Test ID**: APP-MUT-004
**Objective**: Verify rapid edit-save clicks only trigger one update

**Steps**:
1. Click edit icon on an existing note
2. Change the text to "Updated note"
3. Click the save (checkmark) button rapidly 3-5 times
4. Observe network requests and note updates

**Expected Result**:
- Only ONE update request is sent
- Edit controls (input, save, cancel) are disabled during request
- Note updates once with new text
- Edit mode closes

**Actual Failure Mode (if bug exists)**:
- Multiple update requests
- Potential race conditions on note state

---

## E. Pending State Disables All Mutation Controls

**Test ID**: APP-MUT-005
**Objective**: Verify actionPending disables all relevant controls

**Steps**:
1. Initiate any mutation (add note, edit note, or stage change)
2. While request is pending, attempt to:
   - Click other stage buttons
   - Click Add Note button
   - Press Enter in note input
   - Click edit on other notes
   - Click save on edit-in-progress note

**Expected Result**:
- All stage buttons show disabled styling and do not respond to clicks
- Add Note button is disabled
- Enter key in note input is ignored
- Edit save/cancel buttons are disabled
- Note input field is disabled

**Actual Failure Mode (if bug exists)**:
- Concurrent mutations possible
- UI does not reflect pending state

---

## Implementation Notes

**Pending Guard Pattern**:
```typescript
const [actionPending, setActionPending] = useState(false);

const handleMutation = async () => {
  if (actionPending) return;

  setActionPending(true);
  try {
    // mutation
  } catch (error) {
    // error handling
  } finally {
    setActionPending(false);
  }
};
```

**Write/Refresh Separation Pattern**:
```typescript
const handleAddNote = async () => {
  // Write succeeds or throws
  const createdNote = await createApplicationNote(...);

  // Write succeeded - update local state
  setNotes(prev => [createdNote, ...prev]);
  setNewNote("");
};
```

---

## Test Execution Log

| Test ID | Date | Tester | Pass/Fail | Notes |
|---------|------|--------|-----------|-------|
| APP-MUT-001 | | | | |
| APP-MUT-002 | | | | |
| APP-MUT-003 | | | | |
| APP-MUT-004 | | | | |
| APP-MUT-005 | | | | |

---

**Document Version**: 1.0
**Last Updated**: 2026-09-07
**Related Commit**: TBD
