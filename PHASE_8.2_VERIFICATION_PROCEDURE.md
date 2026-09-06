# Phase 8.2 Remote Verification Procedure

## CORRECTED RLS STATUS

**IMPORTANT CORRECTION TO PREVIOUS REPORT:**

The application_events and application_notes relational RLS policies **ARE CORRECTLY IMPLEMENTED** in:

```
supabase/migrations/20260906000003_tighten_application_rls.sql
```

**Code Review Status:** ✓ PASS

Both tables enforce:
- `auth.uid() = user_id` (user owns the event/note)
- **AND** `EXISTS (SELECT 1 FROM applications WHERE id = application_id AND user_id = auth.uid())` (user owns the referenced application)

This prevents cross-user event/note insertion attacks.

**Runtime Status:** NOT VERIFIED (requires authenticated client testing)

---

## VERIFICATION STEPS

### PART 1: Create Test Accounts (Manual Browser Testing)

**Prerequisites:**
- Development server running: `npm run dev`
- Access to email inbox for test accounts

**Create User A:**
1. Navigate to http://localhost:3000/signup
2. Email: `test-user-a@example.com` (use a real email you can access)
3. Password: Choose a secure test password
4. Name: `Test User A`
5. Click "Create account"
6. **If email confirmation is enabled:**
   - Check your email for confirmation link
   - Click the confirmation link
   - Verify redirect to `/auth/callback` → `/onboarding`
7. **If email confirmation is disabled:**
   - Verify immediate redirect to `/onboarding`
8. **Complete onboarding with identifiable test data:**
   - Goals: "Career growth", "Remote work"
   - Current Title: "Test Engineer A"
   - Years Experience: 5
   - Skills: "JavaScript", "React", "Testing"
   - Target Roles: "Senior Engineer", "Tech Lead"
   - Salary: Min $80,000, Ideal $100,000
   - Work Preferences: Remote, Full-time
   - Location: "Madison, WI"
   - Preferred Locations: "Madison, WI", "Milwaukee, WI"
   - Complete all steps
9. **Note User A's credentials securely for later steps**

**Create User B:**
1. Open an incognito/private browser window (to avoid session conflicts)
2. Navigate to http://localhost:3000/signup
3. Email: `test-user-b@example.com` (use a real email you can access)
4. Password: Choose a secure test password (different from User A)
5. Name: `Test User B`
6. Click "Create account"
7. Complete email confirmation if required
8. **Complete minimal onboarding:**
   - Goals: "Learning", "Stability"
   - Current Title: "Test Engineer B"
   - Years Experience: 2
   - Skills: "Python"
   - Target Roles: "Junior Engineer"
   - (complete remaining steps with different data from User A)
9. **Note User B's credentials securely for later steps**

---

### PART 2: Test Password Recovery Flow (Manual Browser Testing)

**Test Password Recovery for User A:**
1. Logout from the application
2. Navigate to http://localhost:3000/forgot-password
3. Enter User A's email: `test-user-a@example.com`
4. Click "Send reset link"
5. Verify "Check your email" message appears
6. Check User A's email inbox for password reset link
7. Click the password reset link
8. Verify redirect to `/auth/callback?next=/reset-password`
9. Verify redirect to `/reset-password` with valid recovery session
10. Enter a new password for User A
11. Click "Update password"
12. Verify success message
13. Navigate to http://localhost:3000/login
14. Login with User A's email and **new password**
15. Verify login succeeds and redirects to `/discover`

**Expected Result:** ✓ PASS if all steps work correctly

---

### PART 3: Test User A Persistence (Manual Browser Testing)

**Verify Data Persists Across Sessions:**
1. Login as User A (use the password from Part 2 if you tested recovery)
2. Navigate to `/profile`
3. **Verify profile data:**
   - Name: "Test User A"
   - Current Title: "Test Engineer A"
   - Years Experience: 5
   - Skills: JavaScript, React, Testing (displayed)
   - Goals: "Career growth", "Remote work" (displayed)
   - Target Roles: "Senior Engineer", "Tech Lead" (displayed)
   - Profile strength percentage displayed

**Test Job Actions:**
1. Navigate to `/discover`
2. **Save Job A:** Find first job, click Save button
3. **Pass Job B:** Find second job, click Pass button
4. **Undo Pass:** Click Undo, verify job returns to stack
5. **Apply to Job C:** Find third job, click Apply
6. Navigate to `/saved` - verify Job A appears
7. Navigate to `/applications`
8. Find Job C application
9. Click on the application to open detail view
10. **Change stage:** Select "Interview" from stage dropdown
11. **Add note:** Click "Add note", enter "Test note for Job C", save
12. **Set next action:** Enter "Follow up with recruiter on Friday", save
13. **Verify timeline:** Check that "Application created" and "Stage changed to Interview" events appear

