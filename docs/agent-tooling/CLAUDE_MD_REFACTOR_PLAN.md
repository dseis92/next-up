# CLAUDE.md Refactor Plan

**Status**: REFERENCE ONLY — NOT AUTHORIZED FOR EXECUTION
**Created**: 2026-09-12
**Purpose**: Document potential CLAUDE.md improvements for future consideration

---

## EXECUTIVE SUMMARY

`CLAUDE.md` has grown to 2,700+ lines as NextUp matured from Phase 1 through Phase 11 + E1-E4 expansions.

This is **normal and expected** for a project with:
- 11 completed phases
- 4 product expansions
- Frozen foundational systems
- Detailed implementation history
- Trust/security requirements

However, strategic refactoring could improve agent onboarding, reduce token usage, and maintain clarity as NextUp continues to evolve.

**This document proposes a refactor plan but does NOT authorize execution.**

---

## CURRENT CLAUDE.MD ANALYSIS

### Strengths
- Comprehensive single source of implementation truth
- Rich historical context preserves decision rationale
- Detailed specifications prevent common mistakes
- Clear frozen system boundaries
- Strong trust principles
- Authorization model well-documented

### Growth Drivers
- Historical phase specifications (Phase 10, Phase 11 complete text preserved)
- Repetitive frozen system reminders across phases
- Product expansion specifications duplicated
- Manual browser QA instructions embedded
- Quality gate requirements repeated

### Token Impact
- Initial read: ~2,700 lines → significant token allocation
- Repeated context: Same frozen system lists in multiple sections
- Historical specs: Phase 10/11 full text despite completion

---

## PROPOSED REFACTOR STRATEGY

### Principle
**Preserve authoritative content. Move implementation details to specialized documents. Maintain single entry point.**

### Target Structure

```
CLAUDE.md (SLIMMER)
├─ Critical Current State (authorization, frozen systems, current phase)
├─ Trust Principles (non-negotiable rules)
├─ Source of Truth Hierarchy
├─ Framework/Stack
├─ Product Identity (brief)
└─ References to detailed specs

PHASE_SPECIFICATIONS/
├─ PHASE_09_MATCHING_ENGINE.md
├─ PHASE_10_MATCHING_INTEGRATION.md
├─ PHASE_11_AI_EXPLANATION.md
└─ [future phases]

EXPANSION_SPECIFICATIONS/
├─ E1_OPPORTUNITY_DECK_SPEC.md
├─ E2_OPPORTUNITY_COMPARE_SPEC.md
├─ E3_DEALBREAKER_ENGINE_SPEC.md
├─ E4_OPPORTUNITY_RADAR_SPEC.md (already exists)
└─ [future expansions]

GOVERNANCE/
├─ PROJECT_STATE.md (already exists)
├─ PROJECT_GUARDRAILS.md
├─ FROZEN_SYSTEMS.md (new)
├─ QUALITY_GATES.md (new)
└─ TRUST_PRINCIPLES.md (new)
```

---

## DETAILED REFACTOR PLAN

### Step 1: Extract Historical Phase Specifications

**Move to**: `docs/phases/PHASE_10_MATCHING_INTEGRATION.md`

**Extract from CLAUDE.md**:
- Full Phase 10 implementation specification (currently ~800 lines)
- Preserve header: "HISTORICAL PHASE 10 — COMPLETE + FROZEN"
- Include approved checkpoint SHA
- Include completion report summary

**Replace in CLAUDE.md with**:
```markdown
PHASE 10 — DETERMINISTIC MATCHING INTEGRATION — COMPLETE + APPROVED

Approved Phase 10 checkpoint: e023730fb0a13ff2d44db4b5d96742526118064f

Phase 10 established canonical matching integration throughout NextUp.

Full specification: docs/phases/PHASE_10_MATCHING_INTEGRATION.md
```

**Repeat for Phase 11**:
- Move full Phase 11 spec to `docs/phases/PHASE_11_AI_EXPLANATION.md`
- Replace with summary + link

**Estimated reduction**: ~1,200 lines

---

### Step 2: Consolidate Frozen Systems

**Create**: `docs/governance/FROZEN_SYSTEMS.md`

