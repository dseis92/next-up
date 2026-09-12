# NextUp Agent Tooling — Architecture

**Version**: 1.0
**Purpose**: Document the governed multi-agent coordination architecture

---

## ARCHITECTURE LAYERS

### Layer 1: Human Authority
**Role**: Final decision maker
**Powers**: Authorization, approval, merge, production validation
**Cannot be overridden by**: Any agent or automation

**Responsibilities**:
- Grant implementation authorization
- Approve specifications
- Execute independent review (or delegate)
- Authorize merges to protected main
- Validate production behavior
- Freeze approved systems

---

### Layer 2: Repository Source of Truth
**Location**: `dseis92/next-up` on GitHub
**Principle**: Code wins over documentation

**Source of Truth Hierarchy**:
1. Repository code at current HEAD
2. `PROJECT_STATE.md`
3. `PROJECT_GUARDRAILS.md`
4. `CLAUDE.md`
5. Active feature specification
6. Roadmap/historical reports

If documentation contradicts repository, **repository is correct**.

---

### Layer 3: Implementation Agent (Claude Code)
**Role**: Authorized implementation only
**May**: Implement explicitly authorized work
**Must**: Follow `PROJECT_GUARDRAILS.md`, report work as "PENDING REVIEW"
**Must NOT**: Self-approve, self-freeze, mark own work PRODUCTION APPROVED

**Coordination Files**:
- `AGENTS.md` — Shared protocol
- `CONTEXT.md` — Domain vocabulary
- `PROJECT_STATE.md` — Current status
- `PROJECT_GUARDRAILS.md` — Prohibited operations

**Skills Available**:
- `nextup-preflight` — Pre-implementation safety check
- `nextup-completion-report` — Mandatory detailed reports
- `nextup-handoff` — Cross-agent handoff generation
- `nextup-browser-qa` — Human QA guidance
- Matt Pocock skills (code-review, tdd, diagnosing-bugs, etc.)

---

### Layer 4: Independent Reviewer (ChatGPT or Human)
**Role**: Verify exact remote SHA independently
**May**: Approve or request corrections
**Must**: Review evidence, not memory
**Must NOT**: Self-approve own implementation

**Critical Requirement**:
- Verify EXACT remote SHA (40 characters)
- Use `git ls-remote origin refs/heads/<branch>`
- Never accept implementer's claim without verification
- Review frozen system audit
- Confirm quality gates actually passed

---

### Layer 5: GitHub Shared Evidence
**Branch Model**:
- `main` — Protected, frozen approved work only
- Feature branches — Implementation + review
- Tooling branches — Governance/tooling work

**SHA Provenance**:
- Base SHA: `origin/main` at start
- Candidate SHA: Feature branch HEAD
- Remote SHA: Verified with `git ls-remote`
- Merge SHA: Actual merged commit to main
- Runtime SHA: Production deployment commit

**Protection Rules**:
- No force push to main
- No direct commits to main
- PR required
- Quality gates required
- Human approval required

---

### Layer 6: Human Browser QA
**Protocol**: `.claude/skills/nextup-browser-qa/SKILL.md`

**Principles**:
1. ONE TEST AT A TIME
2. WAIT FOR HUMAN OBSERVATION
3. RECORD ACTUAL RESULT
4. STOP ON BLOCKING FAILURE
5. FROZEN SHA DURING QA

**Statuses**:
- PASS — Expected behavior observed
- FAIL — Different behavior observed
- NOT OBSERVABLE — Data/condition unavailable
- NOT SAFELY INDUCED — Cannot trigger without code change

**Critical**: Programmatic tests do NOT substitute for required human QA.

---

### Layer 7: Protected-Main PR
**Required Before Merge**:
- Automated tests PASS
- TypeScript PASS
- Build PASS
- ESLint 0 errors
- Independent review APPROVED
- Human browser QA PASS (if required)
- Frozen system audit UNCHANGED
- Explicit merge authorization

**PR Review Evidence**:
- Base SHA
- Candidate SHA
- Remote SHA match verification
- Files changed with counts
- Quality gate results (actual, not claimed)
- QA status (with test count/results)
- Known blockers

---

