// Checks libraries.json and patterns/*.json against their schemas, then runs every lint pattern against its own
// examples: each "bad" example must be caught and each "good" example must pass.
// `node scripts/validate.js` prints every problem and exits 1 if there are any.
import { readFile } from "node:fs/promises";
import { check } from "../src/schema.js";
import { compile, lintText } from "../src/lint.js";
import { loadPatternFiles } from "../src/files.js";

const load = async (path) => JSON.parse(await readFile(path, "utf8"));
const problems = [];

function duplicates(items, key) {
  const seen = new Set();
  for (const item of items ?? []) {
    const id = String(item[key]).toLowerCase();
    if (seen.has(id)) problems.push(`duplicate ${key}: ${item[key]}`);
    seen.add(id);
  }
}

const libraries = await load("libraries.json");
problems.push(...check(libraries, await load("schema/libraries.schema.json"), "libraries.json"));
duplicates(libraries.libraries, "name");

const patternSchema = await load("schema/patterns.schema.json");
const patterns = [];
for (const { file, data } of await loadPatternFiles()) {
  problems.push(...check(data, patternSchema, file));
  for (const pattern of data.patterns ?? []) {
    if (pattern.scope !== file.slice("patterns/".length, -".json".length)) {
      problems.push(`${file} (${pattern.id}): scope ${pattern.scope} belongs in patterns/${pattern.scope}.json`);
    }
    patterns.push(pattern);
  }
}
duplicates(patterns, "id");

for (const pattern of patterns) {
  const where = `patterns/${pattern.scope}.json (${pattern.id})`;
  if (Boolean(pattern.phrases) === Boolean(pattern.regex)) {
    problems.push(`${where}: needs exactly one of phrases or regex`);
    continue;
  }
  let compiled;
  try {
    compiled = compile(pattern);
  } catch (error) {
    problems.push(`${where}: invalid regex: ${error.message}`);
    continue;
  }
  // Examples are checked as HTML, which every scope applies to.
  for (const bad of pattern.examples?.bad ?? []) {
    if (lintText(bad, "html", [compiled]).length === 0) problems.push(`${where}: misses bad example ${bad}`);
  }
  for (const good of pattern.examples?.good ?? []) {
    if (lintText(good, "html", [compiled]).length > 0) problems.push(`${where}: flags good example ${good}`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`libraries.json is valid (${libraries.libraries.length} libraries).`);
console.log(`patterns/ is valid (${patterns.length} checks, every example checked).`);
