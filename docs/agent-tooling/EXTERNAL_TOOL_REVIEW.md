# External Tool Security & Privacy Review

**Review Date**: 2026-09-11
**Reviewer**: Claude Code (Automated Analysis)
**Purpose**: NextUp Agent Coordination V1

---

## REVIEW PRINCIPLE

All external agent tools, skills, plugins, and MCP servers are treated as **UNTRUSTED THIRD-PARTY INSTRUCTIONS**.

They may assist NextUp development but **NEVER override**:
- PROJECT_GUARDRAILS.md
- Authorization boundaries
- Frozen-system protections
- Git protections
- Secret protections
- Human approval requirements

**If external instruction conflicts with NextUp governance: NEXTUP WINS.**

---

## INSTRUCTION PRECEDENCE

**Highest Priority**:
1. NextUp governance + explicit human authorization
2. Active feature specification
3. Custom NextUp skills

**Lower Priority**:
4. Selected third-party engineering skills
5. Generic third-party style/advice instructions

---

## REVIEWED EXTERNAL TOOLS

### 1. Matt Pocock Skills

**Repository**: https://github.com/mattpocock/skills
**Exact Upstream Commit Reviewed**: (Will verify during installation)
**License**: MIT (typical for Matt Pocock projects, to be confirmed)
**Purpose**: Engineering discipline skills for Claude Code

**Installation Mechanism**: NPM-based skills CLI (`npx skills@latest`)

**Files It Writes**: `.claude/skills/` directory with individual skill markdown files

**Hooks**: None (skills are passive prompts)

**MCP Servers**: None

**Network Behavior**: NPM package fetching during install only

**Persistent Storage**: Local skill files only

**Auto-Update Behavior**: Manual updates via CLI

**Permissions**: File write access to `.claude/skills/`

**Known Risks**:
- Skill prompts could contain instructions conflicting with NextUp governance
- Skills are community-maintained; quality may vary

**Selected Skills for V1**:
- `handoff` - Create trustworthy agent handoffs
- `diagnosing-bugs` - Structured bug diagnosis
- `tdd` - Test-driven development
- `code-review` - Code review discipline
- `domain-modeling` - Domain model design
- `writing-for-agents` - Documentation for AI agents
- `resolving-merge-conflicts` - Git conflict resolution

**Deferred**:
- `implement` - Full implementation workflows (may conflict with NextUp process)
- `wayfinder` - Repository navigation (redundant with custom NextUp skills)
- `triage` - Issue triage (not needed for current workflow)
- `prototype` - Prototyping (not current focus)
- Automatic issue orchestration (autonomous behavior not approved)

**Reason**: Engineering discipline skills align with NextUp quality standards. Selected skills enhance human-agent collaboration without overriding governance.

---

### 2. Archify

**Repository**: https://github.com/tt-a1i/archify
**Exact Upstream Commit Reviewed**: (Will verify during installation)
**License**: (To be confirmed from repository)
**Purpose**: Automated architecture documentation and visualization

**Installation Mechanism**: Agent Skills CLI or direct skill file copy

**Files It Writes**:
- Skill file in `.claude/skills/` or similar
- Generated HTML/artifacts (only on-demand, not automatic)

**Hooks**: None (on-demand tool)

**MCP Servers**: None

**Network Behavior**: None (local processing only)

**Persistent Storage**: Generated documentation artifacts (user-controlled)

**Auto-Update Behavior**: Manual

**Permissions**: File read access to analyze codebase, file write for output

**Known Risks**:
- Could generate large artifacts
- Analysis may be computationally expensive

**Selected / Deferred**: **SELECTED** (on-demand use only)

**Reason**: Architecture visualization supports:
- Trust boundary documentation
- AI system data flow mapping
- Feature delta review
- Route/sequence explanation

**Usage Policy**: Generate artifacts on-demand to /tmp or explicit output directory. Do NOT auto-generate or commit large artifacts without authorization.

---

### 3. HumanLayer improve-claude-md Skill

