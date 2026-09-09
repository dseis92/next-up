# E4 — Opportunity Radar Specification

**Feature Code**: E4
**Status**: SPECIFICATION APPROVED + MERGED TO MAIN — IMPLEMENTATION NOT STARTED
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
- Saved/passed state (existing Explore behavior; applied state NOT loaded in V1)
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
**Required Evidence**: Definition of "stretch" — qualification score in manageable range with missing skills
**Existing Repository Evidence**: ✓ AVAILABLE — MatchResult.qualificationScore, MatchResult.missingSkills
**Missing Evidence**: None for V1 definition
**Can V1 Support Deterministically?**: YES — With explicit definition
**Recommended E4 V1 Status**: **INCLUDE** (using qualification score and missing skills)
**Rationale**: Define "stretch" as: qualificationScore between 60-85 (inclusive) AND missingSkills.length > 0. Avoids jobs too far out of reach (qualification <60) or already perfect fits (>85 or no missing skills). Deterministic, evidence-based.

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
**Purpose**: Quickly surface the user's strongest available matches
**Eligibility**:
- Valid scored opportunity (MatchResult.status = 'scored')
- Passes active Explore filters
- Not passed
**Ranking**: Descending by overallScore, then posted_date DESC, then job.id ASC
**Max Displayed**: Top 20 opportunities
**Explanation Template**: "Your strongest available matches"

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
- Job.salary_period = 'yearly'
- Job.salary_min ≥ 75th percentile (top quartile) of eligible yearly disclosed salaries in active filtered dataset
**Ranking**: Descending by salary_min, then posted_date DESC, then job.id ASC
**Max Displayed**: Top 20 opportunities
**Explanation Template**: "Among the highest disclosed salaries" OR "Salary: $X - $Y/year"
**Note**: Hourly jobs excluded from V1. Percentile threshold computed from eligible yearly salaries at runtime using deterministic algorithm (see below).

#### 4. Stretch Opportunities
**Purpose**: Surface roles that are a manageable qualification stretch
**Eligibility**:
- MatchResult.qualificationScore between 60-85 (inclusive)
- MatchResult.missingSkills.length > 0
**Ranking**: Descending by overallScore, then posted_date DESC, then job.id ASC
**Max Displayed**: Top 15 opportunities
**Explanation Template**: "[N] required skills aren't currently matched" OR "Qualification stretch with [N] unmatched skills"

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
- **Applied jobs**: Include in categories (E4 V1 preserves zero-query architecture; applied-state exclusion deferred to future if Explore later provides application state without Radar-specific query cost)

### Exclusion Rules

Global exclusions (apply to ALL categories):
1. Job is passed (exists in passed_jobs table)
2. Job fails existing Explore filters (search query, work arrangement filter, minimum match filter)

**Incomplete Profile Handling**: Jobs with MatchResult.status = 'incomplete_profile' are handled at the integration adapter boundary BEFORE adaptation to RadarJobInput. Pure Radar selectors assume all inputs represent scored opportunities.

**Applied Jobs**: NOT excluded in E4 V1 to preserve zero-query architecture. Explore currently does not load application IDs. Future enhancement may add applied-state exclusion if Explore integration provides this data without Radar-specific query cost.

### Ranking Rules

**Best Matches**: Sort by overallScore DESC, then posted_date DESC, then job.id ASC
**New Opportunities**: Sort by posted_date DESC, then overallScore DESC, then job.id ASC
**High Compensation**: Sort by salary_min DESC, then posted_date DESC, then job.id ASC
**Stretch Opportunities**: Sort by overallScore DESC, then posted_date DESC, then job.id ASC

### Tie-Breaking Rules

All categories use consistent three-level deterministic ordering:
1. Primary sort (category-specific: score, date, or salary)
2. Secondary sort (if not already used)
3. Final tie-break by job.id ASC (stable deterministic ordering)

**Posted Date Comparator Safety**:
- Valid posted_date: compare descending (newer first)
- Missing/invalid/null posted_date: sort AFTER jobs with valid posted_date
- If both dates missing/invalid: fall through to job.id ASC
- Never allow NaN or undefined comparator behavior

**Note**: New Opportunities excludes invalid/missing posted_date entirely at eligibility phase. Other categories (Best Matches, High Compensation, Stretch) may include jobs with invalid posted_date, but these sort last at the date tie-break level.

### Handling Missing Evidence

