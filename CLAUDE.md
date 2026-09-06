# NextUp — Claude Code Project Instructions

## IMPORTANT FRAMEWORK RULE

This project uses Next.js 16.3.4.

Do not assume older Next.js conventions are correct.

Before making framework-sensitive changes involving routing, middleware/proxy,
cookies, server components, server actions, authentication, or rendering,
consult the installed Next.js documentation under:

node_modules/next/dist/docs/

Follow the conventions for the exact installed version.

---

# PROJECT

NextUp is a mobile-first career discovery and job-search platform.

Tagline:

Find what's next.

The goal is to create a Career Operating System that helps users:

Discover → Match → Save → Apply → Follow Up → Interview → Offer → Hired → Grow

The existing visual identity must be preserved:

- charcoal/dark consumer-app UI
- electric lime/chartreuse primary accent
- mobile-first
- five-item bottom navigation
- polished consumer experience
- do not redesign into generic SaaS
- do not add a sixth Saved tab

---

# SOURCE OF TRUTH

The repository is always the source of truth.

Before making changes:

git pull origin main
git status
git log --oneline -10

Inspect existing code before implementing anything.

Do not assume this document is newer than the repository.

---

# CURRENT PROJECT STATE

Current repository HEAD at the time these instructions were written:

b4e8209
Update Claude continuation instructions

Latest completed implementation commit:

c9c9e85
Phase 8.1: Stabilize Supabase persistence and auth flows

The b4e8209 commit only updates Claude project instructions.
Phase 8.2 implementation has NOT started yet.

IMPORTANT:
The existing migrations have NOT yet been pushed to the remote Supabase
database because Phase 8.2 must fix the migration chain first.

---

# IMMEDIATE TASK — PHASE 8.2

DO NOT START PHASE 9 YET.

Phase 8.2 must be completed and verified first.