**Content**:
```markdown
# NextUp Frozen Systems

LAST UPDATED: [date]
BASELINE SHA: [current approved SHA]

## WHAT IS A FROZEN SYSTEM?

Approved implementation that MUST NOT be modified without explicit authorization.

Frozen systems are presumed valuable.

## CURRENT FROZEN SYSTEMS

### Phase 9: Deterministic Matching Engine
**Location**: `lib/matching/`
**Frozen Since**: 7cecc4741600b0a1cda49b84763814e40a9ce2ec
**Why Frozen**: Core product truth, independently approved
**Files**:
- lib/matching/index.ts
- lib/matching/types.ts
- lib/matching/weights.ts
- lib/matching/calculate-job-match.ts
- lib/matching/reasons.ts
- lib/matching/skill-aliases.ts
- lib/matching/__tests__/

### Phase 11: AI Job Explanation
**Location**: `lib/ai/`
**Frozen Since**: 3b15680ca7ee4856a592e0b8886137ebe66158fe
**Why Frozen**: Security reviewed, privacy approved
**Files**: [list]

### E3: Dealbreaker Engine
**Location**: `lib/dealbreakers/`
**Frozen Since**: 8f4ba113c02adddbc014c44510ea1142ba5f3328
**Why Frozen**: Independently approved, migration applied
**Migration**: 20260908000006
**Files**: [list]

[Continue for all frozen systems]

## AUDIT REQUIREMENT

Every completion report must verify frozen systems UNCHANGED.

## MODIFICATION PROTOCOL

If frozen system modification is required:
1. Document reason in feature specification
2. Obtain explicit human authorization
3. Include frozen-modification justification in completion report
4. Require independent review of frozen changes
5. Update FROZEN_SYSTEMS.md after approval
```

**Replace in CLAUDE.md**: Single reference to FROZEN_SYSTEMS.md

**Estimated reduction**: ~200 lines (consolidated from multiple mentions)

---

### Step 3: Extract Quality Gates

**Create**: `docs/governance/QUALITY_GATES.md`

**Content**:
```markdown
# NextUp Quality Gates

## AUTOMATED GATES (REQUIRED)

All implementations must pass:

```bash
npm run typecheck  # PASS required
npm run lint       # 0 errors required
npm run test       # ALL PASS required
npm run build      # PASS required
```

## MANUAL GATES (WHEN REQUIRED)

### Independent Code Review
- Required for: All feature implementations
- Reviewer: ChatGPT or designated human (not implementer)
- Verifies: Exact remote SHA, frozen systems, quality evidence

### Human Browser QA
- Required for: UI/UX changes, new user-facing features, critical flows
- Protocol: .claude/skills/nextup-browser-qa/SKILL.md
- Verifies: Actual browser behavior, not code inspection

### Production Smoke Testing
- Required for: After protected merge to main
- Verifies: Feature works in production, no console errors, no regression

## GATE FAILURE PROTOCOL

If any gate fails:
1. STOP implementation flow
2. Fix failure
3. Re-run gate
4. Do NOT proceed until PASS
5. Document fix in completion report

## EXEMPTIONS

NO exemptions allowed for:
- TypeScript errors
- Failing tests
- Build failures

Limited exemptions possible for:
- Pre-existing lint warnings (must document)
- Browser QA if feature is not user-observable
```

**Replace in CLAUDE.md**: Link to QUALITY_GATES.md

**Estimated reduction**: ~150 lines

---

### Step 4: Extract Product Trust Principles

**Create**: `docs/governance/TRUST_PRINCIPLES.md`

**Content**:
```markdown
# NextUp Product Trust Principles

## FOUNDATIONAL RULE

Data + deterministic matching decide facts.
AI explains, contextualizes, coaches, recommends, and helps the user act.

## AI MUST NOT

- Become a second scoring engine
- Invent or modify match scores
- Override dealbreaker conflicts
- Fabricate missing data
- Change trusted facts
- Invent experience
- Invent qualifications
- Invent education
- Invent certifications
- Invent salary
- Invent job requirements
- Fabricate hiring probability
- Contradict deterministic hard failures
- Auto-apply without confirmation
- Auto-message employers without confirmation

## DETERMINISTIC SYSTEMS DECIDE

- Match scores (Phase 9/10)
- Dealbreaker evaluation (E3)
- Radar category membership (E4)
- Skills matched/missing
- Hard failures

## AI MAY

- Explain deterministic results in natural language
- Provide career coaching based on facts
- Suggest resume wording improvements
- Prepare interview talking points
- Draft follow-up messages for review
- Contextualize opportunities

## PRIVACY PRINCIPLES

Never:
- Expose private user data across accounts
- Weaken RLS for convenience
- Log API keys
- Send auth tokens to external providers
- Include user email/IDs in AI context unless required
- Persist sensitive data unnecessarily

## DATA INTEGRITY PRINCIPLES

Never:
- Show stale persisted scores as current
- Hide important match concerns
- Turn incomplete profile into 0%
- Hide provider errors as profile incompleteness
- Cache match results that won't update on profile change

## SAME USER + SAME JOB = SAME SCORE EVERYWHERE

A job's match percentage must be identical in:
- Discover
- Explore
- Saved
- Job Detail
- Applications

For same user, same point in time.
```

