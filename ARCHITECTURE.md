# Markwhen Timeline — Architecture

Source: `mark-when/timeline` v1.4.5. MIT license.
Vue 3.5 + Vite 5 + Pinia 2 + Tailwind CSS 3.4 + TypeScript 5.6.

---

## 1. Directory Structure

```
index.html                  — HTML shell. Mounts #app div. Includes <title>.
tailwind.config.js          — Tailwind config. darkMode: "class". No custom theme extensions.
vite.config.ts              — Vite config. Uses vite-plugin-singlefile (inlines all JS/CSS into one HTML).
postcss.config.js           — PostCSS: tailwindcss + autoprefixer.
package.json                — v1.4.5. Key deps: @markwhen/parser, @markwhen/view-client, luxon, pinia, vue, hammerjs.
tsconfig.json               — TypeScript config. Path alias: @ → ./src.

src/
  main.ts                   — Entry point. Creates Vue app, Pinia store, router. Mounts to #app.
  App.vue                   — Root component. Renders <Timeline> when markwhenStore.markwhen is truthy.
  assets/main.css            — Tailwind directives (@tailwind base/components/utilities). Global styles, .dark color-scheme, scrollbar hiding.

  router/
    router.ts               — Vue Router. Single catch-all route: /:user?/:timeline(.*)? → App. Used for Meridiem URL routing (user/timeline paths).

  Markwhen/                  — Data ingestion layer. Connects to external data sources.
    markwhenStore.ts         — Pinia store. Holds app state (AppState) and markwhen state (MarkwhenState). Three data paths:
                               (1) Fetch from Meridiem URL (/:user/:timeline)
                               (2) Decode from URL hash (#mw=base64)
                               (3) Receive via LPC message (CLI __markwhen_initial_state or Meridiem editor postMessage)
                             — Exports: app, markwhen, showEditButton, showCopyLinkButton, hash, editorLink, timelineLink, embedLink, hadInitialState, onJumpToPath, onJumpToRange, showInEditor, createEventFromRange, isDetailEventPath, setDetailEventPath.
    useLpc.ts                — Wraps @markwhen/view-client's useLpc. Provides initialAppStateFromMarkwhen callback that computes colorMap via useColors. Re-exports types.
    useColors.ts             — Computes tag→RGB color mapping from parsed timeline data. Reads header tag definitions, assigns colors from 11-color palette (COLORS array). Handles hex-to-RGB conversion.
    index.d.ts               — Augments Window type with __markwhen_initial_state and __markwhen_wss_url.

  Timeline/                  — Core visualization layer.
    Timeline.vue             — Main timeline component. Manages:
                               - Scroll container (#timeline div, overflow-auto)
                               - Virtual scrolling (5x-width trick: scrollLeft = clientWidth * 2 is "center")
                               - Viewport tracking (setViewportDateInterval on scroll)
                               - Resize observer (recalculates referenceDate on window resize, debounced 250ms)
                               - Dark mode class application (:class conditional on timelineStore.darkMode)
                               - Mounts: TimeMarkersBack, NowLine, Events, Settings
    timelineStore.ts         — Central Pinia store (~430 lines). Manages:
                               - pageSettings (scale, viewport, viewportDateInterval)
                               - referenceDate (DateTime — the date at scrollLeft = clientWidth * 2)
                               - darkMode (computed from markwhenStore.app?.isDark)
                               - mode ("timeline" | "gantt", persisted to localStorage)
                               - dateTimeDisplay, progressDisplay (persisted to localStorage via lsRef)
                               - Virtual scroll math: distanceFromBaselineLeftmostDate, dateFromClientLeft, scalelessDistanceBetweenDates
                               - baselineLeftmostDate (earliestTime - 3 years, floored to year)
                               - weights (TimeMarkerWeights — visibility thresholds per scale level)
                               - pageRange, pageScale, setPageScale, autoCenter, goToNow
                               - Gantt sidebar width, left inset
                               - hoveringDate, scrollToPath
    initialPageSettings.ts   — Computes initial Settings (scale, viewport, viewportDateInterval) from parsed timeline data. Two paths: with viewport (computes scale from date range) and without (returns defaults: scale=0.3, viewport={left:0}).
    collapseStore.ts         — Pinia store. Tracks collapsed sections as Set<string> of joined paths. Methods: collapse, expand, toggleCollapsed, collapseAll, expandAll, isCollapsed, isCollapsedChild.
    useNodeStore.ts          — Pinia store. Computes visible nodes for rendering. Maintains:
                               - nodeArray (flattened event tree)
                               - visibleNodes (filtered by viewport bounds + collapse state, returns [events[], sections[]])
                               - predecessorMap (vertical position: how many nodes above each node)
                               - childrenMap (child count per section)
                               - Key recycling for Vue v-for performance
    paths.ts                 — Path utilities. equivalentPaths comparison.
    DebugView.vue            — Debug overlay (disabled in production).

    Events/                  — Event rendering components.
      Events.vue             — Container. Renders: gantt sidebar placeholder, Section components (from visibleNodes[1]), EventNodeRow components (from visibleNodes[0]), NewEvent button, GanttSidebar.
      EventNodeRow.vue       — Wrapper for EventRow. Provides useEventRefs (cached reactive properties), handles hover state.
      HoverDate.vue          — Vertical line at hovered date.
      NowLine.vue            — Vertical "now" line. Updates position every 60s via setInterval.
      ReferenceDate.vue      — Vertical reference date line (debug, currently v-if="false").
      useEventRefs.ts        — Composable. Caches reactive refs for event properties (dateRange, title, supplemental, tags, locations, etc.) keyed by path.

      Event/                 — Individual event rendering.
        EventRow.vue         — Main event component (~449 lines). Computes: left position, width, top position, color, gantt mode layout. Handles: click-to-detail, hover, resize. Contains EventBar, EventTitle, EventMeta, MoveWidgets.
        EventBar.vue         — Colored bar with progress indicator and drag handles.
        EventTitle.vue       — Event title text + task completion indicators.
        EventMeta.vue        — Supplemental metadata (locations, map links).
        EventMarkdown.vue    — Renders markdown content (checkboxes, lists, text, images).
        TaskCompletion.vue   — Visual completion indicator (checkmark circle).
        Edit/
          DragHandle.vue     — Resize handle (left/right edge drag).
          MoveWidgets.vue    — Edit toolbar (edit button, drag handles) shown on hover.
          composables/
            useResize.ts     — Composable for drag-to-resize and drag-to-move events. Touch + mouse support. Computes new date ranges from pixel offsets.

      NewEvent/ — REMOVED (non-functional + button, no editor backend).

      Section/               — Group/section rendering.
        Section.vue          — Section container with SectionHeader + ExpandedSectionBackground + DepthIndicator. Handles collapse/expand.
        SectionHeader.vue    — Section header bar with title, toggle, color indicator.
        SectionTitleButton.vue — Clickable section title.
        ExpandedSectionBackground.vue — Background box for expanded sections.
        DepthIndicator.vue   — Visual nesting depth indicator (vertical line).
        UpCaret.vue          — Expand/collapse arrow icon.

      composables/
        useEventColor.ts     — Computes event color from tags via markwhenStore colorMap.
        useNodePosition.ts   — Computes node top position and collapsed state from predecessorMap and collapseStore.
        useViewport.ts       — Provides viewport dimensions from timelineStore.

    Markers/                 — Time scale markers (date labels, grid lines).
      TimeMarkersBack.vue    — Background layer: grid lines, date labels, era/milestone highlights, weekend shading. Uses computed borderColor and backgroundColor for scale-aware rendering.
      TimeMarkersFront.vue   — Foreground layer: hovering marker labels, current date display. Shows full date on hover.
      markersStore.ts        — Pinia store. Computes time markers array from viewport date interval and scale. Tracks hovering marker and offset range.

    Settings/                — Bottom toolbar.
      Settings.vue           — Fixed bottom bar. Contains: ToggleMode, Now button, UserRanges, AutoCenter, TimelineScale, ToggleDateTimeDisplay, ToggleShowProgress, ExpandAll, CollapseAll, ToggleNowLine, copy link/embed buttons, edit link.
      SettingsButton.vue     — Reusable toolbar button with optional hover hint.
      HoverHint.vue          — Tooltip that appears above buttons.
      AutoCenter.vue         — Center button. Calls timelineStore.autoCenter().
      CollapseAll.vue        — Collapse all sections. Calls collapseStore.collapseAll().
      ExpandAll.vue          — Expand all sections. Calls collapseStore.expandAll().
      ToggleMode.vue         — Toggle between "timeline" and "gantt" modes.
      ToggleNowLine.vue      — Toggle now line visibility.
      ToggleDateTimeDisplay.vue — Toggle date/time display on events.
      ToggleShowProgress.vue — Toggle progress bar visibility on events.
      TimelineScale.vue      — Zoom slider (range input). Sets timelineStore.pageScale.
      UserRanges.vue         — Header-defined viewport ranges (timeline.ranges config). Buttons to jump to predefined date ranges.

    Gantt/
      GanttSidebar.vue       — Left sidebar for Gantt mode. Shows task tree with expand/collapse. Resizable via usePanelResize.

    Svg/                     — SVG export rendering (for static image generation).
      SvgView.vue            — SVG timeline renderer. Reads dark prop for color theming. Renders markers + event rows as SVG elements.
      MarkersSvg.vue         — SVG time marker lines.
      EventRowSvg.vue        — SVG event bar + text.
      types.ts               — SVG-specific types.

    composables/             — Shared composables.
      useGestures.ts         — Pinch-to-zoom (Hammer.js) + ctrl+scroll zoom (zoomer.ts). Sets pageScale, adjusts referenceDate and scrollLeft during zoom.
      useHoveringMarker.ts   — Tracks which time marker the cursor is over.
      useDoubleTap.ts        — Double-tap gesture detection.
      useIsActive.ts         — Tracks if element is being interacted with (pointer events).
      useIsHoveredInEditor.ts — Tracks editor hover state via LPC messages.
      useIsTouchscreen.ts    — Detects touchscreen.
      usePanelResize.ts      — Draggable panel resize (Gantt sidebar).
      canPan.ts              — Pinia store for pan state (Gantt mode: pan when not over sidebar).

    utilities/               — Pure utility functions.
      dateTimeUtilities.ts   — Date math: floorDateTime, ceilDateTime, roundDateTime, dateMidpoint, dateScale, humanDuration, dateRangeToString. Defines DisplayScale type and scales array. diffScale = "hours" (the unit used for all position calculations).
      localStorageRef.ts     — lsRef<T>(): creates a Vue ref backed by localStorage. Used for persisting mode, dateTimeDisplay, progressDisplay.
      zoomer.ts              — Ctrl+scroll wheel zoom handler. Normalizes wheel events, computes scale factor. Supports native GestureEvent (Safari).
      weekdayCache.ts        — Caches weekday lookups for performance.
      DateTimeDisplay.ts     — Date display formatting utilities.
      dateRangeToString2.ts  — Alternative date range string formatter.
      eventComparator.ts     — Sort comparator for events.
      innerHtml.ts           — HTML sanitization for event descriptions.

  Transitions/
    Fade.vue                 — Vue transition wrapper (opacity fade).

  utilities/                 — App-level utilities.
    ranges.ts                — Computes date range of an event or event group (recursive).
    useEventFinder.ts        — Finds event node by path in the tree.
```

