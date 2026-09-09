# E4 — Opportunity Radar Specification

**Feature Code**: E4
**Status**: SPECIFICATION PHASE — NOT IMPLEMENTATION AUTHORIZED
**Product Track**: Product Expansion

---

## PURPOSE

E4 answers:

**"Where should I start looking first?"**

Opportunity Radar organizes the existing opportunity collection into purpose-driven categories that help users navigate toward their most relevant opportunities faster.

This is NOT:
- A replacement match score
- An AI recommendation engine
- A replacement for Explore List/Deck
- A redesign of existing discovery surfaces

Radar is an **ADDITIVE discovery navigation layer** that reuses approved deterministic matching and existing job evidence.

---

## PRODUCT PRINCIPLES

### Core Principle
**Organize, don't fabricate.**

Radar curates the existing job collection using deterministic, evidence-backed rules. It does NOT invent missing data, create AI scores, or manufacture job characteristics.

### Trust Boundaries
1. **MatchResult remains authoritative** — Radar consumes Phase 9/10 matching but NEVER modifies scores
2. **DealbreakerResult remains independent** — E3 conflicts do NOT alter MatchResult or auto-hide jobs
3. **Missing data = category exclusion** — Jobs lacking required evidence are omitted from categories, not estimated
4. **Same rules everywhere** — Category membership is deterministic and reproducible

---

## EXISTING-SYSTEM BOUNDARIES

### MUST NOT MODIFY
- Phase 9 deterministic matching (`lib/matching/`)
- Phase 10 matching integration
- Phase 11 AI job explanation
- E3 dealbreaker evaluation semantics
- Discover experience
- Explore List mode
- E1 Opportunity Deck mode
- E2 Opportunity Compare
- Five-tab mobile navigation
- Existing MatchResult structure
- Existing DealbreakerResult structure

### MAY CONSUME
- MatchResult (overall_score, qualification_score, lifestyle_score, breakdown components, skills, reasons)
- Job data (title, company, location, work_arrangement, employment_type, salary fields, posted_date, created_at)
- User profile/preferences (for category eligibility where needed)
- Saved/passed/applied state
- DealbreakerResult (for display purposes only, not filtering)
- Existing Explore filters

---

## REPOSITORY DATA INVENTORY

Based on inspection of the current NextUp repository, the following data is reliably available for E4 V1:

### AVAILABLE — High Confidence
| Field | Source | Notes |
|-------|--------|-------|
| Match Score (overall) | MatchResult.overallScore | Phase 9/10, 0-100 |
| Qualification Score | MatchResult.qualificationScore | Phase 9/10, 0-100 |
| Lifestyle Score | MatchResult.lifestyleScore | Phase 9/10, 0-100 |
| Component Breakdown | MatchResult.breakdown | Skills, experience, salary, location, work arrangement, career goals, seniority, priorities |
| Matched Skills | MatchResult.matchedSkills | Array of skill names |
| Missing Skills | MatchResult.missingSkills | Array of skill names |
| Hard Failures | MatchResult.hardFailures | Salary/arrangement/relocation conflicts |
| Strengths | MatchResult.reasonsFit | Array of MatchReason |
| Concerns | MatchResult.reasonsConcern | Array of MatchReason |
| Salary Minimum | Job.salary_min | Integer, may be null |
| Salary Maximum | Job.salary_max | Integer, may be null |
| Salary Period | Job.salary_period | 'hourly' \| 'yearly', may be null |
| Salary Estimated Flag | Job.salary_is_estimated | Boolean |
| Work Arrangement | Job.work_arrangement | 'remote' \| 'hybrid' \| 'onsite' |
| Employment Type | Job.employment_type | 'full_time' \| 'part_time' \| 'contract' \| 'temporary' |
| Location | Job.location | String, may be null |
| Posted Date | Job.posted_date | Timestamp with time zone |
| Created At | Job.created_at | Timestamp with time zone |
| Company Name | Job.company.name | String |
| Company Industry | Job.company.industry | String, may be null |
| Job Title | Job.title | String |
| Saved Status | SavedJob presence | Boolean derived |
| Passed Status | PassedJob presence | Boolean derived |
| Applied Status | Application presence | Boolean derived |
| Dealbreaker Evaluation | DealbreakerEvaluation | PASS / CONFLICT / UNKNOWN counts |

### PARTIALLY AVAILABLE — Requires Interpretation
| Field | Source | Notes |
|-------|--------|-------|
| Experience Level | Job.experience_level | May be null, not all jobs specify |
| User Current Location | MatchProfile.location | May be undefined |
| User Preferred Locations | MatchProfile.preferredLocations | May be empty array |
| User Willing to Relocate | MatchProfile.willingToRelocate | Boolean |
| User Target Roles | MatchProfile.targetRoles | Array, may be empty |
| User Current Role | MatchProfile.currentRole | May be undefined |

### NOT AVAILABLE — Cannot Use in E4 V1
| Concept | Why Not Available |
|---------|-------------------|
| Labor market growth data | No external data source integrated |
| Job posting popularity/traction | No applicant count or view tracking |
| Company growth trajectory | No company metrics beyond static industry |
| Role-specific market demand | No O*NET or BLS integration |
| Cost-of-living adjustments | No geocoding or COL database |
| Commute time estimates | No mapping API integration |
| Culture fit scores | No company culture data or assessment |
| Career path likelihood | No career progression model beyond Phase 9 transferability |
| Application success probability | No historical application outcome data |

---

## SEVEN-CATEGORY FEASIBILITY MATRIX

### 1. Best Matches
**Required Evidence**: MatchResult.overallScore
**Existing Repository Evidence**: ✓ AVAILABLE — Phase 9/10 deterministic scoring
**Missing Evidence**: None
**Can V1 Support Deterministically?**: YES
**Recommended E4 V1 Status**: **INCLUDE**
**Rationale**: Straightforward top-N selection by existing match score. Reuses approved matching with zero new logic.

---

### 2. New
**Required Evidence**: Job posting timestamp indicating recent addition
**Existing Repository Evidence**: ✓ AVAILABLE — Job.posted_date, Job.created_at
**Missing Evidence**: None (for basic recency)
**Can V1 Support Deterministically?**: YES
**Recommended E4 V1 Status**: **INCLUDE**
**Rationale**: Simple time-based filter. Define "new" as jobs posted within last N days (recommend 7-14 days). Deterministic, no inference required.

---

### 3. High Salary
**Required Evidence**: Disclosed non-estimated salary minimum
**Existing Repository Evidence**: ✓ PARTIALLY AVAILABLE — Job.salary_min exists but may be null; Job.salary_is_estimated flag available
**Missing Evidence**: Many jobs lack salary disclosure
**Can V1 Support Deterministically?**: CONDITIONAL — Only for jobs with disclosed salary
**Recommended E4 V1 Status**: **INCLUDE** (with clear eligibility criteria)
**Rationale**: Can safely rank disclosed salaries. Must exclude estimated/missing salaries. Category will be empty for users if few jobs disclose compensation, but this is honest. Do NOT estimate or infer undisclosed salaries.

---

### 4. Stretch Opportunities
**Required Evidence**: Definition of "stretch" — likely higher experience level or missing skill requirements
**Existing Repository Evidence**: ✓ PARTIALLY AVAILABLE — MatchResult.missingSkills, Job.experience_level, MatchResult.qualificationScore
**Missing Evidence**: Clear definition of stretch; experience_level is optional
**Can V1 Support Deterministically?**: CONDITIONAL — With explicit definition
**Recommended E4 V1 Status**: **INCLUDE** (using qualification score and missing skills)
**Rationale**: Define "stretch" as: qualification score 60-85 AND has missing skills OR one qualification component below threshold. Avoids jobs too far out of reach (qualification <60) or already perfect fits (>85). Deterministic, evidence-based.

---

### 5. Career Changers
**Required Evidence**: Job in different industry/role than user's current position
**Existing Repository Evidence**: ✓ PARTIALLY AVAILABLE — MatchProfile.currentRole, MatchProfile.industry, Job.title, Job.company.industry, Phase 9 transferability data
**Missing Evidence**: Reliable career adjacency model; currentRole may be undefined; company.industry may be null
**Can V1 Support Deterministically?**: CONDITIONAL — With conservative definition
**Recommended E4 V1 Status**: **DEFER to E5 or later**
**Rationale**: Requires stronger career taxonomy than currently available. Phase 9 has limited transferability paths (3 mappings). Defining "career changer" safely requires more robust role/industry relationship data. Risk of false positives/negatives is high. Recommend deferring until career path model is expanded.

---

### 6. Fast-Growing Roles
**Required Evidence**: Labor market growth data, hiring trend data, or role demand metrics
**Existing Repository Evidence**: ❌ NOT AVAILABLE — No external labor market data source
**Missing Evidence**: BLS data, O*NET projections, hiring velocity, market demand signals
**Can V1 Support Deterministically?**: NO
**Recommended E4 V1 Status**: **DEFER to future phase**
**Rationale**: Cannot safely identify "fast-growing" without authoritative external data. Inventing this would violate trust principles. Requires separate integration with BLS/O*NET or similar source. Not feasible for E4 V1.

---

### 7. Worth Relocating For
**Required Evidence**: High match score + job in non-preferred location + relocation-friendly attributes (high salary, strong fit, etc.)
**Existing Repository Evidence**: ✓ AVAILABLE — MatchResult.overallScore, Job.location, MatchProfile.preferredLocations, MatchProfile.willingToRelocate, Job.salary_min
**Missing Evidence**: Cost-of-living adjustment, commute analysis, geographic desirability
**Can V1 Support Deterministically?**: CONDITIONAL — With simple definition
**Recommended E4 V1 Status**: **DEFER to E5 or later**
**Rationale**: While basic data exists (location, relocation willingness, salary), defining "worth relocating for" requires cost-of-living context and commute analysis to be truly valuable. Simple version (high match + outside preferred locations + willing to relocate + high salary) is possible but provides limited value without COL adjustment. Recommend deferring until geocoding/COL integration available.

---

## FINAL RECOMMENDED E4 V1 SCOPE

### INCLUDED CATEGORIES (4)

#### 1. Best Matches
**Purpose**: Quickly surface the user's strongest overall fits
**Eligibility**: MatchResult.overallScore ≥ 80
**Ranking**: Descending by overallScore
**Max Displayed**: Top 20 opportunities
**Explanation Template**: "Strong overall match"

#### 2. New Opportunities
**Purpose**: Highlight recently posted jobs so users can act quickly
**Eligibility**: Job.posted_date within last 7 days
**Ranking**: Descending by posted_date (newest first), then by overallScore
**Max Displayed**: Top 30 opportunities
**Explanation Template**: "Posted within the last week"

#### 3. High Compensation
**Purpose**: Show opportunities with disclosed high salaries
**Eligibility**:
- Job.salary_min IS NOT NULL
- Job.salary_is_estimated = false
- Job.salary_min ≥ top 25th percentile of all disclosed salaries in dataset
**Ranking**: Descending by salary_min
**Max Displayed**: Top 20 opportunities
**Explanation Template**: "Among the highest disclosed salaries" OR "Salary: $X - $Y/year"
**Note**: Percentile threshold computed from current dataset at runtime

#### 4. Stretch Opportunities
**Purpose**: Identify roles that could accelerate career growth
**Eligibility**:
- MatchResult.qualificationScore between 60-85 (inclusive)
- MatchResult.missingSkills.length > 0
**Ranking**: Descending by overallScore (users want the best stretch opportunities)
**Max Displayed**: Top 15 opportunities
**Explanation Template**: "Growth opportunity with [N] new skills to develop"

### DEFERRED CATEGORIES (3)

**Career Changers** → Deferred to E5 or later (requires expanded career taxonomy)
**Fast-Growing Roles** → Deferred to future phase (requires external labor market data integration)
**Worth Relocating For** → Deferred to E5 or later (requires COL/geocoding integration)

---

## DETAILED CATEGORY RULES

### Category Eligibility Rules

For each job, evaluate eligibility for each category independently. A job MAY appear in multiple categories if it meets multiple eligibility criteria.

**Eligibility Precedence**: None. Categories are independent.

**Filter Interaction**: Radar categories MUST honor existing Explore filters (search, work arrangement, minimum match). If a job is filtered out by Explore controls, it should NOT appear in any Radar category.

**State Interaction**:
- **Saved jobs**: Include in categories (users may want to revisit saved opportunities through different lenses)
- **Passed jobs**: Exclude from categories (user explicitly rejected)
- **Applied jobs**: Exclude from categories (already in Applications funnel)

### Exclusion Rules

Global exclusions (apply to ALL categories):
1. Job is passed (exists in passed_jobs table)
2. Job is applied (exists in applications table)
3. Job fails existing Explore filters (search query, work arrangement filter, minimum match filter)
4. MatchResult.status = 'incomplete_profile'

### Ranking Rules

**Best Matches**: Sort by MatchResult.overallScore DESC
**New Opportunities**: Sort by Job.posted_date DESC, then MatchResult.overallScore DESC
**High Compensation**: Sort by Job.salary_min DESC
**Stretch Opportunities**: Sort by MatchResult.overallScore DESC

### Tie-Breaking Rules

When primary sort produces ties:
1. Secondary sort by MatchResult.overallScore DESC (if not already primary)
2. Tertiary sort by Job.posted_date DESC (newest first)
3. Final tie-break by Job.id ASC (stable deterministic ordering)

### Handling Missing Evidence

| Category | Missing Field | Behavior |
|----------|---------------|----------|
| Best Matches | overallScore null | Exclude (incomplete profile) |
| New Opportunities | posted_date null | Exclude (cannot determine recency) |
| High Compensation | salary_min null OR salary_is_estimated = true | Exclude (no reliable salary data) |
| Stretch Opportunities | qualificationScore null OR missingSkills empty | Exclude (cannot determine stretch status) |

**Critical Rule**: NEVER estimate, infer, or fabricate missing data to qualify a job for a category.

### Maximum Displayed Opportunities

Limits per category:
- **Best Matches**: 20
- **New Opportunities**: 30
- **High Compensation**: 20
- **Stretch Opportunities**: 15

**Rationale**: Prevent overwhelming category displays. Users can always use List/Deck for full exploration.

### Empty State

If a category has zero eligible jobs:
- **Show category heading with explanation**
- **Message**: "No [category name] right now" with category-specific guidance
- Examples:
  - Best Matches: "Complete your profile to see your best matches"
  - New Opportunities: "Check back soon for newly posted jobs"
  - High Compensation: "Jobs with disclosed high salaries will appear here"
  - Stretch Opportunities: "Growth opportunities will appear as you explore"

### Category Computation Performance

**CRITICAL**: Radar must NOT create N+1 queries.

Preferred architecture:
1. Load jobs ONCE (existing Explore behavior)
2. Calculate MatchResults ONCE (existing Phase 10 behavior)
3. Load saved/passed/applied state ONCE
4. Compute category membership locally via pure selectors
5. Total category computation: O(N) single pass over jobs

Do NOT query database per category. Do NOT recalculate matches per category.

---

## MATCHRESULT TRUST BOUNDARY

### Absolute Rules

Opportunity Radar:
- ✓ MAY read MatchResult fields
- ✓ MAY sort by MatchResult.overallScore
- ✓ MAY filter by MatchResult.qualificationScore
- ✓ MAY display MatchResult.matchedSkills/missingSkills
- ✓ MAY use MatchResult.breakdown for category logic

- ✗ MUST NOT modify MatchResult values
- ✗ MUST NOT create a "Radar score" that replaces match percentage
- ✗ MUST NOT reweight Phase 9 components
- ✗ MUST NOT alter MatchResult.hardFailures
- ✗ MUST NOT hide MatchResult.reasonsConcern
- ✗ MUST NOT cap or boost match scores

### Verification Test

For any job, assert:
```typescript
const exploreScore = calculateJobMatch(profile, job).overallScore;
const radarScore = /* same job viewed through Radar */;
assert(exploreScore === radarScore); // MUST be true
```

Same user + same job = same match score, regardless of viewing context.

---

## E3 DEALBREAKER BOUNDARY

### Integration Rules

E3 DealbreakerResult is independent from MatchResult and remains so in Radar.

**Radar MAY**:
- Display DealbreakerBadge on Radar job cards (same as Explore List)
- Show dealbreaker findings in Radar job detail views
- Preserve existing E3 UI behavior

**Radar MUST NOT**:
- Auto-hide jobs with conflicts
- Change match scores based on dealbreakers
- Treat UNKNOWN as CONFLICT
- Remove jobs from categories based on conflicts
- Create category-specific dealbreaker rules

**Example**:
A 95% match with 1 dealbreaker conflict remains:
- 95% match score
- Eligible for "Best Matches" category
- Shows dealbreaker badge
- User sees both the strength (95%) and concern (conflict) and decides

---

## UX ARCHITECTURE

### Primary Placement

**Recommended**: Radar as an additional section within Explore, accessible via a persistent entry point.

**Proposed Route**: `/explore?view=radar` (preserves existing `/explore` for List/Deck)

**Entry Point**: Add a third view mode button in Explore header:
```
[List] [Deck] [Radar]
```

### Alternative Consideration

**Dedicated Route**: `/radar`

**Pros**: Clear separation, simpler navigation state
**Cons**: Breaks from Explore mental model, requires navigation tab consideration, feels more disconnected from discovery flow

**Recommendation**: Prefer Explore integration over separate route. Radar is a lens on the same opportunity collection, not a separate destination.

### Desktop Layout

