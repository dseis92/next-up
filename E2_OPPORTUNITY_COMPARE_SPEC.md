# E2 — Opportunity Compare Specification

## Purpose

Allow users to select 2–4 job opportunities and compare them side-by-side using trusted job facts and existing deterministic match results to understand tradeoffs and make more informed career decisions.

## Core Product Mission

**Problem**: Users can discover several attractive opportunities, but current job-search products make it difficult to answer: "Which of these opportunities is actually better for me?"

**Solution**: Opportunity Compare lets users select 2–4 jobs and compare them using:
1. Trusted job facts
2. Existing deterministic NextUp MatchResult
3. Transparent derived comparisons

**E2 must help users understand TRADEOFFS.**

**E2 must NOT pretend there is universally one correct job.**

---

## Foundational Rules

### DO NOT CREATE ANOTHER SCORE

The existing approved deterministic matching engine remains authoritative.

E2 consumes existing deterministic results from calculateJobMatch().

E2 may display:
- overall score
- qualification score
- lifestyle score
- component scores
- matched skills
- missing skills
- fit reasons
- concern reasons

E2 may NOT:
- recalculate scores using another formula
- change weights
- create an AI score
- create a "compare score"
- create a "winner score"
- modify MatchResult
- reinterpret the official score

**If BuildCo is 93% in Discover/Explore/Job Detail, it must be 93% in Compare.**

### NO AI IN E2

NO AI is required or authorized for E2.

Do not call OpenAI.
Do not touch Phase 11.
Do not generate an AI recommendation like: "BuildCo is the job you should choose."

E2 comparisons must be explainable from deterministic data.

### NO "BEST JOB" BADGE

Do NOT create:
- Best Job
- Recommended Job
- NextUp Pick
- Winner

E2 is a decision-support interface. It exposes tradeoffs. It does not make the decision for the user.

---

## Selection Behavior

### Selection Limits

**Minimum**: 2 opportunities
**Maximum**: 4 opportunities

At 1 selected: "Select at least one more opportunity"
At 2–4 selected: Enable "Compare opportunities" CTA
At 4 selected: Prevent selecting a fifth, show message: "You can compare up to 4 opportunities."

### Selection State

Selection should survive navigation between entry points during the same browser session.

**Storage**: Store only job IDs (not full Job objects or MatchResults)

**State mechanism**: Use Zustand (already installed) with sessionStorage semantics

**Reason**: Job data and match scores should always be loaded fresh when Compare opens

### Selection UX

Add subtle additive action: **"+ Compare"** or **"Compare"**

Do not replace existing actions (Save, Pass, Apply, Details, card navigation)

When selected:
- Change button state to: **"✓ Comparing"** or similar
- Use `aria-pressed` or appropriate accessible selected state

### Compare Tray

When at least one opportunity is selected, display a compact comparison tray.

**Example concept**:
```
┌─────────────────────────────────────────────┐
│ Compare opportunities                       │
│                                             │
│ [BuildCo ×] [Apex ×]              2 / 4    │
│                                             │
│                     Compare opportunities → │
└─────────────────────────────────────────────┘
```

**Tray requirements**:
- Show selected opportunities
- Allow removing an opportunity
- Show selection count (e.g., "2 / 4")
- Disable comparison CTA until at least 2 selected
- CTA navigates to Compare route
- Do not cover critical mobile navigation/actions
- Mobile responsive
- Keyboard accessible

---

## Entry Points

### E2 V1 Entry Points

1. **Explore List**: Add Compare action to each list job card
2. **Saved Jobs**: Add Compare action to saved job cards
3. **Job Detail**: Add "Compare" or "Add to comparison" button

### DO NOT Add To

- **Discover**: Explicitly outside E2
- **Opportunity Deck (E1)**: E1 is frozen, do not modify

### Integration Requirements

**Explore List**:
- Add Compare action to LIST cards only (not Deck)
- Use stopPropagation if card navigates on click
- Do not accidentally open Job Detail
- Do not affect Save/Pass state
- Do not affect filters
- Do not affect deterministic scores

**Saved Jobs**:
- Add Compare action
- Do not change existing remove/save semantics
- Do not change existing loading/error behavior
- Do not change existing card navigation

