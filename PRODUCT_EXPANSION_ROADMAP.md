# NextUp — Product Expansion Roadmap

This document defines the canonical roadmap for additive product expansions to NextUp.

## Roadmap Principles

All expansion work is ADDITIVE.

Existing core functionality is presumed correct and must not be replaced or removed.

New features may:
- Add optional modes
- Add new routes
- Add new components
- Add new sections
- Add new persisted data only when separately approved
- Consume the approved deterministic MatchResult

New features may NOT:
- Replace existing functionality
- Redesign existing working screens unnecessarily
- Modify approved Phase 9 scoring
- Change Phase 10 matching architecture
- Alter MatchResult semantics
- Remove existing routes
- Alter the five-tab mobile navigation
- Redesign Discover
- Modify Phase 11 AI
- Start Phase 12

---

## DISCOVERY

### E1 — Opportunity Deck

**Status**: IMPLEMENTATION COMPLETE + CODE APPROVED
**Manual QA**: PENDING

Tinder-style / swipe-card job discovery INSIDE Explore.

Existing List view remains intact.

- Right swipe = Save
- Left swipe = Pass
- Details button = Job Detail
- Undo = reverse last action

Mode selector: [List] [Deck]

Default: List

Deck shows unreviewed opportunities matching current filters.

**Approved E1 SHA**: 8ffaf3666a7af7aea0b6fdb758032aaed5743d50

---

### E2 — Opportunity Compare

**Status**: IMPLEMENTATION COMPLETE + CODE APPROVED
**Manual QA**: PENDING

Compare 2–4 selected jobs using deterministic evidence.

**Approved E2 SHA**: fe7253ae289155d8263bf4725cb410b728a52c84

**E2 V1 Scope**:

Selection:
- Minimum: 2 jobs
- Maximum: 4 jobs
- Entry points: Explore List, Saved, Job Detail
- Session-persistent selection state
- Compare tray UI
- Comparison route: /compare?jobs=id1,id2,id3

Comparison features:
- Side-by-side job summary columns
- Deterministic match scores (same as other surfaces)
- Skills comparison (matched/missing)
- Strengths/concerns from existing MatchResult reasons
- Salary comparison (when available)
- Lifestyle factors (location, work arrangement, etc.)
- Difference Mode (hide/show identical rows)
- Comparison Lenses (Balanced, Compensation, Lifestyle, Qualification)
- Leader/tie indicators (derived from displayed values)
- Mobile-responsive horizontal comparison UI
- Keyboard accessible