```
┌─────────────────────────────────────────────┐
│  Explore jobs                    [List] [Deck] [Radar] │
│  Browse opportunities by category                     │
├─────────────────────────────────────────────┤
│  [Search + Filters — reuse existing]                  │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐              │
│  │ Best Matches              (20)      │              │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │              │
│  │ │Job │ │Job │ │Job │ │Job │ →       │              │
│  │ └────┘ └────┘ └────┘ └────┘         │              │
│  └─────────────────────────────────────┘              │
│  ┌─────────────────────────────────────┐              │
│  │ New Opportunities         (12)      │              │
│  │ ┌────┐ ┌────┐ ┌────┐                │              │
│  │ │Job │ │Job │ │Job │ →               │              │
│  │ └────┘ └────┘ └────┘                │              │
│  └─────────────────────────────────────┘              │
│  ┌─────────────────────────────────────┐              │
│  │ High Compensation         (8)       │              │
│  │ ┌────┐ ┌────┐                       │              │
│  │ │Job │ │Job │ →                      │              │
│  │ └────┘ └────┘                       │              │
│  └─────────────────────────────────────┘              │
│  ┌─────────────────────────────────────┐              │
│  │ Stretch Opportunities     (15)      │              │
│  │ ┌────┐ ┌────┐ ┌────┐                │              │
│  │ │Job │ │Job │ │Job │ →               │              │
│  │ └────┘ └────┘ └────┘                │              │
│  └─────────────────────────────────────┘              │
└─────────────────────────────────────────────┘
```

**Horizontal Scrolling**: Each category uses horizontal scroll for job cards (similar to modern content platforms)

### Mobile Layout

```
┌───────────────────────┐
│ Explore    [☰]       │
│ [List][Deck][Radar]  │
├───────────────────────┤
│ Best Matches    (20) │
│ ┌──────────────────┐ │
│ │ ← Job → Job → Job│ │
│ └──────────────────┘ │
│                      │
│ New Opportunities (12)│
│ ┌──────────────────┐ │
│ │ ← Job → Job →    │ │
│ └──────────────────┘ │
│                      │
│ High Compensation (8)│
│ ┌──────────────────┐ │
│ │ ← Job → Job →    │ │
│ └──────────────────┘ │
│                      │
│ Stretch Opps     (15)│
│ ┌──────────────────┐ │
│ │ ← Job → Job →    │ │
│ └──────────────────┘ │
└───────────────────────┘
```

**Vertical Stack + Horizontal Scroll**: Categories stack vertically, cards scroll horizontally within each category

### Navigation Behavior

**Entry**: Click "Radar" in Explore view mode selector
**URL**: `/explore?view=radar`
**Exit**: Click "List" or "Deck" to return to those views
**Filters**: Existing Explore filters (search, work arrangement, minimum match) remain active and affect Radar categories
**Persistence**: View mode preference stored in URL state (no new persistence required)

### Back Behavior

**Browser back from Radar**: Returns to previous view mode (List or Deck)
**Job Detail back**: Returns to Radar if that's where user came from

### Loading State

**Initial Load**:
```
┌───────────────────────┐
│ Opportunity Radar    │
│                      │
│ Loading categories...│
│ [Spinner]            │
└───────────────────────┘
```

**Category-Level**: Show skeleton cards while computing categories (should be fast, <100ms for 100 jobs)

### Empty State (No Jobs Qualify)

```
┌───────────────────────┐
│ Opportunity Radar    │
│                      │
│ [Icon]               │
│ No categorized       │
│ opportunities yet    │
│                      │
│ Try adjusting your   │
│ profile or filters   │
│                      │
│ [Return to List]     │
└───────────────────────┘
```

### Error State

```
┌───────────────────────┐
│ Opportunity Radar    │
│                      │
│ Unable to load       │
│ categories right now │
│                      │
│ [Return to List]     │
└───────────────────────┘
```

**Critical**: Radar failure must NOT break Explore List/Deck. Radar is an enhancement, not a dependency.

---

## RADAR PRESENTATION MODEL

### Category Heading

```
┌─────────────────────────────────────┐
│ Best Matches                  (20)  │  ← Category name + count
│ Your strongest overall fits          │  ← Short explanation
│ ┌────┐ ┌────┐ ┌────┐                │
│ │Card│ │Card│ │Card│ →               │  ← Horizontal scroll
│ └────┘ └────┘ └────┘                │
└─────────────────────────────────────┘
```

### Opportunity Card Format

Reuse existing Explore List card design with minor adaptations for horizontal layout:

```
┌──────────────────────────┐
│ [Avatar] Senior Engineer │ ← Title
│ TechCo                   │ ← Company
│                          │
│ [87%] [1 conflict]       │ ← Match + Dealbreaker badges
│                          │
│ Remote · Full-time       │ ← Arrangement + Type
│ $120k–$160k/year         │ ← Salary if disclosed
│                          │
│ React · TypeScript · AWS │ ← Matched skills (top 3)
│                          │
│ [Compare] [Details]      │ ← Actions
└──────────────────────────┘
```

**Dimensions**: Slightly narrower than List cards to accommodate horizontal scroll (~280px width)

### Match Percentage Placement

**Always show** MatchResult.overallScore as the primary badge. Do NOT create a Radar-specific score.

### Salary Display Behavior

- If salary_min and salary_max exist: "$120k–$160k/year"
- If only salary_min exists: "$120k+/year"
- If salary_is_estimated = true: Do NOT display salary in Radar
- If salary is missing: Display "Salary not disclosed"

### Location/Work Arrangement Display

```
Remote · Full-time
San Francisco · Hybrid · Full-time
```

Standard compact format, same as Explore List.

### Save Interaction

Clicking a Radar card opens Job Detail (same as Explore List). Save action happens in Job Detail, not on Radar card directly.

**Rationale**: Keep Radar cards compact and focused on discovery. Full actions happen in Job Detail.

### Details Interaction

Click anywhere on card → navigate to `/jobs/{id}`

### Compare Interaction

Add `<CompareToggle jobId={job.id} />` to each Radar card (same component used in Explore List).

**Behavior**: Toggle adds/removes job from comparison set. Compare tray appears at bottom when jobs are selected (reuse existing E2 implementation).

### E3 Badge Behavior

If DealbreakerEvaluation exists for a job and has conflicts or unknowns:
- Show `<DealbreakerBadge evaluation={eval} size="sm" />` next to match percentage
- Same component and behavior as Explore List
- Badge does NOT affect category membership or ranking

### Horizontal vs Vertical Presentation

**Desktop**: Horizontal scroll within each category (better use of wide screens)
**Mobile**: Horizontal scroll within each category (natural mobile swipe interaction)

Categories themselves stack vertically on both desktop and mobile.

### Mobile Behavior

