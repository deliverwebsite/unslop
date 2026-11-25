# Contributing to unslop

Thanks for helping agents build better interfaces.

## Improve the playbook

1. Edit **only** [`rules/unslop.md`](rules/unslop.md). The files for each tool (`AGENTS.md`, `CLAUDE.md`,
   `.cursor/rules/unslop.mdc`, `.github/copilot-instructions.md`, `skills/unslop/SKILL.md`) are generated from it.
   The banned-phrase list inside it is generated from [`patterns/copy.json`](patterns/copy.json).
2. Run `npm run build` to regenerate them, then `npm run check`.
3. In the pull request, explain the problem the rule fixes, ideally with a before/after from a real agent.

Good rules are specific and testable ("body text 16–18 px"), not taste statements ("make it beautiful"). Every line
costs the agent context, so a new rule should replace a vaguer one where it can.

## Add a lint check

Checks live in [`patterns/`](patterns), one file per scope (schema: [`schema/patterns.schema.json`](schema/patterns.schema.json)).
Each one has:

- `id`, `severity` (`error` for clear slop or broken accessibility, `warn` for things that need judgement) and
  `scope`: `copy` and `markup` run on HTML-like files, `style` also runs on stylesheets.
- Either `phrases` (matched as whole words, in any case, with common endings) or a `regex`.
- Optional `max` (uses allowed per file before reporting), `once` (report a file once) and `unless` (skip a file
  that matches this, such as one that already handles reduced motion).
- `message`, `fix`, and `examples`: at least one `bad` string the check must catch and one `good` string it must
  pass. `npm run check` runs every check against its examples, so add a `good` example for any false positive you
  fix.

Prefer fewer false positives over more catches: a noisy check gets ignored.

## Ground rules

- Write in your own words; don't name other companies or products, and don't paste their copy, logos or screenshots.
- Keep files small and focused (under 300 lines) and logic in one place.
- Be kind in reviews and issues.

Requires Node.js 22 or newer. Run `npm install` once (Prettier is the only dev dependency), then `npm test` for the
tests or `npm run check` for everything CI runs.
