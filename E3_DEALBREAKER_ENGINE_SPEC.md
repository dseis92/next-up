# E3 — Dealbreaker Engine Specification

**Feature Code**: E3
**Status**: IMPLEMENTATION AUTHORIZED
**Product Track**: Product Expansion

---

## MISSION

E3 answers:

**"Does this opportunity violate one of my non-negotiables?"**

This is different from:

"How well does this job match me?"

The approved deterministic `MatchResult` remains authoritative for match score.

Dealbreakers are a **SECOND**, **NON-SCORING** decision-support layer.

---

## ABSOLUTE TRUST RULE

**DEALBREAKERS MUST NEVER CHANGE MATCHRESULT.**

Never:
- Change `overallScore`
- Change `qualificationScore`
- Change `lifestyleScore`
- Change Phase 9 weights
- Cap a match score
- Add or subtract match points
- Create a dealbreaker percentage
- Create another "fit score"
- Rewrite `MatchResult` hard failures
- Reinterpret `MatchResult` as a dealbreaker score

**Example**:

A job may remain:
```
93% Match
```

while separately showing:
```
1 dealbreaker conflict
```

**That is valid.**

---

## NO UNIVERSAL WINNER / AUTO-BLOCKING

A dealbreaker conflict is **guidance**.

**DO NOT**:
- Auto-Pass a job
- Auto-unsave a job
- Hide a job by default
- Block Apply
- Block Save
- Block Job Detail
- Delete the job from discovery
- Change the match percentage

**The user remains in control.**

---

## E3 V1 SUPPORTED DEALBREAKERS

Keep E3 V1 intentionally narrow and based only on trustworthy current job data.

### 1. MINIMUM COMPENSATION

User may define a salary floor.

**Rule Type**: `minimum_salary`

**User Input**: Numeric minimum salary value

### 2. SALARY DISCLOSURE

User may require a job to disclose compensation.

**Rule Type**: `salary_disclosure_required`

**User Input**: Boolean toggle

### 3. WORK ARRANGEMENT

User may specify acceptable arrangements.

**Rule Type**: `allowed_work_arrangements`

**User Input**: Multi-select from:
- `remote`
- `hybrid`
- `onsite`

Based on actual repository type: `WorkArrangement = "remote" | "hybrid" | "onsite"`

### 4. EMPLOYMENT TYPE

User may specify acceptable employment types.

**Rule Type**: `allowed_employment_types`

**User Input**: Multi-select from:
- `full_time`
- `part_time`
- `contract`
- `temporary`

Based on actual repository type: `EmploymentType = "full_time" | "part_time" | "contract" | "temporary"`

---

## NOT IN E3 V1

**DO NOT ADD**:

- Travel-percentage dealbreakers (unless trusted travel data already exists)
- Commute-distance dealbreakers
- Geocoding
- Location-radius calculations
- Company-rating dealbreakers
- Culture dealbreakers
- Benefits dealbreakers without structured data
- Mission/value dealbreakers
- Skill requirements as dealbreakers
- Career-growth scoring
- Employer reputation
- AI-based dealbreaker inference
- Freeform natural-language rules
- Automatic job hiding
- Automatic passing
- E4 Opportunity Radar
- E11 What-If Simulator
- E22 Compensation Intelligence

**Anything lacking trusted structured job evidence should be deferred.**

---

## THREE-STATE EVALUATION

Every active rule must evaluate deterministically to:

### PASS
Job satisfies the user's requirement.

### CONFLICT
Job violates the user's requirement.

### UNKNOWN
Insufficient trusted job data to evaluate this rule.

**UNKNOWN IS NOT A CONFLICT.**

If trusted job data is absent or insufficient: **UNKNOWN**

Do not assume the worst.
Do not assume the best.

---

## OVERALL DEALBREAKER RESULT

Create a separate result type.

### Conceptual Structure

```typescript
DealbreakerEvaluation {
  status:
    "inactive"     // No active rules configured
    | "clear"      // All active rules pass
    | "conflict"   // At least one rule conflicts
    | "unknown";   // No conflicts but at least one unknown

  conflictCount: number;
  unknownCount: number;
  passCount: number;

  findings: DealbreakerFinding[];
}

DealbreakerFinding {
  ruleType: string;
  outcome: "pass" | "conflict" | "unknown";
  title: string;
  explanation: string;
}
```

