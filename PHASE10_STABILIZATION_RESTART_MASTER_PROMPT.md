NextUp — Phase 10 Stabilization Restart Master Prompt

You are resuming an EXISTING Phase 10 implementation after a usage/session reset.

Do NOT restart the project.
Do NOT rebuild Phase 10 from scratch.
Do NOT start Phase 11.

Current checkpoint

Repository: dseis92/next-up
Branch: main

Approved Phase 9:

7cecc4741600b0a1cda49b84763814e40a9ce2ec
Phase 9: Finalize matching engine audit fixes

Current Phase 10 implementation:

1a5e1ea69bf4e2823a15212ec027ea130498dece
Phase 10: Integrate personalized matching throughout NextUp

Vercel for 1a5e1ea succeeded.

However:

PHASE 10 IS NOT APPROVED.

Independent audit found real persistence/runtime integration defects.

Your task is:

PHASE 10 STABILIZATION ONLY.

First — reestablish context

Read CLAUDE.md completely.

Run:

git pull origin main
git status --short
git log --oneline -10
npm install

Verify current state.

If HEAD is newer than 1a5e1ea, inspect newer commits and continue from the actual current tree. Do not reset valid work.

Inspect before editing:

lib/matching/adapters.ts
lib/matching/user-matching-data.ts
lib/matching/integration.ts
lib/matching/calculate-job-match.ts
lib/matching/types.ts
lib/matching/**tests**/
lib/storage/onboarding.ts
lib/storage/jobs.ts
types/index.ts
supabase/migrations/20260906000000_initial_schema.sql

app/discover/page.tsx
app/explore/page.tsx
app/saved/page.tsx
app/jobs/[id]/page.tsx
app/applications/
components/jobs/incomplete-profile-message.tsx

Preserve the architecture

Do not rebuild Phase 10.

Keep:

REAL PERSISTED USER DATA
→ canonical hydrated matching data
→ buildMatchProfile(...)
→ MatchProfile

APP JOB
→ adaptJobForMatching(...)
→ MatchJob

MatchProfile + MatchJob
→ calculateJobMatch(...)
→ MatchResult
→ UI

The problem is the persistence boundary, not the existence of adapters.

Do not create page-specific scoring.

Fix the real persistence mapping

Authoritative sources:

supabase/migrations/20260906000000_initial_schema.sql
lib/storage/onboarding.ts

Actual data lives in:

onboarding_progress

current_title

industry

years_experience

employment_status

location

max_commute

willing_to_relocate

salary_min

salary_ideal

completed

user_preferences

remote

hybrid

onsite

full_time

part_time

contract

travel_tolerance

priorities

preferred_locations

location

target_roles

role

user_skills

skill_name

proficiency

years

skill_id may be NULL

work_experiences

title

company

start_date

end_date

current

description

user_goals

goal

Refactor UserMatchingData to represent the actual hydrated matching data rather than stale application types.

Mandatory corrections

Target roles

Fix:

role_name

to:

role

Skills

Use user_skills.skill_name as the canonical current persisted skill name.

This row:

skill_id = null
skill_name = "Safety"
proficiency = "expert"

must hydrate correctly.

Never replace it with "Unknown".

Loader

loadUserMatchingData() must hydrate from:

onboarding_progress

user_skills

work_experiences

user_preferences

user_goals

target_roles

preferred_locations

Use .maybeSingle() where no row is a legitimate incomplete-user state.

Parallelize independent reads when clean.

No profile fetch per job.

Separate load error from incomplete profile

These are different:

successful load + missing fields
→ incomplete_profile

versus:

query/network/RLS failure
→ matching-data load error

Do not turn a load failure into incomplete_profile.

Use a typed integration result/error contract.

Do not expose raw Supabase errors to users.

Remove manufactured incomplete MatchResults

Do not manually create empty MatchResults with copied Phase 9 weights.

For successfully hydrated incomplete data:

buildMatchProfile()
→ calculateJobMatch()
→ let Phase 9 return incomplete_profile

For real load failure:

typed integration error

Fix incomplete-profile UI

Saved

Never show 0% match.

Keep saved jobs visible and show:

Finish your profile to see your match

or compact equivalent.

Job Detail

Do not create a fake zero-valued legacy JobMatch.

Keep job and matchResult separately.

Only create numeric compatibility structures for scored results.

Discover / Explore

Do not silently filter incomplete users into an empty-jobs state.

Show an explicit profile-completion message and CTA.

Do not redesign Discover.

Strengthen tests

Use real persistence-shaped fixtures.

Must prove:

onboarding_progress.current_title maps to currentRole

industry maps correctly

years_experience maps correctly

salary_min maps correctly

salary_ideal maps correctly

location maps correctly

max_commute maps correctly

willing_to_relocate maps correctly

target_roles.role maps correctly

preferred_locations.location maps correctly

user_skills.skill_name works with null skill_id

priorities map correctly

missing onboarding row yields genuine incomplete profile

load/query failure is not incomplete profile

incomplete profile is never converted to zero

skill change changes result

salary preference change changes result

work preference change changes result

target role change changes result

one hydrated user + N jobs returns N matches without per-job hydration

The prior integration tests that only called calculateJobMatch() twice are insufficient.

If useful, extract pure orchestration helpers such as:

calculateMatchFromUserData(userData, job)
calculateMatchesFromUserData(userData, jobs)

and test those directly.

Real browser/runtime verification is mandatory

Do not call Phase 10 complete without this.

Using an authenticated completed user, verify:

Discover

real jobs load

real score appears

pass

undo

save

apply

progression

no PostgREST/console errors

Explore

jobs load

search

filters

same job = same score as Discover

Saved

saved jobs load

same score

unsave

no fake 0% for incomplete profile

Job Detail

overall

qualification

lifestyle

fit reasons

concerns

skills

save/apply

Applications

stage

notes

next action

timeline

no regressions

Real cross-surface test

Choose one real persisted job ID and record:

Job ID:
Discover:
Explore:
Saved:
Job Detail:
Applications: if applicable

No hypothetical scores.

Real profile-change test

For a safe test user:

record score

change one relevant persisted field

reload same job

confirm score changes

restore field

Report:

field:
before:
after:
score before:
score after:
restored: yes/no

Performance check

Inspect real browser/network behavior.

Report the actual approximate number of matching-profile requests per page.

Requirement:

NO profile hydration per job card

If there are several table requests once per page, report the real count.

Quality gates

Run:

npm run typecheck
npm run lint
npm run test
npm run build

All must pass.

Commit

Before committing:

git status --short
git diff

Do not commit credentials, .env.local, screenshots, temporary scripts, logs, or junk.

Expected commit:

Phase 10: Stabilize real matching data integration

Push to main.

Verify Vercel for the exact new commit.

Final report

Report:

exact commit SHA

files changed

corrected persistence sources

target-role fix

skill-name fix

load-error vs incomplete architecture

Saved incomplete behavior

Discover incomplete behavior

Explore incomplete behavior

Job Detail incomplete behavior

persistence-shaped tests

integration-helper tests

profile-change tests

Phase 9 matching test count

Phase 10 test count

total test count

typecheck

lint

tests

build

Vercel

real Discover result

real Explore result

real Saved result

real Job Detail result

Applications regression result

real cross-surface job ID + scores

real profile-change result

actual matching-profile query count

browser console errors, if any

no schema migration confirmation

auth/RLS unchanged confirmation

no AI/embeddings confirmation

Phase 11 NOT started confirmation

Then STOP.

Do not pause again between blockers unless:

a schema migration is genuinely required

auth/RLS must change

an unavoidable architectural decision needs approval

an external provider blocks required verification

Otherwise continue:

fix → test → verify → commit → push → report → STOP

Begin Phase 10 stabilization now.