**Test Logout/Login Persistence:**
1. Click logout
2. Verify redirect to `/login` or `/` (landing page)
3. Login again as User A
4. Navigate to `/profile` - **verify all profile data still displays**
5. Navigate to `/saved` - **verify Job A still appears**
6. Navigate to `/applications` - **verify Job C still appears**
7. Open Job C application detail
8. **Verify stage:** Still shows "Interview"
9. **Verify note:** "Test note for Job C" still appears
10. **Verify next action:** "Follow up with recruiter on Friday" still appears
11. **Verify timeline:** All events still appear

**Expected Result:** ✓ PASS if all data persists correctly after logout/login

---

### PART 4: Automated RLS Verification (Command Line)

**Prerequisites:**
- User A and User B accounts created (from Part 1)
- User A has completed onboarding and performed job actions (from Part 3)
- You have the passwords for both accounts

**Setup Environment Variables:**

```bash
# DO NOT commit these credentials
export TEST_USER_A_EMAIL="test-user-a@example.com"
export TEST_USER_A_PASSWORD="your-user-a-password"
export TEST_USER_B_EMAIL="test-user-b@example.com"
export TEST_USER_B_PASSWORD="your-user-b-password"
```

**Run Verification Script:**

```bash
npx tsx verify-rls.ts
```

**The script will test:**

1. **User A Write Operations:**
   - ✓ Write onboarding data
   - ✓ Write goals
   - ✓ Write preferences
   - ✓ Save a job
   - ✓ Pass a job
   - ✓ Create an application
   - ✓ Add application note
   - ✓ Add application event

2. **User A Read Operations:**
   - ✓ Read own onboarding
   - ✓ Read own goals

3. **User B Unauthorized Read Attempts (should all fail):**
   - ✓ Try to read User A's onboarding (expects RLS block)
   - ✓ Try to read User A's goals (expects RLS block)
   - ✓ Try to read User A's preferences (expects RLS block)
   - ✓ Try to read User A's saved jobs (expects RLS block)
   - ✓ Try to read User A's applications (expects RLS block)

4. **User B Unauthorized Write Attempts (should all fail):**
   - ✓ Try to insert onboarding for User A (expects RLS block)
   - ✓ Try to insert goal for User A (expects RLS block)
   - ✓ Try to update User A's onboarding (expects RLS block)
   - ✓ Try to delete User A's goals (expects RLS block)

5. **Relational RLS Tests (should all fail):**
   - ✓ User B tries to insert application_event for User A's application (expects RLS block)
   - ✓ User B tries to insert application_note for User A's application (expects RLS block)
   - ✓ User B tries to read User A's application notes (expects RLS block)

**Expected Output:**

```
=== Phase 8.2 RLS and Persistence Verification ===

User A authenticated: <uuid>
User B authenticated: <uuid>

=== USER A: Write Test Data ===
✓ User A onboarding write: Onboarding data saved
✓ User A goals write: Goals saved
✓ User A preferences write: Preferences saved
✓ User A save job: Saved job <job-id>
✓ User A pass job: Passed job <job-id>
✓ User A create application: Application created <app-id>
✓ User A add application note: Note added
✓ User A add application event: Event added

=== USER A: Read Own Data ===
✓ User A read own onboarding: Read onboarding: Test Engineer A
✓ User A read own goals: Found 2 goals

=== USER B: Attempt Unauthorized Access ===
✓ User B read User A onboarding (should fail): RLS blocked access correctly
✓ User B read User A goals (should fail): RLS blocked access correctly
✓ User B read User A preferences (should fail): RLS blocked access correctly
✓ User B read User A saved jobs (should fail): RLS blocked access correctly
✓ User B read User A applications (should fail): RLS blocked access correctly

=== USER B: Attempt Unauthorized Writes ===
✓ User B insert User A onboarding (should fail): RLS blocked: <error>
✓ User B insert User A goal (should fail): RLS blocked: <error>
✓ User B update User A onboarding (should fail): RLS blocked: <error>
✓ User B delete User A goals (should fail): RLS blocked: <error>

=== RELATIONAL RLS: Application Events/Notes ===
✓ User B insert event for User A application (should fail): RLS blocked correctly: <error>
✓ User B insert note for User A application (should fail): RLS blocked correctly: <error>
✓ User B read User A application notes (should fail): RLS blocked access correctly

=== VERIFICATION SUMMARY ===
Total tests: 24
✓ Passed: 24
✗ Failed: 0
⚠ Errors: 0
```

