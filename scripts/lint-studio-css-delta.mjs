#!/usr/bin/env node
// Runs the studio stylesheet lint and fails only on violations that are not in
// studio/lint-baseline.json (the same scheme as the hub's frontend/scripts/lint-css-delta.mjs).
//
// A violation is keyed by file, rule and message text, not by line, so an edit above an old
// violation does not count as a new one. Same message twice in one file counts twice.
//
//   node scripts/lint-studio-css-delta.mjs            fail on new violations
//   node scripts/lint-studio-css-delta.mjs --update   rewrite the baseline from the current run
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = path.join(REPO, "studio", "lint-baseline.json");
const GLOB = "studio/**/*.css";
const update = process.argv.includes("--update");

function runStylelint() {
  const bin = path.join(REPO, "node_modules", "stylelint", "bin", "stylelint.mjs");
  const run = spawnSync(process.execPath, [bin, GLOB, "--formatter", "json"], {
    cwd: REPO,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  for (const text of [run.stdout, run.stderr]) {
    const start = text.indexOf("[");
    if (start < 0) continue;
    try {
      return JSON.parse(text.slice(start));
    } catch {
      // fall through to the other stream
    }
  }
  console.error(run.stderr || run.stdout);
  throw new Error(`stylelint produced no JSON report (exit ${run.status})`);
}

function normalize(report) {
  return report
    .filter((file) => file.warnings.length > 0)
    .map((file) => ({
      source: path.relative(REPO, file.source).split(path.sep).join("/"),
      warnings: file.warnings.map((w) => ({ line: w.line, column: w.column, rule: w.rule, severity: w.severity, text: w.text })),
    }))
    .sort((a, b) => a.source.localeCompare(b.source));
}

/** Multiset of `file|rule|text` keys. */
function tally(files) {
  const counts = new Map();
  for (const file of files) {
    for (const w of file.warnings) {
      const key = `${file.source}|${w.rule}|${w.text}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return counts;
}

const current = normalize(runStylelint());
const total = current.reduce((sum, file) => sum + file.warnings.length, 0);

if (update) {
  writeFileSync(BASELINE, JSON.stringify(current, null, 1) + "\n");
  console.log(`Baseline written: ${total} violations in ${current.length} files -> ${path.relative(process.cwd(), BASELINE)}`);
  process.exit(0);
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : [];
const before = tally(baseline);
const now = tally(current);

const fresh = [];
for (const file of current) {
  const seen = new Map();
  for (const w of file.warnings) {
    const key = `${file.source}|${w.rule}|${w.text}`;
    const n = (seen.get(key) || 0) + 1;
    seen.set(key, n);
    if (n > (before.get(key) || 0)) fresh.push({ file: file.source, ...w });
  }
}

let fixed = 0;
for (const [key, count] of before) fixed += Math.max(0, count - (now.get(key) || 0));

if (fresh.length === 0) {
  console.log(`lint:studio:css:delta: no new violations (${total} in the baseline${fixed ? `, ${fixed} fixed since` : ""})`);
  process.exit(0);
}
console.error(`lint:studio:css:delta: ${fresh.length} new violation${fresh.length === 1 ? "" : "s"} not in studio/lint-baseline.json:`);
for (const w of fresh) console.error(`  ${w.file}:${w.line}:${w.column}  ${w.text}`);
console.error("Fix them, or if the baseline is wrong run: npm run lint:studio:css:baseline");
process.exit(1);
