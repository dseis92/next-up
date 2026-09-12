# NextUp — Shared Context & Vocabulary

**Purpose**: Shared domain vocabulary for humans and agents working on NextUp.

**Note**: This is a glossary, not a status document. For current status, see PROJECT_STATE.md.

---

## PROJECT

### NextUp
A modern, mobile-first career discovery and job-search platform designed to evolve into a Career Operating System. Core principle: Job searching should feel like discovering opportunities, not digging through listings.

### Repository
`dseis92/next-up` on GitHub

---

## CORE DISCOVERY SURFACES

### Discover
NextUp's signature swipe-based discovery experience. Users swipe right to save, left to pass. One job at a time, focused on finding opportunities that fit.

### Explore
Multi-mode opportunity browsing with three views:
- **List** (default): Traditional scrollable job list with filters
- **Deck**: Swipeable card stack (E1 expansion)
- **Radar**: Categorized discovery by purpose (E4 expansion)

### Saved
Collection of jobs the user has saved (swiped right or clicked save). Jobs can be unsaved.

### Applications
Application tracking and management. Users mark jobs as applied, track stage, add notes, record timeline events.

---

## MATCHING & SCORING

### MatchResult
The deterministic output from Phase 9/10 matching engine. Contains:
- `overallScore` (0-100)
- `qualificationScore` (0-100)
- `lifestyleScore` (0-100)
- Component breakdown
- `matchedSkills`, `missingSkills`
- `reasonsFit`, `reasonsConcern`
- `hardFailures` (if any)

### JobMatch
Application-level type combining Job data with MatchResult. Used throughout Discover, Explore, Saved, Job Detail.

### Scores
- **Overall Score**: Combined qualification + lifestyle match (0-100%)
- **Qualification Score**: Skills, experience, seniority, career goals fit
- **Lifestyle Score**: Salary, location, work arrangement, priorities fit

### Skills
- **Matched Skills**: Skills user possesses that job requires
- **Missing Skills**: Skills job requires that user lacks
- **Required Skills**: Skills explicitly listed in job requirements

---

## JOB STATES

### Passed Job
User swiped left or clicked "Pass". Excluded from Discover and Radar. Can be restored via Undo.

### Saved Job
User swiped right or clicked "Save". Appears in Saved collection. Can be unsaved.

### Applied Job
User marked as applied in Applications. Has application record with stage, notes, timeline.

---

## DEALBREAKERS (E3)

### Dealbreaker
User-defined non-negotiable preference. Three types:
- Salary (minimum acceptable)
- Work arrangement (exclusive preference)
- Location/relocation (conservative relocation)

### Evaluation Statuses
- **PASS**: Job meets dealbreaker requirement
- **CONFLICT**: Job violates dealbreaker
- **UNKNOWN**: Insufficient data to evaluate (treated as potential conflict with warning)

**Critical Rule**: Dealbreaker conflicts do NOT modify MatchResult. Conflict detection is independent from scoring.

---

## DETERMINISTIC EVIDENCE

### Deterministic
Based on explicit data and rules, not AI inference. Reproducible, explainable, auditable.

Examples:
- Match scores (Phase 9 engine)
- Dealbreaker evaluation (E3 engine)
- Radar category membership (E4 selectors)

### AI Explanation (Phase 11)
AI **explains** deterministic results in natural language. AI does **NOT**:
- Invent or modify match scores
- Override dealbreaker conflicts
- Fabricate missing data
- Change trusted facts

**Rule**: Data + deterministic matching decide facts. AI explains, coaches, and helps user act.

---

## DEVELOPMENT LIFECYCLE

### Phase
Numbered development milestone (Phase 1-12). Phases build core product functionality sequentially.

### E-Number (Product Expansion)
Lettered+numbered expansion (E1, E2, E3...). Expansions are additive features that extend core product without replacing it.

### Frozen System
Approved implementation that MUST NOT be modified without explicit authorization. Frozen systems are presumed valuable.

Examples:
- Phase 9: `lib/matching/`
- Phase 11: `lib/ai/`
- E3: Dealbreaker engine

### Candidate SHA
Git commit being prepared for review/merge. Must match remote SHA before independent review.

### Runtime SHA
Git commit actually running in production/QA environment. Must be verified, not assumed.

---

## QUALITY GATES

### Merge Gate
Required quality check before merging to protected main:
- Automated tests PASS
- TypeScript PASS
- Build PASS
- Independent review APPROVED
- Human browser QA PASS (if required)
- Explicit merge authorization

### Human QA
Actual browser testing by human tester. Distinct from automated tests or code inspection.

Statuses:
- PASS: All tests passed
- FAIL: Blocking failure found
- NOT OBSERVABLE: Condition cannot be tested with available data
- NOT SAFELY INDUCED: Error condition cannot be safely triggered

---

## RADAR CATEGORIES (E4)

### Best Matches
Top 20 opportunities by overall score. User's strongest available matches.

### New Opportunities
Up to 30 jobs posted within last 7 days, ordered newest first.

### High Compensation
Top 20 jobs with disclosed yearly salaries ≥ 75th percentile.

### Stretch Opportunities
Up to 15 jobs with qualification 60-85% + missing skills. Growth-oriented roles.

---

## TRUST PRINCIPLES

### Same User + Same Job = Same Score Everywhere
A job's match percentage must be identical in Discover, Explore, Saved, Job Detail, Applications (for same user, same point in time).

### Never Invent Experience/Qualifications
AI and code must not:
- Invent user experience
- Fabricate qualifications
- Estimate missing salary
- Auto-apply without confirmation
- Hide important concerns

### Incomplete Profile ≠ Zero Score
If user profile is incomplete, status = `incomplete_profile`, score = `null`. Never show fake 0% or mock percentage.

---

## GOVERNANCE CONCEPTS

### Independent Review
Review by agent/human different from implementer. Verifies exact remote SHA and evidence independently.

### Self-Approval Prohibition
No agent may mark its own implementation as APPROVED, FROZEN, or PRODUCTION APPROVED. Human or independent reviewer must approve.

### Source of Truth Hierarchy
1. Repository code (actual implementation)
2. PROJECT_STATE.md
3. PROJECT_GUARDRAILS.md
4. CLAUDE.md
5. Active spec
6. Roadmap

If documentation conflicts with code, code wins.

---

## ABBREVIATIONS

- **SHA**: Git commit hash (40 hex characters)
- **RLS**: Row-Level Security (Supabase database security)
- **QA**: Quality Assurance
- **PR**: Pull Request
- **MCP**: Model Context Protocol
- **API**: Application Programming Interface
- **UI**: User Interface
- **UX**: User Experience

---

**End of Context Document**
