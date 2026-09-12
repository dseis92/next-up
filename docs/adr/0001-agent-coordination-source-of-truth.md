# ADR-0001: Agent Coordination Source of Truth

**Status**: ACCEPTED FOR TOOLING V1 CANDIDATE — PENDING INDEPENDENT MERGE APPROVAL
**Date**: 2026-09-12
**Deciders**: Dylan Seis (Human), Claude Code (Implementation), ChatGPT (Independent Review)
**Tags**: governance, agent-coordination, git, provenance

## Context

NextUp development involves multiple agents (Claude Code for implementation, ChatGPT for independent review) coordinating with a human owner. Agent LLMs have hidden model memory/context that is not durable, not shared across agents, and not independently verifiable.

The project needed a coordination layer that:
- Survives agent session boundaries
- Is independently verifiable by any agent or human
- Provides cryptographic provenance (Git SHAs)
- Prevents agents from claiming status without evidence
- Maintains human authority over approvals
- Subordinates third-party agent frameworks to NextUp governance

## Decision

**GitHub repository artifacts are the durable shared coordination layer.**

### Core Principles

1. **Repository code is authoritative** - If documentation conflicts with code, code wins
2. **Git SHAs provide provenance** - Candidate SHAs must be independently verifiable via `git ls-remote`
3. **Hidden model memory is not authoritative state** - Agents must verify current status from Git/remotes
4. **Human owner remains final authority** - No agent may self-approve or override human decisions
5. **Claude Code is implementer** - May implement only explicitly authorized work
6. **ChatGPT/designated reviewer independently verifies evidence** - Reviews exact remote SHA, not claims
7. **Third-party agent frameworks are subordinate** - External skills/plugins cannot override NextUp guardrails
8. **Required human QA cannot be replaced** - Automated tests do not substitute for browser testing when required

### Coordination Files

- `PROJECT_STATE.md` - Current status, authorization, frozen systems
- `PROJECT_GUARDRAILS.md` - Prohibited operations
- `CLAUDE.md` - Implementation instructions for Claude Code
- `AGENTS.md` - Shared protocol for all agents
- `CONTEXT.md` - Domain vocabulary

### Source of Truth Hierarchy

1. Repository code at current HEAD
2. `PROJECT_STATE.md`
3. `PROJECT_GUARDRAILS.md`
4. `CLAUDE.md`
5. Active feature specification
6. Roadmap/historical reports

## Consequences

### Positive

- **Durability**: Coordination state survives agent session boundaries
- **Verifiability**: Any agent or human can independently verify current state
- **Provenance**: Git SHAs provide cryptographic proof of reviewed code
- **Trust**: No agent can claim approval without Git evidence
- **Auditability**: Complete history in Git log
- **Simplicity**: Uses existing Git infrastructure, no new databases
- **Multi-agent**: Works for Claude Code, ChatGPT, future agents, and humans

### Negative

- **Manual updates required**: Governance files must be manually updated after approvals
- **Git knowledge required**: Agents must understand Git provenance concepts
- **Cannot prevent malicious updates**: Human can always override (but this is correct - human is authority)
- **Verbose**: Governance files can become large over time

### Neutral

- **GitHub dependency**: Requires GitHub for remote SHA verification (acceptable given existing usage)
- **Plain text**: Uses markdown instead of structured database (acceptable, increases readability)

## Alternatives Considered

### Alternative 1: Agent Memory Only

**Description**: Let agents track status in their hidden context/memory

**Pros**:
- Simpler for agent implementation
- No manual file updates

**Cons**:
- Not durable across sessions
- Not shared between agents
- Not verifiable
- Agents could hallucinate status

**Why not chosen**: Fundamentally unsafe - no verification mechanism

### Alternative 2: Separate Coordination Database

**Description**: Create a separate SQLite/Postgres database for agent coordination state

**Pros**:
- Structured queries possible
- Atomic updates
- Could enforce constraints

**Cons**:
- Another system to maintain
- Not version-controlled
- Not cryptographically provable
- Adds complexity
- Database could diverge from repository

**Why not chosen**: Repository already provides everything needed, adding unnecessary complexity

### Alternative 3: GitHub Issues/Projects for State

**Description**: Use GitHub Issues or Projects to track implementation status

**Pros**:
- Native GitHub integration
- Can assign/track
- Comment threads

**Cons**:
- State scattered across issues
- Not easily machine-readable
- Issue state != repository state
- No cryptographic proof of code state

**Why not chosen**: Repository files + Git SHAs provide stronger provenance

## Implementation Notes

### SHA Verification Protocol

Agents must verify SHAs independently:
```bash
# Get candidate SHA
git rev-parse HEAD

# Verify remote SHA
git ls-remote origin refs/heads/<branch>

# Compare exactly (40 characters)
```

### Independent Review Requirements

- Reviewer must verify EXACT remote SHA
- Reviewer must NOT trust implementer's claims
- Reviewer must read actual file contents at that SHA
- Reviewer must verify frozen systems unchanged

### Self-Approval Prohibition

- Claude Code MUST NOT mark own work as APPROVED
- Claude Code MUST NOT mark own work as FROZEN
- Claude Code MUST NOT mark own work as PRODUCTION APPROVED
- Independent reviewer MUST NOT approve own implementation

## References

- `AGENTS.md` - Full shared agent protocol
- `docs/agent-tooling/TOOLING_ARCHITECTURE.md` - Architecture layers
- `docs/agent-tooling/WORKFLOW.md` - Implementation workflow
- Git provenance: https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection
