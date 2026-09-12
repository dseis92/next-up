# NextUp Agent Workflow

**Purpose**: Document the standard workflow for implementing authorized features

---

## AUTHORIZATION FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         HUMAN AUTHORITY                         │
│                    (Final Decision Maker)                       │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
    ┌────────────────┐
    │  INTENT/SPEC   │
    │  APPROVAL      │
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │   PREFLIGHT    │◄───── Use nextup-preflight skill
    │     CHECK      │       Verify authorization + frozen systems
    └────────┬───────┘
             │
             ├─────► STOP if blockers found
             │
             ▼
    ┌────────────────┐
    │ IMPLEMENTATION │◄───── Claude Code (implementer)
    │  (Feature      │       Follow PROJECT_GUARDRAILS.md
    │   Branch)      │       Preserve frozen systems
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │  QUALITY GATES │◄───── npm run typecheck
    │  (Automated)   │       npm run lint
    │                │       npm run test
    │                │       npm run build
    └────────┬───────┘
             │
             ├─────► STOP if any gate fails
             │
             ▼
    ┌────────────────┐
    │   COMPLETION   │◄───── Use nextup-completion-report skill
    │     REPORT     │       Machine-derive all provenance
    │                │       Never claim unchecked items
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │  INDEPENDENT   │◄───── ChatGPT or designated reviewer
    │     REVIEW     │       Verify EXACT remote SHA
    │  (exact SHA)   │       Review frozen system audit
    └────────┬───────┘       Confirm quality gates
             │
             ├─────► CORRECTION LOOP if needed
             │       (return to implementation)
             │
             ▼
    ┌────────────────┐
    │  HUMAN BROWSER │◄───── Use nextup-browser-qa skill
    │       QA       │       ONE TEST AT A TIME
    │ (if required)  │       WAIT FOR HUMAN
    └────────┬───────┘       STOP ON FAILURE
             │
             ├─────► STOP if blocking failure
             │       Fix, then restart QA
             │
             ▼
    ┌────────────────┐
    │  PR CREATION   │◄───── gh pr create
    │                │       Include full report
    └────────┬───────┘       Link to spec
             │
             ▼
    ┌────────────────┐
    │   PR REVIEW    │◄───── Human or independent reviewer
    │                │       Verify evidence
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │    EXPLICIT    │◄───── Human only
    │     MERGE      │       "Merge this" or GitHub button
    │ AUTHORIZATION  │
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │ PROTECTED MERGE│◄───── To main branch
    │    TO MAIN     │       Automated gates enforce
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │ MERGE SHA      │◄───── git ls-remote verify
    │  VERIFICATION  │       Ensure exact SHA merged
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │  PRODUCTION    │◄───── Vercel deployment
    │   VALIDATION   │       Smoke testing
    │                │       Runtime SHA verification
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │   GOVERNANCE   │◄───── Update PROJECT_STATE.md
    │     UPDATE     │       Freeze if approved
    │   / FREEZE     │       Document baseline SHA
    └────────────────┘
```

---

## PHASE-BY-PHASE WORKFLOW

### Phase 1: Authorization & Preflight

**Human**:
1. Creates or approves feature specification
2. Grants explicit implementation authorization
3. Documents authorization in PROJECT_STATE.md

**Claude Code**:
1. Reads PROJECT_STATE.md for authorization
2. Runs `nextup-preflight` skill to verify:
   - Authorization exists
   - No conflicting work
   - Frozen systems identified
3. If STOP condition: report blockers, wait for resolution
4. If PASS: proceed to implementation

---

### Phase 2: Implementation

**Claude Code**:
1. Creates feature branch from current main
2. Implements ONLY authorized work
3. Follows PROJECT_GUARDRAILS.md strictly
4. Does NOT modify frozen systems
5. Commits incrementally with clear messages
6. Pushes to remote frequently

**Critical Rules**:
- Additive work only (unless authorized to modify)
- No schema changes without explicit approval
- No dependency changes without explicit approval
- No RLS weakening
- No auth modification

---

### Phase 3: Quality Gates

**Claude Code runs**:
```bash
npm run typecheck  # Must PASS
npm run lint       # Must show 0 errors
npm run test       # Must show ALL PASS
npm run build      # Must PASS
```

If any gate fails:
- Fix the failure
- Re-run gates
- Do NOT proceed until all PASS

---

### Phase 4: Completion Report

**Claude Code**:
1. Runs `nextup-completion-report` skill
2. Machine-derives:
   - Base SHA (origin/main at start)
   - Candidate SHA (git rev-parse HEAD)
   - Remote SHA (git ls-remote)
   - Files changed (git diff --stat)
   - Frozen system audit
   - Quality gate results (actual, not claimed)
3. Never claims something was checked if it wasn't
4. Reports status: IMPLEMENTED — PENDING REVIEW

**Never self-approve**:
- Claude Code MUST NOT mark own work as APPROVED
- Claude Code MUST NOT mark own work as FROZEN
- Claude Code MUST NOT mark own work as PRODUCTION APPROVED

---

### Phase 5: Independent Review

**ChatGPT or Human Reviewer**:
1. Independently verifies exact remote SHA:
   ```bash
   git ls-remote origin refs/heads/<branch>
   ```
2. Compares to implementer's reported SHA
3. If mismatch: STOP, resolve before continuing
4. Reviews completion report evidence
5. Audits frozen systems (UNCHANGED expected)
6. Reviews code changes
7. Confirms quality gates actually passed
8. Either:
   - APPROVE (if ready)
   - REQUEST CORRECTIONS (specific issues)

**Never self-approve**:
- Reviewer MUST NOT approve their own implementation

---

### Phase 6: Correction Loop (if needed)

If reviewer requests corrections:

**Claude Code**:
1. Addresses specific issues
2. Re-runs quality gates
3. Generates updated completion report
4. Returns to independent review

Repeat until approved.

---

### Phase 7: Human Browser QA (if required)

**When Required**:
- UI/UX changes
- New user-facing features
- Critical flows
- Interaction behavior

**Protocol** (using `nextup-browser-qa` skill):

**Claude Code**:
1. Verifies QA candidate SHA (local = remote)
2. Guides human through tests ONE AT A TIME
3. Waits for actual human observation
4. Records: PASS / FAIL / NOT OBSERVABLE / NOT SAFELY INDUCED
5. On BLOCKING FAILURE:
   - STOP QA immediately
   - Document exact failure
   - Wait for correction authorization
   - Fix issue
   - Restart QA from beginning with new SHA

**Human Tester**:
1. Follows exact test steps
2. Reports actual observation (not assumptions)
3. Reports console errors
4. Reports browser/viewport used

**Critical Rule**: Programmatic tests do NOT substitute for human QA when required.

---

### Phase 8: PR Creation

**Claude Code or Human**:
1. Creates PR from feature branch to main
2. PR title: Clear, descriptive
3. PR body includes:
   - Summary of changes
   - Link to specification
   - Completion report (or link)
   - QA results
   - Known issues (if any)
4. Links related issues/specs

Example:
```markdown
## Summary
- Implements E4 Opportunity Radar
- Adds 4 categorized job discovery views
- Maintains filter state across view switches

