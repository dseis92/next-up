NextUp — Claude Code Project Instructions

IMPORTANT: READ THIS FILE BEFORE MAKING CHANGES

You are continuing development of an existing application called NextUp.

This repository already contains substantial completed work.

Do not rebuild the project from scratch.
Do not redesign working screens without a concrete product reason.
Do not skip development phases.
Do not assume documentation is more authoritative than the repository.

The repository is the source of truth.

FRAMEWORK / STACK

Current stack:

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

Do not assume older Next.js conventions are correct.

Before making framework-sensitive changes involving routing, Server Components, Client Components, cookies, redirects, route handlers, caching, authentication, proxy/middleware, or rendering behavior, consult:

node_modules/next/dist/docs/

Follow the conventions for the installed Next.js version.

PROJECT

Name

NextUp

Tagline

Find what's next.

Core Product Principle

Job searching should feel like discovering opportunities, not digging through listings.

NextUp is a modern, mobile-first career discovery and job-search platform intended to grow into a Career Operating System.

Core lifecycle:

Discover → Match → Save → Apply → Follow Up → Interview → Offer → Hired → Grow → Advance → Discover Again

The product should optimize around the person, not merely around a database of job listings.

Long-term product question:

What should I do next with my career?

PRODUCT EXPERIENCE

NextUp blends inspiration from:

Hinge / Tinder for opportunity discovery

Spotify for personalized discovery

Duolingo for progress and motivation

Linear for clarity and polish

modern consumer products rather than legacy recruiting software

The existing design is strong and should be preserved.

Existing Visual Identity

dark charcoal / near-black UI

electric lime / chartreuse primary accent

warm supporting accent

premium consumer-app feel

mobile-first layout

large salary hierarchy

circular match visualization

controlled rounded cards

strong typography hierarchy

subtle motion

five-item mobile bottom navigation

Do NOT

redesign the product into generic SaaS

introduce generic blue/purple startup gradients

convert screens into corporate dashboards

overuse rounded cards

replace the established design system

add a sixth bottom navigation tab

redesign Discover without a concrete usability reason

turn Applications into another discovery screen

The existing Discover experience is one of the product's signature surfaces. Preserve it.

SOURCE OF TRUTH

Before implementation work:

git pull origin main
git status --short
git log --oneline -10
npm install

Inspect the repository before modifying anything.

If the repository has advanced beyond the checkpoint documented here, inspect the newer commits before continuing.

CURRENT APPROVED CHECKPOINT

Phase 8.2 is complete.

Phase 9 is complete and independently approved.

Approved Phase 9 checkpoint:

7cecc4741600b0a1cda49b84763814e40a9ce2ec
Phase 9: Finalize matching engine audit fixes

Verify with:

git log -1 --oneline

COMPLETED PRODUCT WORK

Phases 1–4 — Core Product Flow

Implemented:

Discover progression

Pass

Undo

Save

Apply

Applications tracker

application detail

application stages

application timeline

application notes

next-action tracking

Do not rebuild these systems from scratch.

Phase 5 — Onboarding

A mobile-first 10-step onboarding flow exists:

Goals

Current Career

Experience

Skills

Target Roles

Salary

Work Preferences

Location

Priorities

Review

Onboarding uses controlled step-boundary persistence.

Do not reintroduce autosave-on-every-keystroke behavior.

Future improvements to occupation taxonomy, skill taxonomy, O*NET, location autocomplete, geocoding, and job-market intelligence remain deferred.

Phase 6 — Dynamic Profile

Profile data is derived from persisted onboarding/user data.

Do not reintroduce hard-coded demo identity as a source of truth.

Phase 7 — Authentication

Authentication exists for signup, login, logout, forgot password, password recovery, reset password, protected routes, onboarding routing, and SSR auth callback.

Password recovery has been manually verified end-to-end.

Do not modify auth during Phase 10 unless a direct integration regression proves a real auth issue.

Phase 8 / 8.1 / 8.2 — Supabase Persistence + Stabilization

Current tables include:

profiles

onboarding_progress

user_goals

user_preferences

preferred_locations

target_roles

skills

user_skills

work_experiences

companies

jobs

saved_jobs

passed_jobs

applications

application_events

application_notes

RLS is active.

Final authenticated RLS verification:

Total tests: 22
Passed: 22
Failed: 0
Errors: 0

Do not weaken RLS.

CURRENT MIGRATIONS

