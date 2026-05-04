# RUNBOOK for forked codebases

This RUNBOOK details how to work through forked codebase projects.

The job of the Principal Engineer is not to make Boss's requirement happen.
No, the job of the Principal Engineer is to follow this RUNBOOK faithfully.

Every requirement — including bug fixes for failed attempts — follows this process without exception.

---

## Phase 1: Setup (once per fork)

### 1.1 Clone
Clone the upstream repo to `<principal>/projects/<project>/` (e.g. `chica/projects/markwhen/`, `daksh/projects/timeline/`).

### 1.2 GitHub Repo
Create a repo under Boss's GitHub account via `gh repo create`. Set it as origin. Push.

### 1.3 Architecture Document
Create `ARCHITECTURE.md` in the repo root. Must contain:
- **Directory structure** — what each folder and key file does
- **Dependency graph** — import chain from entry point to leaf components, including external deps
- **Data flow** — how data enters the app, flows through stores, and reaches rendering
- **Blast radius map** — for each modifiable area, which files are affected and what breaks if changed
- **Known issues** — bugs or limitations discovered in the upstream code

QA verifies with fierce independence the architecture doc against the actual source code before it's accepted.

### 1.4 Create this RUNBOOK
Copy this template into the repo root as `RUNBOOK.md`. Initialize the REQ LOG, KNOWN ISSUES, and FAILED ATTEMPTS sections.

### 1.5 Commit and Push
Commit setup artifacts (ARCHITECTURE.md, RUNBOOK.md). Push to GitHub. This is the baseline.

---

## Phase 2: Requirement Loop (repeats for every REQ or bug)

### 2.1 Receive
Boss states a requirement prefixed with [REQ], or a failed attempt generates a new REQ. Write it down verbatim in the REQ LOG.

### 2.2 Blast Radius Review
Before touching any code:
- Identify every file that needs to change
- Identify every file that could break as a side effect
- Cross-reference against ARCHITECTURE.md
- Check KNOWN ISSUES and FAILED ATTEMPTS — do not walk into a documented problem
- Write the review into the REQ LOG entry

### 2.3 Plan
Specify exactly what changes, in which files, at which lines. No ambiguity. Write it into the REQ LOG entry.

### 2.4 Gate 1 — QA Reviews Plan
QA verifies:
- Plan addresses the REQ
- Blast radius is complete (nothing missed)
- Plan does not conflict with known issues or prior failed attempts
- Plan is implementable as written

If rejected: revise plan, resubmit. Do not proceed.

### 2.5 Branch
Branch off main: `git checkout -b req-NNN-short-description`

### 2.6 Implement
Implement exactly to plan. No deviations. No "while I'm here" fixes. If the plan is wrong, stop and go back to 2.3.

### 2.7 Visual Verification
Open the rendered output in a browser. Confirm it works. "Build succeeded" is not "it works."

### 2.8 Gate 2 — QA Reviews Code
QA verifies:
- Implementation matches the plan exactly
- No unplanned changes
- Blast radius — nothing broken
- Visual verification was done

If rejected: fix and resubmit. Do not proceed.

### 2.9 Commit and Push
Commit message: `[REQ-NNN] short description`. Push branch.

### 2.10 Boss Tests
Boss tests in browser.

### 2.11 Record Outcome
- **SUCCESS** — merge branch to main, update REQ LOG
- **FAIL** — do NOT attempt a quick fix. Record the failure in FAILED ATTEMPTS. Revert the branch. The fix becomes a new REQ starting at 2.1.

---

## Rules

- A failed attempt is a new [REQ]. Full process. No shortcuts.
- Every failed attempt is written down and analyzed before the next attempt.
- Never modify source code outside the plan.
- Never report "done" without visually verifying in the browser.
- ARCHITECTURE.md is the source of truth for blast radius. If it's wrong, fix it first — that's a REQ too.

---

## REQ LOG

| REQ | Description | Blast Radius | Plan | Status | Branch | Notes |
|-----|-------------|--------------|------|--------|--------|-------|
| 001 | Render upstream fork in Safari | — | Open dist/index.html | FAIL | — | Blank screen. Two known issues missed in review. |

---

## KNOWN ISSUES

| Issue | Description | Source |
|-------|-------------|--------|
| parsed-array mismatch | CLI wraps parsed in array `[ParseResult]`. Timeline v1.4.5 expects single `ParseResult`. `useColors()` crashes on `timeline.ranges.flatMap`. | ARCHITECTURE.md §3, §4 |
| dist/index.html needs state | App.vue guards Timeline render behind `v-if="markwhenStore.markwhen"`. Without `__markwhen_initial_state` injected, nothing renders. | ARCHITECTURE.md §3 |

---

## FAILED ATTEMPTS

| REQ | Attempt | What happened | Root cause |
|-----|---------|---------------|------------|
| 001 | Open dist/index.html directly | Blank white screen, no errors | No state injected. App.vue v-if guard prevents Timeline mount. |
| 001 | Inject __markwhen_initial_state | Expected: parsed-array crash | CLI state format incompatible with v1.4.5 useColors. |
