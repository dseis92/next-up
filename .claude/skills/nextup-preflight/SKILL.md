# NextUp Preflight

**Purpose**: Read-only implementation preflight check before starting authorized work.

**Type**: Verification

**When to Use**: Before beginning ANY implementation task in the NextUp repository.

---

## WHAT THIS SKILL DOES

Performs a comprehensive read-only pre-flight check to ensure:
1. Current authorization is understood
2. Frozen systems are identified
3. Repository state is clean
4. Local and remote state agree
5. Implementation can proceed safely

**This skill NEVER modifies the repository.**

---

## INSTRUCTIONS

When invoked, perform the following steps:

### 1. Read Canonical Governance

Read completely (do not summarize):
- `PROJECT_STATE.md`
- `PROJECT_GUARDRAILS.md`
- `CLAUDE.md` (header section with current authorization)

### 2. Identify Active Authorization

From PROJECT_STATE.md, determine:
- What phase/feature is currently authorized for implementation?
- What is marked as FROZEN?
- What is marked as LOCKED?
- What is marked as NOT STARTED or NOT AUTHORIZED?

### 3. Identify Active Specification

If a product expansion (E1, E2, E3, etc.) is authorized:
- Locate and read the active feature specification file
- Example: `E4_OPPORTUNITY_RADAR_SPEC.md`

If no feature spec exists:
- Note that this is Phase work or maintenance work

### 4. Verify Repository State

Run these commands and record output:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git fetch origin
git rev-parse origin/main
```

### 5. Verify Remote Agreement (if on feature branch)

If current branch is a feature branch:

```bash
git ls-remote origin refs/heads/<current-branch>
```

Compare local HEAD with remote HEAD. They MUST match before independent review.

### 6. Identify Frozen Systems

From governance documents, list systems that MUST NOT be modified:
- Phase 9 matching (lib/matching/)
- Phase 10 integration
- Phase 11 AI (lib/ai/)
- E1 Deck
- E2 Compare
- E3 Dealbreakers
- Any other FROZEN or APPROVED systems

### 7. Check for Blockers

Verify:
- Working tree is CLEAN (or only expected untracked files)
- No conflicting branches checked out
- No uncommitted changes that could interfere
- Current branch matches expected authorization

---

## OUTPUT FORMAT

Provide output in this exact format:

```
NEXTUP PREFLIGHT CHECK

AUTHORIZATION
  Active: [Phase X / Feature EX / Maintenance]
  Status: [AUTHORIZED / NOT STARTED / LOCKED]
  Specification: [filename or "N/A"]

REPOSITORY STATE
  Branch: [branch-name]
  HEAD: [full 40-char SHA]
  Remote: [full 40-char SHA or "N/A"]
  Agreement: [YES / NO / N/A]
  Working tree: [CLEAN / DIRTY]

FROZEN SYSTEMS
  - [list each frozen system]

BLOCKERS
  - [list any blocker or "NONE"]

PREFLIGHT RESULT
  [PASS / STOP]

[If STOP, explain exact reason]
```

---

## STOP CONDITIONS

Output `PREFLIGHT RESULT: STOP` if:

- No clear authorization found
- Working tree is DIRTY with unexpected changes
- Local and remote branch HEAD mismatch (when remote exists)
- Conflicting authorization (e.g., multiple features claim to be authorized)
- Missing required governance files

---

## SUCCESS CONDITION

Output `PREFLIGHT RESULT: PASS` only when:

- Clear authorization identified
- Repository state is clean
- Local/remote agreement verified (when applicable)
- Frozen systems identified
- No blockers detected

---

## EXAMPLE OUTPUT (PASS)

```
NEXTUP PREFLIGHT CHECK

AUTHORIZATION
  Active: Feature E4 — Opportunity Radar
  Status: AUTHORIZED
  Specification: E4_OPPORTUNITY_RADAR_SPEC.md

REPOSITORY STATE
  Branch: feature/e4-opportunity-radar
  HEAD: 5857e635929988719e965624e4fb3b38b31acb3d
  Remote: 5857e635929988719e965624e4fb3b38b31acb3d
  Agreement: YES
  Working tree: CLEAN

FROZEN SYSTEMS
  - Phase 9: lib/matching/
  - Phase 10: Matching integration
  - Phase 11: lib/ai/
  - E1: Opportunity Deck
  - E2: Opportunity Compare
  - E3: Dealbreaker Engine

BLOCKERS
  NONE

PREFLIGHT RESULT: PASS
```

---

## EXAMPLE OUTPUT (STOP)

```
NEXTUP PREFLIGHT CHECK

AUTHORIZATION
  Active: Unknown
  Status: UNCLEAR
  Specification: N/A

REPOSITORY STATE
  Branch: main
  HEAD: 8ab48506db62d8a3d563cd6e8881e4d5bdba643e
  Remote: 8ab48506db62d8a3d563cd6e8881e4d5bdba643e
  Agreement: YES
  Working tree: CLEAN

FROZEN SYSTEMS
  [Unable to determine - governance files not read]

BLOCKERS
  - PROJECT_STATE.md shows "E4: NOT STARTED" but no clear implementation authorization
  - Multiple phases marked as LOCKED
  - No active feature branch

PREFLIGHT RESULT: STOP

REASON: No clear implementation authorization. PROJECT_STATE.md shows E4 as "NOT STARTED".
If E4 implementation is authorized, create feature branch. If not authorized, wait for explicit approval.
```

---

## IMPORTANT NOTES

- This skill is **READ-ONLY**
- Never modify files
- Never create branches
- Never commit
- Never push
- Use actual `git` command output - never invent SHAs
- When in doubt, output STOP with clear reasoning

---

**End of Skill**
