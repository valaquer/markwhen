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

### 2.6 Commit Clean State
Commit the current state (plan in REQ LOG, any RUNBOOK updates) before touching code. This is your rollback point. If the implementation fails, `git reset --hard` to this commit gives you a clean state to start the next attempt from.

### 2.7 Implement
Implement exactly to plan. No deviations. No "while I'm here" fixes. If the plan is wrong, stop and go back to 2.3.

### 2.8 Visual Verification
Open the rendered output in a browser. Confirm it works. "Build succeeded" is not "it works."

### 2.9 Gate 2 — QA Reviews Code
QA verifies:
- Implementation matches the plan exactly
- No unplanned changes
- Blast radius — nothing broken
- Visual verification was done

**Output verification checklist (mechanical, before judgment calls):**
1. Does the output file exist? (`ls -la` the target path)
2. What's its timestamp? (matches this session, not stale)
3. What's its size? (non-zero, reasonable)
4. Do visual claims in the submission match the source code state? (cross-check actual values, not impressions)

If rejected: fix and resubmit. Do not proceed.

### 2.10 Commit and Push
Commit message: `[REQ-NNN] short description`. Push branch.

### 2.11 Boss Tests
Boss tests in browser.

### 2.12 Record Outcome
- **SUCCESS** — merge branch to main, update REQ LOG
- **FAIL** — do NOT attempt a quick fix. Record the failure in FAILED ATTEMPTS. Revert the branch. The fix becomes a new REQ starting at 2.1.

---

## Rules

- A failed attempt is a new [REQ]. Full process. No shortcuts.
- Every failed attempt is written down and analyzed before the next attempt.
- Never modify source code outside the plan.
- Never report "done" without visually verifying in the browser.
- ARCHITECTURE.md is the source of truth for blast radius. If it's wrong, fix it first — that's a REQ too.
- No hacks. If the clean path doesn't work, diagnose why and fix it properly. A workaround that sidesteps the problem is not a solution — it's a deferral.
- When the clean path fails, STOP. Do not attempt a fix. Diagnose the root cause. Bring the diagnosis to QA before writing any code. The diagnosis is a finding, not a code change — it informs the next plan.
- Work in large huddles. When failure patterns start to repeat, recruit extra QA eyes from colleagues in the huddle. Self-appointment is encouraged — anyone who spots a blind spot owns flagging it.

## Design Principles

- **Centralize into config.** Where values can be centralized into a config file, they must be. Color palettes, font families and sizes, spacing and sizing constants, URLs and endpoints, feature flags, animation durations and easing, z-index layers, breakpoints, text strings and labels. If a value appears in more than one file, or if changing it requires searching the codebase, it belongs in a config file. One place to change, one place to verify.

---

## REQ LOG

| REQ | Description | Blast Radius | Plan | Status | Branch | Notes |
|-----|-------------|--------------|------|--------|--------|-------|
| 001 | Render fork with Tom Sawyer sample data | markwhenStore.ts (lines 123-127), useLpc.ts (line 17) | Fix parsed-array normalization in both CLI state entry points. Build, render via scripts/render.mjs, open in Safari. | SUCCESS | req-001-render-tom-sawyer | Merged to main. Pushed to GitHub. |
| 002 | Centralize all colors into palette.ts config | 29 files (palette.ts new, 28 modified). All color definitions across .vue, .ts, .css, tailwind.config.js. | Create palette.ts as single source. CSS vars via applyTheme(). Semantic Tailwind tokens (th-*). Replace all dark: classes and inline RGB ternaries. | SUCCESS | req-002-centralize-colors-dark-mode | Color centralization only. Dark mode deferred to REQ-003. LATENT DEFECT: comma-separated RGB values generated invalid CSS with Tailwind's alpha syntax — all th-* tokens were non-functional. Light mode passed Boss's test only because browser default (white) matched light palette. Discovered during REQ-003 diagnosis. |
| 003 | Dark mode activation + CSS format fix | palette.ts (60 values), useLpc.ts (1 line), 5 .vue files (inline adapters), App.vue (debug removal) | Space-separate all RGB values for Tailwind compatibility. Add rgb() helper for inline rgba() calls. Set isDark: true in initialAppStateFromMarkwhen. | SUCCESS | req-003-dark-mode-activation | Fixed latent REQ-002 defect + enabled dark mode. |
| 004 | Persist zoom scale across browser sessions | timelineStore.ts (3 locations) | Add lsRef for pageScale with -1 sentinel. Initialize from persisted value if exists. Persist on every setPageScale call. | SUCCESS | req-004-persist-zoom | Merged to main. Pushed to GitHub. |
| 005 | Remove non-functional + button (NewEvent) | Events.vue (import + template), NewEvent.vue (delete), useCreateEvent.ts (delete), ARCHITECTURE.md (update) | Remove import + template from Events.vue. Delete NewEvent.vue and useCreateEvent.ts. Update ARCHITECTURE.md. | SUCCESS | req-005-remove-new-event | Merged to main. Pushed to GitHub. |
| 006 | Now line date label (two failed attempts) | NowLine.vue, then TimeMarkersBack.vue | Attempt 1: label in NowLine.vue — behind fixed header. Attempt 2: label in TimeMarkersBack.vue header — overlapped markers. See FAILED ATTEMPTS. | FAIL x2 | req-006-now-line-label | Branch deleted. Main clean at REQ-005. |
| 007 | Now line date label below header | TimeMarkersBack.vue (script + template) | Fixed label div at `top: 24px` below the h-6 header bar. `pointer-events-none`. Same `nowLabelPos` calculation. | SUCCESS | req-007-now-line-label | Merged to main. Pushed to GitHub. |

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
| 003 | isDark: true in useLpc.ts without format fix | Dark mode didn't render despite isDark=true in app state | Comma-separated RGB values in palette.ts generated invalid CSS: `rgb(39, 39, 42 / 1)`. Tailwind alpha syntax requires space-separated: `rgb(39 39 42 / 1)`. |
| 006 | Now line date label in NowLine.vue | Label rendered but invisible — behind the TimeMarkersBack fixed header bar (`z-30`, `position: fixed`). Different CSS stacking context. | Label was in `#timeline` (`relative overflow-auto`), behind the `fixed` header. Diagnosed and moved to TimeMarkersBack.vue. |
| 006 | Now line date label in TimeMarkersBack.vue | Label compiled and rendered in DOM but still not visible visually | Positioning or reactivity issue — `nowLabelPos = nowLineLeft - viewport.left` may evaluate to 0 or NaN on first render due to `viewport.width = 0` before user interaction. |
