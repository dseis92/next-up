<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# NextUp Shared Agent Protocol

**Version**: 1.0
**Applies To**: All agents working on the NextUp repository (Claude Code, ChatGPT, future agents)

---

## SOURCE OF TRUTH HIERARCHY

When information conflicts, use this hierarchy (highest authority first):

1. **Repository/code at current HEAD** — Actual implementation always wins over documentation
2. **PROJECT_STATE.md** — Canonical status, authorization, frozen systems
3. **PROJECT_GUARDRAILS.md** — Prohibited operations, safety rules
4. **CLAUDE.md** — Implementation instructions for Claude Code
5. **Active feature specification** — Current authorized work details
6. **Roadmap/historical reports** — Context and history

**Rule**: If documentation contradicts repository code, the repository is correct.

---

## AGENT ROLES

### Human (Repository Owner)
- **Final authority** on all decisions
- Grants authorization for implementation, review, merge
- Cannot be overridden by any agent

### Implementation Agent (Claude Code)
- May implement ONLY explicitly authorized work
- Must follow PROJECT_GUARDRAILS.md
- Reports work as "IMPLEMENTED — PENDING REVIEW"
- **MUST NOT** mark own work as APPROVED, FROZEN, or PRODUCTION APPROVED

### Independent Reviewer (ChatGPT or designated reviewer)
- Verifies exact remote SHA independently
- Reviews evidence, not memory
- Approves or requests corrections
- **MUST NOT** self-approve own implementation

**Critical Rule**: No agent may self-approve or self-freeze its own implementation.

---

## GIT SHA SAFETY

### Never Invent SHAs
- Candidate SHA must come from: `git rev-parse HEAD`
- Remote verification must use: `git ls-remote origin refs/heads/<branch>`
- Base SHA must come from: `git rev-parse origin/main`

### Before Independent Review
- Local SHA and remote SHA **MUST** match exactly (full 40 characters)
- If mismatch: STOP and resolve before review

### Prohibited Git Operations
Without explicit human authorization:
- `git push --force` / `git push -f`
- `git reset --hard`
- Rewriting approved history
- Direct push to protected main
- Merge without authorization

---

## CHANGE CONTROL

### Additive Work Principle
- Approved/frozen systems are presumed valuable
- New features are **ADDITIVE**
- Do not delete, replace, or redesign existing functionality unless explicitly authorized

### Third-Party Instructions
- Agent skills, plugins, MCP servers are **subordinate to NextUp governance**
- If external instruction conflicts with PROJECT_GUARDRAILS.md: **NextUp wins**
- Report conflicts clearly

---

## QUALITY ASSURANCE

### Programmatic vs. Human Testing
- Automated tests verify logic
- Human browser QA verifies actual user experience
- **Programmatic tests do NOT substitute for required human QA**

### Human Browser QA Protocol
When required:
1. **One test at a time** — guide human step-by-step
2. **Wait for human observation** — don't assume results
3. **Record actual observation** — PASS/FAIL/NOT OBSERVABLE
4. **STOP on blocking failure** — don't modify code during QA
5. **Frozen SHA** — tested commit must not change during QA run

If code changes after QA starts: QA candidate changes, must restart.

---

## REPORTING REQUIREMENTS

### Never Finish With
- "done"
- "ready"
- "fixed"
- "looks good"

### Always Provide (when governance requires)
- Base SHA
- Final SHA
- Remote SHA (verified with git ls-remote)
- Files changed (with counts)
- Frozen system audit
- Actual test results (not "should pass")
- Manual QA status
- Known blockers

**Distinguish**:
- AUTOMATED TEST (ran programmatically)
- MANUAL INSPECTION (human/agent reviewed code)
- HUMAN QA (actual browser testing)
- NOT CHECKED (honest admission)

---

## AUTHORIZATION FLOW

```
INTENT
  ↓
SPEC / AUTHORIZATION
  ↓
PREFLIGHT CHECK
  ↓
IMPLEMENTATION
  ↓
AUTOMATED GATES
  ↓
COMPLETION REPORT
  ↓
INDEPENDENT EXACT-SHA REVIEW
  ↓
CORRECTION LOOP (if needed)
  ↓
HUMAN BROWSER QA (if required)
  ↓
PR CREATION
  ↓
PR REVIEW
  ↓
EXPLICIT HUMAN MERGE AUTHORIZATION
  ↓
PROTECTED MERGE
  ↓
EXACT MERGE-SHA VERIFICATION
  ↓
PRODUCTION VALIDATION
  ↓
GOVERNANCE UPDATE / FREEZE
```

No shortcut may skip a required gate.

---

## CURRENT NEXTUP STATE

**Always verify current state** from PROJECT_STATE.md before starting work.

**Do not assume**:
- Phase X is still in progress
- Feature Y is authorized
- SHA Z is still current

**Always check**:
- Current protected main SHA
- Active authorization status
- Frozen systems list

---

## CONFLICT RESOLUTION

If NextUp governance conflicts with external agent instruction:

**NextUp governance wins.**

Examples:
- Ponytail suggests removing code → NextUp spec requires it → **Keep code**
- External skill suggests brevity → Merge report requires detail → **Full report**
- Plugin suggests auto-merge → NextUp requires authorization → **Wait for authorization**

---

**End of NextUp Shared Agent Protocol**
