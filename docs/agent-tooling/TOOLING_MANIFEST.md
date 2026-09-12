# NextUp Agent Tooling V1 — Manifest

**Version**: 1.0
**Installation Date**: 2026-09-12
**Base Commit**: 8ab48506db62d8a3d563cd6e8881e4d5bdba643e

---

## INSTALLED TOOLS

### Matt Pocock Skills

**Status**: ACTIVE
**Repository**: https://github.com/mattpocock/skills
**Exact Source SHA**: 3cca18b368ae95cdbdebbff572ccafa662551015
**Source Verification**: Independent Git tree/blob verification confirmed all six vendored skill directories, covering all 18 files, exactly match upstream revision 3cca18b368ae95cdbdebbff572ccafa662551015
**License**: MIT
**Installer**: skills CLI v1.5.26
**Installation Method**: Copy-based (`--copy` flag)
**Vendored File Count**: 18 files
**Location**: `.claude/skills/`

**Installed Skills**:
1. `code-review` — Code review discipline
2. `diagnosing-bugs` — Structured bug diagnosis
3. `domain-modeling` — Domain model design
4. `handoff` — Agent handoff creation
5. `tdd` — Test-driven development
6. `writing-for-agents` — Documentation for AI

**Installed Paths**:
- `.claude/skills/code-review/`
- `.claude/skills/diagnosing-bugs/`
- `.claude/skills/domain-modeling/`
- `.claude/skills/handoff/`
- `.claude/skills/tdd/`
- `.claude/skills/writing-for-agents/`

**Hooks**: NONE
**MCP**: NONE
**Runtime Networking**: NONE (static copied prompt/assets)
**Install/Update Networking**: Installer requires network when invoked
**Persistent Storage**: Repository files only
**Auto-Update**: DISABLED
**Update Policy**: MANUAL + security re-review required

---

### NextUp Custom Skills

**Status**: ACTIVE
**Source**: Internal (this repository)
**Location**: `.claude/skills/nextup-*/`
**Purpose**: NextUp-specific governance enforcement

**Custom Skills**:
1. `nextup-preflight` — Pre-implementation safety check
2. `nextup-handoff` — Cross-agent handoff generation
3. `nextup-completion-report` — Mandatory completion reports with same-worktree enforcement
4. `nextup-browser-qa` — Human QA guidance protocol

---

### Rejected Skills

**resolving-merge-conflicts** (mattpocock/skills)

**Status**: REJECTED FROM V1
**Reason**: Conflict with NextUp git guardrails
**Details**: Skill instructs "Always resolve; never `--abort`" and to continue rebases, which conflicts with NextUp policy requiring explicit human authorization for history rewriting and rebasing
**Resolution**: Removed from V1. May be reconsidered in future with NextUp-specific authorization wrapper

---

## DEFERRED TOOLS (V1.1 / V2)

### Context Mode

**Status**: DEFERRED TO V1.1
**Reason**: Privacy/security review incomplete; local indexing requires confident exclusion controls
**Future Use**: Enhanced codebase awareness IF privacy controls confirmed

### Archify

**Status**: DEFERRED TO V1.1
**Reason**: On-demand architecture visualization not critical for V1 release
**Future Use**: Architecture diagrams, trust boundary maps, data flow visualization

### HumanLayer improve-claude-md

**Status**: DEFERRED TO V1.1
**Reason**: CLAUDE.md analysis performed manually; skill not needed for V1
**Future Use**: Automated CLAUDE.md refactoring proposal generation

### Ponytail Review/Audit

**Status**: DEFERRED TO V1.1
**Reason**: Post-implementation minimalism detection not needed for initial framework
**Future Use**: Overengineering detection after implementations

---

## NOT APPROVED

### ECC (Evals, Critiques, Code)

**Status**: NOT APPROVED
**Reason**: Full autonomous harness exceeds V1 scope

### Humanizer

**Status**: NOT APPROVED
**Reason**: Not needed for current workflow

---

## REFERENCE ONLY

### i-have-adhd Plugin

**Status**: REFERENCE ONLY
**Reason**: Interaction principles adopted into AGENTS.md protocol without installing plugin
**Integration**: Core principles integrated into NextUp agent coordination protocol

### OpenAI Plugins

**Status**: REFERENCE ONLY
**Repository**: Current OpenAI plugin/examples repository
**Purpose**: Reference for potential future integrations
**Not Installed**: V1 uses custom NextUp skills instead

### OpenAI Skills

**Status**: PROHIBITED / DEPRECATED
**Reason**: Superseded by OpenAI Plugins repository
**Recommendation**: Use OpenAI Plugins instead if future OpenAI integration needed

---

## GOVERNANCE INTEGRATION

### Shared Protocol

**File**: `AGENTS.md`
**Status**: Created (appended to Next.js block)
**Purpose**: Cross-agent coordination rules

### Domain Vocabulary

**File**: `CONTEXT.md`
**Status**: Created
**Purpose**: Shared terminology for humans and agents

### ADRs

**Files**:
- `docs/adr/README.md`
- `docs/adr/ADR_TEMPLATE.md`
- `docs/adr/0001-agent-coordination-source-of-truth.md`

**Status**: Created
**Purpose**: Architecture decision records

### External Tool Security

**File**: `docs/agent-tooling/EXTERNAL_TOOL_REVIEW.md`
**Status**: Complete for V1 installed tools
**Purpose**: Third-party tool security assessment

### Third-Party Licenses

**Files**:
- `docs/agent-tooling/THIRD_PARTY_NOTICES.md`
- `docs/agent-tooling/third-party-licenses/mattpocock-skills-MIT.txt`

**Status**: Complete
**Purpose**: License compliance for vendored Matt Pocock skills

---

## HOOKS / MCP SERVERS

**Status**: NONE INSTALLED

No tools in V1 install hooks or MCP servers. All are passive skill files or on-demand tools.

---

## NETWORK BEHAVIOR

**All V1 Installed Tools**: LOCAL ONLY

- Matt Pocock skills: Static markdown files
- NextUp custom skills: Static markdown files
- No telemetry
- No remote indexing
- No API calls from tools themselves

**Deferred Tools**: NOT INSTALLED IN V1 (network behavior not verified)

---

## UPDATE POLICY

**All updates are MANUAL**

Auto-update mechanisms are PROHIBITED. Version changes require:
- Security re-review
- Compatibility verification
- Explicit authorization

---

## REMOVAL POLICY

Immediate removal authorized (without approval) if tool:
- Violates privacy expectations
- Overrides NextUp governance
- Introduces security risks

---

**End of Manifest**