- Touch-friendly card dimensions (min 280px width)
- Swipe to scroll horizontally through cards
- Tap card to view details
- All text/badges readable without zoom
- Bottom nav remains accessible
- Filter controls collapsible on mobile

### Duplicate Jobs Across Categories

**Allowed**: A 92% match with $150k salary posted yesterday may appear in:
- Best Matches (92% ≥ 80)
- New Opportunities (posted within 7 days)
- High Compensation (high disclosed salary)

**Rationale**: Categories represent different discovery lenses. Seeing the same strong opportunity through multiple lenses reinforces its value and provides navigation flexibility.

**Within-Category Uniqueness**: Each job appears at most ONCE per category.

---

## CATEGORY EXPLANATIONS

### Best Matches
**Heading**: "Best Matches"
**Description**: "Your strongest overall fits"
**Per-Job Explanation**: None needed (match percentage is self-explanatory)

### New Opportunities
**Heading**: "New Opportunities"
**Description**: "Recently posted jobs"
**Per-Job Explanation**: "Posted [X] days ago" (e.g., "Posted 2 days ago")

### High Compensation
**Heading**: "High Compensation"
**Description**: "Among the highest disclosed salaries"
**Per-Job Explanation**: Display salary prominently ("$140k–$180k/year")

### Stretch Opportunities
**Heading**: "Stretch Opportunities"
**Description**: "Roles that could accelerate your growth"
**Per-Job Explanation**: "[N] new skills to develop" (e.g., "3 new skills to develop")

### Explanation Requirements

1. **Deterministic**: Derived directly from eligibility evidence
2. **Honest**: Do not overstate fit or opportunity
3. **Actionable**: User understands why it's in this category
4. **No AI**: All explanations are template-based, not generated

**Example GOOD Explanations**:
- "Posted 3 days ago" (factual, time-based)
- "92% match" (existing MatchResult)
- "4 new skills to develop" (count from missingSkills)
- "$150k–$180k/year" (disclosed salary)

**Example BAD Explanations**:
- "Perfect for you!" (unsupported claim)
- "Fast-growing company" (no evidence)
- "Great culture fit" (no culture data)
- "You'll love this role" (fabricated sentiment)

---

## FILTER BEHAVIOR

### Existing Explore Filters

Radar MUST honor all active Explore filters:
- **Search query**: Jobs matching search appear in categories
- **Work arrangement filter**: Only jobs matching selected arrangement qualify
- **Minimum match filter**: Only jobs meeting match threshold qualify

**Implementation**: Apply Explore filters BEFORE category selectors run.

### Filter Application Order

1. Load all jobs
2. Calculate MatchResults for all jobs (Phase 10)
3. Apply Explore filters (search, arrangement, match threshold)
4. Apply Radar exclusions (passed, applied, incomplete profile)
5. Compute category membership from filtered set
6. Apply category-specific eligibility/ranking

### Filter State Management

**Reuse** existing Explore filter state. Do NOT duplicate filter controls in Radar view.

**UX**: When user switches to Radar view, existing filter selections remain active and affect categories.

**Filter Changes While in Radar**: Categories update reactively (same as Explore List updates when filters change).

### Search Behavior

Search applies to title, company, location (existing Explore behavior). Radar categories show only jobs matching search query.

**Example**: User searches "engineer" → Radar categories show only jobs with "engineer" in title/company/location.

---

## STATE + PERSISTENCE

### Required State

**View Mode**: `"list" | "deck" | "radar"`
**Storage**: URL query parameter (`?view=radar`)
**Rationale**: No new client state needed. URL captures view mode.

### Category Computation State

**Storage**: Local component state (ephemeral)
**Computed**: On every render from filtered jobs
**Rationale**: Categories are derived views. Do not persist computed results.

### User Preference Persistence

**None required for E4 V1**. View mode is URL-driven.

**Future Consideration**: Could persist last-used view mode in user preferences table, but NOT required for V1.

### Database Changes

**E4 V1 requires ZERO new database tables.**

No:
- radar_categories table
- radar_results table
- category_membership table
- user_radar_preferences table

All category logic is pure derivation from existing job/match data.

---

## PERFORMANCE REQUIREMENTS

### Computational Complexity

**Target**: O(N) where N = number of jobs passing Explore filters

**Approach**:
1. Single pass over filtered jobs
2. For each job, evaluate 4 category eligibility rules (constant time per job)
3. Collect jobs into category buckets
4. Sort each category bucket (O(M log M) where M = jobs in category, typically M << N)
5. Slice to max limits

**Total**: O(N + M1 log M1 + M2 log M2 + M3 log M3 + M4 log M4) ≈ O(N log N) worst case, O(N) typical case

### Network Requests

**Target**: ZERO additional requests beyond existing Explore load

**Verify**:
- Profile/preferences: Loaded once (existing Phase 10 behavior)
- Jobs: Loaded once (existing Explore behavior)
- MatchResults: Calculated once (existing Phase 10 behavior)
- Saved/passed state: Loaded once (existing Explore behavior)
- DealbreakerPreferences: Loaded once (existing E3 integration)
- DealbreakerEvaluations: Calculated once (existing E3 integration)

**Radar adds**: Zero new database queries, zero new API calls.

### Category Computation Performance

**Target**: <100ms for 100 jobs, <200ms for 500 jobs

**Measurement**: Time from filtered jobs → category buckets

**Optimization**: Use pure selectors, avoid unnecessary re-renders

### Rendering Performance

**Target**: <50ms to render category headings + first 3 cards per category

**Approach**: Lazy render remaining cards as user scrolls horizontally

---

## PURE DOMAIN LOGIC

### Recommended Architecture

Create a pure Radar domain layer at:

```
lib/radar/
├── index.ts              # Public API
├── types.ts              # RadarCategory, CategoryBucket
├── selectors.ts          # Pure category selectors
├── explanations.ts       # Template-based explanations
└── __tests__/
    └── selectors.test.ts # Domain tests
```

### Domain Responsibilities

**lib/radar/types.ts**:
- `RadarCategory` enum
- `CategoryBucket` interface
- `CategoryEligibility` rules type