**Job Detail**:
- Add Compare button
- Do not modify existing Save/Apply/AI Explanation
- Do not modify match calculation
- Do not modify application logic
- Show selected state if job already selected

---

## Compare Route

### URL Structure

**Route**: `/compare`

**Preferred URL**: `/compare?jobs=id1,id2,id3`

**URL requirements**:
- Deduplicate IDs
- Preserve selected order
- Accept only 2–4 valid IDs for normal comparison
- Safely handle malformed input
- Safely handle stale/missing IDs
- Never trust query parameters as loaded job objects
- Job IDs only (no private user data in URL)

### Direct URL Behavior

**0 or 1 job**: Show compare empty state
- Message: "Choose at least two opportunities to compare."
- CTA: "Explore jobs"

**More than 4 IDs**: Use deterministic safe policy
- Preferred: Take the first 4 unique valid IDs
- Optionally display a non-blocking notice
- Do not crash

### Shareable URL Semantics

The compare URL can contain job IDs.

**IMPORTANT**: Match results are USER-SPECIFIC.

Opening the same comparison URL as another authenticated user should recompute that user's deterministic match results.

Never encode deterministic scores in URL parameters.

---

## Data Loading

### Job Data Loading

Load selected jobs from trusted storage.

**Preferred**: Batch helper `getJobsByIds(ids)` if not currently exists

If created:
- One Supabase query
- `.in("id", ids)`
- Throw on database/query failure
- Do not collapse failure into `[]`
- Preserve caller-requested ordering after retrieval
- Ignore/identify genuinely missing IDs separately from query failure

Do NOT make one query per selected job if batch query is clean.

Do NOT use service role.
Do NOT change RLS.

### Match Data Loading

Load deterministic matching data ONCE for the comparison batch.

**Preferred architecture**:
```
selected jobs
      ↓
calculatePersonalizedMatches(userId, selectedJobs)
      ↓
one profile hydration
      ↓
MatchResult per selected job
```

**Avoid**: Profile load once per job (N+1 matching profile loads)

Use the existing approved Phase 10 matching integration.

Do not copy Phase 9 matching code into E2.

### Query Error vs Missing Job

Maintain approved storage semantics:

**Database/query failure**: ERROR

**Valid query where one job no longer exists**: MISSING JOB

These are not the same.

If selected IDs are [A, B, C] and C genuinely no longer exists:
- If A + B remain valid: Allow comparison of A + B, show subtle notice that one opportunity is unavailable
- If fewer than two valid opportunities remain: Show comparison empty/unavailable state

Do not convert DB errors into "job not found."

---

## Incomplete Profile Handling

Preserve the canonical semantics.

**Exact existing concept**: "Finish your profile to see your match"

Never show: `0%` for an incomplete profile

E2 may still show trusted factual job information:
- company
- title
- location
- salary
- work arrangement
- employment type

Match-specific comparison sections must display the incomplete-profile state instead of fake percentages.

Do not call incomplete profile an error.

---

## Compare Page Structure

### Header

**Page title**: "Compare opportunities"

**Supporting copy**: "See how your opportunities stack up." (or similar concise NextUp-style message)

**Provide**:
- Back navigation
- Clear comparison action

### Job Summary Columns

For each opportunity show:
- Company
- Title
- Location
- Work arrangement
- Employment type
- Salary (when available)
- Overall match (when available)
- Save state (where practical)
- View details action

Do not add Apply behavior unless reusing existing approved flow is straightforward and safe.

### Comparison Categories

1. **Match Comparison**
2. **Compensation**
3. **Lifestyle**
4. **Skills**
5. **Strengths / Concerns**

Do not force every category to exist if current trusted data does not support it.

---

## Match Comparison

### Display

Show:
- Overall Match
- Qualification
- Lifestyle

Then available approved component scores.

Current JobMatch surface may expose:
- Skills
- Experience
- Salary
- Location
- Work Arrangement
- Career Goals

**Inspect current MatchResult / JobMatch types before implementation.**

If approved Phase 9 data contains additional dimensions but current Phase 10 adapter intentionally does not expose them, DO NOT bypass the adapter casually.

### Component Score Display

A comparison might look conceptually like:

```
                     BUILDCO       APEX

Overall Match           93%         88%
Qualification           91%         94%
Lifestyle               96%         80%

Skills                   95          90
Experience               90          96
Salary                   92          98
Location                 88          72
Work Arrangement        100          65
Career Goals              95          84
```

**Do not create these numbers. They must be actual existing deterministic results.**

---

## Compensation

E2 V1 may compare currently stored compensation facts only.

**Examples**:
- Salary minimum
- Salary maximum
- Salary period
- Estimated/disclosed flag (where available)
- Deterministic salary-alignment score

When user salary target is already available through existing deterministic matching profile and existing comparison data supports it safely, you may present an alignment explanation.

### DO NOT Implement E22

Do NOT add:
- Market salary estimates
- Cost-of-living modeling
- Total compensation estimates
- Salary forecasts

unless that data already exists and is trusted.

### Salary Leader Language

Avoid overly strong labels like: **"BEST PAY"**

**Preferred**:
- "Highest listed maximum"
- "Higher listed salary range"

If salary data is missing:
- Do not treat missing as zero
- If only one opportunity has salary data: Do not imply it definitively pays more than a job with undisclosed salary

---

## Lifestyle

Compare trusted available dimensions:
- Lifestyle score
- Work arrangement
- Location
- Employment type
- Deterministic location score
- Deterministic work-arrangement score

### DO NOT Invent

Do NOT invent:
- Commute time
- Travel percentage
- Schedule
- PTO
- Benefits

unless actually present in trusted job data.

---

## Skills

Create a strong skills comparison.

Show per job:
- Matched skills
- Missing skills

**Consider a matrix** such as:

```
SKILL                  BUILDCO       APEX

Leadership                ✓            ✓
Scheduling                ✓            ✓
Procore                    —            ✓
Budgeting                  —            —
```

Only create this matrix from actual MatchResult skills.

Do not infer a user possesses a skill merely because another job mentions it.

**Clearly distinguish**:
- Matched
- Missing
- Not required / unknown

if the data supports those distinctions.

---

## Strengths / Concerns

Use existing deterministic:
- `reasons_fit`
- `reasons_concern`

**DO NOT generate new reasons using an LLM.**

**Example**:

```
BUILDCO

Strengths
✓ Strong experience alignment
✓ Preferred work arrangement

Concerns
⚠ Missing Procore

APEX

Strengths
✓ Strong technical alignment

Concerns
⚠ Location alignment is weaker
```

These must be existing deterministic reasons.

---

## Dealbreakers

**DO NOT IMPLEMENT THE E3 DEALBREAKER ENGINE.**

If current MatchResult contains approved hard failures, they may be displayed as existing deterministic concerns where appropriate.

Do NOT add:
- User-defined dealbreakers
- Dealbreaker settings
- New tables
- New scoring behavior

That belongs to E3.

---

## Growth Potential

**DO NOT invent a growth-potential score.**

Only show career growth/potential information if the existing job data already contains a trustworthy explicit field.

Otherwise omit this dimension in E2 V1.

Career GPS and broader career trajectory belong to future expansions.

---

## Difference Mode

This is a signature E2 feature.

### Controls

Add: **[ All details ] [ Differences only ]**

**Default**: All details

### Behavior

When "Differences only" is enabled:
- Hide comparison rows where all compared jobs have equivalent values

**Examples**:
- If every job is Full Time: hide Employment Type row
- If scores differ: show row
- If salary differs: show row
- If all locations differ: show row

For arrays/skills: Normalize deterministically before comparing

**DO NOT use fuzzy AI comparison.**

### Implementation

Prefer pure deterministic helpers:
- `areValuesEquivalent(...)`
- `getVisibleComparisonRows(...)`
- `normalizeComparableValue(...)`

Add tests. Rules should be explicit.

---

## Comparison Lenses

Add four user-controlled lenses:
1. **Balanced**
2. **Compensation**
3. **Lifestyle**
4. **Qualification**

### IMPORTANT

**THE LENS DOES NOT CHANGE ANY SCORE.**

**THE LENS DOES NOT CREATE A NEW SCORE.**

**THE LENS ONLY CHANGES PRESENTATION EMPHASIS.**

### Lens Behaviors

**Balanced**: Standard category order

**Compensation**: Salary section emphasized / moved earlier