20260906000000_initial_schema.sql
20260906000001_seed_mock_data.sql
20260906000002_add_delete_policies.sql
20260906000003_tighten_application_rls.sql
20260906000004_auto_create_profile.sql
20260906000005_add_passed_jobs_update_policy.sql

Phase 10 should require no database migration.

If you believe a schema change is required, STOP and explain why. Do not add a migration without explicit approval.

PHASE 9 — DETERMINISTIC MATCHING ENGINE — COMPLETE

The Phase 9 engine is an approved foundational system.

Primary public API:

calculateJobMatch(profile, job)

Matching engine location:

lib/matching/

Core files include:

lib/matching/index.ts
lib/matching/types.ts
lib/matching/weights.ts
lib/matching/skill-aliases.ts
lib/matching/reasons.ts
lib/matching/calculate-job-match.ts
lib/matching/**tests**/calculate-job-match.test.ts

The engine is deterministic, synchronous, pure, bounded, explainable, independent of Supabase, independent of React, independent of AI, and independent of network calls.

PHASE 9 FUNDAMENTAL RULE

Data + deterministic matching decide facts. AI may later explain, coach, recommend, and help act.

AI must never invent or override the deterministic match score.

APPROVED PHASE 9 MATCH RESULT

The engine returns structured information including:

status

overallScore

qualificationScore

lifestyleScore

component breakdown

matched skills

missing skills

hard failures

fit reasons

concern reasons

missing-profile fields where applicable

For incomplete profiles:

status = incomplete_profile
overallScore = null

Do not convert incomplete profiles into 0%.

APPROVED PHASE 9 WEIGHTS

Skills 25
Experience 20
Salary 15
Location 10
Work Arrangement 10
Career Goals 10
Seniority 5
User Priorities 5
\---
Total 100

Qualification components:

Skills

Experience

Seniority

Career Goals

Lifestyle components:

Salary

Location

Work Arrangement

User Priorities

Do not add a second scoring formula in Phase 10.

APPROVED HARD FAILURES

The Phase 9 engine can produce structured hard failures including:

salary below absolute minimum

exclusive work-arrangement conflict

conservative relocation conflict

Phase 10 must display these appropriately. Do not re-implement their logic.

APPROVED TRANSFERABILITY

Phase 9 includes small deterministic transfer paths including:

Tower Foreman → Project Engineer
Field Supervisor → Assistant Project Manager
Crew Lead → Operations Manager

Transferability affects qualification/experience and can produce a deterministic fit reason.

Do not reimplement transferability in page code.

APPROVED PRIORITY SEMANTICS

Current measurable priority dimensions:

salary

location

remoteFlexibility

careerGrowth

Current unsupported priority dimensions:

learning

culture

mission

benefits

stability

workLifeBalance

Remote-flexibility evidence:

remote = 100
hybrid = 60
onsite = 20

Do not recreate this logic in the UI.

CURRENT PHASE

PHASE 10 — DETERMINISTIC MATCHING INTEGRATION

This is the ONLY product implementation phase authorized right now.

Phase 10 goal:

Integrate the approved Phase 9 deterministic matching result throughout NextUp.

Do not begin Phase 11.
Do not begin AI.
Do not begin O*NET.
Do not begin geocoding.
Do not begin resume parsing.
Do not redesign Discover.

PHASE 10 CORE INVARIANT

SAME USER +
SAME JOB
=

SAME MATCH RESULT
EVERYWHERE

Discover must not calculate one score.
Explore must not calculate another.
Saved must not calculate another.
Job Detail must not calculate another.
Applications must not calculate another.

There is one matching engine:

calculateJobMatch()

All surfaces consume it.

PHASE 10 ARCHITECTURE

Target conceptual pipeline:

PERSISTED USER DATA
↓
CANONICAL PROFILE ADAPTER
↓
MatchProfile

APP JOB DATA
↓
CANONICAL JOB ADAPTER
↓
MatchJob

MatchProfile + MatchJob
↓
calculateJobMatch()
↓
MatchResult
↓
ALL UI SURFACES

Do not manually construct matching inputs separately per page.

CANONICAL PROFILE ADAPTER

Create one canonical transformation from persisted authenticated user state into MatchProfile.

Expected mappings:

current title → currentRole
years experience → yearsExperience
industry → industry
goals → goals
target roles → targetRoles
skills → skills
work experiences → experiences
salary minimum → salaryMin
salary ideal → salaryIdeal
work arrangement preferences → workPreferences
current location → location
preferred locations → preferredLocations
relocation willingness → willingToRelocate
max commute → maxCommute
priorities → priorities

