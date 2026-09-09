# E3 Browser QA — Merge Gate

**Runtime**: LOCAL FEATURE BRANCH + REMOTE SUPABASE

**Approved code**: `8f4ba113c02adddbc014c44510ea1142ba5f3328`

**Migration**: `20260908000006` APPLIED

**Tester**: Human tester

**Date**: 2026-09-09

**Browser**: Chrome (local development)

---

## A. STARTUP

**Commands**:

```bash
git checkout feature/e3-dealbreaker-engine
git pull --ff-only origin feature/e3-dealbreaker-engine
git rev-parse HEAD
```

**Expected**: `8f4ba113c02adddbc014c44510ea1142ba5f3328`

**Then**:

```bash
npm run dev
```

**Open**: http://localhost:3000

**Log in normally** (do not include passwords in documentation).

---

## B. SETTINGS — SAVE + PERSISTENCE

**Go to**: `/settings/dealbreakers`

**Set**:
- Minimum salary: `90000`
- Require salary disclosure: ON
- Allowed work: Remote only
- Employment: Full-time only

**Save**.

**PASS if**:
- [x] Save succeeds
- [x] No raw error appears
- [x] Return/reload works
- [x] Values persist after hard refresh

**Result**: PASS

**Notes**: All persistence and reload operations worked correctly

---

## C. VALIDATION

**Try**: `100000.5`

**PASS if**:
- [x] Validation error appears
- [x] Value is NOT silently changed to 100000
- [x] No save occurs

**Try**: `-1`

**PASS if**: rejected ✓

**Try**: `2147483648`

**PASS if**: rejected ✓

**Result**: PASS

---

## D. EXPLORE LIST

**Open**: `/explore`

**Use LIST mode**.

**PASS if**:
- [x] Match percentages still appear
- [x] Dealbreaker badge appears where expected
- [x] Conflict and unknown are distinguishable
- [x] Card layout looks normal
- [x] Job Details still open
- [x] Compare still works

**Record one job**:
- Job ID/title: Project Engineer
- Match score: 65%
- Dealbreaker status: 1 conflict, 1 preference unknown

---

## E. NETWORK N+1 CHECK

**Open DevTools → Network**.

**Filter**: `user_dealbreakers`

**Hard reload Explore**.

**PASS if**:
- [x] Preferences are NOT fetched once per job card

**Record observed request count**: 2 user_dealbreakers requests + 1 preflight

**Expected**: approximately one preference load for the page mount, not N jobs.

**Result**: PASS

---

## F. E1 DECK REGRESSION

**Switch Explore**: List → Deck

**PASS if**:
- [x] No dealbreaker badge appears inside Deck
- [x] Cards still display
- [x] Save works
- [x] Pass works
- [x] Undo works
- [x] No obvious visual regression

**Result**: PASS

---

## G. SAVED

**Save one known job if needed**.

**Open**: `/saved`

**PASS if**:
- [x] Job appears
- [x] Match remains unchanged
- [x] Dealbreaker badge agrees with Explore
- [x] View works
- [x] Remove works
- [x] Compare still works

**Result**: PASS

---

## H. JOB DETAIL

**Open the SAME job used in Explore**.

**PASS if**:
- [x] Same dealbreaker status
- [x] Same conflict count
- [x] Same unknown count
- [x] Match score agrees with Explore
- [x] Findings are readable
- [x] No nested/double-card visual defect
- [x] Save still works
- [x] Compare still works
- [x] Apply flow appears unchanged

**Result**: PASS

---

## I. MATCH SCORE IMMUTABILITY — CRITICAL

**Use the same job**.

**Record**:
- Match score BEFORE: 65%

**Go to Dealbreaker Settings**.

**Change a preference** so this job's dealbreaker status changes.

**Return to same job**.

**Record**:
- Match score AFTER: 65%

**PASS ONLY if**: BEFORE === AFTER ✓

_Dealbreaker preferences must NEVER alter MatchResult._

**Result**: PASS

---

## J. CLEAR

**Return to**: `/settings/dealbreakers`

**Click**: "Clear all dealbreakers"

**First cancel confirmation**.

**PASS if**: nothing changes

**Then confirm Clear**.

**Hard refresh**.

**PASS if**:
- [x] Settings are empty
- [x] Old badges/findings are gone
- [x] No stale dealbreaker state remains

**Result**: PASS

---

## K. MOBILE QUICK CHECK

**Use browser responsive mode** around 390px width.

**Check**: Settings, Explore List, Saved, Job Detail

**PASS if**:
- [x] No horizontal overflow
- [x] Buttons reachable
- [x] Badges wrap acceptably
- [x] Findings readable
- [x] Bottom nav unchanged

**Result**: PASS

---

## L. KEYBOARD QUICK CHECK

**Without mouse**: Tab through Dealbreaker Settings.

**PASS if**:
- [x] Minimum salary reachable
- [x] Toggles/checkboxes reachable
- [x] Save reachable
- [x] Visible focus indicator exists

**Result**: PASS

---

## M. CONSOLE

**While testing**:

**PASS if**:
- [x] No uncaught JS errors
- [x] No hydration mismatch
- [x] No repeated E3 request storm
- [x] No raw PostgREST error during normal use

**Result**: PASS

**Note**: An initial React hydration warning was observed showing `data-redeviation-bs-uid`. This was attributed to browser-extension DOM modification. Clean browser/incognito test without extension did not reproduce application-level failure. Not recorded as E3 defect.

---

## N. OPTIONAL TESTS

**Only execute if practical**.

- Incomplete profile + Saved: PASS / FAIL / NOT EXECUTED
- Targeted user_dealbreakers request failure: PASS / FAIL / NOT EXECUTED
- Cross-user RLS with second normal account: PASS / FAIL / NOT EXECUTED
- Estimated salary live fixture: PASS / FAIL / NOT APPLICABLE

_These optional cases must NOT be falsely marked PASS._

---

## FINAL MERGE GATE

**Required sections**: B, C, D, E, F, G, H, I, J, K, L, M

**ALL REQUIRED TESTS PASS**: YES

**Blocking defects**: None

**Tester recommendation**: READY FOR MERGE

---

## Documentation Reference

**E3_BROWSER_QA_RUNBOOK.md** (this file) is the short merge-gate checklist.

**MANUAL_TESTS_DEALBREAKERS.md** remains the comprehensive QA specification/reference.

Both documents serve distinct purposes and should be preserved.
