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
- **Build verification step included:** Plan must specify how the principal will verify their source changes survived the build pipeline (e.g. grep compiled dist/index.html for the specific change). Source edits that don't appear in the compiled output are not changes — they are noise. This is mandatory for every REQ that touches source code.

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
- **Gate 1 is non-negotiable.** If Boss gives a REQ directly to the principal (e.g., in their tab instead of the huddle), the principal acknowledges and posts a Gate 1 submission to QA before touching any code. No exceptions. The eagerness to execute is a universal AI tendency — the gate catches it regardless of which model is underneath.
- **Never bypass QA by working off-huddle.** Boss must not work directly with the principal without QA in the loop. "A few quick changes" is exactly when failure patterns strike. The QA gate is the protection; removing it removes the protection.
- **Never delete the rendered output file.** The rendered HTML is an ephemeral build artifact — overwrite it in place on every render. Boss's browser points at it. Deleting it blanks the browser.
- **Investigate before assuming.** When a feature appears to exist in source code, verify it works by checking what the parser actually produces — not by reading the code and guessing. Read the regex, check the parsed output, test with console.log. Source code is not proof of functionality.
- **Verify changes survive the build.** After every build, grep the compiled output (dist/index.html) for your specific change — a unique string, constant, or pattern that proves your source edit made it into the bundle. Minifiers rename variables, so search for constants (numbers, strings) not variable names. If your change isn't in the compiled output, the build used cached modules. Clear the Vite cache (node_modules/.vite/) and rebuild. Two principals hit this same failure in one session (May 7 2026).

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
| 008 | Match Now label style to hover label | TimeMarkersBack.vue (2 classes) | Changed `text-sm` → `text-xs font-bold`. Added `mt-px` to hover label for alignment. | SUCCESS | req-008-now-label-style | Merged to main. Pushed to GitHub. |
| 009 | "throw some fictional data into the fork. Preferably something with swimlanes, goals, subgoals and milestones. How to bake a cake." — Boss | **NEW FILE ONLY:** `sample-data/cake-baking.mw`. No existing files touched. No code changes. Blast radius is 1 file: the new .mw file and its rendered output. Known issues checked — parsed-array mismatch handled by render.mjs (already wraps in array), no state injection concern since we use the render script. | 1\. Create `sample-data/cake-baking.mw` — Markwhen file with 7 domain-colored swimlane sections (strategy, tooling, workbench, product, growth, finance, personal) mapped to cake-baking phases. Each section has subsection events (goals/subgoals) and #milestone markers on key transitions. 2. Render: `node scripts/render.mjs sample-data/cake-baking.mw cake-baking.html` | SUCCESS | req-009-cake-baking-timeline | Gate 2 approved by Rio. Boss confirmed visual: "Looks good." Merged to main. |
| 010 | Rename swimlane sections from baking names to org domain names | 1 file: `sample-data/cake-baking.mw` — section header names only. No structural changes, no code changes. | Replace each section header name with its org domain name (e.g. "Strategy — Recipe Planning" → "Strategy"). Keep cake-baking events as placeholder content. Update title/description. Render and verify. | SUCCESS | req-010-rename-domains | Gate 2 approved by Rio. Merged to main. Note: file later renamed to `sample-data/honeybloom.mw` (REQ-009/010 heritage). |
| 011 | Event titles/date text: Menlo 12px, remove ... indicator, remove Gantt truncation | EventTitle.vue (font class + supplemental span), EventRow.vue (date text class + Gantt truncation style) | Replace font-family with Menlo monospace, reduce to 12px (2px smaller). Remove `...` span from EventTitle. Remove overflow/ellipsis/nowrap from Gantt title div. | SUCCESS | — | Applied directly in huddle per Boss instruction, Gate 2 approved retroactively by Rio. Note: font inline styles should be centralized in palette.ts if kept. Data file updated with Cernere timeline (S1-S6 under Workbench). |
| 012 | Remove font-semibold from event titles (make thinner) | 1 file: `EventTitle.vue` — remove `font-semibold` class. Event date text already normal weight. | Remove `font-semibold` from the event title div class in EventTitle.vue. Build and verify in browser. | SUCCESS | req-012-thinner-titles | Gate 2 approved by Rio. |
| 013 | 3-tier text hierarchy: system-ui, 12px ceiling, no bold | EventTitle.vue, EventRow.vue, SectionTitleButton.vue, TimeMarkersBack.vue, TimeMarkersFront.vue, TaskCompletion.vue, Settings.vue, SettingsButton.vue, HoverHint.vue | Apply Rio's 3-tier spec: Tier 1 (12px): event titles, section headers, group titles. Tier 2 (11px): date text, now label, hover sublabel, time scale dates. Tier 3 (10px): completion fraction, collapsed count, settings labels. All system-ui, no bold. | SUCCESS | req-013-text-hierarchy | Gate 2 approved by Rio. Merged to main. |
| 014 | Move now label and hover sublabel lower, aligned below time scale dates | TimeMarkersBack.vue (now label top + new floating hover pill), TimeMarkersFront.vue (new floating hover pill) | Increase now label `top` from 24px to 36px. Add floating hover sublabel at same Y position using `hoveredMarkerText` and `hoveredMarkerLeft` computeds. Remove inline hover sublabel from time marker template. | SUCCESS | req-014-move-labels-down | Gate 2 approved by Rio. |
| 015 | Event date text no-wrap + vertical center bar/date/title | 1 file: `EventRow.vue` — add `whitespace-nowrap` to date text, change grid template to `1fr auto` with `align-items: center` and `height: 100%` | Add `whitespace-nowrap` to date text class. Change `.eventItem` grid from `repeat(2, auto)` to `1fr auto`, add `align-items: center` and `height: 100%`. Build and verify. | SUCCESS | req-015-date-text-nowrap | Gate 2 approved by Rio. |
| 016 | Group Cernere activities in visual group, extend background to cover titles | `sample-data/honeybloom.mw` (data), `Section.vue` (text overflow measurement) | Replace `group`/`endGroup` (dead syntax) with `## Cernere` subsection header. Calculate max text overflow per child event using canvas measureText and add to group fullWidth. | SUCCESS | — | Gate 2 approved by Rio. |
| 017 | Collapsed group label on LEFT side of bar | SectionHeader.vue line 99 — collapsed group positioning | Change from `marginLeft: calc(width + 0.75rem)` to `transform: translateX(calc(-100% - 16px))` so label appears left of bar with 16px gap. | SUCCESS | — | Gate 2 approved by Rio. |
| 018 | Collapse all should skip top-level swimlanes | collapseStore.ts line 81 — add style check | Add `if (eventy.style === "section") continue;` guard in `collapseAll()` to skip sections and only collapse subgroups. | SUCCESS | — | Gate 2 approved by Rio. |
| 019 | Replace text progress with checklist-based progress bars on Cernere events | `sample-data/honeybloom.mw` — update S1-S6 event descriptions with checklist items | For each Cernere event, replace "(Done)" text and descriptions with `- [x]`/`- [ ]` checklist items reflecting actual status. Remove demo events. Data-only. | SUCCESS | — | Gate 2 approved by Rio. |
| 020 | Gantt bars should not spill into next date | `EventRow.vue` (dimensions computed, line 162), `EventRowSvg.vue` (width computed, line 48) | Subtract 1ms from `toDateTime` in bar width calculation | FAIL | req-020-021-visual-fixes | Gate 2 failed — 1ms fix present in build but imperceptible. See FAILED ATTEMPTS. |

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
| 020 | Subtract 1ms from toDateTime in width calc | No visual change. 1ms = imperceptible sub-pixel adjustment at any zoom level. 1ms was too small to shift the bar edge away from the column boundary. | Fix approach was wrong in magnitude — the adjustment needs to be VISIBLY large enough to prevent spill, not a theoretical sub-pixel correction. |
| 003 | isDark: true in useLpc.ts without format fix | Dark mode didn't render despite isDark=true in app state | Comma-separated RGB values in palette.ts generated invalid CSS: `rgb(39, 39, 42 / 1)`. Tailwind alpha syntax requires space-separated: `rgb(39 39 42 / 1)`. |
| 006 | Now line date label in NowLine.vue | Label rendered but invisible — behind the TimeMarkersBack fixed header bar (`z-30`, `position: fixed`). Different CSS stacking context. | Label was in `#timeline` (`relative overflow-auto`), behind the `fixed` header. Diagnosed and moved to TimeMarkersBack.vue. |
| 006 | Now line date label in TimeMarkersBack.vue | Label compiled and rendered in DOM but still not visible visually | Positioning or reactivity issue — `nowLabelPos = nowLineLeft - viewport.left` may evaluate to 0 or NaN on first render due to `viewport.width = 0` before user interaction. |