[NEXTUP — CONTINUE FROM PHASE 8.1
You are continuing development of the existing NextUp project.
This is an existing repository with substantial work already completed.
Repository
GitHub:
https://github.com/dseis92/next-up
Branch:
main
Latest known completed commit:
c9c9e85
Phase 8.1: Stabilize Supabase persistence and auth flows
Before doing ANY work, sync and inspect the repository.
Run:
git pull origin main
git status
git log --oneline -10
npm install
Confirm that c9c9e85 or a later valid commit is present.
Do NOT assume this prompt's summary is more current than the repository.
The repository is the source of truth.

CURRENT PRODUCT STATE
NextUp is a mobile-first job-search / career platform with the core product direction:
Find what's next.
The app already has a strong established visual system:

- dark charcoal background
- electric lime/chartreuse brand accent
- consumer-app aesthetic
- rounded job cards
- large salary hierarchy
- circular match visualization
- five-item mobile bottom navigation
- Discover
- Explore
- AI
- Activity
- Profile
  Do NOT redesign this.
  Do NOT replace the design system.
  Do NOT turn it into a generic SaaS dashboard.

COMPLETED PHASES
The following are already substantially implemented.
Phase 1
Discover final-card progression.
Phase 2
Pass + Undo.
Phase 3
Real Apply flow.
Phase 4
Applications tracker.
Includes:

- stage grouping
- application detail
- stage changes
- timeline
- notes
- next actions
  Phase 5
  10-step onboarding.
  Includes:
- Goals
- Current Career
- Experience
- Skills
- Target Roles
- Salary
- Work Preferences
- Location
- Priorities
- Review
  Phase 6
  Dynamic Profile integration.
  Hard-coded demo profile data was removed as the source of truth.
  Phase 7
  Supabase authentication.
  Includes:
- signup
- login
- forgot password
- protected routes
- session handling
- onboarding routing
  Phase 8
  Supabase persistence + RLS.
  Tables, RLS, storage modules and seeded jobs were implemented.
  Phase 8.1
  Supabase stabilization.
  Commit:
  c9c9e85
  Work included:
- fixing invalid job UUIDs
- aligning frontend mock IDs with database IDs
- improved Supabase error handling
- explicit saved/pass conflict targets
- stronger application RLS
- signup confirmation handling
- reset-password screen
- onboarding enforcement
- Vitest setup
- database scripts
- removal of unnecessary Vercel runtime dependency
  However, Phase 8.1 was audited afterward and there are still specific blockers.

DO NOT START PHASE 9 YET
Your IMMEDIATE task is:
PHASE 8.2 — FINAL SUPABASE / AUTH VERIFICATION
Complete this first.
Do not begin the matching engine until Phase 8.2 passes.

FIRST TASK — AUDIT THESE FILES
Inspect at minimum:
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
Do not blindly edit.
Understand the current implementation first.

PHASE 8.2 ISSUE 1 — MIGRATION CHAIN
The initial migration already creates a policy named approximately:
Users can delete own goals
but migration:
20260906000002_add_delete_policies.sql
also creates that policy.
This can cause a clean migration chain to fail.
Fix this.
Use safe migration behavior such as:
DROP POLICY IF EXISTS ...
or remove redundant policy creation where appropriate.
The key requirement is:
npm run db:reset
must succeed from a completely empty database.
Do not validate only against a partially-migrated database.

PHASE 8.2 ISSUE 2 — UPSERT CONFLICT TARGETS
The last audit found that saveOnboardingData() still did not explicitly specify the conflict target for:
onboarding_progress
user_preferences
Both use:
UNIQUE(user_id)
with separate generated primary keys.
Explicitly use the correct conflict target.
Conceptually:
.upsert(data, {
onConflict: "user_id"
})
Do this for:
onboarding_progress
user_preferences
Audit every other .upsert() in the repo.
Each upsert must target its real unique constraint.
Expected examples:
saved_jobs
user_id,job_id

passed_jobs
user_id,job_id

onboarding_progress
user_id

user_preferences
user_id
Test repeated operations.
Saving onboarding twice for one user must UPDATE rather than fail.

PHASE 8.2 ISSUE 3 — SUPABASE SSR AUTH CALLBACK
The project uses:
@supabase/ssr
and therefore needs a correct server-side confirmation/recovery callback flow.
The current implementation must not merely assume that visiting:
/reset-password
has already established the proper cookie-backed recovery session.
Implement the appropriate current Supabase SSR/PKCE flow.
Create an auth callback route if required, for example:
/auth/callback
Use the appropriate server Supabase client.
For code-based PKCE callback behavior, exchange the returned code appropriately, e.g.:
supabase.auth.exchangeCodeForSession(code)
If the configured email template uses token hashes instead, use the correct:
verifyOtp(...)
flow.
Do not invent a custom auth mechanism.

REQUIRED SIGNUP CONFIRMATION FLOW
When email confirmation is enabled:
Signup
↓
"Check your email"
↓
confirmation email
↓
auth callback
↓
session cookie established
↓
onboarding
When confirmation is disabled:
Signup
↓
session exists immediately
↓
onboarding
Both must work.

REQUIRED PASSWORD RECOVERY FLOW
Forgot password
↓
email recovery link
↓
auth callback / code exchange
↓
valid recovery session
↓
reset-password
↓
enter new password
↓
auth.updateUser()
↓
success
↓
login
Do not rely on a browser session existing before the callback is processed.

PHASE 8.2 ISSUE 4 — REAL DATABASE VERIFICATION
Previous reports claimed the database layer was verified, but manual real-Supabase verification had actually been deferred.
Do not claim verification unless it is actually performed.
If the required Supabase project/environment variables are NOT available to you, stop at this point and tell the developer exactly what needs to be configured.
Do not fake successful verification.
Required variables should include only what the current application genuinely needs.
Likely:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
Do not reintroduce a service-role key unless server-side functionality genuinely requires it.

VERIFY USER A
Using a configured development Supabase project:
Create User A.
Then perform:
signup
↓
complete onboarding
↓
profile displays onboarding data
↓
save Job A
↓
pass Job B
↓
undo a pass
↓
apply to Job C
↓
open Applications
↓
change application stage
↓
create note
↓
set next action
↓
logout
Then:
login User A
Verify:
profile persists
skills persist
goals persist
preferences persist
saved jobs persist
passed jobs persist
applications persist
application stage persists
timeline persists
notes persist
If possible, verify the same account from another browser/session.

VERIFY USER B / RLS
Create User B.
Verify User B cannot SELECT, INSERT, UPDATE or DELETE User A's private data.
Test at minimum:
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
Application notes/events must also ensure:
application_id
belongs to the authenticated user.
Do not merely trust .eq("user_id") in frontend code.
The database policies must provide isolation.

DUPLICATE / IDEMPOTENCY TESTING
Perform repeated operations:
save same job twice
pass same job twice
apply to same job twice
save onboarding twice
save preferences twice
Expected:
no duplicate records
no uncontrolled unique constraint errors
correct record updated/preserved

DATABASE MIGRATION VERIFICATION
From a clean local Supabase database, or an equivalent clean dev database:
run:
npm run db:reset
The migration chain must successfully apply:
00000 initial schema
00001 seed data
00002 delete policies
00003 application RLS
00004 profile trigger
any new Phase 8.2 migration
Do not edit an already-deployed migration in a way that makes deployed environments impossible to upgrade if an additive corrective migration is safer.
Use proper migration practices.

ERROR HANDLING AUDIT
Audit Supabase reads and writes.
Writes must not silently fail.
For critical user actions such as:
Save
Pass
Apply
Onboarding save
Stage change
Note creation
the UI should not behave as though the operation succeeded when the database rejected it.
Preserve the fast UX, but handle rollback/error state correctly.
Do not expose raw database stack traces to users.

PHASE 8.2 TESTS
Keep the existing Vitest configuration.
Add useful tests where possible.
Then run:
npm run typecheck
npm run lint
npm run test
npm run build
Everything must pass.
Also run:
npm run db:reset
when the environment supports it.

PHASE 8.2 COMMIT
When finished:
git status
git add .
git commit -m "Phase 8.2: Verify Supabase migrations and SSR auth callbacks"
git push origin main
Then report:
commit SHA
files changed
migration verification result
auth callback verification result
real Supabase test result
RLS test result
typecheck result
lint result
test result
build result
Do not describe something as tested if it was not actually tested.

GATE BEFORE PHASE 9
Only continue to Phase 9 if Phase 8.2 is genuinely successful.
If any database/auth/RLS blocker remains:
STOP.
Fix it first.

NEXT: PHASE 9 — DETERMINISTIC MATCHING ENGINE
After Phase 8.2 passes, begin Phase 9.
The match percentage must NOT be generated by AI.
Create approximately:
lib/matching/
calculate-job-match.ts
weights.ts
skill-aliases.ts
reasons.ts
types.ts
**tests**/

MATCHING ENGINE INPUT
The engine should accept real user data already stored in Supabase:
profile
experience
skills
preferences
goals
job
Example API:
calculateJobMatch({
profile,
experiences,
skills,
preferences,
goals,
job,
})

MATCHING ENGINE OUTPUT
Return:
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
Scores must be:
0–100
and deterministic.
Same inputs must always yield the same output.

INITIAL WEIGHTS
Use configurable weights approximately:
Skills 25%
Experience 20%
Salary 15%
Location 10%
Work arrangement 10%
Career goals 10%
User priorities 10%
Do not scatter magic numbers through the algorithm.
Centralize them.

QUALIFICATION MATCH
Qualification should primarily consider:
skills
experience
seniority
required qualifications
Do not punish users heavily for optional/preferred requirements.

LIFESTYLE MATCH
Lifestyle should consider:
salary
work arrangement
location
commute
travel tolerance
employment type
user priorities

HARD CONSTRAINTS
Support genuine hard conflicts such as:
salary below user's absolute minimum

remote-only user +
onsite-only role

relocation required +
user refuses relocation
Use care with hard requirements.
Do not infer hard disqualification from vague wording.

CAREER TRANSITION IS CORE TO NEXTUP
NextUp is not supposed to match only identical prior job titles.
Transferable experience matters.
Examples:
Tower Foreman
→ Project Engineer

Field Supervisor
→ Assistant Project Manager

Crew Lead
→ Operations Manager
can be legitimate transitions.
The engine should reward transferable:
leadership
crew management
safety
field operations
construction
documentation
coordination
fiber/telecom
project execution
where relevant.

SKILL ALIASES
Build a configurable alias system.
Example group:
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
Do not implement embeddings yet.
Use deterministic normalization.

EXPERIENCE INTERPRETATION
Parse simple experience requirements when feasible.
Examples:
"3+ years field construction experience"
"5 years project coordination"
Compare to the user's profile/experience.
Do not attempt overly complex NLP.
Simple deterministic parsing is enough for MVP.

MATCH REASONS
Create deterministic human-readable reasons.
Examples:
Your field leadership experience aligns strongly with this role.

Your salary target falls within the published range.

This role supports your goal of moving into project management.

Your telecommunications construction background transfers well to this position.

MATCH CONCERNS
Examples:
BIM is listed as preferred but is not currently in your skills.

This role requires more travel than your stated preference.

The bottom of the salary range falls below your ideal target.
Keep language useful, not discouraging.

PHASE 9 TESTS — MANDATORY
Write comprehensive unit tests.
At minimum test:
strong skill overlap produces a high skill score

strong experience increases qualification

career-transition transferable skills are recognized

salary below absolute minimum causes appropriate penalty/hard failure

salary inside desired range improves lifestyle score

remote preference matches remote role

remote-only vs onsite-only produces hard conflict

optional missing skill does not disqualify candidate

preferred skill has less impact than required skill

scores never exceed 100

scores never fall below 0

same inputs return identical outputs

empty/incomplete profile does not fabricate confidence
Run:
npm run test
npm run typecheck
npm run lint
npm run build

PHASE 9 COMMIT
Commit separately:
Phase 9: Build deterministic personalized matching engine
Push to main.

NEXT: PHASE 10 — CONNECT MATCHING THROUGHOUT APP
Only after Phase 9 tests pass.
Replace hard-coded demo match percentages.
The same user/job combination must have the same score everywhere.
Connect matching to:
Discover
Explore
Saved
Job Details
Applications where relevant

DISCOVER
Discover should:
load real user profile/preferences
↓
calculate job matches
↓
filter passed jobs
↓
rank opportunities
↓
show personalized match score
Preserve the existing Discover visual design.
Do not redesign the card.

EXPLORE
Preserve:
search
work arrangement filtering
minimum match filtering
but use calculated personalized match values.

JOB DETAIL
Display:
Overall Match
Qualification Match
Lifestyle Match

Matched Skills
Possible Gaps
Why You Fit
Worth Knowing
All values must derive from the deterministic engine.

MATCH CONSISTENCY
For a given authenticated user and job:
Discover 93%
Explore 93%
Saved 93%
Job Detail 93%
Never:
Discover 93%
Explore 88%
Job Detail 91%
Use one source of truth.

PROFILE CHANGES
When relevant profile/preferences change:
new match results must reflect the updated data.
Avoid stale hard-coded scores.

INCOMPLETE PROFILE
If the user lacks enough information for a meaningful match:
do NOT fabricate:
87%
Instead display something like:
Finish your profile to see your match

PHASE 10 TESTING
Test the user flow:
signup
↓
onboarding
↓
Discover personalized scores
↓
Explore same scores
↓
Job Detail same score
↓
edit profile/preference
↓
score changes predictably
Run:
npm run test
npm run typecheck
npm run lint
npm run build
Commit separately:
Phase 10: Integrate personalized matching throughout NextUp
Push to main.

DO NOT START THESE YET
After Phase 10:
STOP and report.
Do NOT start:
full AI Career Coach
resume AI
social/community
employer recruiting
job scraping
real job provider integrations
notifications
payments
subscriptions
Those are future phases.

IMPORTANT PRODUCT CONSTRAINTS
Keep:
mobile-first
dark theme
electric lime
five bottom-nav items
existing Discover visual language
existing Profile visual language
existing Activity visual language
existing Explore visual language
Do not add a sixth Saved tab.
Do not redesign working screens unless fixing a concrete usability/accessibility issue.

FINAL CURRENT MILESTONE
The objective is to move NextUp from:
authenticated database-backed prototype
to:
personalized job-matching MVP
The final flow after Phase 10 should be:
LANDING
↓
SIGNUP
↓
EMAIL CONFIRMATION IF REQUIRED
↓
ONBOARDING
↓
SUPABASE PROFILE
↓
DETERMINISTIC MATCHING
↓
DISCOVER
↓
JOB DETAIL
↓
SAVE / PASS / UNDO
↓
APPLY
↓
APPLICATION TRACKER
↓
STAGE / NOTES / TIMELINE
↓
LOGOUT
↓
LOGIN
↓
DATA + MATCHES STILL WORK
Start with Phase 8.2.
Do not skip it.
Do not start Phase 9 until Phase 8.2 is actually verified.
]