**Lifestyle**: Lifestyle, location, work arrangement, employment type emphasized first

**Qualification**: Qualification, skills, experience, missing skills emphasized first

**Official match percentages remain unchanged.**

---

## Leaders / "Why This One Leads"

Provide transparent derived labels where useful.

**Examples**:
- Highest overall match
- Highest qualification
- Highest lifestyle fit
- Highest listed salary maximum
- Most matched skills
- Fewest missing skills

### Requirements

- Derive only from displayed trusted values
- Handle ties
- Do not treat missing values as zero
- Do not declare one universal winner
- Do not create a composite winner

**Example**:

```
BUILDCO LEADS IN
Overall Match
Lifestyle

APEX LEADS IN
Qualification
Highest listed salary maximum
```

If tied: Show "Tie" or avoid displaying a leader for that dimension.

---

## Compare Actions

Each compared opportunity should provide:
- **View details**

And possibly:
- **Remove from comparison**

Use existing Saved state only if it can be integrated without new mutation risk.

Do not add unnecessary actions.

---

## Mobile Experience

Compare must be intentionally designed for mobile.

**DO NOT simply squeeze four desktop columns into a phone.**

### Preferred Pattern

- Sticky comparison labels
- Horizontally scrollable opportunity columns

or another clean accessible mobile comparison UI.

### Requirements

- 2 jobs easy to compare on phone
- 3–4 jobs horizontally accessible
- Job headers remain understandable
- Row labels remain understandable
- No microscopic text
- No broken overflow
- Bottom navigation remains usable
- Compare tray does not cover important controls

---

## Desktop Experience

Desktop may use a true comparison matrix.

**Suggested**:
- Left column: attribute labels
- Remaining columns: jobs

Job headers may be sticky when scrolling if implementation remains clean.

Do not over-engineer sticky behavior if it causes layout problems.

---

## Visual Design

Preserve NextUp design language:
- Charcoal/dark surfaces
- Electric lime/chartreuse brand
- Orange accent only where meaningful
- Off-white foreground
- Existing typography
- Existing radii
- Existing Card/Button/Badge/Avatar components

**Goal**:
- Premium
- Clear
- Consumer-friendly
- Decision-oriented

**Avoid**:
- Corporate spreadsheet look
- Generic SaaS table
- Purple gradients
- Excessive nested cards
- LinkedIn-style dense UI

---

## Loading State

Compare route must have intentional loading behavior.

Do not briefly show: "No opportunities selected" while real data is still loading.

**Correct ordering**: loading → error OR data/empty

---

## Error Messages

Safe user-facing errors only.

**Examples**:
- "Unable to load these opportunities right now."
- "One of these opportunities is no longer available."
- "Choose at least two opportunities to compare."

**Do not expose**:
- Supabase raw errors
- PostgREST diagnostics
- Stack traces
- Database details

---

## Accessibility

### Required

- Compare toggle has accessible selected state
- Remove buttons have job-specific aria labels
- Compare tray communicates count
- Comparison matrix is keyboard accessible
- Difference Mode controls accessible
- Lens controls accessible
- Horizontal mobile comparison is usable with keyboard where applicable
- Focus indicators visible

**Do not rely solely on color** for:
- Leader
- Difference
- Match status
- Missing skills

---

## State Reset

Provide: **"Clear comparison"**

This clears selected job IDs and returns the comparison selection to empty.

**Removing one job from a 3-job comparison**: Remain on Compare with 2

**Removing one from a 2-job comparison**: Show the minimum-selection state instead of crashing

---

## Selection Store Safety

The store should enforce:
- Unique job IDs
- Maximum 4
- Stable insertion order

Pure functions should make selection behavior testable.

**Examples**:
- `addCompareJob`
- `removeCompareJob`
- `clearCompareJobs`
- `isCompareSelected`
- `canAddCompareJob`

or equivalent.

**Do not store MatchResult inside the selection store.**

---

## Auth / RLS / Security

Follow existing auth behavior.

Do not add another auth system.
Do not use service-role key.
Do not expose user IDs unnecessarily.

---

## Non-Goals (E2 V1)

E2 V1 explicitly does NOT include:

- AI-generated comparisons
- Dealbreaker engine (E3)
- New scoring formula
- Growth-potential scores
- Market salary estimates
- Cost-of-living analysis
- Total compensation modeling
- Persisted comparison results
- Comparison history
- Social sharing
- Export to PDF
- General AI Career Coach integration

---

## Future Integration Points

E2 is designed to be extensible:

**E3 — Dealbreaker Engine**: User-defined non-negotiables could filter or highlight jobs in Compare

**E11 — What-If Match Simulator**: Could integrate with Compare to show hypothetical match changes

**E13 — Skill ROI**: Could show which skills would improve multiple jobs in the comparison

**E22 — Compensation Intelligence**: Could add market salary context

**Phase 11 AI**: Could optionally add an AI explanation of the tradeoffs (separate from E2 V1)

But these are NOT authorized for E2 implementation.

---

## Testing Requirements

### Selection Tests

- Add first job
- Add second job
- Add up to 4
- Reject fifth
- No duplicate IDs
- Remove selected job
- Clear all
- Insertion order preserved

### Query Parsing Tests

- Parse 2 IDs
- Parse 4 IDs
- Deduplicate
- Malformed input
- >4 IDs
- Zero IDs
- One ID

### Batch Storage Tests

If `getJobsByIds` created:
- Returns selected jobs
- Preserves requested order
- Legitimate missing job is distinguishable
- Database error throws

### Comparison Tests

- Highest overall match
- Tie
- Missing numeric values not treated as zero
- Salary leader with missing salary
- Matched-skill count
- Missing-skill count

### Difference Mode Tests

- Identical row hidden
- Differing row shown
- Normalized arrays compare deterministically
- Null/missing handling explicit

### Lens Tests

- Balanced order
- Compensation order
- Lifestyle order
- Qualification order
- No score mutation

### Incomplete Profile Tests

- No fake 0
- Incomplete status preserved

---

## Manual QA Requirements

Create: `MANUAL_TESTS_OPPORTUNITY_COMPARE.md`

Include test cases for:
- Explore List compare selection
- Saved compare selection
- Job Detail compare selection
- Selection persistence across navigation
- 2-job compare
- 3-job compare
- 4-job compare
- Fifth-job prevention
- Remove comparison job
- Clear comparison
- Direct compare URL
- Malformed URL
- Missing job
- Database/load failure
- Same deterministic score as Job Detail
- Same deterministic score as Explore
- Incomplete profile
- Difference Mode
- Balanced lens
- Compensation lens
- Lifestyle lens
- Qualification lens
- Salary missing
- Score ties
- Mobile 2-column
- Mobile 4-column horizontal navigation
- Desktop comparison
- Keyboard navigation
- Screen-reader labels
- Focus visibility
- Refresh
- Session restoration
- Browser back/forward
- Console errors
- Network behavior

**DO NOT claim these were executed unless actually executed.**

---

## E1 Regression Requirements

Because Explore List shares a page with E1 Deck, explicitly verify in code and tests where practical:

- Explore still defaults to List
- Deck selector still works
- Deck Save still works
- Deck Pass still works
- Deck Undo still works
- Deck code unchanged
- No Compare control appears inside Deck
- No E1 persistence logic changed

Manual E1 browser QA is still pending. Do not mark it completed.

---

## Existing Product Regression

Confirm no functional regressions to:
- Discover
- Explore List
- Explore Deck
- Saved
- Job Detail
- Applications
- Profile
- Matching
- Phase 11 AI code

---

## Quality Gates

Before E2 implementation:
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Record exact baseline.

After E2:
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

All must pass.

Do not call new warnings "pre-existing" unless verified against the before baseline.

---

## Git Strategy

Use TWO commits.

**COMMIT 1**: `docs: authorize E2 opportunity compare`
- Expected docs: CLAUDE.md, PRODUCT_EXPANSION_ROADMAP.md, E2_OPPORTUNITY_COMPARE_SPEC.md
- Push main
- Record SHA

**COMMIT 2**: `feat: add opportunity compare`
- Implementation + tests + manual QA document
- Push main
- Record exact SHA
- Verify Vercel for the exact FINAL implementation SHA

---

## Document Information

**Created**: 2026-09-07
**Version**: 1.0
**Status**: Implementation Authorized
**Related Expansion**: E2 — Opportunity Compare