**Replace in CLAUDE.md**: Link to TRUST_PRINCIPLES.md

**Estimated reduction**: ~120 lines

---

### Step 5: Streamline CLAUDE.md

**New CLAUDE.md Structure** (~1,000 lines target):

```markdown
# NextUp — Claude Code Project Instructions

## CRITICAL CURRENT STATE
[Authorization status, current phase, frozen baseline - ~150 lines]

## SOURCE OF TRUTH
[Hierarchy, repository authority - ~50 lines]

## FRAMEWORK / STACK
[Technology summary - ~30 lines]

## PROJECT IDENTITY
[Brief product description, core principle - ~80 lines]

## COMPLETED WORK SUMMARY
[Brief phase/expansion summaries with links to detailed specs - ~200 lines]

## CURRENT AUTHORIZED WORK
[Current phase/expansion with link to full spec - ~100 lines]

## QUALITY REQUIREMENTS
[Link to QUALITY_GATES.md - ~20 lines]

## FROZEN SYSTEMS
[Link to FROZEN_SYSTEMS.md - ~20 lines]

## TRUST PRINCIPLES
[Link to TRUST_PRINCIPLES.md - ~20 lines]

## GIT / DEPLOYMENT RULES
[Essential git safety, commit format, Vercel - ~80 lines]

## LOCKED PHASES
[What NOT to start - ~50 lines]

## REPORTING REQUIREMENTS
[Completion report mandate, never finish with "done" - ~50 lines]

## REFERENCES
[Links to all detailed specifications - ~50 lines]
```

**Total target**: ~900-1,000 lines (down from 2,700)

---

## MIGRATION EXECUTION PLAN (IF AUTHORIZED)

### Phase 1: Create New Documents
1. Create `docs/phases/` directory
2. Create `docs/governance/` directory
3. Extract and create PHASE_10_MATCHING_INTEGRATION.md
4. Extract and create PHASE_11_AI_EXPLANATION.md
5. Create FROZEN_SYSTEMS.md
6. Create QUALITY_GATES.md
7. Create TRUST_PRINCIPLES.md

### Phase 2: Update CLAUDE.md
1. Create backup: `CLAUDE.md.backup-[date]`
2. Rewrite CLAUDE.md with new structure
3. Replace detailed sections with links
4. Verify all critical content preserved or linked

### Phase 3: Update Cross-References
1. Update PROJECT_STATE.md references
2. Update AGENTS.md if needed
3. Ensure all links valid

### Phase 4: Verification
1. Test agent comprehension with sample tasks
2. Verify frozen systems still clear
3. Verify trust principles still enforced
4. Confirm quality gates understood

### Phase 5: Commit
```
chore(docs): refactor CLAUDE.md for clarity and token efficiency

- Move historical Phase 10/11 specs to docs/phases/
- Consolidate frozen systems to docs/governance/FROZEN_SYSTEMS.md
- Extract quality gates to docs/governance/QUALITY_GATES.md
- Extract trust principles to docs/governance/TRUST_PRINCIPLES.md
- Reduce CLAUDE.md from 2,700 to ~1,000 lines
- Preserve all authoritative content via links
```

---

## RISKS & MITIGATIONS

### Risk: Agent Doesn't Read Linked Documents
**Mitigation**:
- Keep critical authorization status in CLAUDE.md
- Include "READ BEFORE STARTING" warnings
- Test agent behavior before/after

### Risk: Lost Historical Context
**Mitigation**:
- Preserve ALL content in extracted docs
- Maintain CLAUDE.md.backup
- Version control ensures recoverability

### Risk: Broken Link Failures
**Mitigation**:
- Use relative paths from repo root
- Include file existence verification
- Test all links before commit

### Risk: Incomplete Extraction
**Mitigation**:
- Diff CLAUDE.md before/after for missing content
- Independent review of extraction
- Pilot with non-critical section first

---

## RECOMMENDATION

**Recommendation**: DEFER until after E4 completion.

**Rationale**:
1. E4 implementation in progress - minimize disruption
2. Current CLAUDE.md works - "if it ain't broke"
3. Token budget sufficient for current operations
4. Refactor safer when no active implementation

**Future Trigger**: Consider refactor when:
- E4 complete + frozen
- E5-E10 specifications added
- Token pressure increases
- Agent confusion incidents
- Human requests consolidation

---

**This plan is REFERENCE ONLY and does NOT authorize refactoring CLAUDE.md.**

**End of Refactor Plan**