---

## 2. Dependency Graph

### Entry Chain
```
index.html
  └─ src/main.ts
       ├─ vue (createApp)
       ├─ pinia (createPinia)
       ├─ src/router/router.ts → vue-router
       ├─ src/assets/main.css → tailwindcss
       └─ src/App.vue
            ├─ src/Markwhen/markwhenStore.ts
            │    ├─ @markwhen/parser (parse, types)
            │    ├─ src/Markwhen/useLpc.ts
            │    │    ├─ @markwhen/view-client (useLpc, types)
            │    │    └─ src/Markwhen/useColors.ts
            │    ├─ src/Markwhen/useColors.ts
            │    └─ vue-router (useRoute)
            └─ src/Timeline/Timeline.vue
                 ├─ src/Timeline/timelineStore.ts
                 │    ├─ src/Markwhen/markwhenStore.ts
                 │    ├─ src/Timeline/initialPageSettings.ts
                 │    ├─ src/Timeline/utilities/dateTimeUtilities.ts
                 │    ├─ src/Timeline/utilities/localStorageRef.ts
                 │    ├─ @markwhen/parser
                 │    └─ luxon
                 ├─ src/Timeline/Markers/TimeMarkersBack.vue
                 │    ├─ src/Timeline/Markers/markersStore.ts → timelineStore
                 │    ├─ src/Timeline/useNodeStore.ts → timelineStore, collapseStore
                 │    └─ src/Timeline/utilities/dateTimeUtilities.ts
                 ├─ src/Timeline/Events/Events.vue
                 │    ├─ src/Timeline/useNodeStore.ts
                 │    ├─ src/Timeline/Events/EventNodeRow.vue → EventRow.vue
                 │    ├─ src/Timeline/Events/Section/Section.vue → SectionHeader, ExpandedSectionBackground
                 │    ├─ src/Timeline/Events/NewEvent/NewEvent.vue
                 │    └─ src/Timeline/Gantt/GanttSidebar.vue
                 ├─ src/Timeline/Events/NowLine.vue → timelineStore
                 ├─ src/Timeline/Settings/Settings.vue
                 │    ├─ src/Timeline/Settings/SettingsButton.vue → HoverHint.vue
                 │    ├─ src/Timeline/Settings/AutoCenter.vue
                 │    ├─ src/Timeline/Settings/TimelineScale.vue
                 │    ├─ src/Timeline/Settings/ToggleMode.vue
                 │    ├─ src/Timeline/Settings/CollapseAll.vue → collapseStore
                 │    ├─ src/Timeline/Settings/ExpandAll.vue → collapseStore
                 │    ├─ src/Timeline/Settings/ToggleNowLine.vue
                 │    ├─ src/Timeline/Settings/ToggleDateTimeDisplay.vue
                 │    ├─ src/Timeline/Settings/ToggleShowProgress.vue
                 │    └─ src/Timeline/Settings/UserRanges.vue
                 └─ src/Timeline/composables/useGestures.ts
                      ├─ src/Timeline/utilities/zoomer.ts
                      └─ @squadette/hammerjs
```

