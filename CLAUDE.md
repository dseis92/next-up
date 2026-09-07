NextUp — Claude Code Project Instructions

IMPORTANT: READ THIS FILE BEFORE MAKING CHANGES

You are continuing development of an existing application called NextUp.

Do not rebuild the project from scratch.
Do not redesign working screens without a concrete reason.
Do not skip development gates.
Do not start a later phase because the current phase is partially implemented.
Do not trust summaries more than the repository.

The repository is the source of truth.

PROJECT

Name

NextUp

Tagline

Find what's next.

Core Product Principle

Job searching should feel like discovering opportunities, not digging through listings.

NextUp is a modern, mobile-first career discovery platform intended to grow into a Career Operating System.

Core lifecycle:

Discover → Match → Save → Apply → Follow Up → Interview → Offer → Hired → Grow → Advance → Discover Again

Long-term product question:

What should I do next with my career?

DESIGN / PRODUCT GUARDRAILS

Preserve the existing visual identity:

dark charcoal / near-black interface

electric lime / chartreuse primary accent

warm supporting accent

premium consumer-app feel

mobile-first behavior

strong typography hierarchy

subtle motion

five-item mobile bottom navigation

Do NOT:

redesign NextUp into generic SaaS

add generic blue/purple startup gradients

turn screens into corporate dashboards

over-cardify the UI

add a sixth bottom-nav item

redesign Discover without a real usability reason

make Applications into another discovery page

Discover is a signature surface. Preserve it.

STACK

Current stack includes:

Next.js 16.3.4

React 19.2.8

TypeScript 5

Tailwind CSS v4

Framer Motion 13.2

Lucide

React Hook Form

Zod

Zustand

TanStack Query

Supabase

Vitest

For framework-sensitive changes involving routing, Server/Client Components, cookies, redirects, route handlers, caching, auth, proxy/middleware, or rendering behavior, consult:

node_modules/next/dist/docs/

Do not rely on outdated Next.js conventions.

SOURCE-OF-TRUTH STARTUP CHECK

Before implementation work:

git pull origin main
git status --short
git log --oneline -10
npm install

Inspect the repository before modifying anything.

If HEAD is newer than the checkpoints documented here, inspect the newer commits first.

COMPLETED PHASES

Phases 1–4 — Core Product Flow

Implemented and stable.

Phase 5 — Onboarding

10-step onboarding exists and persists at controlled step boundaries.

Phase 6 — Dynamic Profile

Profile is driven by persisted user/onboarding data.

Phase 7 — Auth

Signup/login/logout/recovery/reset/protected-route flow exists.

Phase 8 / 8.1 / 8.2 — Supabase Persistence + RLS Stabilization

Complete.

Final authenticated RLS verification:

22 / 22 PASS

Do not weaken RLS.

Phase 9 — Deterministic Personalized Matching — COMPLETE + APPROVED

Approved checkpoint:

7cecc4741600b0a1cda49b84763814e40a9ce2ec
Phase 9: Finalize matching engine audit fixes

Primary scoring API:

calculateJobMatch(profile, job)

The Phase 9 engine is deterministic, pure, synchronous, testable, bounded, explainable, and independent of Supabase, React, AI, and network calls.

Foundational rule:

Data + deterministic matching decide facts. AI may later explain, coach, recommend, and help act.

Do not duplicate or override Phase 9 scoring.

CURRENT PHASE STATUS

PHASE 10 — DETERMINISTIC MATCHING INTEGRATION

Phase 10 implementation exists, but Phase 10 is NOT APPROVED yet.

Current implementation commit:

1a5e1ea69bf4e2823a15212ec027ea130498dece
Phase 10: Integrate personalized matching throughout NextUp

That commit is pushed to main and its Vercel deployment succeeded.

However, independent audit found real persistence/runtime integration defects.

The current task is:

PHASE 10 STABILIZATION

This is the ONLY authorized implementation work right now.

Do NOT start Phase 11.
Do NOT add AI.
Do NOT add O*NET.
Do NOT add geocoding.
Do NOT add resume parsing.
Do NOT redesign Discover.

PHASE 10 ARCHITECTURE — KEEP, DO NOT REBUILD

The architecture is directionally correct and should be stabilized, not discarded.

Existing concepts include:

lib/matching/adapters.ts
lib/matching/user-matching-data.ts
lib/matching/integration.ts
lib/storage/jobs.ts
components/jobs/incomplete-profile-message.tsx

Pipeline:

REAL PERSISTED USER DATA
→ CANONICAL USER MATCHING DATA
→ buildMatchProfile(...)
→ MatchProfile

APP JOB
→ adaptJobForMatching(...)
→ MatchJob