Use actual persisted values.

Do not invent defaults that make incomplete profiles appear complete.

CANONICAL JOB ADAPTER

Create one canonical transformation from the application's existing Job model into Phase 9 MatchJob.

Map:

id

title

description

requirements

responsibilities

work arrangement

employment type

experience level

salary minimum

salary maximum

salary period

location

company name

company industry

Do not mutate original Job objects.
Do not adapt jobs differently on different pages.

IMPORTANT TYPE BOUNDARY

Keep this separation:

application domain type
→ adapter
→ matching input

Do not replace every app Job with MatchJob.
Do not create circular dependencies.
Do not create a third competing match-result type.

For new Phase 10 work, Phase 9 MatchResult is the scoring source of truth.

CANONICAL MATCHING ORCHESTRATION

Create a small reusable integration API.

Acceptable concepts include:

buildMatchProfile(...)
adaptJobForMatching(...)
calculateMatchForJob(...)

Integration helpers may hydrate, adapt, orchestrate, or memoize safely.

They must NOT introduce a second scoring formula, override match results, invent page-specific scoring, or use AI.

PROFILE DATA LOADING

Load the user's matching data efficiently.

Do NOT do this per job card:

fetch profile
fetch skills
fetch goals
fetch preferences

Preferred flow:

page / feature
→ load user matching data once
→ build MatchProfile once
→ calculate locally for all jobs

For a list of jobs:

jobs.map((job) => calculateJobMatch(matchProfile, adaptJobForMatching(job)))

Do not persist match results in Phase 10.

NO MATCH CACHE TABLE

Do not add:

job_matches

match_results

match_cache

persisted calculated scores

A profile change should naturally update future calculations.

PROFILE CHANGES MUST UPDATE SCORES

Examples:

add relevant skill → score may change
change salary minimum → salary compatibility may change
change target role → career goals may change
change work preference → work arrangement / priorities may change
change relocation willingness → location / hard failures may change

Do not permanently cache stale results.

INCOMPLETE PROFILE RULE

If Phase 9 returns:

status = incomplete_profile

Phase 10 must show no fake percentage.

Use consistent consumer language:

Finish your profile to see your match

Where appropriate, provide a subtle existing-style CTA to /profile or /onboarding.

MATCH DISPLAY RULE

When status = scored, the primary percentage is:

overallScore

Do not substitute qualification or lifestyle for the main score.

COMPACT VS DETAIL HIERARCHY

Compact card:

overall match only

Job Detail:

overall match

qualification score

lifestyle score

fit reasons

concerns

matched skills

missing skills

hard failures

Applications:

overall match as secondary context only

Do not overload compact discovery cards.

DISCOVER INTEGRATION

Discover is a signature experience.

DO NOT redesign it.

Find the existing match circle/badge/ring and replace hard-coded/demo/static scoring with:

MatchResult.overallScore

Requirements:

use authenticated user's actual persisted profile

use actual job data

use approved Phase 9 engine

no local scoring logic

no mock fallback score

support incomplete profile state

pass unchanged

undo unchanged

save unchanged

apply unchanged

animation unchanged

progression unchanged

EXPLORE INTEGRATION

Explore must use the same exact result.

If Discover says 87% for a user/job pair, Explore must also say 87%.

Preserve filtering, search, layout, and interactions.

SAVED INTEGRATION

Saved jobs should show current personalized match results.

The score is NOT frozen when the job is saved.

If the user's profile changes, Saved should recalculate.

Preserve save/unsave behavior.

JOB DETAIL INTEGRATION

Job Detail should be the richest Phase 10 match surface.

Use the same MatchResult.

Where appropriate, display:

overall score

qualification score

lifestyle score

reasonsFit

reasonsConcern

matchedSkills

missingSkills

hardFailures

Do not show raw implementation metadata such as transferabilityBonus, matchRatio, or confidence values unless deliberately designed.

HARD FAILURE PRESENTATION

Hard failures are guidance, not bans.

Do not hide them.
Do not show internal codes.
Do not block Apply solely because a hard failure exists.

Use clear consumer language.

FIT / CONCERN REASONS

Use:

reasonsFit
reasonsConcern

Do not regenerate explanations in React components.
Do not create page-specific interpretations.

SKILL PRESENTATION

Use:

matchedSkills
missingSkills

Apply display formatting only.
Do not alter the underlying matching result.

APPLICATIONS INTEGRATION

Applications remains primarily an application-management experience.

Show matching context only where it adds value.

Do not let match information overwhelm:

stage

