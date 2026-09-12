# NextUp Completion Report

**Purpose**: Generate mandatory detailed completion reports for NextUp implementation tasks.

**Type**: Documentation Generation

**When to Use**: After completing ANY implementation task (phase, feature, bugfix, maintenance).

---

## CORE PRINCIPLE

NextUp governance requires FULL DETAILED REPORTS. Never finish with only "done", "ready", or "fixed".

---

## REQUIRED SECTIONS

### 1. PROVENANCE
- Base SHA (origin/main at start)
- Branch name
- Final local HEAD SHA
- Final remote SHA (from git ls-remote)
- Local/remote match: YES/NO

### 2. CHANGESET
- Files changed (count)
- Files added (list with line counts)
- Files modified (list with +/- counts)
- Files deleted (list or "NONE")
- Files renamed (list or "NONE")
- Total additions/deletions

Use: `git diff --stat` and `git diff --name-status`

### 3. FROZEN SYSTEM AUDIT
Verify each frozen system was NOT modified:
- lib/matching/ (Phase 9)
- lib/ai/ (Phase 11)
- lib/dealbreakers/ (E3)
- E1/E2 components
- package.json
- migrations/
- database schema

State: UNCHANGED / CHANGED for each

### 4. QUALITY GATES (ACTUAL RESULTS)
- Tests: [count]/[count] PASS or "NOT RUN"
- TypeScript: PASS/FAIL or "NOT CHECKED"
- Lint: [X] errors, [Y] warnings or "NOT CHECKED"
- Build: PASS/FAIL or "NOT CHECKED"
- Vercel: SUCCESS/FAIL/PENDING or "NOT CHECKED"

**CRITICAL**: Never claim something was checked if it wasn't.

### 5. MANUAL QA
- Human browser QA: PASS/FAIL/PENDING/NOT APPLICABLE
- If completed: test count, results
- If failed: exact failure details
- If pending: reason

Distinguish:
- AUTOMATED TEST (programmatic)
- MANUAL CODE INSPECTION (human/agent code review)
- HUMAN QA (actual browser testing)
- NOT CHECKED

### 6. DATABASE/DEPENDENCIES
- Database changes: YES/NO
- Migration added: YES/NO (if yes, list number)
- Dependencies changed: YES/NO (if yes, list changes)

### 7. KNOWN ISSUES
List:
- Blockers
- Unresolved items
- Deferred work
- Known limitations

Or state: "NONE"

### 8. FINAL STATUS
Choose ONE:
- IMPLEMENTED — PENDING INDEPENDENT REVIEW
- BLOCKED — [exact reason]
- PARTIAL — [what remains]

**NEVER** mark own work as:
- APPROVED
- FROZEN
- PRODUCTION APPROVED

---

## EXAMPLE (Abbreviated)

```
E4 OPPORTUNITY RADAR — COMPLETION REPORT

PROVENANCE
Base: 8ab48506db62d8a3d563cd6e8881e4d5bdba643e
Branch: feature/e4-opportunity-radar
Final HEAD: 5857e635929988719e965624e4fb3b38b31acb3d
Remote: 5857e635929988719e965624e4fb3b38b31acb3d
Match: YES

CHANGESET
Changed: 15 files
Added: 14 files (+2798 lines)
Modified: 1 file (+106 -20)
Deleted: NONE
Renamed: NONE

FROZEN AUDIT
lib/matching/: UNCHANGED ✓
lib/ai/: UNCHANGED ✓
package.json: UNCHANGED ✓
[... all frozen systems UNCHANGED]

QUALITY GATES
Tests: 531/531 PASS
TypeScript: PASS
Lint: 0 errors, 24 warnings
Build: PASS
Vercel: SUCCESS

MANUAL QA
Human browser QA: 16/16 PASS
Filter regression: PASS
Cross-view consistency: PASS

DATABASE/DEPENDENCIES
Database: UNCHANGED
Migration: NO
Dependencies: UNCHANGED

KNOWN ISSUES
NONE

FINAL STATUS
IMPLEMENTED — PENDING INDEPENDENT REVIEW
```

---

**End of Skill**