MatchProfile + MatchJob
→ calculateJobMatch(...)
→ MatchResult
→ ALL UI SURFACES

Keep this architecture.

Do not return to page-specific scoring logic.

PHASE 10 CORE INVARIANT

SAME USER +
SAME JOB
=

SAME MATCH RESULT
EVERYWHERE

Relevant surfaces:

Discover

Explore

Saved

Job Detail

Applications where matching context is actually shown

There is one scoring engine:

calculateJobMatch()

All surfaces consume that result.

AUTHORITATIVE PERSISTENCE SOURCES

The authoritative current persistence behavior is in:

supabase/migrations/20260906000000_initial_schema.sql
lib/storage/onboarding.ts

Current persisted sources:

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

Do not pretend these values live on different tables/types just because an application-domain type has similarly named properties.

STABILIZATION REQUIREMENTS

1. Canonical UserMatchingData must represent actual hydrated matching data

Refactor UserMatchingData away from stale/invented UserProfile / UserPreferences assumptions when those types do not match current persistence.

The canonical hydrated shape should contain actual matching concepts such as:

currentTitle

industry

yearsExperience

goals

targetRoles

skills

experiences

salaryMin

salaryIdeal

workPreferences

location

preferredLocations

maxCommute

willingToRelocate

priorities

Do not invent defaults that make an incomplete profile appear complete.

2. Correct target-role mapping

Current incorrect assumption:

target_roles.role_name

Actual column:

target_roles.role

Fix and test it.

3. Correct skill mapping

Current onboarding persists:

user_skills.skill_name
user_skills.proficiency

skill_id may be null.

skill_name is the canonical current persisted user skill name.

Never turn a valid persisted skill into "Unknown" merely because skill_id is null.

4. Correct matching-data loader

loadUserMatchingData() must hydrate from:

onboarding_progress

user_skills

work_experiences

user_preferences

user_goals

target_roles

preferred_locations

Use .maybeSingle() where missing rows are a valid incomplete-user state.

Parallelize independent reads when clean.

No per-job profile hydration.

5. Load error must differ from incomplete profile

These are separate states:

PROFILE INCOMPLETE

= successful hydration, missing required matching data.

PROFILE LOAD ERROR

= query/network/RLS/hydration failure.

Do not convert a real load error into status = "incomplete_profile".

Use a typed integration-layer error/result contract.

Do not expose raw Supabase errors in user-facing UI.

6. Remove duplicated empty MatchResult construction

integration.ts must not manually manufacture incomplete MatchResult objects with copied Phase 9 weights.

For successfully loaded but incomplete data:

build MatchProfile
→ calculateJobMatch()
→ Phase 9 returns incomplete_profile

For load failure:

typed integration error

7. Saved must never display fake 0%

Saved jobs should remain visible for incomplete users.

Show:

Finish your profile to see your match

Do not convert null to zero.

Refactor away from legacy numeric JobMatch where needed.

8. Job Detail must never manufacture zero scores

Prefer:

job
matchResult

as separate state.

Only create legacy numeric score data when result status is "scored".

Apply/save should depend on Job data, not fake match scores.

9. Discover / Explore incomplete state must be explicit

Do not silently filter all incomplete-profile results and make the user think there are no opportunities.

Show:

Finish your profile to see your match

with an appropriate CTA.

Do not redesign Discover.

TEST REQUIREMENTS

Tests must use actual persistence-shaped fixtures, not only synthetic application-domain fixtures.

At minimum prove:

onboarding_progress.current_title → currentRole

onboarding_progress.industry → industry

onboarding_progress.years_experience → yearsExperience

onboarding_progress.salary_min → salaryMin

onboarding_progress.salary_ideal → salaryIdeal

onboarding_progress.location → location

onboarding_progress.max_commute → maxCommute

onboarding_progress.willing_to_relocate → willingToRelocate

target_roles.role → targetRoles

preferred_locations.location → preferredLocations

user_skills.skill_name works with skill_id = null

user_preferences.priorities map correctly

missing onboarding row produces genuine incomplete profile

query/load failure is NOT treated as incomplete profile

incomplete profile remains incomplete

incomplete profile is never converted to 0%

relevant skill change updates result

salary preference change updates result

work preference change updates result

target role change updates result

saved-job matching uses current profile

same user/job gives identical result through canonical integration path

one hydrated profile + N jobs produces N MatchResults without per-job hydration

If useful, extract pure helpers such as:

calculateMatchFromUserData(userData, job)
calculateMatchesFromUserData(userData, jobs)

to make the integration layer directly testable without live Supabase.

RUNTIME / BROWSER VERIFICATION IS MANDATORY

