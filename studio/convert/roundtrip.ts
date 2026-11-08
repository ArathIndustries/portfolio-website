/**
 * Round-trip test: every content/**\/*.mdx -> Puck -> MDX, compared to the
 * original. Prints counts (identical / whitespace-only / different / failed)
 * and the first non-identical diff. Run: npm run studio:roundtrip
 */
import fs from "node:fs";
import path from "node:path";
import { mdxToPuck } from "./mdxToPuck";
import { puckToMdx } from "./puckToMdx";

const root = path.resolve(__dirname, "..", "..");
const contentDir = path.join(root, "content");
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : null;

function* walk(dir: string): Generator<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith(".mdx")) yield p;
  }
}

function firstDiff(a: string, b: string): string {
  const al = a.split("\n");
  const bl = b.split("\n");
  for (let i = 0; i < Math.max(al.length, bl.length); i++) {
    if (al[i] !== bl[i]) {
      return [`  line ${i + 1}`, `  - ${JSON.stringify(al[i] ?? "<EOF>")}`, `  + ${JSON.stringify(bl[i] ?? "<EOF>")}`].join("\n");
    }
  }
  return "  (no line-level difference found)";
}

const results = { identical: [] as string[], whitespace: [] as string[], different: [] as string[], failed: [] as string[] };
const details: string[] = [];
let shownDiff = false;

for (const file of walk(contentDir)) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const original = fs.readFileSync(file, "utf8");
  try {
    const data = mdxToPuck(original, rel);
    const back = puckToMdx(data);
    if (outDir) {
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, rel.replace(/[\\/]/g, "__") + ".json"), JSON.stringify(data, null, 2));
      fs.writeFileSync(path.join(outDir, rel.replace(/[\\/]/g, "__") + ".back.mdx"), back);
    }
    const blocks = data.content.map((c) => c.type);
    if (back === original) {
      results.identical.push(rel);
      details.push(`OK   ${rel}  [${blocks.join(", ")}]`);
    } else if (back.replace(/\s+/g, "") === original.replace(/\s+/g, "")) {
      results.whitespace.push(rel);
      details.push(`WS   ${rel}  [${blocks.join(", ")}]\n${firstDiff(original, back)}`);
    } else {
      results.different.push(rel);
      details.push(`DIFF ${rel}  [${blocks.join(", ")}]\n${firstDiff(original, back)}`);
      if (!shownDiff) {
        shownDiff = true;
      }
    }
  } catch (e) {
    results.failed.push(rel);
    details.push(`FAIL ${rel}\n  ${(e as Error).message}`);
  }
}

console.log(details.join("\n"));
console.log("");
const total = Object.values(results).reduce((n, a) => n + a.length, 0);
console.log(`files: ${total}`);
console.log(`byte-identical: ${results.identical.length}`);
console.log(`whitespace-only differences: ${results.whitespace.length}`);
console.log(`other differences: ${results.different.length}`);
console.log(`failed: ${results.failed.length}`);
process.exitCode = results.failed.length ? 1 : 0;