**NOT in E2 V1**:
- AI-generated comparisons
- Dealbreaker engine (that's E3)
- New scoring formula
- Growth-potential scores
- Market salary estimates
- Cost-of-living analysis
- Persisted comparison results

---

### E3 — Dealbreaker Engine

**Status**: COMPLETE + INDEPENDENTLY APPROVED + PRODUCTION APPROVED + FROZEN

**Approved E3 Code SHA**: `8f4ba113c02adddbc014c44510ea1142ba5f3328`

**Production-Tested Runtime SHA**: `5b4593185a060e269324b9d9d4914717d738a731`

**Migration**: `20260908000006` APPLIED + VERIFIED

User-defined non-negotiables kept separate from MatchResult score.

**E3 V1 Scope**:

Dealbreaker Categories:
- Minimum compensation
- Salary disclosure requirement
- Work arrangement restrictions (remote/hybrid/onsite)
- Employment type restrictions (full_time/part_time/contract/temporary)

Three-State Evaluation:
- PASS: Job satisfies requirement
- CONFLICT: Job violates requirement
- UNKNOWN: Insufficient job data to evaluate

Pure Deterministic Engine:
- No AI inference
- No persisted results
- Same rules + same job = same evaluation

Surface Integration (E3 V1):
- Settings (/settings/dealbreakers)
- Explore List (badge only)
- Saved Jobs
- Job Detail (full findings)

NOT in E3 V1:
- Discover integration
- Opportunity Deck integration
- Opportunity Compare integration
- Applications integration
- Auto-blocking jobs
- Auto-hiding jobs
- Modifying match scores
- Travel restrictions
- Commute restrictions
- Company ratings
- Culture requirements
- AI-inferred dealbreakers

Specification: E3_DEALBREAKER_ENGINE_SPEC.md

---

### E4 — Opportunity Radar

**Status**: PLANNING ONLY — NOT IMPLEMENTATION AUTHORIZED

Personalized categories:
- Best Matches
- New
- High Salary
- Stretch Opportunities
- Career Changers
- Fast-Growing Roles
- Worth Relocating For

---

### E5 — Discovery Diversity

**Status**: PLANNING ONLY

User-controlled discovery spectrum:

Safe ←————————→ Explore

Future recommendation mix may contain:
- Strong matches
- Adjacent careers
- Wildcards

---

### E6 — Daily Opportunity Drop

**Status**: PLANNING ONLY

Finite high-quality daily opportunity set rather than endless scrolling.

---

## CAREER IDENTITY

### E7 — Career Passport

**Status**: PLANNING ONLY

Private structured career identity containing:
- Experience
- Skills
- Certifications
- Achievements
- Projects
- Education
- Career goals
- Salary goals
- Location
- Work preferences
- Career interests

This becomes a foundational source for future systems.

---

### E8 — Opportunity Genome

**Status**: PLANNING ONLY

Structured job DNA including:
- Skills
- Experience
- Seniority
- Compensation
- Schedule
- Location
- Travel
- Leadership
- Physical requirements
- Autonomy
- Technical depth
- Growth potential

---

### E9 — Career Capital

**Status**: PLANNING ONLY

Private self-development indicator.

NEVER employer-facing.
NEVER used as hiring eligibility.
NEVER replace deterministic matching.

---

### E10 — Professional Proof Graph

**Status**: PLANNING ONLY

Skill
→ Where learned
→ Where used
→ Achievement
→ Evidence

---

## MATCH INTELLIGENCE

### E11 — What-If Match Simulator

**Status**: PLANNING ONLY

Temporarily modify hypothetical user attributes and recalculate using the SAME deterministic matching engine.

Must NOT modify the actual user profile.

Examples:
- Certification
- Skill
- Experience
- Relocation
- Salary change
- Work arrangement

---

### E12 — Why My Score Changed

**Status**: PLANNING ONLY

Show deterministic before/after component changes after a user changes their profile.

---

### E13 — Skill & Certification ROI

**Status**: PLANNING ONLY

Estimate how a skill/certification affects:
- Jobs unlocked
- Match improvement
- Salary opportunity
- Career paths
- Market demand
- Time/cost to obtain

Must use trustworthy data and deterministic calculations where possible.

---

## CAREER NAVIGATION

### E14 — Career GPS

**Status**: PLANNING ONLY

Graph/map from current role to realistic future roles.

---

### E15 — Hidden Career Paths

**Status**: PLANNING ONLY

Find occupations users are qualified for but would probably never search.

---

### E16 — Career Arbitrage

**Status**: PLANNING ONLY

Identify industries/roles where existing skills may have greater market value.

---

### E17 — Career Experiments

**Status**: PLANNING ONLY

Temporary discovery experiments such as:

"Explore Project Management for 14 days"

Use behavior to help the user learn what they actually prefer.

---

### E18 — Career Missions

**Status**: PLANNING ONLY

Goal-driven progression toward a career outcome.

---

### E19 — Career Time Machine

**Status**: PLANNING ONLY

Visual history/future view showing how opportunity access changes as the Career Passport evolves.

---

## MARKET INTELLIGENCE

### E20 — Opportunity Trust

**Status**: PLANNING ONLY

Separate trust/freshness intelligence from match score.

Signals may include:
- Posting age
- Original employer listing
- Source
- Reposting frequency
- Salary transparency
- Description completeness
- Company verification

Never make unsupported accusations.

---

### E21 — Ghost Job / Scam Signals

**Status**: PLANNING ONLY

Evidence-based caution signals only.

Do not label an employer fraudulent without sufficient evidence.

---

### E22 — Compensation Intelligence

**Status**: PLANNING ONLY

- Market salary
- User target
- Comparable roles
- Geographic comparisons
- Estimated total compensation when supported

---

### E23 — Career Weather

**Status**: PLANNING ONLY

Labor-market environment for a career/location.

Potential signals:
- Hiring demand
- Salary movement
- Remote availability
- Fast-growing skills
- Job volume

---

### E24 — Opportunity Heat Map

**Status**: PLANNING ONLY

Geographic visualization of:
- Job density
- Salary
- Match density
- Career demand
- Relocation attractiveness

---

## AI / FUTURE INTELLIGENCE

**All AI expansions remain PLANNING ONLY while Phase 11 production runtime is blocked.**

### E25 — Career Digital Twin

**Status**: PLANNING ONLY

Private structured professional model.

Not a personality clone.

---

### E26 — Future Self Simulator

**Status**: PLANNING ONLY

Evidence-based 1/3/5-year professional paths.

---

### E27 — Career Chief of Staff

**Status**: PLANNING ONLY

Proactive AI career assistant.

---

### E28 — Career Board Meeting

**Status**: PLANNING ONLY

Periodic career performance/review experience.

---

### E29 — Interview Memory

**Status**: PLANNING ONLY

Capture interview questions, commitments, contacts and recurring patterns.

---

### E30 — Rejection Intelligence

**Status**: PLANNING ONLY

Analyze outcomes across the application funnel.

---

### E31 — Truthful Resume Autopilot

**Status**: PLANNING ONLY

Use verified user achievements.

Never invent experience.

---

## NETWORK / MARKETPLACE

### E32 — Career Circles

**Status**: PLANNING ONLY

Small useful communities around actual career transitions.

---

### E33 — Employer Reality

**Status**: PLANNING ONLY

Structured anonymous employer/job reality signals.

---

### E34 — Ask Someone Who Does This Job

**Status**: PLANNING ONLY

Short conversations with verified professionals.

---

### E35 — Opt-In Talent Discovery

**Status**: PLANNING ONLY

Employer → candidate compatibility.

This must remain user-controlled and privacy-first.

---

## Document Information

**Created**: 2026-09-07
**Last Updated**: 2026-09-08
**E3 Status**: COMPLETE + APPROVED (Code SHA: 8f4ba113c02adddbc014c44510ea1142ba5f3328)
**E3 Migration**: 20260908000006 APPLIED
**E3 Manual Browser QA**: PENDING
**E4**: NOT AUTHORIZED