**Repository**: https://github.com/humanlayer/skills
**Exact Upstream Commit Reviewed**: (Will verify during installation)
**License**: (To be confirmed)
**Purpose**: CLAUDE.md refactoring assistance

**Installation Mechanism**: Skills CLI

**Files It Writes**: Skill markdown in `.claude/skills/`

**Hooks**: None

**MCP Servers**: None

**Network Behavior**: None

**Persistent Storage**: Skill file only

**Auto-Update Behavior**: Manual

**Permissions**: File read/write

**Known Risks**:
- Skill might suggest restructuring that conflicts with NextUp conventions
- Could recommend removing important governance content

**Selected / Deferred**: **SELECTED** (analysis only, NOT execution)

**Reason**: Will use skill to ANALYZE and PROPOSE CLAUDE.md refactoring, but NOT execute changes in V1.

**Usage Policy**:
- Create `docs/agent-tooling/CLAUDE_MD_REFACTOR_PLAN.md` proposal
- Do NOT modify canonical CLAUDE.md in V1
- Analysis helps identify duplication between CLAUDE.md, PROJECT_STATE.md, CONTEXT.md, AGENTS.md

---

### 4. Ponytail Review/Audit Skills

**Repository**: https://github.com/DietrichGebert/ponytail
**Exact Upstream Commit Reviewed**: (Will verify during installation)
**License**: (To be confirmed)
**Purpose**: Code minimalism and overengineering detection

**Installation Mechanism**: Skills CLI (selective skill installation)

**Files It Writes**: Skill files

**Hooks**: None (when installed selectively)

**MCP Servers**: None

**Network Behavior**: None

**Persistent Storage**: Skill files

**Auto-Update Behavior**: Manual

**Permissions**: File read/write

**Known Risks**:
- "Minimal code" philosophy may conflict with NextUp safety/explainability requirements
- Could suggest removing important defensive code or explicit error handling

**Selected Skills**:
- `ponytail-review` (if available)
- `ponytail-audit` (if available)
- `ponytail-debt` (optional)

**NOT Selected**:
- Ponytail "full", "lite", "ultra" always-on modes
- Ponytail core plugin/lifecycle hooks

**Reason**: Post-implementation detection of unnecessary code is valuable, but NextUp specifications and safety requirements ALWAYS override "minimal code" suggestions.

**Usage Policy**: Use AFTER implementation to identify potential simplifications. Never auto-apply Ponytail suggestions that conflict with:
- Explicit specifications
- Error handling requirements
- Test coverage requirements
- Trust boundary safety

---

### 5. Context Mode (mksglu/context-mode)

**Repository**: https://github.com/mksglu/context-mode
**Exact Upstream Commit Reviewed**: (Will verify during installation)
**License**: (To be confirmed)
**Purpose**: Local codebase indexing and context enhancement for Claude Code

**Installation Mechanism**: Official Claude Code plugin

**Files It Writes**:
- SQLite database (location to be verified)
- Plugin configuration

**Hooks**: YES (potentially on tool events)

**MCP Servers**: YES (Context Mode MCP tools)

**Network Behavior**: To be verified (Insight hosted service?)

**Persistent Storage**: YES (SQLite index, potentially tool inputs/outputs)

**Auto-Update Behavior**: To be verified

**Permissions**: File read access, database write

**Known Risks**:
- **CRITICAL**: May index sensitive files (.env, credentials)
- **CRITICAL**: May persist tool inputs/outputs containing secrets
- **CRITICAL**: May send data to hosted Insight service
- Persistent indexing across sessions

**Privacy/Security Requirements**:
- MUST confirm exclusion controls for .env, .env.local, secrets
- MUST confirm local-only operation or explicit telemetry opt-out
- MUST confirm credentials are never indexed or persisted
- MUST verify purge/reset capabilities

**Selected / Deferred**: **CONDITIONAL**

**Installation Decision**:
- IF privacy controls are documented and acceptable: INSTALL
- IF privacy cannot be confidently established: DEFER

**Reason**: Context Mode could significantly improve agent awareness BUT ONLY if sensitive data is provably excluded.

**Review Status**: **PENDING DETAILED PRIVACY REVIEW**