### External Dependencies
| Package | Purpose |
|---------|---------|
| `@markwhen/parser` | Parses .mw text → ParseResult (events, header, ranges, foldables) |
| `@markwhen/view-client` | LPC message protocol (postMessage/WebSocket). Connects editor ↔ visualization. Provides AppState/MarkwhenState types. |
| `vue` 3.5 | Reactivity, components |
| `pinia` 2.2 | State management (4 stores: markwhen, timeline, collapse, markers + 2 minor: nodes, canPan) |
| `vue-router` 4.4 | URL routing for Meridiem paths |
| `luxon` 3.5 | DateTime math (all position calculations use luxon DateTime) |
| `@squadette/hammerjs` | Touch gestures (pinch-to-zoom, pan) |
| `@vueuse/core` | useResizeObserver, useDebounceFn, useThrottleFn |
| `immer` | Immutable state updates (imported but minimal usage) |
| `tailwindcss` 3.4 | Utility CSS classes |
| `vite-plugin-singlefile` | Inlines all JS/CSS into one dist/index.html |

---

## 3. Data Flow

### State Injection (CLI Path)
```
1. CLI parses .mw file via @markwhen/parser
2. CLI injects into HTML: <script>var __markwhen_initial_state = { rawText, parsed: [parsedResult], transformed }</script>
3. On page load, @markwhen/view-client reads window.__markwhen_initial_state
4. view-client calls listeners.markwhenState(state) → markwhenStore.markwhen = state
5. view-client calls initialAppStateFromMarkwhen(state) → useColors(state.parsed) → colorMap
6. view-client calls listeners.appState(appState) → markwhenStore.app = appState (with colorMap)
```

