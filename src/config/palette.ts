// palette.ts — Single source of truth for all colors in the app.
// Two consumption paths:
//   1. Templates: main.ts injects these as CSS custom properties → Tailwind reads them
//   2. SVG/computed styles: import directly from this file
//
// Values are SPACE-SEPARATED RGB channels (e.g. "39 39 42") for Tailwind's
// alpha syntax: rgb(var(--color-surface) / <alpha-value>).
// For inline rgba() calls, use the rgb() helper to convert to comma-separated.

export const theme = {
  light: {
    surface: "255 255 255",
    surfaceAlt: "228 228 231",
    surfaceDark: "24 24 27",
    text: "17 24 39",
    textMuted: "113 113 122",
    textHover: "63 63 70",
    border: "228 228 231",
    borderMedium: "161 161 170",
    borderStrong: "113 113 122",
    gridLine: "200 200 200",
    gridBorder: "161 161 170",
    markerBg: "255 255 255",
    headerGradientStart: "255 255 255",
    accent: "79 70 229",
    accentLight: "129 140 248",
    hoverBg: "228 228 231",
    nowLine: "147 197 253",
    refLine: "252 165 165",
    hoverLine: "63 63 70",
    sectionBg: "156 163 175",
    sectionBgDeep: "156 163 175",
    sectionBorder: "75 85 99",
    eventDetailBg: "255 255 255",
    barEmpty: "63 63 70",
    barBorder: "31 41 55",
    progressBar: "63 63 70",
    svgFill: "147 151 154",
    svgText: "0 0 0",
    svgMarkerStroke: "100 100 100",
  },
  dark: {
    surface: "11 13 16",
    surfaceAlt: "18 20 24",
    surfaceDark: "8 9 12",
    text: "200 200 200",
    textMuted: "161 161 170",
    textHover: "212 212 216",
    border: "82 82 91",
    borderMedium: "113 113 122",
    borderStrong: "161 161 170",
    gridLine: "40 42 48",
    gridBorder: "30 32 38",
    markerBg: "11 13 16",
    headerGradientStart: "51 65 85",
    accent: "129 140 248",
    accentLight: "129 140 248",
    hoverBg: "82 82 91",
    nowLine: "161 161 170",
    refLine: "248 113 113",
    hoverLine: "161 161 170",
    sectionBg: "0 0 255",        // BLUE — section header bg
    sectionBgDeep: "75 85 99",
    sectionBorder: "156 163 175",
    eventDetailBg: "24 24 27",
    barEmpty: "255 0 255",       // MAGENTA — bar empty (already set in EventBar)
    barBorder: "74 104 88",       // #2 Forest light
    progressBar: "74 104 88",   // #2 Forest light
    svgFill: "147 151 154",
    svgText: "255 255 255",
    svgMarkerStroke: "200 200 200",
  },
} as const;

export type ThemeColors = typeof theme.light;
export type ThemeKey = keyof ThemeColors;

// Convert space-separated to comma-separated for inline rgba() calls
export const rgb = (v: string) => v.replace(/ /g, ", ");

// Tag event colors — used by useColors.ts for coloring events by tag
// These stay comma-separated (only used in inline rgba(), never in Tailwind tokens)
// Layout constants — single source of truth for spacing and sizing.
export const ROW_HEIGHT = 20;
export const HEADER_OFFSET = 100;
export const SWIMLANE_PADDING = 20;
export const GROUP_PADDING = 10;

export const TAG_COLORS = [
  "22, 163, 76",
  "2, 132, 199",
  "212, 50, 56",
  "242, 202, 45",
  "80, 73, 229",
  "145, 57, 234",
  "214, 45, 123",
  "234, 88, 11",
  "168, 162, 157",
  "255, 255, 255",
  "0, 0, 0",
];

export const TAG_COLORS_HUMAN = [
  "green",
  "blue",
  "red",
  "yellow",
  "indigo",
  "purple",
  "pink",
  "orange",
  "gray",
  "white",
  "black",
];

// Inject theme as CSS custom properties on the document root.
// Call this at startup and whenever dark mode toggles.
export function applyTheme(isDark: boolean): void {
  const colors = isDark ? theme.dark : theme.light;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(colors)) {
    root.style.setProperty(`--color-${camelToKebab(key)}`, value);
  }
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