| Category | Missing Field | Behavior |
|----------|---------------|----------|
| All Categories | overallScore null (incomplete profile) | Excluded at adapter boundary (RadarJobInput not created) |
| New Opportunities | posted_date null | Exclude (cannot determine recency) |
| High Compensation | salary_min null OR salary_is_estimated = true OR salary_period != 'yearly' | Exclude (no reliable comparable salary data; hourly excluded from V1) |
| Stretch Opportunities | qualificationScore null OR missingSkills empty | Exclude (cannot determine stretch status) |

**Critical Rules**:
- NEVER estimate, infer, or fabricate missing data to qualify a job for a category
- Incomplete profile handling occurs at integration adapter layer, NOT in pure Radar domain logic

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
- **Message**: Context-accurate empty state (not generic)
- Examples:
  - Best Matches (incomplete profile): Use existing incomplete-profile messaging
  - Best Matches (no filtered opportunities): "No matching opportunities with your current filters"
  - Best Matches (no available jobs): "No opportunities available right now"
  - New Opportunities: "Check back soon for newly posted jobs"
  - High Compensation: "Jobs with disclosed high salaries will appear here"
  - Stretch Opportunities: "Qualification stretch opportunities will appear as you explore"

### High Compensation Percentile Algorithm

**Deterministic 75th Percentile Calculation**:

```
1. Collect eligible yearly disclosed salaries:
   - salary_min IS NOT NULL
   - salary_is_estimated = false
   - salary_period = 'yearly'

2. Sort collected values ascending numerically

3. Let n = number of eligible values

4. If n = 0:
   - Category is empty (no eligible salaries)
   - Return empty category

5. Calculate threshold index:
   - thresholdIndex = max(0, ceil(0.75 * n) - 1)

6. Determine threshold value:
   - threshold = sortedValues[thresholdIndex]

7. Filter jobs:
   - Include jobs where salary_min >= threshold

8. Sort qualifying jobs:
   - By salary_min DESC, then posted_date DESC, then job.id ASC

9. Apply max limit (top 20)
```

**Edge Cases**:
- n = 1: threshold = sortedValues[0], only that job qualifies
- n = 4: thresholdIndex = 2, top 2 values (50th percentile due to small sample)
- Ties at threshold: All jobs with salary_min = threshold qualify (before limit)

**Hourly Jobs**: Excluded from V1. Do NOT annualize hourly rates. Do NOT assume work hours. Future enhancement may add hourly compensation category with separate percentile logic.

### Category Computation Performance

**CRITICAL**: Radar must NOT create N+1 queries.

Preferred architecture:
1. Load jobs ONCE (existing Explore behavior)
2. Calculate MatchResults ONCE (existing Phase 10 behavior)
3. Load saved/passed state ONCE (existing Explore behavior)
4. Compute category membership locally via pure selectors
5. Total category computation: O(N) single pass over jobs

Do NOT query database per category. Do NOT recalculate matches per category. Do NOT load application state (preserves zero-query architecture).

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
**Persistence**: View mode stored in URL query parameter only (no database persistence)

### View Mode Architecture

**Source of Truth**: URL query parameter (`?view=`)

**Supported Values**:
- `view=list` → Explore List mode
- `view=deck` → Explore Deck mode (E1 Opportunity Deck)
- `view=radar` → Opportunity Radar mode

**Fallback Behavior**:
- Missing `view` parameter → defaults to `list`
- Invalid `view` value → defaults to `list`
- Invalid is defined as: any value other than "list", "deck", or "radar"

**State Management**:
- Derive active view from URL search params, NOT from independent component state
- View switching uses router navigation that updates only `view` parameter
- Preserve other URL parameters during view switching (filters remain intact)
- Use browser history (Back button returns to previous Explore view)

**Filter State Interaction**:
- Existing Explore filter React state remains intact when switching among List/Deck/Radar
- Filter changes update Explore state, which affects all views
- Radar does NOT duplicate or fork filter state

**Compare Tray Availability**:
- Available in: List, Radar
- Not available in: Deck (existing E1 behavior)

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

**Category Eligibility vs Card Display**: Estimated salaries are excluded from High Compensation category eligibility, but displayed on cards with clear labeling.

**Card Display Rules**:
- If salary_min and salary_max exist (non-estimated): "$120k–$160k/year"
- If only salary_min exists (non-estimated): "$120k+/year"
- If salary_is_estimated = true: Display value with "Estimated" label (e.g., "~$120k–$160k/year (Estimated)")
- If salary is missing: Display "Salary not disclosed"

**Critical**: Do NOT represent estimated salary as disclosed salary. Do NOT use estimated values in High Compensation percentile logic. Estimated salaries excluded from category eligibility but not suppressed in card display.

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