---

# README CLEANUP

As part of Phase 8.2 cleanup, update README.md so it accurately reflects the
current architecture and project status.

The current README is outdated.

Update it to include:

- current Supabase authentication
- current database persistence
- onboarding
- dynamic profiles
- saved/passed jobs
- Applications tracker
- current npm scripts
- current Supabase setup
- current environment variables
- current phase/status

Remove obsolete references to:

- Supabase being merely "planned"
- authentication being merely "planned"
- onboarding being merely "planned"
- Applications being merely "planned"
- SUPABASE_SERVICE_ROLE_KEY being required

Do not change product scope while updating documentation.

---

# AFTER PHASE 8.2

Only after Phase 8.2 is genuinely verified:

Phase 9:
Deterministic personalized matching engine + tests.

Then:

Phase 10:
Integrate calculated matching into Discover, Explore, Saved and Job Detail.

After Phase 10:

STOP.

Do not automatically begin AI, social, employer tools, job-provider integration,
payments, subscriptions or other new feature categories.

---

# FUTURE AI PRINCIPLE

NextUp structured data and the deterministic matching engine establish facts.

AI:

- explains
- coaches
- recommends
- helps users act

AI must NOT:

- invent match percentages
- invent employment experience
- invent credentials
- invent skills
- automatically apply to jobs
- automatically send messages without user approval

AI implementation happens after the matching foundation is complete.
