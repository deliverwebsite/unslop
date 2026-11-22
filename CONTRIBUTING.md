# Contributing to unslop

Thanks for helping agents build better interfaces.

## Improve the playbook

1. Edit **only** [`rules/unslop.md`](rules/unslop.md). The files for each tool (`AGENTS.md`, `CLAUDE.md`,
   `.cursor/rules/unslop.mdc`, `.github/copilot-instructions.md`, `skills/unslop/SKILL.md`) are generated from it.
2. Run `npm run build` to regenerate them, then `npm run check`.
3. In the pull request, explain the problem the rule fixes, ideally with a before/after from a real agent.

Good rules are specific and testable ("body text 16–18 px"), not taste statements ("make it beautiful").

## Ground rules

- Write in your own words; don't name other companies or products, and don't paste their copy, logos or screenshots.
- Keep files small and focused (under 300 lines) and logic in one place.
- Be kind in reviews and issues.

Requires Node.js 26 (current LTS) or newer. Run `npm install` once (Prettier is the only dev dependency).