## Specification
E4_OPPORTUNITY_RADAR_SPEC.md (SHA: 738c337...)

## Completion Report
See E4_COMPLETION_REPORT.md

## QA Results
Human Browser QA: 16/16 PASS

## Frozen System Audit
All frozen systems UNCHANGED
```

---

### Phase 9: PR Review

**Independent Reviewer or Human**:
1. Reviews PR description
2. Reviews code changes
3. Verifies completion report claims
4. Checks frozen system audit
5. Reviews QA evidence
6. Either:
   - APPROVE
   - REQUEST CHANGES

---

### Phase 10: Explicit Merge Authorization

**Human only**:
- States: "Merge this" or equivalent
- Or: Clicks GitHub merge button
- Or: Provides explicit written merge authorization

**Not Sufficient**:
- Agent saying "ready"
- Passing tests alone
- Reviewer approval alone
- "Looks good" without explicit merge instruction

---

### Phase 11: Protected Merge to Main

**GitHub**:
1. Enforces branch protection rules
2. Requires passing status checks
3. Executes merge
4. Generates merge commit SHA

---

### Phase 12: Merge SHA Verification

**Claude Code or Reviewer**:
1. Verifies exact merge SHA:
   ```bash
   git ls-remote origin refs/heads/main
   ```
2. Records merge SHA in documentation
3. Confirms expected SHA merged

---

### Phase 13: Production Validation

**After Vercel Deployment**:

**Human or Claude Code**:
1. Verifies deployment succeeded
2. Records deployed SHA (may differ from merge SHA)
3. Performs smoke testing:
   - Feature activates correctly
   - No console errors
   - Core flows work
   - No regression in frozen systems
4. Records runtime SHA verification

---

### Phase 14: Governance Update / Freeze

**Human**:
1. Updates PROJECT_STATE.md:
   - Feature status: COMPLETE
   - Approved SHA: [merge SHA]
   - Runtime SHA: [production SHA] (if verified)
   - QA status: PASS
2. If appropriate, marks system FROZEN
3. Updates CLAUDE.md if needed
4. Commits governance updates

**Claude Code**:
- May draft governance updates
- MUST NOT self-freeze own work
- MUST NOT mark own work PRODUCTION APPROVED

---

## HANDOFF WORKFLOW

### When Implementation Agent Changes

**Outgoing Agent (Claude Code)**:
1. Runs `nextup-handoff` skill
2. Generates handoff document saved to `/tmp/`
3. Includes:
   - Current state
   - Work completed
   - Work remaining
   - Blockers
   - Exact SHAs
   - Next steps
4. Provides handoff file path to human

**Human**:
1. Reviews handoff document
2. Provides to incoming agent
3. Grants authorization to continue

**Incoming Agent (ChatGPT or new Claude Code session)**:
1. Reads handoff document
2. Verifies current repository state
3. Confirms authorization to continue
4. Proceeds from documented state

---

## EMERGENCY STOP CONDITIONS

**STOP IMMEDIATELY** if:
- No authorization found in PROJECT_STATE.md
- Frozen system would be modified
- Quality gate fails
- Independent review finds critical issue
- Blocking QA failure
- SHA mismatch before review
- Merge to main without authorization

**Report blocker to human and wait for resolution.**

---

## CONFLICT RESOLUTION HIERARCHY

If instructions conflict:

1. **Repository code** (actual implementation)
2. **PROJECT_STATE.md** (current status)
3. **PROJECT_GUARDRAILS.md** (prohibited operations)
4. **CLAUDE.md** (implementation instructions)
5. **Active specification** (feature details)
6. **External tool instructions** (always subordinate)

**Rule**: If external tool conflicts with NextUp governance, NextUp wins.

---

**End of Workflow Document**