**Allowed**: A 92% match with $150k yearly disclosed salary posted yesterday may appear in:
- Best Matches (top available matches)
- New Opportunities (posted within 7 days)
- High Compensation (≥75th percentile yearly disclosed salary)

**Rationale**: Categories represent different discovery lenses. Seeing the same strong opportunity through multiple lenses reinforces its value and provides navigation flexibility.

**Within-Category Uniqueness**: Each job appears at most ONCE per category.

---

## CATEGORY EXPLANATIONS

### Best Matches
**Heading**: "Best Matches"
**Description**: "Your strongest available matches"
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
**Description**: "Qualification stretch roles"
**Per-Job Explanation**: "[N] required skills aren't currently matched" (e.g., "3 required skills aren't currently matched")

### Explanation Requirements

1. **Deterministic**: Derived directly from eligibility evidence
2. **Honest**: Do not overstate fit or opportunity
3. **Actionable**: User understands why it's in this category
4. **No AI**: All explanations are template-based, not generated

**Example GOOD Explanations**:
- "Posted 3 days ago" (factual, time-based)
- "92% match" (existing MatchResult)
- "4 required skills aren't currently matched" (count from missingSkills)
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
4. Apply Radar exclusions (passed jobs only)
5. Compute category membership from filtered set
6. Apply category-specific eligibility/ranking

**Note**: Incomplete-profile handling occurs at integration adapter boundary. Pure Radar selectors operate only on scored RadarJobInput. Applied-job exclusion deferred to preserve zero-query architecture.

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

**Architecture**: Derived data, NOT persisted state
**Computation**: Pure selectors transform filtered RadarJobInput[] → category buckets
**Memoization**: May memoize category results to avoid unnecessary recomputation
**Time Reference**: Capture explicit `asOfMs = Date.now()` once when Radar view mounts/initializes. Reuse that SAME asOfMs for all category computations during the mounted Radar session, including filter changes. Do NOT refresh asOfMs when filters change.
**Rationale**: Categories are pure derivations. Do NOT duplicate category membership into mutable React state or database tables.

**State Flow**:
1. Explore loads jobs + calculates MatchResults (existing behavior)
2. Radar view mounts/initializes: Capture `asOfMs = Date.now()` once for this Radar session
3. Adapter filters scored matches → RadarJobInput[]
4. Pure selectors: `computeAllCategories(radarJobs, asOfMs)` → category buckets
5. Render category buckets
6. On filter change: re-adapt + recompute using the SAME Radar-session asOfMs (do NOT refresh time reference)
7. On Radar view unmount/remount: New session may capture new asOfMs

**Do NOT**:
- Store category membership in component state separate from derivation
- Persist category results to database
- Call `Date.now()` inside pure domain selectors

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

**Manual Benchmark Goals** (not CI assertions):
- <100ms for 100 jobs
- <200ms for 500 jobs

**Measurement**: Time from filtered jobs → category buckets (manual profiling)

**Optimization**: Use pure selectors, memoization, avoid unnecessary re-renders

**Note**: Wall-clock timing goals are targets for manual profiling, NOT mandatory merge-gate assertions. CI gates focus on request count and algorithmic behavior.

### Rendering Performance

**Manual Goal**: <50ms to render category headings + first 3 cards per category

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

### Radar Domain Input Contract

**Explicit Pure Input Type** (specification-only, NOT a repository type change):

```typescript
interface RadarJobInput {
  job: Job;                           // Complete job data
  overallScore: number;               // MatchResult.overallScore (camelCase)
  qualificationScore: number;         // MatchResult.qualificationScore
  missingSkills: readonly string[];   // MatchResult.missingSkills
}
```

**Integration Adapter Responsibilities**:
1. Accept existing Explore JobMatch data (scored opportunities only)
2. Filter out incomplete-profile MatchResults BEFORE adaptation
3. Transform scored JobMatch (snake_case) → RadarJobInput (camelCase)
4. Pass only scored RadarJobInput to pure Radar selectors

**Incomplete Profile Boundary**:
- Existing Explore integration handles incomplete-profile messaging/UI
- Adapter layer excludes incomplete MatchResults before creating RadarJobInput
- Pure Radar selectors assume all inputs represent scored opportunities (overallScore is number, not null)
- Radar domain logic does NOT inspect MatchResult.status

**CRITICAL**: Do NOT modify `lib/matching/` types. Do NOT change existing `JobMatch` structure. Do NOT modify Phase 9/10 semantics. Do NOT add `matchStatus` field to RadarJobInput. Adapter pattern preserves separation.

### Domain Responsibilities

**lib/radar/types.ts**:
- `RadarCategory` enum
- `CategoryBucket` interface
- `RadarJobInput` interface (domain contract)
- `CategoryEligibility` rules type