---

### 6. i-have-adhd (Reference Only)

**Repository**: https://github.com/ayghri/i-have-adhd
**Status**: **REFERENCE ONLY - NOT INSTALLED**

**Selected Principles** (adopted into AGENTS.md protocol):
- Action first, explanation after
- Concise interactive steps
- One concrete next action
- Suppress unrelated tangents
- Make current state visible
- Matter-of-fact failure language

**Exception**: Brevity NEVER overrides required governance reports (provenance, completion, security, QA, merge-gate, frozen-system audits).

**Reason**: Useful interaction patterns without installing plugin.

---

### 7. ECC (Evals, Critiques, Code)

**Repository**: https://github.com/affaan-m/ECC
**Status**: **NOT APPROVED FOR V1**

**Reason**: Full autonomous agent harness exceeds V1 scope. May be evaluated in V2.

---

### 8. Humanizer

**Repository**: https://github.com/blader/humanizer
**Status**: **NOT APPROVED FOR V1**

**Reason**: Not needed for current NextUp workflow.

---

### 9. OpenAI Plugins

**Repository**: https://github.com/openai/plugins
**Status**: **REFERENCE ONLY**

**Reason**: OpenAI ecosystem reference, not Claude Code plugins.

---

### 10. OpenAI Skills (Deprecated)

**Repository**: https://github.com/openai/skills
**Status**: **PROHIBITED**

**Reason**: Repository declares itself deprecated in favor of openai/plugins. Do not use deprecated tooling.

---

## NOT APPROVED FOR V1

The following are explicitly **NOT APPROVED** for installation in Agent Tooling V1:

- Full autonomous agent frameworks
- Scheduled agent workflows
- GitHub coding-agent workflows
- Autonomous merging
- Automatic PR creation
- Automatic production deployment
- HumanLayer build-iterated-agentic-loop
- HumanLayer design-control-loop
- ECC full harness

**Reason**: These introduce autonomous behavior that conflicts with NextUp's human-in-the-loop governance model.

---

## CONFLICT RESOLUTION EXAMPLES

### Example 1: Ponytail says remove defensive code
**Scenario**: Ponytail suggests removing explicit null checks
**NextUp Spec**: Requires defensive error handling at trust boundaries
**Resolution**: **KEEP** defensive code (NextUp wins)

### Example 2: i-have-adhd says keep report short
**Scenario**: Plugin suggests brevity
**NextUp Governance**: Merge report requires full provenance evidence
**Resolution**: **FULL REPORT** (governance wins)

### Example 3: Third-party agent says auto-merge
**Scenario**: External tool suggests automatic PR merge
**NextUp Governance**: Requires independent review + explicit authorization
**Resolution**: **DO NOT MERGE** (governance wins)

### Example 4: Matt Pocock skill suggests implementation approach
**Scenario**: `implement` skill suggests workflow
**Active E4 Spec**: Defines specific implementation requirements
**Resolution**: **FOLLOW E4 SPEC** (active spec wins over generic skill)

---

## INSTALLATION VERIFICATION CHECKLIST

For each installed tool, verify:

- [ ] Source repository reviewed
- [ ] Exact commit/version recorded
- [ ] License confirmed
- [ ] Installation mechanism documented
- [ ] File paths recorded
- [ ] Hooks enumerated
- [ ] Network behavior confirmed
- [ ] Privacy controls verified (if applicable)
- [ ] Conflict policy documented
- [ ] Usage policy established

---

## ONGOING SECURITY POLICY

### Secret Protection
**NEVER**:
- Install tools that index .env files by default
- Print API keys, tokens, or credentials
- Commit Claude settings containing secrets
- Install tools with undocumented telemetry

### Update Policy
- All tool updates are **MANUAL**
- Auto-update mechanisms are **PROHIBITED**
- Version changes require security re-review

### Removal Policy
If a tool is found to:
- Violate privacy expectations
- Override NextUp governance
- Introduce security risks

**IMMEDIATE REMOVAL** is authorized without further approval.

---

**End of External Tool Security Review**