**KNOWN ISSUE:** CLI wraps parsed in array: `parsed: [parsedResult]`. Timeline v1.4.5 expects single `ParseResult`. `useColors(state.parsed)` receives array → `timeline.ranges.flatMap` crashes because `Array.ranges` is undefined. Fix required: normalize in markwhenStore's markwhenState listener or in useLpc's initialAppStateFromMarkwhen.

### State Injection (Meridiem Editor Path)
```
1. Meridiem sends postMessage with type:"state" containing MarkwhenState
2. view-client's message listener dispatches to markwhenState/appState listeners
3. Same flow as step 4-6 above
```

### State Injection (URL Path)
```
1. Router parses /:user/:timeline from URL
2. markwhenStore's watchEffect fetches https://meridiem.markwhen.com/:user/:timeline.mw
3. Parses response, sets app.value and markwhen.value directly
```

### Rendering Pipeline
```
markwhenStore.markwhen (MarkwhenState)
  → timelineStore.markwhenState (computed alias)
    → timelineStore.pageTimeline (= markwhenState.parsed — the events tree)
    → timelineStore.transformedEvents (= markwhenState.transformed — same tree, sourced)
    → timelineStore.pageTimelineMetadata (earliest/latest time from events)
      → timelineStore.baselineLeftmostDate (earliestTime - 3 years, floored)
      → markersStore.markers (time markers for the current viewport)
    → useNodeStore.nodeArray (flattened tree)
      → useNodeStore.visibleNodes (filtered by viewport + collapse state)
        → Events.vue renders EventNodeRow + Section components
```