**lib/radar/selectors.ts**:
- `selectBestMatches(jobs: RadarJobInput[]): RadarJobInput[]`
- `selectNewOpportunities(jobs: RadarJobInput[], asOfMs: number): RadarJobInput[]`
- `selectHighCompensation(jobs: RadarJobInput[]): RadarJobInput[]`
- `selectStretchOpportunities(jobs: RadarJobInput[]): RadarJobInput[]`
- `computeAllCategories(jobs: RadarJobInput[], asOfMs: number): Map<RadarCategory, RadarJobInput[]>`

**lib/radar/explanations.ts**:
- `getBestMatchesDescription(): string`
- `getNewOpportunityExplanation(postedDate: Date, asOfMs: number): string`
- `getStretchExplanation(missingSkillsCount: number): string`

### Purity Requirements

Domain selectors MUST:
- Be pure functions (same inputs → same outputs)
- NOT mutate inputs
- NOT access React state/context
- NOT call Supabase
- NOT call AI APIs
- NOT use browser APIs (including Date.now(), new Date() implicit current time)
- NOT use randomness
- Accept explicit reference time (asOfMs) for time-based logic
- Be testable in isolation with fixed inputs

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
| overallScore = null | Excluded at adapter boundary (incomplete profile; RadarJobInput not created) |
| qualificationScore = null | Exclude from Stretch Opportunities |
| posted_date = null | Exclude from New Opportunities |
| salary_min = null | Exclude from High Compensation |
| salary_is_estimated = true | Exclude from High Compensation |
| salary_period != 'yearly' | Exclude from High Compensation (hourly excluded from V1) |
| missingSkills = [] | Exclude from Stretch Opportunities |

**Architecture Note**: Pure Radar selectors assume RadarJobInput.overallScore is always a valid number (never null). Incomplete-profile filtering happens at integration adapter layer before domain logic.

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
- Best Matches selector returns all scored jobs passing filters
- Best Matches sorted by overallScore DESC, then posted_date DESC, then job.id ASC
- Best Matches limited to 20
- Best Matches includes 79% match if it's among top available
- New Opportunities uses explicit asOfMs parameter
- New Opportunities returns jobs posted within 7 days of asOfMs
- New Opportunities excludes future-dated jobs (posted_date > asOfMs)
- New Opportunities excludes invalid/null posted_date
- New Opportunities sorted by posted_date DESC, then overallScore DESC, then job.id ASC
- New Opportunities limited to 30
- New Opportunities deterministic with same asOfMs
- High Compensation requires yearly period
- High Compensation excludes hourly jobs
- High Compensation excludes estimated salaries
- High Compensation excludes missing salaries
- High Compensation 75th percentile algorithm correct
- High Compensation edge cases (n=0, n=1, n=4, ties at threshold)
- High Compensation sorted by salary_min DESC, then posted_date DESC, then job.id ASC
- High Compensation limited to 20
- Stretch Opportunities returns qualification 60-85 with missing skills
- Stretch Opportunities sorted by overallScore DESC, then posted_date DESC, then job.id ASC
- Stretch Opportunities limited to 15
- Stretch Opportunities excludes jobs with empty missingSkills
- Same job can appear in multiple categories
- No duplicates within a category
- Passed jobs excluded from all categories
- Applied jobs NOT excluded (V1 preserves zero-query architecture)
- Deterministic ordering (same inputs + same asOfMs → same outputs)
- No mutation of input arrays
- Tie-breaking rules applied correctly
- Invalid/missing posted_date sorts after valid posted_date
- Invalid posted_date does not cause NaN comparator
- Two invalid posted_dates fall through to job.id ASC

### Incomplete Profile Boundary Tests

**Location**: Integration tests

**Coverage**:
- Explore adapter does not create RadarJobInput from incomplete MatchResults
- Incomplete-profile messaging remains owned by existing Explore integration
- Pure Radar selectors never receive null overallScore
- Radar view shows existing incomplete-profile UI (does not invent new messaging)

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
- Application state NOT loaded (zero-query architecture preserved)
- No N+1 request patterns
- No repeated Match calculation
- No unnecessary recomputation
- Rendering does not block main thread

**Performance Goals** (manual benchmark targets, not mandatory CI assertions):
- Category computation <100ms for 100 jobs
- Category computation <200ms for 500 jobs

**Note**: Wall-clock timing assertions should not be CI merge gates unless deterministic benchmark mechanism exists. Focus merge gates on request count and algorithmic behavior.

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