**lib/radar/selectors.ts**:
- `selectBestMatches(jobs: JobMatch[]): JobMatch[]`
- `selectNewOpportunities(jobs: JobMatch[]): JobMatch[]`
- `selectHighCompensation(jobs: JobMatch[]): JobMatch[]`
- `selectStretchOpportunities(jobs: JobMatch[]): JobMatch[]`
- `computeAllCategories(jobs: JobMatch[]): Map<RadarCategory, JobMatch[]>`

**lib/radar/explanations.ts**:
- `getBestMatchesDescription(): string`
- `getNewOpportunityExplanation(job: Job): string`
- `getStretchExplanation(missingSkillsCount: number): string`

### Purity Requirements

Domain selectors MUST:
- Be pure functions (same inputs → same outputs)
- NOT mutate inputs
- NOT access React state/context
- NOT call Supabase
- NOT call AI APIs
- NOT use browser APIs
- NOT use randomness
- Be testable in isolation

Domain selectors MAY:
- Read MatchResult fields
- Read Job fields
- Filter arrays
- Sort arrays (non-mutating)
- Map/reduce
- Call other pure functions

---

## UNKNOWN / MISSING DATA POLICY

### Strict Handling Rules

| Missing Field | Radar Behavior |
|---------------|----------------|
| overallScore = null | Exclude from ALL categories (incomplete profile) |
| qualificationScore = null | Exclude from Stretch Opportunities |
| posted_date = null | Exclude from New Opportunities |
| salary_min = null | Exclude from High Compensation |
| salary_is_estimated = true | Exclude from High Compensation |
| missingSkills = [] | Exclude from Stretch Opportunities |

### Never Estimate

Do NOT:
- Estimate missing salary
- Assume missing posted_date means "old"
- Treat null experience_level as "entry"
- Infer company growth from industry
- Fabricate labor market demand
- Generate missing skills from job description
- Convert UNKNOWN dealbreaker to CONFLICT or PASS

### Honest Empty States

If a category has zero eligible jobs, show:
```
┌───────────────────────────────┐
│ High Compensation        (0) │
│ Jobs with disclosed high      │
│ salaries will appear here     │
└───────────────────────────────┘
```

Better to show an honest empty category than fabricate eligibility.

---

## TEST PLAN

### Pure Domain Tests

**Location**: `lib/radar/__tests__/selectors.test.ts`

**Coverage**:
- Best Matches selector returns jobs with score ≥ 80
- Best Matches sorted by overallScore DESC
- Best Matches limited to 20
- Best Matches excludes incomplete profiles
- New Opportunities selector returns jobs posted within 7 days
- New Opportunities sorted by posted_date DESC, then overallScore DESC
- New Opportunities limited to 30
- New Opportunities excludes jobs with null posted_date
- High Compensation selector returns non-estimated disclosed salaries
- High Compensation sorted by salary_min DESC
- High Compensation limited to 20
- High Compensation excludes estimated salaries
- High Compensation excludes missing salaries
- Stretch Opportunities selector returns qualification 60-85 with missing skills
- Stretch Opportunities sorted by overallScore DESC
- Stretch Opportunities limited to 15
- Stretch Opportunities excludes jobs with empty missingSkills
- Same job can appear in multiple categories
- No duplicates within a category
- Passed jobs excluded from all categories
- Applied jobs excluded from all categories
- Deterministic ordering (same inputs → same outputs)
- No mutation of input arrays
- Tie-breaking rules applied correctly

### Match Trust Tests

**Location**: Integration tests

**Coverage**:
- Radar does not modify MatchResult.overallScore
- Job viewed in List has same score as viewed in Radar
- Profile change updates both Explore and Radar identically
- Sorting by match score does not change score values
- Category explanations reference existing MatchResult fields only

### E3 Trust Tests

**Location**: Integration tests

**Coverage**:
- Dealbreaker conflict does NOT alter match percentage in Radar
- Dealbreaker UNKNOWN does NOT become CONFLICT in Radar
- Radar does NOT auto-hide jobs with conflicts
- DealbreakerBadge appears on Radar cards same as Explore List
- High-match job with conflict appears in Best Matches category

### Filter Tests

**Location**: Component tests

**Coverage**:
- Search filter affects Radar categories
- Work arrangement filter affects Radar categories
- Minimum match filter affects Radar categories
- Changing filters updates categories
- Empty search shows all categories
- Filters applied before category selectors

### UI Tests

**Location**: Component tests

**Coverage**:
- Category headings render with correct names
- Category counts accurate
- Empty categories show appropriate message
- Loading state displays
- Error state displays
- Radar failure does not crash Explore
- Job cards render correctly
- Match badges display
- Dealbreaker badges display
- Compare toggle works
- Job detail navigation works
- Horizontal scroll works (desktop)
- Horizontal scroll works (mobile)
- Category vertical stack works
- Bottom nav remains accessible

### Accessibility Tests

**Coverage**:
- Keyboard navigation through categories
- Keyboard navigation through cards
- Visible focus states
- Screen reader category labels
- Screen reader card labels
- Semantic heading hierarchy
- Horizontal scroll keyboard accessible
- Mobile touch targets ≥44px
- Color contrast meets WCAG AA

### Performance Tests

**Coverage**:
- No per-card preference requests
- No per-category database queries
- Profile loaded once
- MatchResults calculated once
- Category computation <100ms for 100 jobs
- Category computation <200ms for 500 jobs
- No N+1 request patterns
- Rendering does not block main thread

### Regression Tests

**Coverage**:
- Explore List unchanged
- Opportunity Deck unchanged
- Opportunity Compare unchanged
- Saved page unchanged
- Job Detail unchanged
- Discover unchanged
- Applications unchanged
- E3 dealbreaker surfaces unchanged
- Phase 9/10 matching unchanged
- Five-tab navigation unchanged

---

## FAILURE ISOLATION

### Radar-Specific Failures

If Radar encounters an error:

**MUST NOT**:
- Break Explore List
- Break Opportunity Deck
- Break Compare
- Break Job Detail
- Break Saved
- Break overall Explore page

**SHOULD**:
- Show bounded Radar error state
- Log error to console
- Allow user to return to List/Deck
- Preserve existing Explore functionality

### Error Boundaries

Wrap Radar view with React Error Boundary:

```tsx
<ErrorBoundary fallback={<RadarErrorState />}>
  <OpportunityRadar />
</ErrorBoundary>
```

**Fallback**: Shows error message + "Return to List" button

### Graceful Degradation

If category computation fails:
- Show empty Radar with error message
- User can switch to List/Deck normally
- No data corruption
- No broken state

---

## ACCESSIBILITY

### Keyboard Navigation

**Tab order**:
1. View mode selector (List/Deck/Radar buttons)
2. Search input
3. Filter controls
4. Category 1 heading
5. Category 1 cards (left/right arrows to scroll)
6. Category 2 heading
7. Category 2 cards
8. (Repeat for all categories)

**Arrow keys**:
- Left/Right: Navigate within category card horizontal scroll
- Up/Down: Navigate between categories

### Visible Focus States

All interactive elements MUST have visible focus ring:
- View mode buttons
- Job cards
- Compare toggles
- Category headings (if clickable)

### Semantic Headings

```html
<h2>Best Matches</h2>         <!-- Category heading -->
<h3>Senior Engineer</h3>       <!-- Job title within card -->
```

Proper heading hierarchy for screen readers.

### Button Labels

```html
<button aria-label="Switch to Radar view">Radar</button>
<button aria-label="Compare Senior Engineer at TechCo">Compare</button>
<button aria-label="View details for Senior Engineer at TechCo">Details</button>
```

### Horizontal Card Accessibility

Horizontal scrolling region must be keyboard-accessible:

```html
<div role="region" aria-label="Best Matches jobs" tabindex="0">
  <!-- Cards -->
</div>
```

### Screen Reader Category Labels

```html
<section aria-labelledby="best-matches-heading">
  <h2 id="best-matches-heading">Best Matches (20)</h2>
  <!-- Category description -->
  <!-- Cards -->
</section>
```

### Mobile Touch Targets

All interactive elements ≥44px × 44px (WCAG 2.1 AA).

---

## NON-GOALS

### Explicitly Excluded from E4 V1

**New Matching/Scoring**:
- New matching algorithm
- New match score
- Radar-specific scoring formula
- AI-generated match recommendations
- Embedding-based similarity
- Collaborative filtering

**Auto-Actions**:
- Auto-apply to jobs
- Auto-save to list
- Auto-pass on jobs
- Auto-message employers
- Auto-generate cover letters
- Auto-hide based on dealbreakers

**Advanced Features**:
- Resume parsing for Radar
- Resume tailoring suggestions
- Interview prep for categories
- Salary negotiation coaching
- Career path modeling (beyond basic stretch definition)
- Job market trend analysis
- Employer insights/ratings
- Application tracking from Radar

**External Integrations**:
- Labor market APIs (BLS, O*NET)
- Cost-of-living databases
- Geocoding/mapping services
- Commute time calculation
- Company review APIs (Glassdoor, etc.)
- Social proof (applicant counts, view counts)

**Persistence**:
- Persisted Radar results
- Category membership cache
- User category preferences
- Radar analytics/telemetry (unless separately approved)

**Redesigns**:
- Discover redesign
- Explore List redesign
- Opportunity Deck redesign
- Opportunity Compare redesign
- Five-tab navigation changes
- Bottom nav changes

**Phase/Expansion Modifications**:
- Phase 9 matching changes
- Phase 10 integration changes
- Phase 11 AI changes
- E3 dealbreaker changes
- New database migrations (unless absolutely required)

**AI Usage**:
- AI-generated category explanations
- AI-determined category membership
- AI-inferred missing job data
- AI recommendation engine
- Conversational Radar interface

---

## IMPLEMENTATION PLAN

### MUST CHANGE

**New Files**:
- `lib/radar/index.ts` — Public domain API
- `lib/radar/types.ts` — RadarCategory, CategoryBucket types
- `lib/radar/selectors.ts` — Pure category selectors
- `lib/radar/explanations.ts` — Template-based explanations
- `lib/radar/__tests__/selectors.test.ts` — Domain tests
- `components/explore/opportunity-radar.tsx` — Radar view component
- `components/explore/radar-category.tsx` — Category section component
- `components/explore/radar-card.tsx` — Horizontal scrolling job card

**Modified Files**:
- `app/explore/page.tsx` — Add Radar view mode, integrate <OpportunityRadar />
- `types/index.ts` — Add ViewMode = "list" | "deck" | "radar" if needed

### MAY CHANGE

**Potentially Modified**:
- `components/ui/button.tsx` — If view mode button styling needs adjustment
- `components/ui/card.tsx` — If horizontal card variant needed
- Tailwind config — If new Radar-specific spacing/layout needed

### MUST NOT CHANGE

**Frozen Systems**:
- `lib/matching/` — Phase 9/10 matching engine
- `lib/dealbreakers/` — E3 dealbreaker engine
- `app/discover/page.tsx` — Discover experience
- `components/explore/opportunity-deck.tsx` — E1 Deck mode
- `app/compare/page.tsx` — E2 Compare
- `app/ai/` — Phase 11 AI
- `app/applications/` — Applications funnel
- `supabase/migrations/20260908000006_create_user_dealbreakers.sql` — E3 migration
- Any existing migration files

**Reasoning**: These systems are independently approved and frozen. E4 is purely additive and operates on existing data.

---

## ACCEPTANCE CRITERIA

### Functional Requirements

1. ✓ Four Radar categories implemented: Best Matches, New Opportunities, High Compensation, Stretch Opportunities
2. ✓ Category rules are deterministic (same inputs → same outputs)
3. ✓ Jobs can appear in multiple categories
4. ✓ No duplicates within a category
5. ✓ Passed jobs excluded from all categories
6. ✓ Applied jobs excluded from all categories
7. ✓ Existing Explore filters honored
8. ✓ Search affects Radar categories
9. ✓ Empty categories show appropriate messaging
10. ✓ Category counts accurate

### Trust Boundaries

11. ✓ MatchResult.overallScore unchanged by Radar
12. ✓ Same job has same match score in List, Deck, and Radar
13. ✓ No new Radar score created
14. ✓ DealbreakerResult unchanged by Radar
15. ✓ Dealbreaker conflicts do NOT auto-hide jobs
16. ✓ UNKNOWN dealbreakers do NOT become CONFLICT

