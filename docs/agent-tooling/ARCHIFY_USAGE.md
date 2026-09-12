# Archify Usage Guide

**Status**: DEFERRED FOR V1
**Reason**: On-demand architecture visualization not critical for V1 agent coordination release

---

## WHAT IS ARCHIFY?

Archify is an AI-powered architecture visualization tool that can generate diagrams from codebases.

**Repository**: https://github.com/gtanczyk/archify

**Primary Use Cases**:
- Architecture documentation
- Trust boundary visualization
- Data flow diagrams
- Component relationship mapping
- Onboarding documentation

---

## WHY DEFERRED FOR V1?

### Current V1 Priorities
1. Cross-agent coordination protocol (AGENTS.md, CONTEXT.md)
2. Safety skills (preflight, completion-report, browser-qa)
3. Matt Pocock workflow skills
4. External tool security review
5. Basic documentation

### Architecture Visualization Not Critical For
- E4 implementation (already authorized)
- Independent code review (text-based)
- Human browser QA (behavioral testing)
- Git SHA provenance (command-line verification)

### Future Value
Architecture visualization becomes valuable when:
- Onboarding new developers
- Explaining trust boundaries to stakeholders
- Documenting complex Phase 12+ features
- Planning major refactors
- Security audits requiring visual evidence

---

## INSTALLATION PLAN (FUTURE)

When authorized:

### Step 1: Install Archify
```bash
npm install -g archify
# or
npx archify [options]
```

### Step 2: Configure for NextUp
Create `.archifyrc.json`:
```json
{
  "include": [
    "app/",
    "lib/",
    "components/"
  ],
  "exclude": [
    "node_modules/",
    "**/__tests__/",
    "**/*.test.ts",
    ".next/"
  ],
  "outputDir": "docs/architecture/diagrams",
  "format": ["mermaid", "svg"]
}
```

### Step 3: Generate Base Diagrams
```bash
# Full application architecture
archify --input . --output docs/architecture/diagrams/full-architecture.mmd

# Matching engine detail
archify --input lib/matching --output docs/architecture/diagrams/matching-engine.mmd

# AI explanation layer
archify --input lib/ai --output docs/architecture/diagrams/ai-layer.mmd

# Dealbreaker engine
archify --input lib/dealbreakers --output docs/architecture/diagrams/dealbreaker-engine.mmd
```

---

## PROPOSED USAGE PATTERNS

### Pattern 1: Pre-Implementation Architecture Review

**When**: Before starting major new phase/expansion

**Process**:
1. Generate current architecture diagram
2. Review with human for completeness
3. Identify integration points for new feature
4. Document planned changes
5. Use as reference during implementation
6. Generate post-implementation diagram
7. Compare before/after

**Example**:
```bash
# Before E4 implementation
archify --input app/explore --output docs/architecture/e4-before.mmd

# After E4 implementation
archify --input app/explore --output docs/architecture/e4-after.mmd

# Diff for review
```

---

### Pattern 2: Trust Boundary Visualization

**When**: Security review, independent audit, or stakeholder explanation

**Process**:
1. Generate diagram highlighting trust boundaries
2. Annotate:
   - Deterministic systems (green)
   - AI-enhanced systems (yellow)
   - External integrations (red)
   - RLS-protected data access (blue)
3. Document data flow across boundaries
4. Include in security documentation

**Example Layers**:
- Client → Server boundary
- Public → Authenticated boundary
- User data → AI provider boundary
- Database RLS boundaries

---

### Pattern 3: Frozen System Documentation

**When**: Freezing a major system

**Process**:
1. Generate detailed diagram of frozen system
2. Document all entry points
3. Document all dependencies
4. Include in FROZEN_SYSTEMS.md
5. Use as reference for "do not modify" verification

**Example**:
```bash
archify --input lib/matching \
        --output docs/frozen-systems/phase-9-matching-engine.mmd \
        --depth 3
```

