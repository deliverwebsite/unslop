// `unslop init`: puts the playbook where the project's coding agents will read it.
// Dedicated files (Cursor rule, skill) are written whole. Shared files (AGENTS.md, CLAUDE.md, Copilot) keep the
// project's own instructions: the playbook goes in a marked block that later runs replace in place.
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { hasBlock, replaceBlock, wrapBlock } from "./markers.js";
import { readPackageFile } from "./files.js";
import { BLOCK, SOURCE, TARGETS, installNotice, render } from "./targets.js";

export const AGENT_IDS = TARGETS.map((target) => target.id);

// The agents a project appears to use. With no signal at all, AGENTS.md: the file most agents read.
export function detectAgents(cwd) {
  const found = TARGETS.filter((target) => target.detect.some((path) => existsSync(join(cwd, path))));
  return found.length > 0 ? found.map((target) => target.id) : ["agents"];
}

// What a target's file should contain after init, given its current content (or null if it doesn't exist).
export function nextContent(target, current, rules, version) {
  const notice = installNotice(version);
  if (!target.shared) return `${render(target, notice, rules).trimEnd()}\n`;
  const block = `${notice}\n\n${rules.trim()}`;
  if (current === null || current.trim() === "") return `${wrapBlock(BLOCK, block)}\n`;
  if (hasBlock(current, BLOCK)) return replaceBlock(current, BLOCK, block);
  return `${current.trimEnd()}\n\n${wrapBlock(BLOCK, block)}\n`;
}

// Returns one entry per agent: { id, path, action: "created" | "updated" | "unchanged" }.
export async function init({ cwd = process.cwd(), agents, dryRun = false, version }) {
  const ids = agents?.length ? agents : detectAgents(cwd);
  const unknown = ids.filter((id) => !AGENT_IDS.includes(id));
  if (unknown.length > 0) throw new Error(`Unknown agent: ${unknown.join(", ")}. Choose from ${AGENT_IDS.join(", ")}.`);

  const rules = await readPackageFile(SOURCE);
  const results = [];
  for (const target of TARGETS.filter((t) => ids.includes(t.id))) {
    const path = join(cwd, target.installPath);
    const current = await readFile(path, "utf8").catch(() => null);
    const next = nextContent(target, current, rules, version);
    const action = current === null ? "created" : current === next ? "unchanged" : "updated";
    if (!dryRun && action !== "unchanged") {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, next);
    }
    results.push({ id: target.id, path: target.installPath, action });
  }
  return results;
}
