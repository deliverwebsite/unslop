// Writes every generated file from its single source:
// - each AI tool's rule file from rules/unslop.md (see targets.js)
// - the library table in README.md from libraries.json (see readme-table.js)
// `node scripts/build.js` writes them; `node scripts/build.js --check` fails if any is out of date (used in CI).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { format, resolveConfig } from "prettier";
import { SOURCE, TARGETS } from "./targets.js";
import { renderTable, replaceBetweenMarkers } from "./readme-table.js";

const isCheck = process.argv.includes("--check");
const stale = [];

// Writes `content` to `path`, formatted by Prettier, if it changed; in check mode, only records that it's out of date.
async function sync(path, raw) {
  const content = await format(raw, { ...(await resolveConfig(path)), filepath: path });
  const current = await readFile(path, "utf8").catch(() => null);
  if (current === content) return;
  if (isCheck) return stale.push(path);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
  console.log(`wrote ${path}`);
}

const rules = await readFile(SOURCE, "utf8");
for (const target of TARGETS) await sync(target.path, `${target.header}\n\n${rules}`);

const { libraries } = JSON.parse(await readFile("libraries.json", "utf8"));
const readme = await readFile("README.md", "utf8");
await sync("README.md", replaceBetweenMarkers(readme, renderTable(libraries)));

if (stale.length > 0) {
  console.error(`Out of date: ${stale.join(", ")}. Run \`npm run build\` and commit the result.`);
  process.exit(1);
}
if (isCheck) console.log("All generated files are up to date.");