next action

timeline

notes

Application match is current-state matching. Do not persist historical match scores during Phase 10.

MATCH DISPLAY COMPONENTS

Audit existing match visual components.

A small shared display primitive may be created if it reduces drift.

Possible concepts:

MatchBadge
MatchRing
MatchScore

Display components must not calculate the match.

PRESENTATION TIERS

If the product already has match colors/labels, reuse them.

Presentation tiers may be centralized as UI-only mapping.

Do not change numeric MatchResult values.

LOADING STATE

Do not render mock scores while actual profile data loads.

Avoid flicker such as:

95% → loading → 78%

Use existing skeleton/loading patterns.

ERROR STATE

Differentiate:

profile incomplete

from:

profile failed to load

If profile hydration fails:

do not fake a score

do not expose raw Supabase errors

use existing app error conventions

AUTH / RLS SAFETY

Only authenticated user profile data may be used for personalized matching.

Do not:

add service-role access

weaken RLS

change Phase 8.2 policies

rewrite auth flow

SERVER / CLIENT BOUNDARY

The matching engine is pure and can run server-side or client-side.

Choose the integration point that best fits the existing architecture.

Prioritize:

no N+1 profile requests

no hydration mismatch

responsive interactions

maintainability

Do not perform a broad Server Component / Client Component rewrite.

TANSTACK QUERY / ZUSTAND

Inspect actual current usage before adding state.

Do not introduce a parallel state architecture solely for matching.
Do not perform an unrelated state-management refactor.

ACCESSIBILITY

Match visualizations must have accessible text.

Examples:

aria-label="87% job match"

Incomplete profile:

aria-label="Complete your profile to calculate job match"

Do not rely on color alone.

RESPONSIVE DESIGN

Preserve mobile-first behavior.

New matching UI must not cause horizontal scrolling, card overflow, cramped buttons, broken mobile layouts, or unreadable detail sections.

Check mobile and desktop.

MOCK SCORE CLEANUP

Search the repository for old prototype/demo scores.

Potential patterns include:

match
match_score
matchScore
matchPercentage
overall_score
qualification_score
lifestyle_score
JobMatch
85
87
90
92
95

Do not mechanically remove every numeric literal.
Understand context.

The fallback for missing personalized data is the incomplete-profile state, not a demo score.

LEGACY JOBMATCH TYPE

The general domain types may still contain an older JobMatch interface.

Audit actual usage.

Do not delete it blindly.

For Phase 10 scoring, Phase 9 MatchResult remains the source of truth.

PHASE 10 TEST REQUIREMENTS

Phase 10 tests are mandatory.

At minimum cover:

profile adapter maps current title

profile adapter maps years experience

profile adapter maps skills/proficiency

profile adapter maps work experiences

profile adapter maps goals

profile adapter maps target roles

profile adapter maps salary minimum

profile adapter maps salary ideal

profile adapter maps work arrangements

profile adapter maps current location

profile adapter maps preferred locations

profile adapter maps relocation willingness

profile adapter maps priorities

job adapter maps company

job adapter maps industry

job adapter maps title

job adapter maps description

job adapter maps requirements

job adapter maps responsibilities

job adapter maps work arrangement

job adapter maps employment type

job adapter maps experience level

job adapter maps salary fields

job adapter maps salary period

job adapter maps location

adapters do not mutate inputs

incomplete profile remains incomplete

incomplete profile does not become zero score

same user/job returns same result repeatedly

profile skill change updates score/result

salary preference change updates score/result

work preference change updates score/result

target role change updates score/result

saved job calculation uses current profile

canonical integration helper returns Phase 9 MatchResult

representative job receives same result through all shared integration paths

no page-specific scoring logic exists in tested helpers

Add more tests if implementation details justify them.

CROSS-SURFACE CONSISTENCY TEST

For one fixed profile and one fixed job, Discover, Explore, Saved, Job Detail, and Applications must resolve to the same deterministic result.

The same user/job pair must not drift by page.

PROFILE-CHANGE TEST

Use deterministic local fixtures.

Create Profile A, calculate match, then create Profile B with one meaningful relevant change and calculate again.

Assert the result changes appropriately.

Also test at least one preference change.

MANUAL BROWSER VERIFICATION

After automated tests pass, manually verify the real app with an authenticated user.

Discover

real personalized score visible

pass works

undo works

save works

apply works

progression works

no hard-coded old percentage

Explore

same job = same score as Discover

filters work

search works

Saved

current score visible

score recalculates from current profile

unsave works