**Standard Tab Navigation**: Use native browser tab order through interactive elements:
1. View mode selector (List/Deck/Radar buttons)
2. Search input
3. Filter controls
4. Job cards within categories (standard tab order)
5. Compare toggles
6. Detail buttons

**Horizontal Scroll**: Horizontal card regions should use native keyboard-accessible scroll behavior (focus card, use arrow keys if natively supported by scroll container).

**Avoid Unnecessary Custom Navigation**: Do NOT invent custom roving-focus or arrow-key navigation unless there is a clear accessibility need. Prefer standard semantic HTML and native browser behavior.

### Visible Focus States

All interactive elements MUST have visible focus ring:
- View mode buttons
- Job cards
- Compare toggles
- Category headings only if interactive (headings should NOT be focusable unless they perform an action)

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
6. ✓ Applied jobs NOT excluded (V1 preserves zero-query architecture)
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
18. ✓ Estimated salary → excluded from High Compensation eligibility (but displayed with label)
19. ✓ Hourly period → excluded from High Compensation
20. ✓ Missing posted_date → excluded from New Opportunities
21. ✓ Future-dated jobs → excluded from New Opportunities
22. ✓ No fabricated or estimated data

### Performance

23. ✓ Zero additional database queries beyond Explore
24. ✓ Profile loaded once
25. ✓ MatchResults calculated once
26. ✓ Application state NOT loaded (preserves zero-query architecture)
27. ✓ No N+1 request patterns
28. ✓ No repeated Match calculation
29. ✓ Category computation goals: <100ms for 100 jobs, <200ms for 500 jobs (manual benchmarks, not CI assertions)

### UI/UX

30. ✓ Radar accessible via Explore view mode selector
31. ✓ View mode derived from URL query parameter (not independent state)
32. ✓ Missing/invalid view parameter defaults to list
33. ✓ Browser Back returns to previous Explore view
34. ✓ CompareTray available in List and Radar (not Deck)
35. ✓ Horizontal scrolling job cards
36. ✓ Mobile responsive
37. ✓ Bottom nav remains accessible
38. ✓ Radar failure does not break Explore List/Deck
39. ✓ Job Detail navigation works
40. ✓ Compare integration works
41. ✓ DealbreakerBadge displays on cards
42. ✓ Best Matches shows top available (no fixed 80% threshold)
43. ✓ New Opportunities uses explicit asOfMs parameter (deterministic time handling)
44. ✓ Invalid posted_date sorted after valid posted_date (no NaN comparator)

### Accessibility

45. ✓ Keyboard navigation functional (standard tab order, no unnecessary custom navigation)
46. ✓ Visible focus states
47. ✓ Screen reader labels present
48. ✓ Semantic headings (non-interactive headings not focusable)
49. ✓ Touch targets ≥44px on mobile
50. ✓ Horizontal scroll keyboard-accessible (native behavior)

### Testing

51. ✓ Pure domain tests cover all selectors (including asOfMs handling)
52. ✓ High Compensation percentile algorithm tested (edge cases: n=0, n=1, ties)
53. ✓ Hourly salary exclusion tested
54. ✓ Invalid posted_date tie-break tested (sorts after valid, no NaN)
55. ✓ Incomplete profile handled at adapter boundary (integration test)
56. ✓ Pure selectors never receive null overallScore (integration test)
57. ✓ Match trust tests verify no MatchResult mutation
58. ✓ E3 trust tests verify dealbreaker independence
59. ✓ Filter tests verify Explore filter integration
60. ✓ Regression tests verify frozen systems unchanged
61. ✓ All quality gates pass (typecheck, lint, tests, build)

### Non-Functional

62. ✓ No new database migration
63. ✓ No new AI usage
64. ✓ No new external API integrations
65. ✓ No modifications to Phase 9/10/11
66. ✓ No modifications to E1/E2/E3
67. ✓ Radar domain input contract explicit (RadarJobInput)
68. ✓ No modification to existing JobMatch or MatchResult types
69. ✓ Category membership derived data (not persisted component state)
70. ✓ View mode source of truth is URL (not separate React state)

---

## OPEN QUESTIONS / BLOCKERS

### BLOCKING BEFORE IMPLEMENTATION

**None identified.** E4 V1 can proceed with existing repository data and infrastructure.

### NON-BLOCKING / FUTURE CONSIDERATIONS

1. **High Compensation Percentile Threshold**:
   - Spec uses 75th percentile (top quartile)
   - Should this be configurable or fixed?
   - **Recommendation**: Fixed at 75th percentile for V1, make configurable in future if needed
   - **Status**: Non-blocking, spec provides clear deterministic algorithm

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