### Status Logic

- **No active rules**: `inactive`
- **Any conflict**: `conflict`
- **No conflicts + at least one unknown**: `unknown`
- **All active rules pass**: `clear`

**Do not create a numeric score.**

---

## PURE ENGINE

Create a pure deterministic engine under:

```
lib/dealbreakers/
```

Possible files:
- `types.ts`
- `evaluate-dealbreakers.ts`
- `job-adapter.ts`
- `index.ts`

### Pure Evaluator Requirements

**NO**:
- Supabase
- React
- OpenAI
- Browser state
- Network
- Zustand
- `MatchResult` mutation

**Same rules + same job facts = same evaluation every time.**

---

## RULE EVALUATION SEMANTICS

### MINIMUM SALARY RULE

**Be conservative.**

If salary is absent: **UNKNOWN**
(Unless the separate Salary Disclosure rule is enabled, in which case that rule may independently CONFLICT.)

#### Comparison Logic

**Job maximum < user's minimum**: **CONFLICT**

**Job minimum >= user's minimum**: **PASS**

**Range overlaps the user's floor**:
```
job minimum < floor <= job maximum
```
**UNKNOWN**

**Reason**: The listed range includes acceptable and unacceptable compensation. Do not pretend that is a guaranteed pass.

#### Salary Period Handling

If salary periods differ:

Inspect whether NextUp already exposes a public, pure, tested salary normalization helper that can be safely reused **WITHOUT** modifying Phase 9.

- **If YES**: Reuse it.
- **If NO**: Do not invent a conversion inside E3 merely to force a result. Return **UNKNOWN** for unsupported/non-comparable periods.

**Do not modify Phase 9 salary logic.**

---

### SALARY DISCLOSURE RULE

If rule is enabled:

**No salary min AND no salary max**: **CONFLICT**

**Salary information available**: **PASS**

This rule is about disclosure, not whether the salary is good enough.

---

### WORK ARRANGEMENT RULE

User chooses acceptable arrangements.

**No enabled restriction / empty allowed list**: Rule inactive

**Job arrangement known + allowed**: **PASS**

**Job arrangement known + not allowed**: **CONFLICT**

**Job arrangement missing/unknown**: **UNKNOWN**

---

### EMPLOYMENT TYPE RULE

Same semantics:

**No enabled restriction**: Inactive

**Known + allowed**: **PASS**

**Known + not allowed**: **CONFLICT**

**Missing**: **UNKNOWN**

---

## DEALBREAKER LANGUAGE

Consumer wording must remain calm and factual.

### Good Examples

- "Listed maximum is below your $90,000 minimum."
- "This role is on-site, which is outside your selected work arrangements."
- "Compensation is not listed."
- "Employment type is not specified, so this preference can't be verified."

### Avoid

- "Terrible fit"
- "Never take this job"
- "Bad employer"
- "Failed job"
- "Unacceptable company"

**Do not make accusations.**

---

## PERSISTENCE REQUIREMENT

Dealbreakers are **account-specific durable preferences**.

**DO NOT** use:
- `sessionStorage` / `localStorage` as the authoritative persistence layer
- E2 comparison Zustand store
- `user_preferences.priorities` (would alter Phase 9/10 semantics)

**Prefer**: A dedicated user-owned persistence model.

---

## SCHEMA AUTHORIZATION — NARROW AND ADDITIVE

You are authorized to **DRAFT exactly ONE new additive E3 migration** if repository inspection confirms a dedicated table is appropriate.

### Authorization Scope

**LIMITED TO**:
- CREATE one new user-owned dealbreaker preference table
- RLS policies for the authenticated owner
- Safe indexes/constraints for that new table
- Timestamps for that new table

**NO**:
- Modifications to existing tables
- Dropping/altering existing columns
- Migration-history edits
- Weakening existing RLS
- Service role

### Likely Shape

One row per user with fields equivalent to:

```sql
user_id UUID PRIMARY KEY REFERENCES auth.users(id)
minimum_salary INTEGER NULL
require_salary_disclosure BOOLEAN DEFAULT false
allowed_work_arrangements TEXT[] NULL
allowed_employment_types TEXT[] NULL
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

**BUT**: Inspect the actual Job and preference types first. Use field names and constraints matching actual repository semantics.

**Prefer typed explicit columns over a vague unrestricted JSON blob for E3 V1.**

---

## IMPORTANT DATABASE SAFETY GATE

**CREATE THE MIGRATION FILE ON THE FEATURE BRANCH.**

**DO NOT APPLY IT TO THE REMOTE SUPABASE PROJECT YET.**

Do **NOT** run:
```bash
supabase db push
```
against production during this implementation pass.

Do **NOT** run:
```bash
supabase db reset
```
ever for this task.

Independent review must inspect the migration before remote application.

In the final E3 implementation report say:

```
REMOTE E3 MIGRATION:
NOT APPLIED — INTENTIONALLY PENDING INDEPENDENT REVIEW
```

**This is expected, not a failure.**

---

## RLS REQUIREMENTS

The new table must be **private user-owned data**.

**Enable RLS.**

Authenticated users may only:
- SELECT their own row
- INSERT their own row
- UPDATE their own row
- DELETE/reset their own row

Ownership must use: `auth.uid()`

**NO**:
- Cross-user reads
- Public read policy
- Employer access
- Service-role client usage

---

## STORAGE LAYER

Create a dedicated storage module such as:

```
lib/storage/dealbreakers.ts
```

Follow the hardened storage semantics already used in NextUp.

### Distinguish

**No saved dealbreaker row**: Valid "no configured dealbreakers" state

**Query failure**: Error

**Do not convert database failures into empty settings.**

### Provide Functions

Equivalent to:
```typescript
getUserDealbreakers(...)
saveUserDealbreakers(...)
clearUserDealbreakers(...)
```

Use existing repository naming/auth patterns.

---

## SETTINGS UX

Add an additive settings experience.

**Preferred route**: `/settings/dealbreakers`

Add a link/section from existing Settings.

**Do not add a sixth bottom-navigation tab.**

### Page Heading

**Dealbreakers**

### Supporting Explanation

"Dealbreakers flag opportunities that conflict with your non-negotiables. They do not change your match score."

Use existing NextUp visual system.

**No generic SaaS redesign.**

---

## EDITING MODEL

Use explicit controlled editing.

**DO NOT autosave every keystroke.**

### Preferred Flow

1. Load saved settings
2. Edit form locally
3. "Save changes"

### While Saving

- Disable duplicate submission
- Show safe pending state

### On Failure

- Keep user's local edits
- Show safe error
- Allow retry

**Do not claim save succeeded until persistence succeeds.**

---

## SETTINGS FORM

### Minimum Compensation
- Optional
- Clearly show unit/period

### Salary Disclosure
- Toggle

### Work Arrangement
- Select allowed arrangements

### Employment Type
- Select allowed types

**Empty/no restriction must be clearly understandable.**

### Provide

- "Save changes"

### Optional

- "Clear all dealbreakers"

If Clear is added, require an explicit user action. Do not hide the destructive meaning.

---

## SURFACE INTEGRATION — E3 V1

E3 may integrate into:

1. **Explore LIST only**
2. **Saved Jobs**
3. **Job Detail**
4. **Settings**

**DO NOT integrate into**:
- Discover
- Opportunity Deck
- Opportunity Compare
- Applications

during E3 V1.

**E1 and E2 are frozen.**

---

## EXPLORE LIST

Explore page contains both List and E1 Deck logic.

**Modify Explore extremely carefully.**

E3 dealbreaker data must be loaded **once per Explore page/batch**.

**DO NOT query dealbreakers per card.**

Run the pure evaluator locally per job.

**Only add the signal to LIST cards.**

### Do Not Change

- Deck candidate selection
- Deck filtering
- Deck Save
- Deck Pass
- Deck Undo
- Deck gestures
- Deck lifecycle
- Deck pending locks

### Prefer Not to Modify

- `components/explore/opportunity-deck.tsx`
- `components/explore/opportunity-swipe-card.tsx`

---

## SAVED JOBS

Load dealbreaker settings **once**.

Evaluate Saved jobs locally.

### Do Not Alter

- Save/unsave persistence
- Matching behavior
- Loading semantics
- Error semantics

---

## JOB DETAIL

This should be the richest E3 surface.

Add a section such as: **Your dealbreakers**

### Example

```
1 conflict · 1 unknown

Salary minimum
⚠ Listed maximum is below your $90,000 minimum.

Work arrangement
✓ Hybrid is one of your selected arrangements.

