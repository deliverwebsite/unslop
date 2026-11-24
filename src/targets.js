// Each coding agent reads its rules from its own file. They are all generated from one source, rules/unslop.md,
// so the playbook is written once. Each target only adds the header its tool expects.
//
// `path` is where the generated copy lives in this repository (built by scripts/build.js).
// `installPath` is where `unslop init` puts it in a project. `shared` files may already hold the project's own
// instructions, so init places the playbook in a marked block inside them instead of replacing them.
// `detect` lists paths whose presence suggests the project uses that agent.

export const SOURCE = "rules/unslop.md";

export const BLOCK = "unslop";

export const REPO_NOTICE =
  "<!-- Generated from rules/unslop.md by scripts/build.js. Edit the source, then run `npm run build`. -->";

export const installNotice = (version) =>
  `<!-- unslop ${version}. Update with \`npx @deliverwebsite/unslop init\`; edits inside this block are replaced. -->`;

const frontmatter = (fields) => ["---", ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`), "---"];

export const TARGETS = [
  {
    id: "agents",
    path: "AGENTS.md",
    installPath: "AGENTS.md",
    shared: true,
    detect: ["AGENTS.md"],
    header: [],
  },
  {
    id: "claude",
    path: "CLAUDE.md",
    installPath: "CLAUDE.md",
    shared: true,
    detect: ["CLAUDE.md", ".claude"],
    header: [],
  },
  {
    id: "cursor",
    path: ".cursor/rules/unslop.mdc",
    installPath: ".cursor/rules/unslop.mdc",
    shared: false,
    detect: [".cursor", ".cursorrules"],
    header: frontmatter({ description: "Build interfaces that don't look AI-generated", alwaysApply: true }),
  },
  {
    id: "copilot",
    path: ".github/copilot-instructions.md",
    installPath: ".github/copilot-instructions.md",
    shared: true,
    detect: [".github/copilot-instructions.md"],
    header: [],
  },
  {
    id: "skill",
    path: "skills/unslop/SKILL.md",
    installPath: ".claude/skills/unslop/SKILL.md",
    shared: false,
    detect: [],
    header: frontmatter({
      name: "unslop",
      description:
        "Use when designing or building any website, landing page or app interface, so it doesn't look AI-generated. Product-first layout, specific copy, one accent colour, motion with a job, real interface states, reusable components.",
    }),
  },
];

// The file content for a target: its header, a notice, then the playbook.
export const render = (target, notice, rules) => [...target.header, notice, "", rules].join("\n");
