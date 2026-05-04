// render.mjs — Replicates the CLI's core function:
// parse .mw file → inject __markwhen_initial_state into dist/index.html → write output
//
// Usage: node scripts/render.mjs <input.mw> <output.html>

import { readFileSync, writeFileSync } from "fs";
import { parse } from "@markwhen/parser";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/render.mjs <input.mw> <output.html>");
  process.exit(1);
}

const mwText = readFileSync(resolve(inputPath), "utf-8");
const parsed = parse(mwText);
const template = readFileSync(resolve(__dirname, "../dist/index.html"), "utf-8");

const state = JSON.stringify({
  rawText: mwText,
  parsed: [parsed],
  transformed: parsed.events,
});

const injection = `<script>var __markwhen_initial_state = ${state};</script>`;
const output = template.replace("<head>", `<head>\n${injection}`);

writeFileSync(resolve(outputPath), output, "utf-8");
console.log(`Rendered: ${resolve(outputPath)}`);
