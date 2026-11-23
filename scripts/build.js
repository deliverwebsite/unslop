// Writes every generated file from its single source:
// - the banned-phrase list in rules/unslop.md from patterns.json
// - each AI tool's rule file from rules/unslop.md (see src/targets.js)
// - the library and lint-check tables in README.md from libraries.json and patterns.json
// `node scripts/build.js` writes them; `node scripts/build.js --check` fails if any is out of date (used in CI).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { format, resolveConfig } from "prettier";
import { REPO_NOTICE, SOURCE, TARGETS, render } from "../src/targets.js";
import { renderBannedPhrases, renderLibraryTable, renderPatternTable, replaceBlock } from "../src/markers.js";

const isCheck = process.argv.includes("--check");
const stale = [];

// Writes `raw` to `path`, formatted by Prettier, if it changed; in check mode, only records that it's out of date.
// Returns the formatted content, so later steps build on what is (or would be) on disk.
async function sync(path, raw) {
  const content = await format(raw, { ...(await resolveConfig(path)), filepath: path });
  const current = await readFile(path, "utf8").catch(() => null);
  if (current === content) return content;
  if (isCheck) {
    stale.push(path);
    return content;
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
  console.log(`wrote ${path}`);
  return content;
}

const { patterns } = JSON.parse(await readFile("patterns.json", "utf8"));
const source = await readFile(SOURCE, "utf8");
const rules = await sync(SOURCE, replaceBlock(source, "banned-phrases", renderBannedPhrases(patterns)));
for (const target of TARGETS) await sync(target.path, render(target, REPO_NOTICE, rules));

const { libraries } = JSON.parse(await readFile("libraries.json", "utf8"));
const readme = await readFile("README.md", "utf8");
const withLibraries = replaceBlock(readme, "libraries", renderLibraryTable(libraries));
await sync("README.md", replaceBlock(withLibraries, "patterns", renderPatternTable(patterns)));

if (stale.length > 0) {
  console.error(`Out of date: ${stale.join(", ")}. Run \`npm run build\` and commit the result.`);
  process.exit(1);
}
if (isCheck) console.log("All generated files are up to date.");
