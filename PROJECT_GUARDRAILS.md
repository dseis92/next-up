# NextUp — Repository Guardrails

## CORE RULE

**Add features.**

**Do not destroy approved work.**

---

## PROHIBITED DESTRUCTIVE COMMANDS

The following commands are **PROHIBITED** without explicit user authorization:

### Git Destructive Operations
```bash
git reset --hard
git clean -fd
git clean -fdx
git checkout -- .
git restore .  # against unknown user work
git push --force
git push -f
```

### History Rewriting
- Branch history rewriting
- Commit history rewriting
- Migration history rewriting

### File Operations
- `rm -rf` against project directories
- Bulk deletion of existing files
- Mass renaming of existing routes/components

### Database Operations
```bash
supabase db reset
npm run db:reset
```

### SQL Destructive Operations
- `DROP TABLE` on existing tables
- `DROP COLUMN`
- `TRUNCATE`
- Destructive migrations
- Rewriting existing migration history

### Code Formatting
- Formatting the entire repository
- Automatic repo-wide lint fixing

---

## FEATURE DEVELOPMENT GUARDRAILS

### Routes and Navigation
- Never delete existing routes merely because a new route supersedes them
- Never replace existing user flows unless explicitly authorized
- Never change five-tab mobile navigation without explicit approval

### Design and UX
- Never redesign Discover during unrelated feature work
- Preserve the existing dark charcoal / electric lime visual identity
- Do not turn NextUp into generic SaaS design

### Matching and Scoring
- Never change deterministic scoring during expansion work
- Never make AI a scoring engine
- Never modify Phase 9/10 matching logic during unrelated work
- Do not add duplicate scoring formulas

### Authentication and Security
- Never change auth/RLS during unrelated feature work
- Never expose a service-role key
- Never weaken existing RLS policies
- Never commit credentials
- Never commit `.env.local`

### Database
- Never modify existing migration files after they have been applied
- Never convert query/database errors into legitimate empty states
- Do not persist stale calculated data as current truth

### Data Integrity
- Never invent fake data because trusted data is missing
- Never hide or suppress errors to make quality gates appear green
- Do not claim save/load succeeded until persistence succeeds

### Dependencies
- Never install a new dependency if existing stack can solve the problem
- Never run broad dependency upgrades during a feature task

### Code Quality
- Never rewrite unrelated code for style
- Never remove historical project documentation during feature work

---

## PRE-COMMIT SAFETY CHECKS

Before every feature commit, run:

```bash
git status --short
git diff --stat
git diff --name-status
git diff --check
```

Review every changed file.

### Explicit Deletion Check

```bash
git diff --diff-filter=D --name-status <BASE_SHA>...HEAD
```

**Any unexpected `D` result is a STOP condition.**

### Explicit Rename Check

```bash
git diff --summary <BASE_SHA>...HEAD
```

**Unexpected renames are a STOP condition.**

---

## POST-IMPLEMENTATION REPORT REQUIREMENTS

After every implementation session, report:

- **Base SHA**
- **Branch**
- **Final SHA**
- **Files changed**
- **Files added**
- **Files deleted**
- **Files renamed**
- **Schema changes**
- **Migration status**
- **Quality gates**
- **Vercel status**
- **Manual QA status**
- **Frozen systems touched**
- **Known blockers**
- **Next authorized action**

---

## FROZEN SYSTEMS

The following systems are **FROZEN** unless explicitly authorized:

### Core Phases
- Phase 9 — Deterministic Matching
- Phase 10 — Deterministic Integration
- Phase 11 — Grounded AI Job Explanation

### Product Expansions
- E1 — Opportunity Deck
- E2 — Opportunity Compare

### Core Routes
- `/discover` — signature discovery experience
- Five-tab mobile bottom navigation

---

## IF YOU THINK SOMETHING SHOULD BE DELETED

**DO NOT DELETE IT.**

**Report it.**

If E3 appears to require deleting, renaming, or replacing existing production behavior:

**STOP and explain why.**

---

## CHANGE CONTROL PRINCIPLE

**Existing approved functionality is presumed valuable.**

**New features are ADDITIVE.**

**The user's highest-level implementation requirement is:**

**DO NOT DAMAGE, DELETE, REPLACE, OR SILENTLY REMOVE EXISTING NEXTUP WORK.**

---

**End of Repository Guardrails**
