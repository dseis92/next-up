# NextUp Agent Tooling V1 — Manifest

**Version**: 1.0
**Installation Date**: 2026-09-11
**Base Commit**: 8ab48506db62d8a3d563cd6e8881e4d5bdba643e

---

## INSTALLED TOOLS

### Matt Pocock Skills
**Status**: ACTIVE
**Source**: https://github.com/mattpocock/skills
**Installed Via**: NPX skills CLI v1.5.26
**Location**: `.claude/skills/`
**Network**: None (local skill files)
**Update Policy**: Manual

**Installed Skills**:
1. `code-review` — Code review discipline
2. `diagnosing-bugs` — Structured bug diagnosis
3. `domain-modeling` — Domain model design
4. `resolving-merge-conflicts` — Git conflict resolution
5. `tdd` — Test-driven development
6. `handoff` — Agent handoff creation
7. `writing-for-agents` — Documentation for AI

---

### NextUp Custom Skills
**Status**: ACTIVE
**Source**: Internal (this repository)
**Location**: `.claude/skills/nextup-*/`
**Purpose**: NextUp-specific governance enforcement

**Custom Skills**:
1. `nextup-preflight` — Pre-implementation safety check
2. `nextup-handoff` — Cross-agent handoff generation
3. `nextup-completion-report` — Mandatory completion reports
4. `nextup-browser-qa` — Human QA guidance protocol

---

### Archify
**Status**: DEFERRED (V1)
**Reason**: On-demand architecture visualization not critical for V1 release
**Future Use**: Architecture diagrams, trust boundary maps, data flow visualization

---

### HumanLayer improve-claude-md
**Status**: DEFERRED (V1)
**Reason**: CLAUDE.md analysis performed manually; skill not needed for V1
**Future Use**: Automated CLAUDE.md refactoring proposal generation

---

### Ponytail Review/Audit
**Status**: DEFERRED (V1)
**Reason**: Post-implementation minimalism detection not needed for initial framework
**Future Use**: Overengineering detection after implementations

---

### Context Mode
**Status**: DEFERRED (V1)
**Reason**: Privacy/security review incomplete; local indexing requires confident exclusion controls
**Future Use**: Enhanced codebase awareness IF privacy controls confirmed

---

## NOT APPROVED

### ECC (Evals, Critiques, Code)
**Status**: NOT APPROVED
**Reason**: Full autonomous harness exceeds V1 scope

### Humanizer
**Status**: NOT APPROVED
**Reason**: Not needed for current workflow

### OpenAI Plugins/Skills
**Status**: NOT APPROVED
**Reason**: Deprecated or not Claude Code compatible

### i-have-adhd Plugin
**Status**: REFERENCE ONLY
**Reason**: Interaction principles adopted into AGENTS.md protocol without installing plugin

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

### External Tool Security
**File**: `docs/agent-tooling/EXTERNAL_TOOL_REVIEW.md`
**Status**: Created
**Purpose**: Third-party tool security assessment

---

## HOOKS / MCP SERVERS

**Status**: NONE INSTALLED

No tools in V1 install hooks or MCP servers. All are passive skill files or on-demand tools.

---

## NETWORK BEHAVIOR

**Status**: LOCAL ONLY

All V1 tools operate locally:
- Matt Pocock skills: Static markdown files
- NextUp custom skills: Static markdown files
- No telemetry
- No remote indexing
- No API calls from tools themselves

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