### Scroll & Viewport
```
Timeline.vue scroll container (#timeline div)
  - Width: 5 × clientWidth (virtual scroll trick)
  - scrollLeft = clientWidth × 2 = "center" position
  - referenceDate = the DateTime at the center position
  - When scrollLeft drifts past edges (< clientWidth/2 or > clientWidth×3.5):
    → referenceDate shifts by the offset
    → scrollLeft resets to clientWidth × 2
    → Effect: infinite horizontal scrolling
  - Resize observer (debounced 250ms):
    → Recomputes referenceDate from viewport center
    → Resets scrollLeft to clientWidth × 2
  - setViewportDateInterval(): reads scrollLeft/clientWidth, updates timelineStore.pageSettings.viewport
```

### Zoom
```
User action: ctrl+scroll (zoomer.ts) or pinch (useGestures.ts)
  → Computes new scale from gesture
  → timelineStore.setPageScale(scale)
  → Adjusts referenceDate to zoom origin point (prevents viewport jump)
  → All position-dependent computeds recompute (marker positions, event positions)
```

---

## 4. Blast Radius Map

### Color / Theme
| What | Files | Breaks if wrong |
|------|-------|-----------------|
| Dark mode toggle | `Timeline.vue:241` (`:class="darkMode ? 'dark' : ''"`), `timelineStore.ts:116` (`darkMode` computed from `markwhenStore.app?.isDark`), `markwhenStore.ts:87,104` (`isDark: false` in app.value init) | All dark: Tailwind classes stop applying. Light mode renders. |
| Tailwind dark: classes | 39 unique classes across ~20 files. Top files: `TimeMarkersBack.vue`, `Events.vue`, `EventRow.vue`, `SectionHeader.vue`, `Settings.vue`, `SettingsButton.vue`, `TimeMarkersFront.vue` | Individual UI elements lose dark styling |
| SVG inline colors | `SvgView.vue:141,172`, `MarkersSvg.vue:90`, `EventRowSvg.vue:99-100` — dark ternaries using `dark` prop | SVG export renders wrong colors |
| Inline computed colors | `TimeMarkersBack.vue:45-47` (weekend bg), `TimeMarkersBack.vue:65` (border color) — use `dark.value` ternaries with RGB | Grid lines and weekend shading wrong |
| Tag colors | `useColors.ts` — 11-color COLORS array, hexToRgb conversion | Event bar colors wrong |
| tailwind.config.js | `darkMode: "class"`, no custom theme extensions | All Tailwind class generation changes |
| main.css | `.dark { color-scheme: dark }`, scrollbar hiding, font stack | System-level dark mode hints break |

### Scroll / Viewport
| What | Files | Breaks if wrong |
|------|-------|-----------------|
| Virtual scroll (5x width trick) | `Timeline.vue:213` (initial scrollLeft), `Timeline.vue:220-226` (scroll handler boundary check), `Timeline.vue:168-169` (scrollToDate resets to clientWidth×2) | Infinite scroll breaks. Content jumps or stops scrolling. |
| referenceDate | `timelineStore.ts:179` (init to DateTime.now()), `Timeline.vue:143` (resize observer recomputes), `useGestures.ts:46,96,101` (zoom adjusts) | All position calculations wrong. Events render at wrong horizontal positions. |
| Resize observer | `Timeline.vue:136-151` (debounced 250ms) | Recomputes referenceDate from viewport center. If removed: window resize breaks viewport. If timing changes: initial scroll position wrong. |
| initialPageSettings | `initialPageSettings.ts` | Default scale and viewport on page load |
| Zoom / setPageScale | `timelineStore.ts:325-328`, `TimelineScale.vue` (slider), `useGestures.ts` (pinch/scroll) | Zoom stops working or positions shift |
| autoCenter | `timelineStore.ts:155-158`, `AutoCenter.vue`, `Timeline.vue:207-208` | Center button stops working |
| goToNow | `timelineStore.ts:144,160-162`, `Settings.vue:51`, `Timeline.vue:189-192` | Now button stops working |
| Viewport tracking | `Timeline.vue:153` (setViewportDateInterval), `timelineStore.ts:257-269` (setViewport) | Node visibility culling breaks. Events outside viewport still render (performance) or visible events don't render. |
| baselineLeftmostDate | `timelineStore.ts:184-186`, `initialPageSettings.ts:20-22` | All absolute position calculations shift |

