# NextUp Handoff

**Purpose**: Create trustworthy handoff documentation for cross-agent coordination.

**Type**: Documentation Generation

**When to Use**: When handing off work to another agent (e.g., Claude Code → ChatGPT reviewer) or resuming work after a break.

---

## WHAT THIS SKILL DOES

Generates a comprehensive, factual handoff document containing:
- Current repository state (derived from git, not memory)
- Active authorization and specification
- Work completed
- Test results
- Manual QA status
- Frozen system audit
- Known blockers
- Exact next authorized action

**CRITICAL**: Handoff is saved to TEMP directory, NOT the repository.

---

## INSTRUCTIONS

### 1. Determine Handoff Context

Ask yourself:
- What phase/feature was I working on?
- What was accomplished?
- What remains?
- Who is the handoff recipient? (Human, Claude Code, ChatGPT, other)

### 2. Gather Repository Facts

Run these commands and record ACTUAL output:

```bash
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git ls-remote origin refs/heads/<current-branch>  # if on feature branch
git status --short
git log --oneline -5
git diff --stat origin/main...HEAD  # if on feature branch
git diff --name-status origin/main...HEAD
```

### 3. Gather Test Results

If tests were run:
```bash
# Record actual test counts from most recent run
# Do NOT invent numbers
```

If tests were NOT run:
- State: "Tests: NOT RUN"

### 4. Gather Build/Quality Results

Record actual results if checked:
- TypeScript: [PASS / FAIL / NOT CHECKED]
- Lint: [0 errors / X errors / NOT CHECKED]
- Build: [PASS / FAIL / NOT CHECKED]
- Vercel: [SUCCESS / FAIL / NOT CHECKED / N/A]

### 5. Identify Frozen Systems

From governance docs, list what was NOT modified:
- lib/matching/
- lib/ai/
- lib/dealbreakers/
- components/explore/opportunity-deck
- components/compare
- package.json
- migrations/
- etc.

### 6. Generate Handoff Document

Create a markdown file in OS temp directory:

**Filename**: `NEXTUP_HANDOFF_<YYYYMMDD>_<HHMMSS>.md`

**Location**: Use OS temp directory:
- macOS/Linux: `/tmp/`
- Windows: `%TEMP%`

**DO NOT** save to repository.

---

## HANDOFF DOCUMENT TEMPLATE