The first Phase 10 report deferred real runtime verification.

That is not acceptable for approval.

After stabilization, verify with a real authenticated test user.

Discover

Verify:

real jobs load

personalized score appears

pass works

undo works

save works

apply works

progression works

no Supabase/PostgREST errors

Explore

Verify:

jobs load

search works

filters work

same job = same score as Discover

Saved

Verify:

saved jobs load

same score as other surfaces

incomplete user never sees 0%

unsave works

Job Detail

Verify:

job loads

overall score

qualification

lifestyle

fit reasons

concerns

matched skills

missing skills

save/apply works

Applications

Verify no regressions to:

stage changes

notes

next action

timeline

REAL CROSS-SURFACE CHECK

Choose one real persisted job ID.

Record:

Job ID:
Discover:
Explore:
Saved:
Job Detail:
Applications: if applicable

Do not provide hypothetical numbers.

REAL PROFILE-CHANGE CHECK

Using a safe test account:

record one job's score

change one relevant persisted profile field

revisit same job

confirm score changes

restore original value

Report:

field changed:
before:
after:
score before:
score after:
restored: yes/no

PERFORMANCE / QUERY CHECK

Inspect actual browser/network behavior.

Requirement:

NO matching-profile fetch per job card

Report the actual approximate number of matching-profile requests per page load.

If hydration makes multiple table requests once per page, report the real count.

Do not call several requests "one query."

NO MATCH RESULT PERSISTENCE

Do not add:

job_matches

match_results

match_cache

persisted calculated scores

Scores remain current-state calculations.

AUTH / RLS / SCHEMA SAFETY

Do not:

add service-role access

weaken RLS

rewrite auth

modify schema/migrations just to make Phase 10 pass

If a schema/auth/RLS change appears unavoidable:

STOP and explain before making it.

QUALITY GATE

Before Phase 10 stabilization can be reported complete:

npm run typecheck
npm run lint
npm run test
npm run build

Requirements:

typecheck: PASS
lint: 0 errors
tests: ALL PASS
build: PASS

Pre-existing warnings may remain only if genuinely pre-existing.

GIT RULES

Before committing:

git status --short
git diff

Do not commit:

.env.local

credentials

passwords

screenshots

debug logs

temporary scripts

generated junk

Expected stabilization commit:

Phase 10: Stabilize real matching data integration

Push to:

main

Then verify Vercel for the exact commit.

FINAL REPORT REQUIREMENTS

Report:

exact commit SHA

exact files changed

corrected persisted data sources

corrected target-role mapping

corrected skill-name mapping

load-error vs incomplete-profile architecture

Saved incomplete-profile behavior

Discover incomplete-profile behavior

Explore incomplete-profile behavior

Job Detail incomplete-profile behavior

persistence-shaped tests added

integration-helper tests added

profile-change tests added

Phase 9 matching test count

Phase 10 test count

total test count

typecheck

lint

tests

build

Vercel

real browser Discover result

real browser Explore result

real browser Saved result

real browser Job Detail result

real browser Applications regression result

real cross-surface job ID and scores

real profile-change before/after result

actual approximate matching-profile query count per page

browser console errors observed, if any

confirmation no schema migration

confirmation auth/RLS unchanged

confirmation no AI/embeddings/network scoring

confirmation Phase 11 was NOT started

STOP CONDITION

After stabilization, tests, runtime verification, cross-surface verification, profile-change verification, query inspection, quality gates, commit, push, Vercel verification, and final report:

STOP.

Do not begin Phase 11.

PHASE 11 — LOCKED

Do NOT begin:

AI job explanation

career coach

resume parsing

resume tailoring

interview coach

follow-up AI

O*NET

geocoding

location provider integration

social features

employer tooling

PRODUCT TRUST PRINCIPLES

Never:

invent experience

invent qualifications

invent salary

invent job requirements

fabricate match percentages

turn incomplete profile into 0%

hide data-load errors as profile incompleteness

auto-apply without confirmation

auto-message employers without confirmation

weaken RLS for convenience

expose private user data across accounts

persist stale match scores as current truth

Matching must remain deterministic, explainable, current, and trustworthy.

PHASE 10 STABILIZATION DEFINITION OF DONE

Phase 10 is ready for approval only when a real authenticated NextUp user can view the same real job across the product and receive one consistent personalized answer derived from:

actual persisted user data +
actual job data +
approved Phase 9 deterministic engine

with:

no schema mismatch

no mock scoring

no page-specific formulas

no stale persisted scores

no fake zero for incomplete users

no silent profile-load failure

no per-card profile-fetch explosion

successful real browser verification

Until then, Phase 10 remains in stabilization.