### UI Chrome (Toolbar / Settings)
| What | Files | Breaks if wrong |
|------|-------|-----------------|
| Bottom toolbar layout | `Settings.vue:54-187` — fixed bottom, flex row | Toolbar disappears or overlaps content |
| Now button | `Settings.vue:71-86` — calls goToNow | Can't scroll to today |
| Center button | `AutoCenter.vue` — calls timelineStore.autoCenter | Can't center on data range |
| Zoom slider | `TimelineScale.vue` — range input, setPageScale | Can't zoom via slider |
| Mode toggle | `ToggleMode.vue` — switches timeline/gantt | Mode switching breaks |
| Collapse/Expand All | `CollapseAll.vue`, `ExpandAll.vue` → collapseStore | Section collapse/expand all breaks |
| Now line toggle | `ToggleNowLine.vue` — toggles hideNowLine | Can't hide/show now line |
| Copy link/embed | `Settings.vue:111-164` — clipboard write | Link sharing breaks |
| Edit link | `Settings.vue:165-181` — links to Meridiem editor | Editor link breaks |
| UserRanges | `UserRanges.vue` — buttons from header timeline.ranges | Preset viewport jumps break |
| SettingsButton | `SettingsButton.vue` — reusable button + HoverHint | All toolbar buttons lose hover hints |

### Event Rendering
| What | Files | Breaks if wrong |
|------|-------|-----------------|
| Event bars | `EventBar.vue` — colored bar with width/position from EventRow | Bars disappear or wrong size |
| Event positioning | `EventRow.vue:78-140` — left/width/top computed from dateRange, scale, predecessorMap | Events at wrong position |
| Event title | `EventTitle.vue` — text + task completion | Titles missing |
| Event color | `useEventColor.ts` → markwhenStore.app.colorMap → useColors.ts | Wrong colors or no colors |
| Sections/groups | `Section.vue`, `SectionHeader.vue` — container with collapse toggle | Groups don't render or can't collapse |
| Section background | `ExpandedSectionBackground.vue` — positioned box behind section | Visual grouping lost |
| Depth indicator | `DepthIndicator.vue` — vertical nesting line | Nesting depth invisible |
| Collapse state | `collapseStore.ts` — Set<string> of collapsed paths | Collapse/expand non-functional |
| Visible node culling | `useNodeStore.ts:113-191` — filters by viewport bounds | Wrong events shown, performance degradation |
| Gantt sidebar | `GanttSidebar.vue` — task tree in gantt mode | Gantt mode sidebar missing |
| New event button | REMOVED (REQ-005) — was non-functional in static HTML, no editor backend |
| Now line | `NowLine.vue` — vertical line at current time | Time indicator missing |
| Event editing | `useResize.ts`, `DragHandle.vue`, `MoveWidgets.vue` | Drag-to-resize/move breaks |
| Markdown content | `EventMarkdown.vue` — checkboxes, lists, images | Event descriptions don't render |

### State Injection (CLI Integration)
| What | Files | Breaks if wrong |
|------|-------|-----------------|
| __markwhen_initial_state | `markwhenStore.ts:30-33` (hadInitialState check), `@markwhen/view-client` (reads from window) | No data renders. Blank page. |
| State shape | CLI's appState: `{ rawText, parsed: [ParseResult], transformed }` | **Known bug:** parsed array vs single object mismatch with v1.4.5. Crashes useColors. |
| Template HTML | CLI copies dist/index.html as template, injects state via script tag | Wrong template = wrong version = crashes |
| Script injection | CLI's injectScript prepends `<script>var __markwhen_initial_state = ...</script>` to <head> | State not available. Blank page. |
| WebSocket (serve mode) | CLI's `mw serve` sends state updates via WebSocket, view-client listens | Live reload breaks |
