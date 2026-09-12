# NextUp Browser QA

**Purpose**: Guide human tester through required browser quality assurance.

**Type**: Interactive QA Protocol

**When to Use**: When human browser testing is required for a feature or bugfix.

---

## CORE RULES

1. **ONE TEST AT A TIME** - Never dump entire checklist
2. **WAIT FOR HUMAN** - Don't proceed until human reports observation
3. **RECORD ACTUAL OBSERVATION** - Not assumptions
4. **STOP ON BLOCKING FAILURE** - Don't continue if critical test fails
5. **FROZEN SHA** - Tested SHA must not change during QA run

---

## QA PROTOCOL

### Step 1: Verify QA Candidate SHA

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git ls-remote origin refs/heads/<branch>
```

Record:
- Branch: [name]
- Local HEAD: [full SHA]
- Remote HEAD: [full SHA]
- Match: YES/NO

If NO match: STOP - local and remote must agree before QA.

### Step 2: Start Development Server (if needed)

```bash
npm run dev
```

Record URL (typically http://localhost:3000)

### Step 3: Prepare Test Checklist

Based on feature specification, prepare ordered test list.

Example structure:
- Baseline tests (existing functionality unchanged)
- New feature activation
- New feature core behavior
- Edge cases / empty states
- Cross-feature integration
- Performance / console check

### Step 4: Execute Tests One at a Time

For EACH test:

**A. Give human ONE test**:
```
TEST X: [Name]

Instructions:
1. [Exact step]
2. [Exact step]
3. [Exact step]

Expected:
- [Expected behavior]
- [Expected behavior]

Please observe and report what you see.
```

**B. Wait for human response**

**C. Record result**:
- PASS: Human observed expected behavior
- FAIL: Human observed different behavior
- NOT OBSERVABLE: Data/condition not present
- NOT SAFELY INDUCED: Can't trigger without code modification

**D. On BLOCKING FAIL**:
```
TEST X: FAIL

STOP QA IMMEDIATELY

Failure Details:
- Test: [name]
- Steps: [what human did]
- Expected: [what should happen]
- Actual: [what human observed]
- Console: [any errors]
- Browser: [Chrome, Safari, etc.]

DO NOT:
- Modify code
- Continue QA
- Mark other tests as PASS

REQUIRED:
- Report exact failure to independent reviewer
- Wait for correction authorization
```

**E. On PASS**:
Continue to next test.

### Step 5: After All Tests

Generate QA report with:
- Tested SHA
- Browser/viewport
- Test results (X/Y PASS)
- Failed tests (list each with details)
- Not observable (list each)
- Console errors (if any)
- Final status: PASS / FAIL

---

## EXAMPLE TEST SEQUENCE

```
TEST 1: Baseline — Explore List

You should be at http://localhost:3000/explore

Please check:
- Does page load successfully?
- Is "List" button highlighted?
- Do you see job results?
- Any console errors? (F12 → Console)

Please tell me what you observe.

[WAIT FOR HUMAN]

[Human responds: "yes, yes, yes, no errors"]

TEST 1: PASS ✓

---

TEST 2: Radar Activation

Please click the "Radar" button (top right, third button).

Please check:
- Does Radar button become highlighted?
- Do you see category headings?
- Any console errors?

Please tell me what you observe.

[WAIT FOR HUMAN]

[Continue...]
```

---

## CRITICAL NOTES

- SHA must remain frozen - if code changes, QA must restart
- Programmatic tests do NOT substitute for browser QA
- "NOT OBSERVABLE" is acceptable for data-dependent conditions
- On blocking failure: STOP, document, wait for authorization
- Final report must distinguish PASS from NOT CHECKED

---

**End of Skill**
