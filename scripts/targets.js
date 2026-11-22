// Each coding agent reads its rules from its own file. They are all generated from one source, rules/unslop.md,
// so the playbook is written once. Each target only adds the header its tool expects.

export const SOURCE = "rules/unslop.md";

const NOTICE =
  "<!-- Generated from rules/unslop.md by scripts/build.js. Edit the source, then run `npm run build`. -->";

export const TARGETS = [
  {
    path: "AGENTS.md",
    header: NOTICE,
  },
  {
    path: "CLAUDE.md",
    header: NOTICE,
  },
  {
    path: ".cursor/rules/unslop.mdc",
    header: [
      "---",
      "description: Build interfaces that don't look AI-generated",
      "alwaysApply: true",
      "---",
      NOTICE,
    ].join("\n"),
  },
  {
    path: ".github/copilot-instructions.md",
    header: NOTICE,
  },
  {
    path: "skills/unslop/SKILL.md",
    header: [
      "---",
      "name: unslop",
      "description: Use when designing or building any website, landing page or app interface, so it doesn't look AI-generated. Product-first layout, specific copy, one accent colour, motion with a job, reusable components.",
      "---",
      NOTICE,
    ].join("\n"),
  },
];
