# NextUp — Claude Code Project Instructions

## IMPORTANT: READ THIS FILE BEFORE MAKING CHANGES

You are continuing development of an existing application called NextUp.

This repository already contains substantial completed work.

Do not rebuild the project from scratch.
Do not redesign working screens.
Do not skip development phases.
Do not assume previous Claude summaries are correct without inspecting the repository.

The repository is the source of truth.

---

# FRAMEWORK RULE

This project currently uses:

- Next.js 16.3.4
- React 19.2.8
- TypeScript 5
- Tailwind CSS v4
- Supabase
- Vitest

Do not assume older Next.js conventions are correct.

Before making framework-sensitive changes involving:

- routing
- middleware / proxy
- cookies
- Server Components
- Server Actions
- authentication
- rendering behavior
- redirects
- route handlers

consult the documentation installed with the exact Next.js version under:

node_modules/next/dist/docs/

Follow the conventions appropriate for the installed version.

Do not rewrite working framework infrastructure merely because a newer or
different pattern exists unless the current implementation is actually
incorrect or incompatible.

---

# PROJECT

## Name

NextUp

## Tagline

Find what's next.

## Product Vision

NextUp is a modern, mobile-first career discovery and job-search platform.

The central product principle is:

Job searching should feel like discovering opportunities, not digging through listings.

NextUp is intended to grow into a Career Operating System that helps users
navigate the entire career lifecycle:

Discover
→ Match
→ Save
→ Apply
→ Follow Up
→ Interview
→ Offer
→ Hired
→ Grow
→ Advance
→ Discover Again

NextUp should optimize around the person, not merely around a database of job listings.

---

# PRODUCT EXPERIENCE

The product combines ideas inspired by:

- Hinge / Tinder for opportunity discovery
- Spotify for personalized discovery
- Duolingo for progress and motivation
- Linear for polish and clarity
- modern consumer apps rather than recruiting software

The existing product design is already strong and must be preserved.

## Existing Visual Identity

- dark charcoal / near-black interface
- electric lime / chartreuse primary accent
- warm supporting accent
- premium consumer-app feel
- mobile-first layout
- large salary hierarchy
- circular match visualization
- rounded but controlled card design
- strong typography hierarchy
- subtle motion
- five-item mobile bottom navigation

Do NOT:

- redesign the product into generic SaaS
- introduce generic blue/purple startup gradients
- convert screens into corporate dashboards
- overuse rounded container cards
- replace the established design system
- add a sixth Saved tab to mobile navigation
- redesign Discover without a concrete usability reason

The existing Discover screen is one of the product's signature experiences.

Preserve it.

---

# SOURCE OF TRUTH

Before doing any implementation work, run:

git pull origin main
git status
git log --oneline -10
npm install

Inspect the repository before modifying anything.

The repository is always more authoritative than this document if there is a
difference.

Do not assume commit references written here are necessarily the current HEAD.

Documentation-only commits may exist after the implementation checkpoint below.

---

# CURRENT IMPLEMENTATION CHECKPOINT

The latest completed application implementation milestone before Phase 8.2 is:

c9c9e85
Phase 8.1: Stabilize Supabase persistence and auth flows

There may be newer documentation or instruction-only commits after c9c9e85.

That is expected.

Phase 8.2 application implementation has NOT been completed yet.

Verify this with:

git log --oneline -10

before starting.

---

# COMPLETED WORK

The following product phases are already substantially implemented.

## Phases 1–4 — Core Product Flow

Implemented:

- Discover final-card progression
- Pass
- Undo
- Save
- real application creation
- Applications tracker
- application detail
- application stages
- application timeline
- notes
- next-action tracking

Do not rebuild these systems from scratch.

---

## Phase 5 — Onboarding

A mobile-first 10-step onboarding experience exists.

Current steps include:

1. Goals
2. Current Career
3. Experience
4. Skills
5. Target Roles
6. Salary
7. Work Preferences
8. Location
9. Priorities
10. Review

Onboarding currently works with a limited prototype dataset.

Future improvements to skills, occupations, career taxonomy, location
autocomplete and job-market intelligence are intentionally deferred until the
core matching foundation is stable.

Do not expand onboarding scope during Phase 8.2.

---

## Phase 6 — Dynamic Profile

Profile data is derived from onboarding/user data rather than a hard-coded
demo identity.