### Layer 8: Explicit Merge Authorization
**Who**: Human only
**When**: After all gates pass
**How**: Explicit statement or GitHub merge action

**Not Sufficient**:
- "looks good"
- "ready"
- Agent claiming "approved"
- Passing tests alone

**Required**:
- Human statement: "merge this" or equivalent
- Or: Human clicks GitHub merge button

---

## AUTHORIZATION FLOW

```
INTENT
  ↓
SPECIFICATION / AUTHORIZATION
  ↓
PREFLIGHT CHECK (nextup-preflight skill)
  ↓
IMPLEMENTATION (Claude Code)
  ↓
AUTOMATED GATES (tests, typecheck, lint, build)
  ↓
COMPLETION REPORT (nextup-completion-report skill)
  ↓
INDEPENDENT EXACT-SHA REVIEW (ChatGPT/Human)
  ↓
CORRECTION LOOP (if needed)
  ↓
HUMAN BROWSER QA (if required, nextup-browser-qa skill)
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

## SHA SAFETY

### Never Invent SHAs
- Candidate SHA: `git rev-parse HEAD`
- Remote verification: `git ls-remote origin refs/heads/<branch>`
- Base SHA: `git rev-parse origin/main`

### Before Independent Review
Local SHA and remote SHA **MUST** match exactly (full 40 characters).

If mismatch: **STOP** and resolve before review.

### Prohibited Git Operations
Without explicit human authorization:
- `git push --force`
- `git reset --hard`
- Rewriting approved history
- Direct push to protected main
- Merge without authorization

---

## FROZEN SYSTEMS

### Definition
Approved implementation that MUST NOT be modified without explicit authorization.

Frozen systems are **presumed valuable**.

### Current Frozen Systems
- `lib/matching/` (Phase 9)
- `lib/ai/` (Phase 11)
- `lib/dealbreakers/` (E3)
- E1 Opportunity Deck components
- E2 Opportunity Compare components
- `package.json` dependencies
- Database schema/migrations

### Audit Requirement
Every completion report must verify frozen systems were **NOT** modified.

---

## EXTERNAL TOOL GOVERNANCE

### Principle
External agent skills/plugins are **subordinate to NextUp governance**.

If external instruction conflicts with `PROJECT_GUARDRAILS.md`:
**NextUp wins.**

### Review Process
All external tools reviewed in:
`docs/agent-tooling/EXTERNAL_TOOL_REVIEW.md`

### Installation Policy
- Manual installation only
- Auto-update **PROHIBITED**
- Copy-based approach (not package dependencies)
- Security re-review required for updates
- Explicit authorization for version changes

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
- Remote SHA (verified with `git ls-remote`)
- Files changed (with counts)
- Frozen system audit
- Actual test results (not "should pass")
- Manual QA status
- Known blockers

### Distinguish
- AUTOMATED TEST (ran programmatically)
- MANUAL INSPECTION (human/agent reviewed code)
- HUMAN QA (actual browser testing)
- NOT CHECKED (honest admission)

---

## TRUST BOUNDARIES

### Deterministic Systems Decide Facts
- Phase 9/10 matching engine
- E3 dealbreaker evaluation
- E4 radar category selection

### AI Explains Facts
- Phase 11 job match explanation
- Future career coaching
- Future resume tailoring

**Rule**: Data + deterministic matching decide facts. AI explains, coaches, and helps user act.

AI **MUST NOT**:
- Invent or modify match scores
- Override dealbreaker conflicts
- Fabricate missing data
- Change trusted facts

---

## QUALITY GATES

### Automated (Required)
```bash
npm run typecheck  # PASS
npm run lint       # 0 errors
npm run test       # ALL PASS
npm run build      # PASS
```

### Manual (When Required)
- Human browser QA (protocol in `nextup-browser-qa` skill)
- Independent code review
- Production smoke testing

---

## CONFLICT RESOLUTION

If NextUp governance conflicts with external agent instruction:

**NextUp governance wins.**

Examples:
- Ponytail suggests removing code → NextUp spec requires it → **Keep code**
- External skill suggests brevity → Merge report requires detail → **Full report**
- Plugin suggests auto-merge → NextUp requires authorization → **Wait for authorization**

---

**End of Architecture Document**
