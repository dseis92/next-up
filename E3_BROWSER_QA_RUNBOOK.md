# E3 Browser QA — Merge Gate

**Runtime**: LOCAL FEATURE BRANCH + REMOTE SUPABASE

**Approved code**: `8f4ba113c02adddbc014c44510ea1142ba5f3328`

**Migration**: `20260908000006` APPLIED

**Tester**: __________

**Date**: __________

**Browser**: __________

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
- [ ] Save succeeds
- [ ] No raw error appears
- [ ] Return/reload works
- [ ] Values persist after hard refresh

**Result**: PASS / FAIL

**Notes**: __________

---

## C. VALIDATION

**Try**: `100000.5`

**PASS if**:
- [ ] Validation error appears
- [ ] Value is NOT silently changed to 100000
- [ ] No save occurs

**Try**: `-1`

**PASS if**: rejected

**Try**: `2147483648`

**PASS if**: rejected

**Result**: PASS / FAIL

---

## D. EXPLORE LIST

**Open**: `/explore`

**Use LIST mode**.

**PASS if**:
- [ ] Match percentages still appear
- [ ] Dealbreaker badge appears where expected
- [ ] Conflict and unknown are distinguishable
- [ ] Card layout looks normal
- [ ] Job Details still open
- [ ] Compare still works

**Record one job**:
- Job ID/title: ________________
- Match score: ________
- Dealbreaker status: ________

---

## E. NETWORK N+1 CHECK

**Open DevTools → Network**.

**Filter**: `user_dealbreakers`

**Hard reload Explore**.

**PASS if**:
- [ ] Preferences are NOT fetched once per job card

**Record observed request count**: ________

**Expected**: approximately one preference load for the page mount, not N jobs.

**Result**: PASS / FAIL

---

## F. E1 DECK REGRESSION

**Switch Explore**: List → Deck

**PASS if**:
- [ ] No dealbreaker badge appears inside Deck
- [ ] Cards still display
- [ ] Save works
- [ ] Pass works
- [ ] Undo works
- [ ] No obvious visual regression

**Result**: PASS / FAIL

---

## G. SAVED

**Save one known job if needed**.

**Open**: `/saved`

**PASS if**:
- [ ] Job appears
- [ ] Match remains unchanged
- [ ] Dealbreaker badge agrees with Explore
- [ ] View works
- [ ] Remove works
- [ ] Compare still works

**Result**: PASS / FAIL

---

## H. JOB DETAIL

**Open the SAME job used in Explore**.

**PASS if**:
- [ ] Same dealbreaker status
- [ ] Same conflict count
- [ ] Same unknown count
- [ ] Match score agrees with Explore
- [ ] Findings are readable
- [ ] No nested/double-card visual defect
- [ ] Save still works
- [ ] Compare still works
- [ ] Apply flow appears unchanged

**Result**: PASS / FAIL

---

## I. MATCH SCORE IMMUTABILITY — CRITICAL

**Use the same job**.

**Record**:
- Match score BEFORE: ________

**Go to Dealbreaker Settings**.

**Change a preference** so this job's dealbreaker status changes.

**Return to same job**.

**Record**:
- Match score AFTER: ________

**PASS ONLY if**: BEFORE === AFTER

_Dealbreaker preferences must NEVER alter MatchResult._

**Result**: PASS / FAIL

---

## J. CLEAR

**Return to**: `/settings/dealbreakers`

**Click**: "Clear all dealbreakers"

**First cancel confirmation**.

**PASS if**: nothing changes

**Then confirm Clear**.

**Hard refresh**.

**PASS if**:
- [ ] Settings are empty
- [ ] Old badges/findings are gone
- [ ] No stale dealbreaker state remains

**Result**: PASS / FAIL

---

## K. MOBILE QUICK CHECK

**Use browser responsive mode** around 390px width.

**Check**: Settings, Explore List, Saved, Job Detail

**PASS if**:
- [ ] No horizontal overflow
- [ ] Buttons reachable
- [ ] Badges wrap acceptably
- [ ] Findings readable
- [ ] Bottom nav unchanged

**Result**: PASS / FAIL

---

## L. KEYBOARD QUICK CHECK

**Without mouse**: Tab through Dealbreaker Settings.

**PASS if**:
- [ ] Minimum salary reachable
- [ ] Toggles/checkboxes reachable
- [ ] Save reachable
- [ ] Visible focus indicator exists

**Result**: PASS / FAIL

---

## M. CONSOLE

**While testing**:

**PASS if**:
- [ ] No uncaught JS errors
- [ ] No hydration mismatch
- [ ] No repeated E3 request storm
- [ ] No raw PostgREST error during normal use

**Result**: PASS / FAIL

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

**ALL REQUIRED TESTS PASS**: YES / NO

**Blocking defects**: ________________________________

**Tester recommendation**: READY FOR MERGE / BLOCKED

---

## Documentation Reference

**E3_BROWSER_QA_RUNBOOK.md** (this file) is the short merge-gate checklist.

**MANUAL_TESTS_DEALBREAKERS.md** remains the comprehensive QA specification/reference.

Both documents serve distinct purposes and should be preserved.