### Missing Data Handling

17. ✓ Missing salary → excluded from High Compensation
18. ✓ Estimated salary → excluded from High Compensation
19. ✓ Missing posted_date → excluded from New Opportunities
20. ✓ No fabricated or estimated data

### Performance

21. ✓ Zero additional database queries beyond Explore
22. ✓ Profile loaded once
23. ✓ MatchResults calculated once
24. ✓ Category computation <100ms for 100 jobs
25. ✓ No N+1 request patterns

### UI/UX

26. ✓ Radar accessible via Explore view mode selector
27. ✓ Horizontal scrolling job cards
28. ✓ Mobile responsive
29. ✓ Bottom nav remains accessible
30. ✓ Radar failure does not break Explore List/Deck
31. ✓ Job Detail navigation works
32. ✓ Compare integration works
33. ✓ DealbreakerBadge displays on cards

### Accessibility

34. ✓ Keyboard navigation functional
35. ✓ Visible focus states
36. ✓ Screen reader labels present
37. ✓ Semantic headings
38. ✓ Touch targets ≥44px on mobile
39. ✓ Horizontal scroll keyboard-accessible

### Testing

40. ✓ Pure domain tests cover all selectors
41. ✓ Match trust tests verify no MatchResult mutation
42. ✓ E3 trust tests verify dealbreaker independence
43. ✓ Filter tests verify Explore filter integration
44. ✓ Regression tests verify frozen systems unchanged
45. ✓ All quality gates pass (typecheck, lint, tests, build)

### Non-Functional

46. ✓ No new database migration
47. ✓ No new AI usage
48. ✓ No new external API integrations
49. ✓ No modifications to Phase 9/10/11
50. ✓ No modifications to E1/E2/E3

---

## OPEN QUESTIONS / BLOCKERS

### BLOCKING BEFORE IMPLEMENTATION

**None identified.** E4 V1 can proceed with existing repository data and infrastructure.

### NON-BLOCKING / FUTURE CONSIDERATIONS

1. **High Compensation Percentile Threshold**:
   - Current spec uses "top 25th percentile"
   - Should this be configurable or fixed?
   - **Recommendation**: Fixed at 75th percentile for V1, make configurable in future if needed
   - **Status**: Non-blocking, spec provides clear initial value

2. **New Opportunities Time Window**:
   - Current spec uses 7 days
   - Could be 3 days, 14 days, or user-configurable
   - **Recommendation**: Fixed at 7 days for V1
   - **Status**: Non-blocking, can adjust post-launch based on user feedback

3. **Stretch Opportunities Qualification Range**:
   - Current spec uses 60-85
   - Could be tighter (65-80) or wider (55-90)
   - **Recommendation**: Start with 60-85, monitor category size
   - **Status**: Non-blocking, deterministic rule can be tuned

4. **Category Display Order**:
   - Current spec shows: Best Matches → New → High Comp → Stretch
   - Could prioritize differently based on user behavior
   - **Recommendation**: Use proposed order for V1, track engagement
   - **Status**: Non-blocking, order is configurable

5. **User Preference for Radar Default View**:
   - Should Radar be default view for some users?
   - **Recommendation**: No for V1, keep List as default
   - **Status**: Non-blocking, future enhancement

6. **Category Persistence for Analytics**:
   - Should category membership be logged for product analytics?
   - **Recommendation**: Only if separate analytics authorization granted
   - **Status**: Non-blocking, E4 V1 works without analytics

7. **Deferred Categories (Career Changers, Fast-Growing, Worth Relocating)**:
   - When should these be reconsidered?
   - **Recommendation**:
     - Career Changers: After career taxonomy expansion (E5+)
     - Fast-Growing: After BLS/O*NET integration (separate initiative)
     - Worth Relocating: After geocoding/COL integration (E5+)
   - **Status**: Non-blocking, clearly deferred

8. **International Salary Normalization**:
   - High Compensation assumes USD/single currency
   - Multi-currency support not in current dataset
   - **Recommendation**: V1 assumes single currency, defer international
   - **Status**: Non-blocking, out of scope for V1

---

## VERIFICATION CHECKLIST

Before claiming E4 V1 complete:

**Domain Layer**:
- [ ] Pure selectors implemented and tested
- [ ] All category rules match spec exactly
- [ ] Deterministic (same inputs → same outputs)
- [ ] No input mutation
- [ ] No external dependencies (React, Supabase, AI)

**Integration Layer**:
- [ ] Radar view added to Explore
- [ ] Existing filters honored
- [ ] Profile loaded once
- [ ] MatchResults reused
- [ ] Zero new database queries

**UI Layer**:
- [ ] Horizontal scrolling works (desktop + mobile)
- [ ] Categories stack vertically
- [ ] Match badges display correct scores
- [ ] Dealbreaker badges display (where applicable)
- [ ] Compare integration functional
- [ ] Job Detail navigation works
- [ ] Empty states show
- [ ] Error states show
- [ ] Loading states show

**Trust Boundaries**:
- [ ] MatchResult unchanged by Radar (verified via tests)
- [ ] DealbreakerResult unchanged by Radar (verified via tests)
- [ ] No new scoring formula
- [ ] No auto-hiding of jobs

**Accessibility**:
- [ ] Keyboard navigation works
- [ ] Focus visible
- [ ] Screen reader labels present
- [ ] Touch targets ≥44px
- [ ] Semantic HTML

**Regression**:
- [ ] Explore List unchanged
- [ ] Opportunity Deck unchanged
- [ ] Compare unchanged
- [ ] Job Detail unchanged
- [ ] Saved unchanged
- [ ] Discover unchanged
- [ ] Applications unchanged

**Quality Gates**:
- [ ] TypeScript: PASS
- [ ] ESLint: 0 errors
- [ ] Tests: ALL PASS
- [ ] Build: PASS
- [ ] Vercel: SUCCESS

**Documentation**:
- [ ] E4 spec complete
- [ ] Test plan documented
- [ ] Acceptance criteria clear
- [ ] Non-goals explicit

---

**End of E4 Opportunity Radar Specification**