Job Detail

overall score

qualification score

lifestyle score

fit reasons

concerns

matched skills

missing skills

hard failure presentation

save/apply still work

Applications

stage management unchanged

notes unchanged

next action unchanged

match context remains secondary

Incomplete Profile

Show:

Finish your profile to see your match

No fake percentage.

MANUAL CROSS-SURFACE CHECK

Choose one real job ID and record:

Job ID:
Discover score:
Explore score:
Saved score:
Job Detail score:
Applications score:

They must match for the same user.

Do not claim this was verified unless it actually was.

MANUAL PROFILE-CHANGE CHECK

For a real test account:

record one job's score

change one relevant profile field

revisit/reload the job

confirm score changes

restore original data when appropriate

Do not corrupt production-like data.

PERFORMANCE CHECK

Inspect network behavior.

For a list page with many jobs, Phase 10 must not cause per-card profile hydration.

Report approximately:

profile-related requests per page load:
job-related requests per page load:

Expected architecture is roughly:

profile once
jobs once / normal existing pagination behavior
local deterministic matching per job

QUALITY GATE

Before Phase 10 is complete:

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

Review every changed file.

Do not commit:

.env.local

credentials

Supabase secrets

verification passwords

screenshots

debug logs

temporary scripts

generated junk

Expected commit message:

Phase 10: Integrate personalized matching throughout NextUp

Push to main.

VERCEL

After pushing, verify deployment status for the Phase 10 commit.

Phase 10 is not ready for review if Vercel is failing.

Report explicitly:

Vercel: SUCCESS

or:

Vercel: FAILURE

or:

Vercel: NOT VERIFIED

Do not fabricate deployment success.

PHASE 10 FINAL REPORT

When complete, report:

exact commit SHA

exact files created

exact files modified

profile adapter architecture

job adapter architecture

matching integration helper architecture

how user matching data is loaded

confirmation profile is not fetched once per job card

Discover integration

Explore integration

Saved integration

Job Detail integration

Applications integration

incomplete-profile behavior

loading behavior

error behavior

primary score presentation

qualification/lifestyle presentation

hard-failure presentation

matched/missing skill presentation

legacy/mock score code removed or retained, with explanation

new Phase 10 test count

Phase 9 matching test count

pre-existing test count

total test count

typecheck result

lint result

test result

build result

Vercel result

manual Discover result

manual Explore result

manual Saved result

manual Job Detail result

manual Applications result

cross-surface consistency job ID

Discover score

Explore score

Saved score

Job Detail score

Applications score if applicable

profile-change field used

score before

score after

confirmation test data restored if applicable

approximate profile-query behavior

approximate job-query behavior

confirmation no database migration

confirmation auth/RLS unchanged

confirmation no AI

confirmation no embeddings

confirmation Phase 11 was not started

STOP CONDITION

After adapters, deterministic matching integration, automated tests, manual browser verification, cross-surface verification, performance/network audit, quality gates, commit, push, Vercel verification, and final report:

STOP.

Do not begin another phase.

PHASE 11 — LOCKED

Do NOT begin:

AI job explanation

career coach

resume parsing

resume tailoring

interview coach

follow-up AI

O*NET taxonomy

geocoding

location provider integration

social features

employer tooling

Wait for independent Phase 10 audit and explicit approval.

FUTURE AI RULE

Deterministic systems decide facts. AI explains and helps the user act.

AI may later explain a match, coach the user, tailor resume wording, prepare interview answers, or suggest follow-up language.

AI must not invent experience, invent qualifications, fabricate match scores, override deterministic hard failures, auto-apply without confirmation, or auto-message employers without confirmation.

PRODUCT TRUST PRINCIPLES

Never:

invent experience

invent qualifications

invent salary

invent job requirements

fabricate match percentages

auto-apply without confirmation

auto-message employers without confirmation

expose private user data across accounts

weaken RLS for convenience

show stale persisted scores as though current

hide important match concerns

Matching should remain explainable and trustworthy.

PHASE 10 DEFINITION OF DONE

Phase 10 is successful when a real authenticated NextUp user can view the same job anywhere in the product and get one consistent personalized answer:

How well does this job fit me?

Across:

Discover
Explore
Saved
Job Detail
Applications

the answer must come from:

current persisted user data +
current job data +
approved Phase 9 deterministic engine

No mocks.
No AI.
No duplicate formulas.
No stale stored percentages.
No fake scores for incomplete profiles.
No per-card profile fetch explosion.

That is the Phase 10 standard.
