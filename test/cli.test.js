import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { detectAgents, init } from "../src/init.js";

const BIN = fileURLToPath(new URL("../bin/unslop.js", import.meta.url));
const tempDir = () => mkdtemp(join(tmpdir(), "unslop-"));

async function run(cwd, ...args) {
  try {
    const { stdout } = await promisify(execFile)(process.execPath, [BIN, ...args], { cwd });
    return { code: 0, stdout };
  } catch (error) {
    return { code: error.code, stdout: error.stdout, stderr: error.stderr };
  }
}

test("init writes AGENTS.md when no agent is detected", async () => {
  const cwd = await tempDir();
  assert.deepEqual(detectAgents(cwd), ["agents"]);
  const [result] = await init({ cwd, version: "1.0.0" });
  assert.deepEqual(result, { id: "agents", path: "AGENTS.md", action: "created" });
  const text = await readFile(join(cwd, "AGENTS.md"), "utf8");
  assert.match(text, /^<!-- unslop:start -->/);
  assert.match(text, /## 2\. Copy that a person would write/);
});

test("init keeps a project's own instructions and updates its block in place", async () => {
  const cwd = await tempDir();
  await writeFile(join(cwd, "CLAUDE.md"), "# My project\n\nUse pnpm.\n");
  assert.deepEqual(detectAgents(cwd), ["claude"]);

  await init({ cwd, version: "1.0.0" });
  const first = await readFile(join(cwd, "CLAUDE.md"), "utf8");
  assert.ok(first.startsWith("# My project\n\nUse pnpm.\n\n<!-- unslop:start -->"));

  const [again] = await init({ cwd, version: "1.0.0" });
  assert.equal(again.action, "unchanged");

  const [upgraded] = await init({ cwd, version: "1.1.0" });
  assert.equal(upgraded.action, "updated");
  const second = await readFile(join(cwd, "CLAUDE.md"), "utf8");
  assert.equal(second.match(/unslop:start/g).length, 1);
  assert.match(second, /unslop 1\.1\.0/);
});

test("init writes dedicated files whole, and dry runs write nothing", async () => {
  const cwd = await tempDir();
  await mkdir(join(cwd, ".cursor"));
  const results = await init({ cwd, agents: ["cursor", "skill"], dryRun: true, version: "1.0.0" });
  assert.deepEqual(
    results.map((r) => r.path),
    [".cursor/rules/unslop.mdc", ".claude/skills/unslop/SKILL.md"],
  );
  await assert.rejects(readFile(join(cwd, ".cursor/rules/unslop.mdc")));

  await init({ cwd, agents: ["cursor"], version: "1.0.0" });
  const mdc = await readFile(join(cwd, ".cursor/rules/unslop.mdc"), "utf8");
  assert.match(mdc, /^---\ndescription: .+\nalwaysApply: true\n---\n/);
});

test("init rejects unknown agents", async () => {
  await assert.rejects(init({ cwd: await tempDir(), agents: ["vim"], version: "1" }), /Unknown agent: vim/);
});

test("lint exits 1 on errors, 0 on a clean project, and skips dependency folders", async () => {
  const cwd = await tempDir();
  await mkdir(join(cwd, "src"));
  await mkdir(join(cwd, "node_modules/pkg"), { recursive: true });
  await writeFile(join(cwd, "node_modules/pkg/index.html"), "<p>Seamless</p>");
  await writeFile(join(cwd, "src/page.tsx"), "export const Page = () => <h1>Overdue invoices, chased</h1>;\n");
  assert.equal((await run(cwd, "lint")).code, 0);

  await writeFile(join(cwd, "src/hero.jsx"), "<h1>Unlock the power of AI</h1>\n");
  const failed = await run(cwd, "lint", "--json");
  assert.equal(failed.code, 1);
  const report = JSON.parse(failed.stdout);
  assert.equal(report.files, 2);
  assert.equal(report.errors, 1);
});

test("lint accepts absolute paths", async () => {
  const cwd = await tempDir();
  await writeFile(join(cwd, "a.html"), "<p>Seamless</p>\n");
  assert.equal((await run(await tempDir(), "lint", join(cwd, "a.html"))).code, 1);
});

test("lint --strict fails on warnings", async () => {
  const cwd = await tempDir();
  await writeFile(join(cwd, "a.html"), '<a href="#">Pricing</a>\n');
  assert.equal((await run(cwd, "lint")).code, 0);
  assert.equal((await run(cwd, "lint", "--strict")).code, 1);
});

test("unknown commands and missing paths exit 2", async () => {
  const cwd = await tempDir();
  assert.equal((await run(cwd, "deploy")).code, 2);
  assert.equal((await run(cwd, "lint", "nope")).code, 2);
});
