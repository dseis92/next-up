# NextUp — Current Project State

**Last Updated**: 2026-09-12

**Repository**: dseis92/next-up

**Main Branch**: main

---

## LAST INDEPENDENTLY APPROVED CODE BASELINE

**Commit**: `5857e635929988719e965624e4fb3b38b31acb3d`

**Message**: fix(E4): preserve Explore filters across view navigation

**Important Distinction**:

This SHA (`5857e635...`) is the approved **E4 product-code checkpoint**.

The protected merged / production-tested runtime checkpoint is:

`3df3751a98ab66838e39737434beaa503c76c1d1`

A later docs-only authorization commit may exist on main.

Do not confuse a docs commit with a newly approved product-code baseline.

---

## CORE PHASE STATUS

### Phases 1–8.2
**Status**: COMPLETE

### Phase 9 — Deterministic Matching
**Status**: COMPLETE + APPROVED + FROZEN

**Approved Checkpoint**: `7cecc4741600b0a1cda49b84763814e40a9ce2ec`

**Deliverable**: Pure deterministic job matching engine (`lib/matching/`)

### Phase 10 — Deterministic Integration
**Status**: COMPLETE + APPROVED + FROZEN

**Approved Checkpoint**: `e023730fb0a13ff2d44db4b5d96742526118064f`

**Deliverable**: Personalized matching integrated across Discover, Explore, Saved, Job Detail, Applications

### Phase 11 — Grounded AI Job Explanation
**Status**: IMPLEMENTATION COMPLETE + CODE/SECURITY/PRIVACY APPROVED + FROZEN

**Approved Code Checkpoint**: `3b15680ca7ee4856a592e0b8886137ebe66158fe`

**Real OpenAI Runtime**: INDEPENDENTLY VERIFIED + APPROVED + PRODUCTION ACTIVE

**Verified Production Runtime SHA**: `20fea115c9989524180a485c458a0f214054c366`

**Real Runtime QA**: LOCAL PASS + PRODUCTION PASS

**Match Immutability**: PASS — observed 63% → 63%

**OpenAI Request Privacy**: `store: false` confirmed (requests use `store: false`; API data not used for model training by default unless customer opts in; other provider data-control rules are separate from this setting)

**Deliverable**: Privacy-hardened AI job explanation with strict trust boundaries

### Phase 12
**Status**: LOCKED

---

## MAINTENANCE STATUS

### Application Mutation Safety
**Approved Baseline**: `3be6d51b39f8a7f12eff528973bdcf2d94c6fc30`

**Known Limitation**: `application` / `application_event` multi-write operations are not transactional.

**Authorization**: This is known but NOT authorized for modification during E3.

### Manual Maintenance Browser Regression
**Status**: PENDING

---

## PRODUCT EXPANSION STATUS

### E1 — Opportunity Deck
**Status**: COMPLETE + INDEPENDENT CODE REVIEW COMPLETE + CODE APPROVED + FROZEN

**Manual QA**: PENDING

**Approved Checkpoint**: `8ffaf3666a7af7aea0b6fdb758032aaed5743d50`

**Deliverable**: Swipeable Tinder-style job discovery in Explore Deck mode

### E2 — Opportunity Compare
**Status**: COMPLETE + INDEPENDENT CODE REVIEW COMPLETE + CODE APPROVED + FROZEN

**Manual QA**: PENDING

**Approved Checkpoint**: `fe7253ae289155d8263bf4725cb410b728a52c84`

**Deliverable**: Side-by-side job comparison with deterministic scoring consistency

### E3 — Dealbreaker Engine
**Status**: COMPLETE + INDEPENDENTLY APPROVED + PRODUCTION APPROVED + FROZEN

**Approved E3 Code SHA**: `8f4ba113c02adddbc014c44510ea1142ba5f3328`

**Merged / Production-Tested Runtime SHA**: `5b4593185a060e269324b9d9d4914717d738a731`

**Migration**: `20260908000006` APPLIED + VERIFIED