**Expected Result:** ✓ PASS if all 24 tests pass with 0 failures

**If any test fails:**
- Review the error message
- Check Supabase RLS policies in dashboard
- Investigate whether it's a genuine RLS gap or test issue
- Report the failure details

---

### PART 5: Clean Up Test Data (Optional)

**⚠️ WARNING: Only perform cleanup if you're certain you want to delete test accounts**

**Option A: Delete via Supabase Dashboard**
1. Go to https://app.supabase.com
2. Navigate to Authentication → Users
3. Find test-user-a@example.com and test-user-b@example.com
4. Delete both users
5. Due to ON DELETE CASCADE, all related data will be automatically deleted

**Option B: Keep for Further Testing**
- Leave test accounts in place for additional manual testing
- They can be reused for future Phase 9 verification

---

## VERIFICATION CHECKLIST

Mark each item after completing:

### Code-Level Verification (Already Complete)
- [x] Repository synced to ea3df6a
- [x] Remote Supabase project linked
- [x] All 5 migrations applied to remote database
- [x] Remote schema contains `current_title` field
- [x] Auth callback route exists with SSR flow
- [x] Signup configured with emailRedirectTo
- [x] Password recovery configured with redirectTo
- [x] Application event/note relational RLS policies exist in migration 20260906000003

### Manual Browser Testing
- [ ] User A signup (with email confirmation if enabled)
- [ ] User A email confirmation callback → /onboarding
- [ ] User A onboarding completion
- [ ] User B signup and onboarding
- [ ] Password recovery email sent
- [ ] Password recovery link → /auth/callback → /reset-password
- [ ] Password successfully updated
- [ ] Login with new password succeeds
- [ ] User A profile data displays correctly
- [ ] User A job actions work (save, pass, undo, apply)
- [ ] User A application stage/note/next action saved
- [ ] User A logout/login persistence verified

### Automated RLS Testing
- [ ] Environment variables set for test accounts
- [ ] `npx tsx verify-rls.ts` executed
- [ ] All 24 RLS tests passed
- [ ] 0 failures reported

### Final Status
- [ ] All manual tests PASS
- [ ] All automated tests PASS
- [ ] No Phase 8.2 blockers remain
- [ ] Phase 9 NOT started

---

## REPORTING RESULTS

After completing all verification steps, report:

1. **Manual Browser Testing Results:**
   - Signup flow: PASS / FAIL / NOT TESTED
   - Email confirmation: PASS / FAIL / NOT TESTED / NOT APPLICABLE
   - Password recovery: PASS / FAIL / NOT TESTED
   - User A persistence: PASS / FAIL / NOT TESTED

2. **Automated RLS Testing Results:**
   - Script execution: PASS / FAIL / NOT RUN
   - Tests passed: X / 24
   - Tests failed: X / 24
   - Any RLS breaches detected: YES / NO

3. **Issues Found:**
   - List any failures or unexpected behavior
   - Include error messages
   - Note which specific test failed

4. **Recommendation:**
   - Phase 8.2 COMPLETE (if all tests pass)
   - Phase 8.2 BLOCKED (if any test fails, describe blocker)
   - Ready for Phase 9: YES / NO

---

## IMPORTANT NOTES

**DO NOT:**
- Commit test credentials to git
- Use Supabase service_role key for RLS testing
- Use SQL Editor direct queries as RLS verification (they bypass RLS by default)
- Claim tests PASS without actually running them
- Start Phase 9 before Phase 8.2 is approved

**DO:**
- Use real authenticated Supabase client sessions (anon key)
- Test with two separate browser sessions / incognito windows
- Verify data persists across logout/login
- Report accurate results (PASS / FAIL / NOT VERIFIED)
- Keep test credentials secure

---

## SECURITY VERIFICATION PRINCIPLE

**RLS verification MUST use authenticated Supabase clients, not SQL Editor.**

The SQL Editor in Supabase Dashboard typically uses the `postgres` role or bypasses RLS by default. To properly verify RLS:

1. ✓ Use `@supabase/supabase-js` client with anon key
2. ✓ Authenticate as User A using `signInWithPassword()`
3. ✓ Authenticate as User B using `signInWithPassword()` in separate client
4. ✓ Verify `auth.uid()` correctly represents the authenticated user
5. ✓ Attempt cross-user operations and verify RLS blocks them

**The verification script (`verify-rls.ts`) implements this correctly.**