Employment type
? Employment type isn't specified, so this preference can't be verified.
```

Use existing components/icons.

### Do Not Alter

- Official match score
- Save
- Apply
- AI Explanation
- Application creation
- Phase 11 code

---

## COMPACT BADGE

Create a reusable display-only component if useful.

### Possible Concept

`DealbreakerBadge`

### Examples

- `1 dealbreaker conflict`
- `2 dealbreaker conflicts`
- `1 preference unknown`

**Do not show fake "0%".**

**Do not imply unknown is a conflict.**

If no rules are active: Prefer no badge rather than clutter.

If all rules clearly pass: A subtle "No dealbreaker conflicts" indicator is acceptable where useful, but do not overload compact cards.

---

## ERROR STATE

If dealbreaker settings fail to load:

**DO NOT** show "No conflicts."

That would falsely imply success.

Use:
```
Dealbreaker preferences unavailable
```

or omit compact status and show a safe section error on richer surfaces.

Match scoring should still work.

**E3 storage failure must not break the entire Explore/Saved page if the rest of the page loaded successfully.**

---

## N+1 RULE

**Never**:
```
getDealbreakers()
per job card
```

**Preferred**:
```
load dealbreaker preferences once
↓
adapt/evaluate jobs locally
```

For 20 jobs:
- **1 dealbreaker preference load**
- **NOT 20**

---

## MATCHING BOUNDARY

**Do not import E3 into**:
- `lib/matching/calculate-job-match.ts`

**Do not modify**:
- `lib/matching/weights.ts`
- `lib/matching/reasons.ts`
- Phase 9 hard-failure logic
- Phase 10 matching integration

**Dealbreaker evaluation consumes job facts separately.**

**It does not decorate or mutate `MatchResult`.**

---

## PHASE 9 HARD FAILURES VS E3 DEALBREAKERS

Keep them conceptually distinct.

**Phase 9 hard failures**: Approved matching-engine evidence

**E3 dealbreakers**: Explicit USER non-negotiables

**Do not**:
- Merge the arrays
- Translate one into the other behind the scenes

They may occasionally describe similar concerns. **That is acceptable.**

The UI should not imply they are the same data structure.

---

## E2 FREEZE

**DO NOT MODIFY** during E3:

- `app/compare/page.tsx`
- `components/compare/*`
- `lib/compare/*`
- `store/compare-store.ts`
- `hooks/use-compare-hydration.ts`

No Dealbreaker section in Compare yet.

That can be considered later under separate authorization.

---

## E1 FREEZE

**DO NOT MODIFY**:

- `components/explore/opportunity-deck.tsx`
- `components/explore/opportunity-swipe-card.tsx`

No E3 controls inside Deck.

---

## AI

**No AI for E3.**

Do not call OpenAI.
Do not infer dealbreakers from free text.
Do not ask an LLM whether a job violates a rule.

**All E3 V1 evaluation is deterministic.**

---

## TEST REQUIREMENTS

Add thorough E3 automated tests.

### PURE ENGINE

- No active rules → `inactive`
- All active rules pass → `clear`
- One conflict → `conflict`
- Multiple conflicts → correct count
- No conflict + unknown → `unknown`
- Unknown does not count as conflict

### MINIMUM SALARY

- Max below floor → conflict
- Min at/above floor → pass
- Range overlaps floor → unknown
- Salary absent → unknown
- Unsupported/non-comparable period → unknown (unless existing approved helper safely normalizes it)

### SALARY DISCLOSURE

- Salary absent → conflict
- Salary present → pass

### WORK ARRANGEMENT

- Allowed → pass
- Disallowed → conflict
- Missing → unknown

### EMPLOYMENT TYPE

- Allowed → pass
- Disallowed → conflict
- Missing → unknown

### MULTI-RULE

- Conflict + pass
- Conflict + unknown
- All pass
- All unknown
- Result counts deterministic

### MATCH ISOLATION

Prove E3 evaluation does not mutate a `MatchResult` fixture.

Better: The evaluator should not need `MatchResult` at all.

### STORAGE

- No row → valid empty/default dealbreakers
- Query failure → throws
- Save/upsert success
- Save failure → throws
- Clear/reset success
- Wrong-user access is prevented by RLS migration design

### BATCH BEHAVIOR

One rules object may evaluate multiple jobs without additional storage calls.

### SETTINGS VALIDATION

- Invalid salary
- Empty allowed selections
- Supported arrangement values
- Supported employment values

---

## MANUAL QA DOCUMENT

Create: `MANUAL_TESTS_DEALBREAKERS.md`

Include at minimum:

- DB migration/application status
- Settings initial empty state
- Save salary floor
- Save salary disclosure rule
- Save arrangements
- Save employment types
- Refresh persistence
- Logout/login account isolation
- Different user cannot see settings
- Explore List conflict badge
- Explore List no per-card rules fetch
- Saved signal
- Job Detail full findings
- Known conflict
- Unknown salary
- Salary range overlaps floor
- Salary undisclosed
- Work arrangement conflict
- Employment type conflict
- Multiple conflicts
- Clear result
- Inactive rules
- Storage failure behavior
- Save failure/retry
- Clear all
- Match percentage unchanged before/after enabling a dealbreaker
- Apply still works with conflict
- Save still works with conflict
- Discover unchanged
- Deck unchanged
- Compare unchanged
- Mobile layout
- Keyboard navigation
- Screen-reader labels
- Console errors
- Network request count

**DO NOT claim manual tests executed.**

---

## IMPLEMENTATION ORDER

Use this internal order:

1. Inspect actual job/type/storage conventions
2. Pure dealbreaker types + evaluator
3. Evaluator tests
4. Draft additive migration
5. Storage layer + tests
6. Settings UI
7. Display components
8. Explore List integration
9. Saved integration
10. Job Detail integration
11. Manual QA document
12. Regression review
13. Quality gates
14. Feature-branch commit(s)
15. Vercel preview/build verification
16. Final report

**Do not stop for approval between normal internal implementation steps.**

Only stop for a genuine conflict with the authorization.

---

## DEPENDENCIES

Use the existing stack.

**Do not add a dependency unless absolutely necessary.**

E3 should not need one.

**Do not upgrade**:
- Next
- React
- Supabase
- Zustand
- Tailwind
- Framer Motion

during E3.

---

## PRE-COMMIT DAMAGE AUDIT

Before committing implementation:

```bash
git status --short
git diff --stat
git diff --name-status
git diff --check
```

Use the documentation commit SHA as `BASE_SHA`.

Then run:

```bash
git diff --diff-filter=D --name-status BASE_SHA...HEAD
```

**Expected: NO DELETED EXISTING FILES**

Run:

```bash
git diff --summary BASE_SHA...HEAD
```

Review every rename.

**Expected: NO UNEXPECTED RENAMES**

Also explicitly confirm **no changes to**:
- `components/explore/opportunity-deck.tsx`
- `components/explore/opportunity-swipe-card.tsx`
- `app/compare/page.tsx`
- `components/compare/`
- `lib/compare/`
- `store/compare-store.ts`
- `hooks/use-compare-hydration.ts`
- `lib/matching/`
- Phase 11 AI files
- Auth files
- Existing migration files

---

## MIGRATION REVIEW

If an E3 migration file was created:

Inspect it manually before committing.

### Verify

- CREATE only for new E3 table
- No existing table drop
- No existing column drop
- RLS enabled
- Owner-only policies
- `auth.uid()`
- No public read
- No service role
- No migration rewrites

**Do NOT apply remotely.**

---

## FEATURE BRANCH COMMITS

Prefer logical commits if clean.

For example:
- `feat: add deterministic dealbreaker engine`
- `feat: add dealbreaker settings and job signals`

A single clean E3 implementation commit is also acceptable if the diff remains easy to audit.

Push only: `feature/e3-dealbreaker-engine`

**DO NOT merge.**

**DO NOT push implementation to main.**

---

## VERCEL

Verify build/deployment status for the exact feature-branch implementation SHA if Vercel produces a preview deployment.

Report:
- SUCCESS
- FAILURE
- NOT AVAILABLE

**Do not fabricate success.**

Because the new database migration is intentionally NOT remotely applied, **do not claim real persistence runtime verification**.

---

## FINAL STATUS

Claude Code's E3 status may only be:

**E3 IMPLEMENTED ON FEATURE BRANCH — PENDING INDEPENDENT REVIEW**

or:

**E3 BLOCKED**

**DO NOT mark**:
- APPROVED
- FROZEN
- PRODUCTION VERIFIED

---

**End of E3 Dealbreaker Engine Specification**