The profile includes a dynamic profile-strength calculation.

Do not reintroduce hard-coded user data as a source of truth.

---

## Phase 7 — Supabase Authentication

Authentication infrastructure exists for:

- signup
- login
- logout
- forgot password
- reset password UI
- protected routes
- session handling
- onboarding routing

Phase 8.2 must finalize and verify the SSR confirmation/recovery callback flow.

---

## Phase 8 — Supabase Persistence + RLS

Supabase persistence exists for major user data.

The current database architecture includes tables for:

- profiles
- onboarding_progress
- user_goals
- user_preferences
- preferred_locations
- target_roles
- skills
- user_skills
- work_experiences
- companies
- jobs
- saved_jobs
- passed_jobs
- applications
- application_events
- application_notes

Row Level Security is implemented and must be verified, not merely assumed.

---

## Phase 8.1 — Stabilization

Phase 8.1 addressed several issues including:

- invalid UUIDs in seed data
- mismatched frontend/database job IDs
- Supabase write error handling
- saved job conflict targets
- passed job conflict targets
- stronger application RLS
- signup confirmation-state handling
- reset-password UI
- onboarding enforcement
- database scripts
- Vitest infrastructure
- removal of unnecessary Vercel runtime dependency

The implementation commit is:

c9c9e85

Phase 8.1 was audited afterward and several remaining blockers were discovered.

Those blockers define Phase 8.2.

---

# SUPABASE PROJECT STATE

The developer has already linked the local repository to the intended Supabase
project using the Supabase CLI.

Do not require them to relink unless the existing link is invalid.

IMPORTANT:

The migration chain has intentionally NOT been approved for remote push yet.

The developer previously ran:

npm run db:push

but did NOT approve the migration push because a known migration issue remained.

Do not push migrations to the production/main Supabase database until the
Phase 8.2 migration chain has been corrected and verified.

Never place secrets into:

- CLAUDE.md
- README.md
- source files
- Git commits
- console output intended for documentation

Do not reintroduce SUPABASE_SERVICE_ROLE_KEY unless the application genuinely
requires privileged server-side operations.

The current architecture is intended to work without it.

---

# IMMEDIATE DEVELOPMENT TASK

# PHASE 8.2 — FINAL SUPABASE / AUTH STABILIZATION

This is the ONLY implementation phase you should perform right now.

DO NOT begin Phase 9 during this session unless the developer explicitly
returns after the Phase 8.2 audit and instructs you to proceed.

Complete Phase 8.2.

Commit it.

Push it.

Report the results.

Then STOP.

---

# PHASE 8.2 — FIRST STEP

Before editing anything, inspect at minimum:

supabase/migrations/20260906000000_initial_schema.sql
supabase/migrations/20260906000001_seed_mock_data.sql
supabase/migrations/20260906000002_add_delete_policies.sql
supabase/migrations/20260906000003_tighten_application_rls.sql
supabase/migrations/20260906000004_auto_create_profile.sql

lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/middleware.ts
middleware.ts

lib/storage/job-actions.ts
lib/storage/applications.ts
lib/storage/onboarding.ts
lib/storage/profile.ts

app/signup/page.tsx
app/login/page.tsx
app/forgot-password/page.tsx
app/reset-password/page.tsx

package.json
.env.example
README.md

Also search the repository for:

.upsert(
exchangeCodeForSession
verifyOtp
resetPasswordForEmail
emailRedirectTo
redirectTo
SUPABASE_SERVICE_ROLE_KEY

Do not blindly apply the notes below.

Verify each issue against the current repository first.

---

# PHASE 8.2 ISSUE 1 — MIGRATION CHAIN

The previous audit found that:

20260906000000_initial_schema.sql

already creates a DELETE policy approximately named:

Users can delete own goals

and:

20260906000002_add_delete_policies.sql

attempts to create the same policy again.

That can make a clean migration chain fail.

Fix this correctly.

The final migration chain must be able to initialize from an empty database.

Use safe SQL/migration practices.

Possible approaches include:

DROP POLICY IF EXISTS ...

before recreating a policy, or removing redundant creation where doing so is
safe for the current migration history.

Be careful about editing historical migrations if an additive corrective
migration would be safer for already-deployed environments.

The important requirement is:

npm run db:reset

must succeed from a clean local Supabase database when the environment supports
local Supabase.

Do not consider a migration verified merely because a partially migrated
database accepts it.

---

# PHASE 8.2 ISSUE 2 — UPSERT CONFLICT TARGETS

The previous audit found that:

saveOnboardingData()

still contained upserts without explicit conflict targets for:

onboarding_progress
user_preferences

Both tables use UNIQUE(user_id) while also having generated primary keys.

The expected behavior is conceptually:

.upsert(data, {
onConflict: "user_id"
})

Audit EVERY .upsert() in the repository.

Expected conflict targets currently include:

saved_jobs
→ user_id,job_id

passed_jobs
→ user_id,job_id

onboarding_progress
→ user_id

user_preferences
→ user_id

Do not assume the list is complete.

Inspect the real constraints.

Repeated operations must be idempotent.

Required behavior:

save the same job twice
→ no duplicate

pass the same job twice
→ no duplicate

apply to the same job twice
→ no duplicate application

save onboarding twice
→ update existing onboarding row

save preferences twice
→ update existing preferences row

No uncontrolled unique constraint errors should occur.

---

# PHASE 8.2 ISSUE 3 — SUPABASE SSR AUTH CALLBACK

The application uses:

@supabase/ssr

The previous audit found no proper server-side auth callback implementation for
the email-confirmation and password-recovery flow.

The reset-password page currently expects a valid session to already exist.

That is not sufficient if the email link arrives with an auth code/token that
still needs to be exchanged.

Implement the proper Supabase SSR auth callback flow for the currently installed
Supabase libraries.

Use the official supported flow.

Do not invent a custom authentication mechanism.

Likely route:

app/auth/callback/route.ts

or the correct equivalent for the installed framework/library versions.

For PKCE/code-based flow, use the appropriate:

supabase.auth.exchangeCodeForSession(code)

If the project's email templates use token hashes, use the correct:

verifyOtp(...)

flow.

Inspect the current Supabase documentation and installed library behavior before
choosing the implementation.

---

# REQUIRED SIGNUP FLOW

When email confirmation is ENABLED:

Signup
→ account created
→ user sees Check Your Email
→ confirmation email
→ NextUp auth callback
→ auth code/token processed
→ cookie-backed session established
→ onboarding

When email confirmation is DISABLED:

Signup
→ session returned immediately
→ onboarding

Both paths must be supported.

The user's name/profile metadata should remain intact.

---

# REQUIRED PASSWORD RECOVERY FLOW

Forgot Password
→ resetPasswordForEmail()
→ recovery email
→ NextUp auth callback
→ auth code/token processed
→ valid recovery session established
→ /reset-password
→ user enters new password
→ auth.updateUser()
→ success
→ login

Do NOT assume that simply navigating to:

/reset-password

means the recovery session already exists.

Handle invalid and expired recovery links cleanly.

Do not expose technical Supabase errors directly to normal users.

---

# AUTH CALLBACK SECURITY

Any callback redirect/next parameter must be handled safely.

Do not create an open redirect vulnerability.

Only allow internal application paths or explicitly trusted origins.

Avoid blindly redirecting to arbitrary user-provided URLs.

The expected signup destination is generally:

/onboarding

The expected recovery destination is generally:

/reset-password

unless the existing architecture requires an equivalent safe route.

---

# PHASE 8.2 ISSUE 4 — PROFILE CREATION TRIGGER

Audit:

20260906000004_auto_create_profile.sql

The database trigger automatically creates a profile when a Supabase auth user
is created.

Verify:

- trigger works on a clean database
- duplicate profile creation cannot break signup
- display_name is safely taken from metadata
- the SECURITY DEFINER function uses appropriate security practices
- use a safe search_path if appropriate for Supabase/Postgres security

Do not overengineer this.

Fix only genuine issues.

---

# PHASE 8.2 ISSUE 5 — REAL DATABASE VERIFICATION

Earlier implementation reports claimed database behavior was verified even
though some manual real-Supabase verification had actually been deferred.

Do NOT repeat that mistake.

Never describe something as verified unless it was actually tested.

If the required Supabase environment/configuration is unavailable, clearly say:

NOT VERIFIED — environment unavailable

and specify exactly what remains to be tested.

Do not fabricate successful verification.

Likely application environment variables are:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL

Do not expose their actual secret values in reports.

---

# USER A — FUNCTIONAL PERSISTENCE TEST

When the environment allows real Supabase testing, verify one complete account
flow.

Create User A.

Test:

Signup
→ email confirmation if enabled
→ onboarding
→ complete onboarding
→ Profile

Verify profile reflects onboarding data.

Then test:

Save Job A
Pass Job B
Undo Pass Job B
Apply to Job C
Open Applications
Change application stage
Add application note
Set next action

Then:

Logout
→ Login again

Verify persistence of:

- profile
- goals
- skills
- work experience
- preferences
- target roles
- preferred locations
- saved jobs
- passed jobs where applicable
- applications
- application stage
- timeline/events
- notes
- next actions

If practical, verify from a second browser/session.

Do not state that cross-device/session persistence was verified if it was not.

---

# USER B — RLS ISOLATION TEST

Create User B.

User B must not be able to access User A's private data.

Verify database-level isolation for at least:

profiles
onboarding_progress
user_goals
user_preferences
preferred_locations
target_roles
user_skills
work_experiences
saved_jobs
passed_jobs
applications
application_events
application_notes

Test relevant operations where practical:

SELECT
INSERT
UPDATE
DELETE

The frontend's:

.eq("user_id", user.id)

is NOT a security boundary.

RLS must enforce isolation.

---

# APPLICATION EVENT / NOTE OWNERSHIP

application_events and application_notes reference applications.

The database must prevent a malicious authenticated user from inserting or
modifying an event/note attached to another user's application.

Ownership must be verified using the referenced application relationship.

Do not rely exclusively on a user_id supplied by frontend code.

---

# ERROR HANDLING AUDIT

Audit critical Supabase reads and writes.

Critical writes must not silently fail.

Important user actions include:

- Save
- Pass
- Undo
- Apply
- onboarding save
- preference save
- application stage change
- note creation
- next-action updates
- profile updates

The UI must not indicate success if the database rejected the operation.

Preserve the fast consumer-app experience.

Use clean user-facing errors.

Do not expose database stack traces, internal SQL or sensitive information.

---

# PHASE 8.2 TESTING

Keep the existing Vitest setup.

Add targeted tests where they provide meaningful protection.

Run:

npm run typecheck
npm run lint
npm run test
npm run build

All four must pass before Phase 8.2 is considered code-complete.

Also run:

npm run db:reset

when local Supabase/Docker/environment support it.

If db:reset cannot run because the environment does not support Docker or local
Supabase, report that accurately.

Do not substitute:

npm run build

for real migration verification.

They validate different things.

---

# REMOTE DATABASE PUSH

Do NOT automatically push migrations to the developer's main remote Supabase
project merely because the SQL was edited.

First verify the migration chain as safely as possible.

If the developer must approve:

npm run db:push

stop and explain what is ready to be pushed.

Do not approve an interactive destructive operation on behalf of the developer
unless explicitly authorized.

---

# README CLEANUP — PART OF PHASE 8.2

README.md is currently stale relative to the actual application.

Update README.md during Phase 8.2.

The README should accurately reflect:

- current NextUp product vision
- current Next.js/React stack
- Supabase authentication
- Supabase persistence
- RLS
- onboarding
- dynamic user profile
- Discover
- Explore
- Save / Pass / Undo
- Job Detail
- Applications tracker
- application stages
- notes/timeline
- current test commands
- current database commands
- environment configuration
- current development phase

Remove stale claims that these are merely planned:

- Supabase
- authentication
- onboarding
- profiles
- saved jobs
- Applications tracker

Remove any instruction that says:

SUPABASE_SERVICE_ROLE_KEY

is required when it is not actually used.

Do not add real environment secrets.

Do not expand product scope during README cleanup.

---

# PHASE 8.2 DEFINITION OF DONE

Phase 8.2 is complete only when the following are true or accurately reported
as environment-blocked:

Migration chain:

- duplicate policy issue fixed
- clean migration path inspected
- db reset tested where possible

Persistence:

- onboarding conflict target correct
- preferences conflict target correct
- all upserts audited
- duplicate operations handled intentionally

Auth:

- SSR callback exists
- signup confirmation callback supported
- password recovery callback supported
- callback redirect behavior safe

Security:

- RLS policies audited
- application note/event ownership enforced
- profile trigger audited

Quality:

- typecheck passes
- lint passes
- tests pass
- production build passes

Documentation:

- README updated

Verification:

- real Supabase behavior clearly distinguished from code-only verification

---

# PHASE 8.2 COMMIT

After completing Phase 8.2:

git status

Review the diff.

Then commit the Phase 8.2 implementation separately.

Expected commit message:

git add .
git commit -m "Phase 8.2: Verify Supabase migrations and SSR auth callbacks"
git push origin main

Do not mix Phase 9 matching work into this commit.

---

# PHASE 8.2 AUDIT GATE

AFTER PHASE 8.2 IS COMMITTED AND PUSHED:

STOP.

DO NOT START PHASE 9.

Report to the developer:

- commit SHA
- files changed
- migration changes
- migration verification result
- db reset result
- auth callback implementation
- signup confirmation verification result
- password recovery verification result
- real Supabase verification result
- User A persistence result
- User B / RLS result
- duplicate/idempotency result
- typecheck result
- lint result
- test result
- build result
- README update result
- anything that could not actually be tested
- any remaining concerns

Clearly label each item as one of:

PASS
FAIL
NOT VERIFIED
NOT APPLICABLE

Then STOP.

Wait for the developer to have Phase 8.2 independently reviewed.

Do not begin Phase 9 until the developer explicitly tells you that the audit is
approved and instructs you to continue.

This gate applies even if every Phase 8.2 test passes.

---

# PHASE 9 — FUTURE REFERENCE ONLY

DO NOT IMPLEMENT THIS DURING PHASE 8.2.

Once the developer explicitly approves the Phase 8.2 audit, the next phase will
be:

Phase 9: Build deterministic personalized matching engine

The match percentage must NOT be generated by AI.

The matching engine should become the factual source of truth for personalized
job fit.

Likely structure:

lib/matching/
calculate-job-match.ts
weights.ts
skill-aliases.ts
reasons.ts
types.ts
**tests**/

---

# PHASE 9 — MATCHING INPUT

The engine should use real NextUp user data such as:

- profile
- work experience
- skills
- preferences
- goals
- job

Conceptual API:

calculateJobMatch({
profile,
experiences,
skills,
preferences,
goals,
job,
})

---

# PHASE 9 — MATCHING OUTPUT

Return deterministic structured data conceptually like:

{
overallScore,
qualificationScore,
lifestyleScore,

breakdown: {
skills,
experience,
salary,
location,
workArrangement,
careerGoals,
seniority,
},

matchedSkills,
missingSkills,
hardFailures,

reasonsFit,
reasonsConcern,
}

All scores must be constrained to:

0–100

Identical inputs must produce identical outputs.

No randomness.

No AI-generated percentage.

---

# PHASE 9 — INITIAL WEIGHTING

Use centralized/configurable weights approximately around:

Skills: 25%
Experience: 20%
Salary: 15%
Location: 10%
Work arrangement: 10%
Career goals: 10%
User priorities: 10%

Do not scatter magic scoring constants throughout the code.

Weights must live in a clear source of truth.

---

# QUALIFICATION MATCH

Qualification Match should primarily consider:

- relevant skills
- required skills
- experience
- seniority
- required qualifications
- transferable experience

Do not heavily punish someone for a missing skill that is merely preferred or
optional.

---

# LIFESTYLE MATCH

Lifestyle Match should consider available data such as:

- salary expectations
- work arrangement
- employment type
- location
- commute
- travel tolerance
- relocation willingness
- user priorities

Missing job data should not automatically be treated as a negative fact.

---

# HARD CONSTRAINTS

Support genuine hard conflicts where the data actually supports them.

Examples:

User's absolute minimum salary is above the job's maximum salary.

Remote-only user +
onsite-only job.

Job explicitly requires relocation +
user explicitly refuses relocation.

Use care.

Do not invent hard disqualifications from vague text.

---

# CAREER TRANSITION IS CORE TO NEXTUP

NextUp must not match people only to identical prior job titles.

Transferable experience is one of the product's core differentiators.

Examples:

Tower Foreman
→ Project Engineer

Tower Foreman
→ Assistant Project Manager

Field Supervisor
→ Project Coordinator

Crew Lead
→ Operations Manager

Field Construction
→ Construction Management

The engine should recognize transferable concepts such as:

- leadership
- crew management
- field operations
- construction
- safety
- project documentation
- coordination
- troubleshooting
- quality control
- scheduling
- project execution
- telecom
- fiber
- client communication

where genuinely relevant.

---

# SKILL ALIASES

Use deterministic skill normalization.

Do not implement embeddings yet.

Example alias group:

Leadership
Team Leadership
Crew Leadership
Crew Management
People Management
Supervision

Another:

Project Documentation
Construction Documentation
Field Documentation
Closeout Documentation

Another:

Scheduling
Project Scheduling
Construction Scheduling
Schedule Coordination

Alias behavior must be configurable and testable.

---

# EXPERIENCE REQUIREMENTS

Support simple deterministic parsing where useful.

Examples:

"3+ years field construction experience"

"5 years project coordination"

Compare the requirement to the user's known experience.

Do not attempt sophisticated NLP during the MVP.

If the text cannot be confidently interpreted, avoid pretending it was.

---

# DETERMINISTIC MATCH REASONS

Generate useful reasons from deterministic facts.

Examples:

Your field leadership experience aligns strongly with this role.

Your salary target falls within the published range.

This role supports your goal of moving into project management.

Your telecommunications construction background transfers well to this
position.

These are templates driven by actual data.

They are not AI-generated claims.

---

# DETERMINISTIC MATCH CONCERNS

Examples:

BIM is listed as preferred but is not currently in your skills.

This role requires more travel than your stated preference.

The bottom of the published salary range falls below your ideal target.

Keep concerns useful.

Do not use discouraging or absolute language unless the requirement genuinely
is absolute.

---

# PHASE 9 TESTS

Phase 9 must have meaningful unit tests.

At minimum test:

- strong skill overlap
- weak skill overlap
- required vs preferred skills
- strong experience
- insufficient experience
- transferable career experience
- salary below absolute minimum
- salary inside target range
- salary above target
- remote preference + remote job
- remote-only + onsite-only hard conflict
- relocation conflict
- score lower bound
- score upper bound
- deterministic repeatability
- incomplete profile
- missing job data
- alias matching

Run:

npm run test
npm run typecheck
npm run lint
npm run build

Phase 9 should be committed separately as:

Phase 9: Build deterministic personalized matching engine

Then stop for review unless the developer explicitly instructs otherwise.

---

# PHASE 10 — FUTURE REFERENCE ONLY

After Phase 9 has been independently reviewed and approved:

Phase 10: Integrate personalized matching throughout NextUp

The same user/job combination must show the same match everywhere.

Integrate matching into:

- Discover
- Explore
- Saved
- Job Detail
- Applications where appropriate

There must be one matching source of truth.

---

# DISCOVER — PHASE 10

Discover should eventually:

load authenticated user data
→ calculate deterministic job matches
→ filter passed jobs
→ rank opportunities
→ display personalized scores

Preserve the existing Discover visual design.

Do not redesign the card.

---

# EXPLORE — PHASE 10

Preserve:

- search
- work-arrangement filtering
- minimum-match filtering

Replace hard-coded match values with calculated personalized results.

---

# SAVED — PHASE 10

Saved jobs must display the same deterministic match as every other surface.

No stale demo values.

---

# JOB DETAIL — PHASE 10

Eventually display:

Overall Match
Qualification Match
Lifestyle Match

Matched Skills
Possible Gaps
Why You Fit
Worth Knowing

Every value must derive from the deterministic matching engine.

---

# MATCH CONSISTENCY

For the same authenticated user and job:

Discover: 93%
Explore: 93%
Saved: 93%
Job Detail: 93%

Never:

Discover: 93%
Explore: 88%
Job Detail: 91%

Use one calculation path.

---

# PROFILE CHANGES

When relevant profile data changes:

- skills
- experience
- salary expectations
- location preferences
- career goals
- work arrangement
- priorities

match results must update predictably.

Avoid persistent hard-coded match scores.

---

# INCOMPLETE PROFILE

If there is not enough user information to create a meaningful personalized
match:

DO NOT display a fabricated percentage.

Prefer messaging such as:

Finish your profile to see your match.

The product must distinguish:

unknown

from:

poor match.

---

# STOP AFTER PHASE 10

After Phase 10 is eventually completed and reviewed:

STOP.

Do not automatically start:

- AI Career Coach
- resume AI
- social/community
- employer recruiting
- live job provider integrations
- job scraping
- notifications
- payments
- subscriptions

Those are separate future product phases.

---

# FUTURE AI ARCHITECTURE — LOCKED PRODUCT PRINCIPLE

Do NOT implement the following during Phase 8.2, Phase 9 or Phase 10 unless
explicitly requested later.

NextUp's structured data and deterministic matching engine establish facts.

AI sits on top of those facts.

AI should:

- explain
- coach
- recommend
- help users prepare
- help users communicate
- help users understand career options
- help users act

AI must NOT:

- invent match percentages
- invent employment history
- invent accomplishments
- invent credentials
- invent certifications
- invent skills
- silently modify factual career data
- automatically apply to jobs
- automatically send recruiter messages without user approval

Core rule:

NEXTUP DATA + DETERMINISTIC ENGINE = FACTS

AI = EXPLANATION + COACHING + ASSISTANCE

---

# FUTURE AI ROLLOUT ORDER

The intended AI rollout after the matching foundation is stable is:

1. AI Job Explanation
2. AI Career Coach
3. Resume Upload + Profile Extraction
4. Resume Tailoring
5. Interview Coach
6. Application Follow-Up Assistant
7. Career Path Explorer
8. Skill Gap Intelligence
9. Natural-Language Job Discovery

Do not reorder or implement these prematurely without developer direction.

---

# AI JOB EXPLANATION

The first AI feature should take:

user profile +
job +
deterministic match result

and explain:

- why the user fits
- strongest transferable experience
- possible gaps
- what to highlight
- whether the role appears worth considering

AI must explain the deterministic score.

It must not generate its own competing match percentage.

---

# AI CAREER COACH

The future Career Coach should understand the user's actual NextUp profile.

It should be able to help with questions like:

What roles should I target?

How could my current experience transfer?

What should I learn next?

How can I move into management?

It should use structured career context rather than behave like an empty generic
chatbot.

---

# RESUME UPLOAD + PROFILE EXTRACTION

Future resume upload should extract structured information such as:

- work history
- skills
- certifications
- education
- accomplishments
- job titles
- employment dates

The user should review extracted information before it becomes permanent profile
data.

AI must never fabricate missing experience.

---

# RESUME TAILORING

Resume tailoring should work from:

master resume +
verified profile data +
selected job

AI may rewrite truthful experience for relevance and clarity.

AI may NOT add experience that does not exist.

Prefer suggestion/review workflows rather than silently replacing the resume.

---

# INTERVIEW COACH

When an application reaches an interview stage, AI can eventually use:

- user background
- selected job
- match strengths
- match gaps
- company/job information

to generate likely interview questions and coaching.

Voice interview simulation may be explored later.

---

# APPLICATION FOLLOW-UP ASSISTANT

AI may eventually recommend actions such as:

Follow up with the recruiter.

It may draft:

- follow-up emails
- recruiter messages
- thank-you messages
- interview follow-ups

But the user must review and approve communication.

No autonomous sending.

---

# CAREER PATH EXPLORER

AI may eventually help users understand realistic paths from their current
career toward other roles.

Example:

Tower Foreman
→ Project Engineer
→ Assistant Project Manager
→ Project Manager
→ Senior Project Manager / Construction Manager

The system should combine:

structured occupation data +
user background +
real career transitions +
job-market information

AI should explain paths rather than invent them.

---

# SKILL GAP INTELLIGENCE

Future NextUp should analyze recurring skill gaps across strong job matches.

Example:

BIM appears in 60% of the user's strongest Project Engineer opportunities.

This is more useful than generic skill recommendations.

Later this can support:

- learning recommendations
- certifications
- courses
- skill-building plans

based on actual opportunity demand.

---

# NATURAL-LANGUAGE JOB DISCOVERY

Eventually a user should be able to say something like:

Find jobs around Madison where I can use my field construction experience,
make at least $80,000, travel less than 20%, and stop climbing towers.

AI should convert that intent into structured filters.

The normal search/job/matching systems should retrieve and rank opportunities.

AI should interpret the request.

AI should not become the database.

---

# FUTURE ONBOARDING IMPROVEMENTS

Do NOT implement these during Phase 8.2.

The current onboarding prototype uses limited suggested skills and roles.

Before real-user launch, NextUp should move toward a structured career taxonomy.

Potential foundation:

- O*NET occupation data
- normalized skill catalog
- occupation aliases
- skill aliases
- occupation-to-skill relationships
- industry relationships
- certifications
- transferable career paths
- NextUp-specific career-transition mappings

The jobs currently in NextUp should NOT determine which careers NextUp knows
exist.

Career knowledge must exist independently from current job inventory.

---

# FUTURE SKILL SUGGESTIONS

Skills onboarding should eventually use:

career taxonomy +
current role +
work experience +
selected industry +
real job-market patterns

to suggest a broader set of skills.

Users must always be able to:

- search all skills
- add another skill
- select suggested skills
- add a skill not currently suggested

Suggestions should assist users, not restrict them.

---

# FUTURE ROLE SUGGESTIONS

Role suggestions should eventually support categories such as:

Natural Next Moves

Transferable Career Moves

Career-Change Possibilities

Stretch Opportunities

Example for a field/tower foreman background:

Project Engineer
Assistant Project Manager
Project Coordinator
Field Engineer
Construction Manager
Telecommunications Construction Manager
Field Operations Manager
Operations Supervisor
Implementation Manager
Site Development Manager
Safety Manager
Facilities Manager

The purpose is to help users discover realistic opportunities they may not know
their experience can transfer into.

---

# FUTURE LOCATION EXPERIENCE

The onboarding location experience should eventually move beyond a plain text
field.

Use a modern location autocomplete provider behind a NextUp abstraction.

Potential providers may include:

- Google Places
- Mapbox
- another appropriate geocoding/location provider

Do not tightly couple the application to one provider.

Potential architecture:

lib/location/
provider.ts
search-locations.ts
normalize-location.ts
distance.ts

Store structured data where appropriate:

display name
city
state / region
state code
country
country code
latitude
longitude
provider place ID

Do not store only an arbitrary free-text location string when structured data is
available.

---

# FUTURE LOCATION CONCEPTS

Eventually distinguish:

CURRENT LOCATION
Where the user lives.

PREFERRED LOCATIONS
Places the user is willing to work.

COMMUTE
How far the user is willing to travel regularly.

RELOCATION
Whether the user is willing to move.

WORK ARRANGEMENT
Remote / Hybrid / Onsite preferences.

TRAVEL TOLERANCE
How much work travel is acceptable.

These should eventually contribute to Lifestyle Match.

---

# FUTURE LOCATION UX

Potential UX:

Where are you based?

Search/autocomplete location.

Optional:

Use my current location

with explicit browser/mobile permission.

Then:

How far would you commute?

Examples:

15 miles
25 miles
50 miles
75+ miles
Anywhere

Preferred locations should eventually display as removable chips.

Example:

Madison, WI ×
Milwaukee, WI ×
Chicago, IL ×

- Add location

These are future enhancements.

Do not implement them during Phase 8.2.

---

# PRODUCT DATA PRINCIPLE

Every user answer should make the next experience smarter.

The goal is not to make onboarding longer.

The goal is to make it progressively more intelligent.

Conceptually:

Current Career
→ smarter skill suggestions
→ richer transferable role suggestions
→ salary preferences
→ modern location preferences
→ priorities
→ personalized profile
→ deterministic matching
→ later AI intelligence

---

# PRIVACY PRINCIPLE

NextUp will eventually contain sensitive career information such as:

- employment history
- resumes
- salary expectations
- career goals
- job applications
- recruiter communication
- possibly contact information

Use conservative privacy defaults.

AI requests should receive only the context necessary for the specific task.

Do not send a user's entire career database to an AI provider when only a small
subset is needed.

Never expose secrets or another user's private data.

RLS is a foundational security boundary.

---

# FINAL CURRENT MILESTONE

The immediate objective is to move NextUp from:

authenticated database-backed prototype

to:

verified authenticated database-backed prototype

and then, after audit approval:

personalized deterministic matching MVP.

The intended flow after Phase 10 is eventually:

Landing
→ Signup
→ Email Confirmation if Required
→ Onboarding
→ Supabase Profile
→ Deterministic Matching
→ Discover
→ Job Detail
→ Save / Pass / Undo
→ Apply
→ Applications
→ Stage / Notes / Timeline
→ Logout
→ Login
→ Data and personalized matches persist

But right now:

PHASE 8.2 ONLY.

Complete Phase 8.2.

Commit it.

Push it.

Report results.

STOP.

Wait for independent audit and explicit developer approval before Phase 9.
