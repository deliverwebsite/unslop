#!/usr/bin/env node
// The unslop command line: `unslop init` installs the playbook for your agents, `unslop lint` checks your UI code.
import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { AGENT_IDS, init } from "../src/init.js";
import { collectFiles, extensionOf, loadPatterns, readPackageFile } from "../src/files.js";
import { compile, lintText } from "../src/lint.js";
import { formatJson, formatText, summarise } from "../src/report.js";

const HELP = `unslop: stop your coding agent from shipping interfaces that look AI-generated.

Usage
  unslop init [--agent <id>]... [--dry-run]
      Put the playbook where your agents read it. Detects agents from the files in this folder;
      with none found it writes AGENTS.md. Run again to update. Agents: ${AGENT_IDS.join(", ")}.

  unslop lint [paths...] [--json] [--strict]
      Check HTML, JSX, TSX, Vue, Svelte, Astro and CSS files for the tells of generated UI.
      Exits 1 on errors (or on warnings too, with --strict).
      Skip a line with an "unslop-ignore" comment on it, or "unslop-ignore-next-line" on the line above.

  unslop --version | --help
`;

async function runInit(values) {
  const { version } = JSON.parse(await readPackageFile("package.json"));
  const results = await init({ agents: values.agent, dryRun: values["dry-run"], version });
  const prefix = values["dry-run"] ? "would be " : "";
  for (const { path, action } of results) console.log(`${prefix}${action.padEnd(9)} ${path}`);
  const changed = results.some(({ action }) => action !== "unchanged");
  if (changed && !values["dry-run"]) console.log("\nYour agent picks up the playbook on its next prompt.");
}

async function runLint(paths, values) {
  const compiled = (await loadPatterns()).map(compile);
  const files = await collectFiles(paths.length > 0 ? paths : ["."]);
  const results = [];
  for (const file of files) {
    const text = await readFile(join(process.cwd(), file), "utf8");
    results.push({ file, findings: lintText(text, extensionOf(file), compiled) });
  }
  console.log(values.json ? formatJson(results) : formatText(results));
  const { errors, warnings } = summarise(results);
  return errors > 0 || (values.strict && warnings > 0) ? 1 : 0;
}

async function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      agent: { type: "string", multiple: true },
      "dry-run": { type: "boolean" },
      json: { type: "boolean" },
      strict: { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
  const [command, ...rest] = positionals;
  if (values.version) return (console.log(JSON.parse(await readPackageFile("package.json")).version), 0);
  if (values.help || !command) return (console.log(HELP), 0);
  if (command === "init") return (await runInit(values), 0);
  if (command === "lint") return runLint(rest, values);
  console.error(`Unknown command: ${command}\n\n${HELP}`);
  return 2;
}

main(process.argv.slice(2)).then(
  (code) => (process.exitCode = code),
  (error) => {
    console.error(`unslop: ${error.message}`);
    process.exitCode = 2;
  },
);