```markdown
# NextUp Handoff

**Generated**: [ISO 8601 timestamp]
**From**: [Agent name, e.g., "Claude Code"]
**To**: [Recipient, e.g., "ChatGPT Independent Reviewer"]
**Context**: [Brief context, e.g., "E4 Opportunity Radar Implementation Complete"]

---

## REPOSITORY STATE

**Repository**: dseis92/next-up

**Branch**: [branch-name]
**Local HEAD**: [full 40-char SHA]
**Remote HEAD**: [full 40-char SHA or "N/A"]
**Protected Main**: [full 40-char SHA]

**Local/Remote Agreement**: [YES / NO / N/A]

**Working Tree**: [CLEAN / DIRTY - if dirty, list files]

---

## ACTIVE AUTHORIZATION

**Phase/Feature**: [e.g., "E4 — Opportunity Radar"]
**Status**: [e.g., "IMPLEMENTATION COMPLETE"]
**Specification**: [filename, e.g., "E4_OPPORTUNITY_RADAR_SPEC.md"]
**Approved Spec SHA**: [full SHA if known, or "N/A"]

---

## WORK COMPLETED

[Describe what was accomplished in this session/task]

Example:
- Implemented Opportunity Radar categories (Best Matches, New Opportunities, High Compensation, Stretch)
- Added 91 automated tests for radar selectors
- Integrated Radar view into Explore page
- Fixed filter-state preservation bug (changed router.push to window.history.pushState)

---

## FILES CHANGED

**Added**: [count]
**Modified**: [count]
**Deleted**: [count]
**Renamed**: [count]

**Detailed File List**:
[Paste output from: git diff --name-status origin/main...HEAD]

---

## AUTOMATED TEST RESULTS

**Test Files**: [count or "NOT RUN"]
**Tests**: [count PASS / count FAIL or "NOT RUN"]

**Feature-Specific Tests**: [count if known]

**Command Used**: [e.g., "npm test -- --run" or "NOT RUN"]

---

## QUALITY GATES

**TypeScript**: [PASS / FAIL / NOT CHECKED]
**Lint**: [0 errors, X warnings / NOT CHECKED]
**Build**: [PASS / FAIL / NOT CHECKED]
**Vercel**: [SUCCESS / FAIL / PENDING / NOT CHECKED]

---

## MANUAL QA STATUS

**Human Browser QA**: [PASS / FAIL / IN PROGRESS / NOT STARTED / NOT APPLICABLE]

If completed, summarize:
- Tests executed: [count]
- Tests passed: [count]
- Tests failed: [count]
- Blockers found: [list or "NONE"]

If not completed:
- State: "PENDING HUMAN VERIFICATION"

---

## FROZEN SYSTEM AUDIT

**Systems Verified UNCHANGED**:
- [ ] lib/matching/ (Phase 9)
- [ ] lib/ai/ (Phase 11)
- [ ] lib/dealbreakers/ (E3)
- [ ] components/explore/opportunity-deck (E1)
- [ ] components/compare (E2)
- [ ] package.json
- [ ] package-lock.json
- [ ] migrations/
- [ ] Database schema

[Check each that was verified. If not verified, note "NOT AUDITED"]

---

## KNOWN BLOCKERS

[List any unresolved issues, bugs, or blockers]

If none:
- NONE

---

## UNRESOLVED ITEMS

[List any items that require follow-up]

If none:
- NONE

---

## REVIEW FINDINGS

[If this handoff follows independent review, summarize findings]

If not applicable:
- N/A

---

## EXACT NEXT AUTHORIZED ACTION

[State the specific next step]

Examples:
- "PENDING: Independent exact-SHA review of HEAD 5857e63..."
- "AUTHORIZED: Create PR from feature/e4-opportunity-radar → main"
- "BLOCKED: Fix failing test in selectors.test.ts before proceeding"
- "COMPLETE: No further action - await merge authorization"

---

## REFERENCES

**Governance**:
- PROJECT_STATE.md
- PROJECT_GUARDRAILS.md
- CLAUDE.md

**Specification** (if applicable):
- [filename, e.g., E4_OPPORTUNITY_RADAR_SPEC.md]

**Related Documentation**:
- [List any QA reports, completion reports, or other relevant docs]

---

## SECURITY

**Secrets Exposed**: NO (if true)
**API Keys in Handoff**: NO (if true)

[If secrets were exposed or at risk, state clearly and redact from handoff]

---

**End of Handoff**
```

---

## OUTPUT

After generating the handoff file, output to the user:

```
NextUp Handoff created:

Location: /tmp/NEXTUP_HANDOFF_YYYYMMDD_HHMMSS.md

Summary:
- Branch: [branch-name]
- HEAD: [short SHA]
- Status: [brief status]
- Next Action: [brief next action]

Full handoff available at the path above.
```

---

## CRITICAL RULES

1. **Use actual command output** - never invent SHAs or test counts
2. **Save to TEMP directory** - never commit handoff to repository
3. **Redact secrets** - never include API keys, tokens, or credentials
4. **Reference, don't copy** - link to specs/docs instead of reproducing entire files
5. **Be honest** - if something wasn't checked, say "NOT CHECKED", not "PASS"

---

## EXAMPLE HANDOFF SUMMARY

```
NextUp Handoff created:

Location: /tmp/NEXTUP_HANDOFF_20260911_143022.md

Summary:
- Branch: feature/e4-opportunity-radar
- HEAD: 5857e63
- Status: Implementation complete, human QA passed
- Next Action: PENDING independent exact-SHA review

Full handoff available at /tmp/NEXTUP_HANDOFF_20260911_143022.md
```

---

**End of Skill**