---

### Pattern 4: Onboarding Documentation

**When**: New developer/agent joining project

**Process**:
1. Generate high-level application structure
2. Generate detailed diagrams for each major subsystem
3. Create visual tour document linking diagrams
4. Include in onboarding checklist

**Diagrams to Generate**:
- Overall application architecture
- Database schema + RLS
- Matching engine flow
- AI explanation flow
- Dealbreaker evaluation flow
- Discover → Explore → Saved → Applications flow

---

## NEXTUP-SPECIFIC DIAGRAM CATALOG (PROPOSED)

### Core Architecture
- `docs/architecture/diagrams/full-stack.mmd` — Next.js app + Supabase + OpenAI
- `docs/architecture/diagrams/data-flow.mmd` — User data → Matching → UI

### Frozen Systems
- `docs/architecture/diagrams/phase-9-matching.mmd` — Deterministic matching engine
- `docs/architecture/diagrams/phase-11-ai.mmd` — AI explanation layer
- `docs/architecture/diagrams/e3-dealbreakers.mmd` — Dealbreaker evaluation

### Feature Flows
- `docs/architecture/diagrams/discover-flow.mmd` — Discover swipe experience
- `docs/architecture/diagrams/explore-modes.mmd` — List/Deck/Radar modes
- `docs/architecture/diagrams/applications-tracking.mmd` — Application lifecycle

### Trust Boundaries
- `docs/architecture/diagrams/trust-boundaries.mmd` — Deterministic vs AI boundaries
- `docs/architecture/diagrams/rls-security.mmd` — Database security model
- `docs/architecture/diagrams/ai-privacy.mmd` — AI provider data flow

---

## GOVERNANCE INTEGRATION

### When to Update Diagrams
- After completing major phase/expansion
- After freezing a system
- Before independent review (optional)
- When architecture changes significantly
- On request for stakeholder communication

### Diagram Ownership
- Claude Code may generate diagrams
- Human reviews and approves accuracy
- Diagrams are documentation, not source of truth
- Repository code remains authoritative

### Storage
- Commit diagrams to: `docs/architecture/diagrams/`
- Format: Mermaid (.mmd) for version control friendliness
- Also generate: SVG for human viewing

---

## ARCHIFY LIMITATIONS

### Known Constraints
- Generated diagrams may be incomplete
- AI interpretation may miss implicit relationships
- Large codebases may produce cluttered diagrams
- Manual annotation usually required
- Not a substitute for code review

### NextUp-Specific Challenges
- May not capture RLS policies visually
- May not distinguish frozen vs non-frozen
- May not show deterministic vs AI boundaries
- Requires human curation for trust documentation

---

## ALTERNATIVE APPROACHES

If Archify proves insufficient:

### Manual Mermaid Diagrams
- Create diagrams by hand in Mermaid syntax
- More accurate for trust boundaries
- Better for governance documentation
- More work, but more precise

### Hybrid Approach
- Use Archify for initial scaffolding
- Manually refine for NextUp specifics
- Annotate with frozen/trust markers
- Maintain manually for critical systems

---

## INSTALLATION DECISION CRITERIA

Install Archify when:
- [ ] E4 complete and frozen
- [ ] E5+ planning requires architecture visualization
- [ ] Stakeholder requests visual documentation
- [ ] Security audit requires trust boundary diagrams
- [ ] New developer onboarding scheduled
- [ ] Human explicitly requests architecture diagrams

**Current Status**: NONE of above criteria met for V1

**Recommendation**: Defer until explicit need arises

---

## INSTALLATION AUTHORIZATION REQUIRED

**DO NOT install Archify without**:
1. Explicit human authorization
2. Clear use case identified
3. Time allocated for diagram generation + review
4. Commitment to maintain diagrams (or accept staleness)

**This document is REFERENCE ONLY.**

---

**End of Archify Usage Guide**
