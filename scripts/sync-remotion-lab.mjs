/**
 * Refresh the vendored copy of the MathViz-Remotion scene.
 *
 *   node scripts/sync-remotion-lab.mjs          copy, then stamp the README
 *   node scripts/sync-remotion-lab.mjs --check  compare only, exit 1 on drift
 *
 * The site build must not depend on a checkout that is not in this repository:
 * Vercel builds from GitHub and has no remotion-lab. So the four files the
 * MathViz-Remotion composition needs are copied in, byte for byte, under
 * src/remotion/mathviz/. Their paths mirror remotion-lab's own, so the copies
 * are unedited (MatrixScene.tsx imports "../Showcase/palette") and a drift
 * check is a plain byte comparison.
 *
 * REMOTION_LAB_DIR overrides where the checkout is; the default is
 * ../../remotion-lab relative to this repo.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = path.join(repoRoot, "src", "remotion", "mathviz");
const labDir = process.env.REMOTION_LAB_DIR
  ? path.resolve(process.env.REMOTION_LAB_DIR)
  : path.resolve(repoRoot, "..", "..", "remotion-lab");

/**
 * Everything the MathViz-Remotion composition reaches, and nothing else, as
 * paths inside the checkout. MatrixScene.tsx imports ./spine and
 * ../Showcase/palette; spine.ts imports only zod; palette.ts imports nothing.
 * The JSON is the scene's data file. Adding a composition means adding its
 * files here.
 */
const FILES = [
  "src/MathViz/MatrixScene.tsx",
  "src/MathViz/spine.ts",
  "src/Showcase/palette.ts",
  "public/math/matrix_transform.json",
];

/**
 * Where a checkout path lands in the vendored folder. The checkout's own "src/"
 * level is dropped (this folder is already under src/), so MathViz/ and
 * Showcase/ stay siblings and MatrixScene.tsx's "../Showcase/palette" resolves
 * without editing the copy. public/ keeps its name, since that is what the file
 * is called in remotion-lab and nothing here serves it.
 */
const destOf = (rel) => rel.replace(/^src\//, "");

const check = process.argv.includes("--check");

if (!fs.existsSync(path.join(labDir, "src", "Root.tsx"))) {
  console.error(`no remotion-lab checkout at ${labDir}. Set REMOTION_LAB_DIR.`);
  process.exit(1);
}

let changed = 0;
for (const rel of FILES) {
  const from = path.join(labDir, rel);
  const to = path.join(vendorDir, destOf(rel));
  if (!fs.existsSync(from)) {
    console.error(`missing in the checkout: ${from}`);
    process.exit(1);
  }
  const src = fs.readFileSync(from);
  const same = fs.existsSync(to) && fs.readFileSync(to).equals(src);
  if (same) {
    console.log(`same   ${rel} (${src.length} bytes)`);
    continue;
  }
  changed++;
  if (check) {
    console.log(`DRIFT  ${rel}`);
    continue;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  // Atomic: write beside the target, then rename over it.
  const tmp = `${to}.tmp`;
  fs.writeFileSync(tmp, src);
  fs.renameSync(tmp, to);
  console.log(`copied ${rel} (${src.length} bytes)`);
}

const sha = execFileSync("git", ["-C", labDir, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
const when = new Date().toISOString().slice(0, 10);

if (check) {
  console.log(changed ? `\n${changed} file(s) differ from ${labDir} at ${sha}` : `\nin step with ${labDir} at ${sha}`);
  process.exit(changed ? 1 : 0);
}

// Stamp the README so the copy always says what it is a copy of.
const readme = path.join(vendorDir, "README.md");
const stamp = `Vendored copy of remotion-lab at commit ${sha}, taken ${when}.`;
const body = fs.readFileSync(readme, "utf8");
const eol = body.includes("\r\n") ? "\r\n" : "\n";
const next = body.replace(/^Vendored copy of remotion-lab at commit .*$/m, stamp.replace(/\$/g, "$$$$"));
if (next === body && !body.includes(stamp)) {
  console.error(`could not find the stamp line to update in ${readme}`);
  process.exit(1);
}
const tmp = `${readme}.tmp`;
fs.writeFileSync(tmp, next.replace(/\r?\n/g, eol));
fs.renameSync(tmp, readme);

console.log(`\n${stamp}`);
console.log(changed ? `${changed} file(s) updated.` : "nothing to update.");