**Programmatic/Database CRUD**: PASS

**Required Local Browser Merge-Gate**: PASS

**Production Browser Smoke**: PASS

**Match Immutability**: PASS (Observed verification: 65% → 65%)

**Vercel Exact Runtime SHA**: SUCCESS

**Cross-User RLS Runtime**: NOT EXECUTED

**Deliverable**: User-defined non-negotiable preferences with independent conflict detection that does not alter deterministic MatchResult

### E4 — Opportunity Radar
**Status**: COMPLETE + INDEPENDENTLY APPROVED + PRODUCTION APPROVED + FROZEN

**Approved Specification SHA**: `738c3378df712dd5da25bc894616d987c764f5ff`

**Approved Specification Merge SHA**: `2f3eab0cab17f8daa2854efe8a1a878f99283dda`

**Approved Implementation SHA**: `5857e635929988719e965624e4fb3b38b31acb3d`

**Protected Merge / Production Runtime SHA**: `3df3751a98ab66838e39737434beaa503c76c1d1`

**Human Browser QA**: 16/16 PASS

**Production Browser Smoke**: PASS

**Exact Merge-SHA Vercel**: SUCCESS

**Database**: UNCHANGED

**Migrations**: UNCHANGED

**Dependencies**: UNCHANGED

**Deliverable**: Purpose-driven deterministic Explore Radar with Best Matches, New Opportunities, High Compensation, and Stretch Opportunities

### E5–E35
**Status**: PLANNING ONLY — NOT IMPLEMENTATION AUTHORIZED

---

## CURRENT QUALITY CHECKPOINT

**At Approved E4 Implementation** (`5857e635929988719e965624e4fb3b38b31acb3d`):

- **Test Files**: 31
- **Tests**: 531 PASS
- **Radar Tests**: 91 PASS
- **Typecheck**: PASS
- **Build**: PASS
- **Vercel**: SUCCESS
- **Lint Errors**: 0
- **Lint Warnings**: 24
- **Human Browser QA**: 16/16 PASS
- **Production Smoke**: PASS

---

## CURRENT MANUAL QA STATUS

- **E1 Browser QA**: PENDING
- **E2 Browser QA**: PENDING
- **Application Mutation Browser QA**: PENDING
- **E3 Required Browser Merge-Gate**: PASS
- **E3 Production Smoke**: PASS
- **E4 Human Browser QA**: PASS — 16/16
- **E4 Production Smoke**: PASS

**Do not falsely mark incomplete QA as complete.**

---

## CURRENT AUTHORIZATION

- Phase 9 is **FROZEN**
- Phase 10 is **FROZEN**
- Phase 11 is **IMPLEMENTATION + REAL OPENAI RUNTIME APPROVED + FROZEN**
- Phase 12 is **LOCKED**
- E1/E2 are **FROZEN**
- E3 is **CLOSED + FROZEN**
- E4 is **CLOSED + PRODUCTION APPROVED + FROZEN**
- E5+ are **PLANNING ONLY / NOT IMPLEMENTATION AUTHORIZED**

**CURRENT PRODUCT IMPLEMENTATION AUTHORIZATION**: NONE

---

## APPROVAL RULE

Claude Code may report:

**IMPLEMENTED / PENDING INDEPENDENT REVIEW**

Claude Code **MUST NOT** mark its own implementation:

- APPROVED
- FROZEN
- PRODUCTION APPROVED

Independent review happens separately.

---

## SOURCE-OF-TRUTH HIERARCHY

Use this hierarchy when documentation conflicts arise:

1. **Actual repository/code at current git HEAD**
2. **PROJECT_STATE.md** (this file)
3. **PROJECT_GUARDRAILS.md**
4. **CLAUDE.md**
5. **Active feature specification** (if an implementation is explicitly authorized)
6. **PRODUCT_EXPANSION_ROADMAP.md**
7. **Historical reports/manual test documents**

Currently no product implementation feature is authorized.

Repository code always wins over stale prose.

---

**End of Project State**
