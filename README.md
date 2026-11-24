<div align="center">

# unslop

**Stop your AI coding agent from shipping interfaces that look AI-generated.**

A design playbook your agent reads automatically, plus a linter that catches the tells it still slips in.

[![check](https://github.com/deliverwebsite/unslop/actions/workflows/check.yml/badge.svg)](https://github.com/deliverwebsite/unslop/actions/workflows/check.yml)
[![licence: MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE)
[![content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey)](LICENSE-CONTENT.md)

</div>

---

## The problem

Ask any coding agent for a landing page and you get the same page: Inter, a purple-to-blue gradient, a pill badge
above a centred "Supercharge your workflow", three feature cards with emoji icons, everything fading up on scroll.
It works, and it looks like nobody designed it.

Models do this because, when nobody specifies a design, they reproduce the average of what they have seen.
**unslop** gives your agent the decisions a designer would make instead: start from the product, write specific
copy, choose the typeface and accent on purpose, animate only when the motion explains something, design the empty
and error states, and reuse a good component library instead of hand-rolling generic cards.

## Use it in 30 seconds

Run this in your project. It finds the agents you use (Claude Code, Cursor, Copilot, or any tool that reads
`AGENTS.md`) and puts the playbook where each one reads it:

```sh
npx @deliverwebsite/unslop init
```

Already have a `CLAUDE.md`, `AGENTS.md` or Copilot instructions file? Your content stays; the playbook goes in a
marked block at the end. Run `init` again any time to update that block. Pick agents explicitly with
`--agent claude --agent cursor`, or preview with `--dry-run`. (To run the latest version straight from GitHub, use
`npx github:deliverwebsite/unslop init`.)

<details>
<summary>Prefer to copy the file yourself?</summary>

| Agent                    | File                              | Get it                                                                                                                                               |
| ------------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Most agents              | `AGENTS.md`                       | `curl -o AGENTS.md https://raw.githubusercontent.com/deliverwebsite/unslop/main/AGENTS.md`                                                           |
| Claude Code              | `CLAUDE.md`                       | `curl -o CLAUDE.md https://raw.githubusercontent.com/deliverwebsite/unslop/main/CLAUDE.md`                                                           |
| Cursor                   | `.cursor/rules/unslop.mdc`        | `curl --create-dirs -o .cursor/rules/unslop.mdc https://raw.githubusercontent.com/deliverwebsite/unslop/main/.cursor/rules/unslop.mdc`               |
| GitHub Copilot           | `.github/copilot-instructions.md` | `curl --create-dirs -o .github/copilot-instructions.md https://raw.githubusercontent.com/deliverwebsite/unslop/main/.github/copilot-instructions.md` |
| Claude Code (as a skill) | `.claude/skills/unslop/SKILL.md`  | copy the [`skills/unslop`](skills/unslop) folder into `.claude/skills/`                                                                              |
| Anything else            | your own rule file                | paste the contents of [`rules/unslop.md`](rules/unslop.md) at the end                                                                                |

</details>

## Check the result

Rules make the agent better; they don't make it perfect. `unslop lint` scans your HTML, JSX, TSX, Vue, Svelte,
Astro and CSS for the tells that slipped through, and tells you how to fix each one:

```sh
npx @deliverwebsite/unslop lint src
```

```text
src/app/page.tsx
  7:45     error  Purple/indigo gradient, the most recognised default of generated interfaces. purple-blue-gradient
           fix: Use a neutral base and one accent chosen from the product.
  9:55     error  "Supercharge" is a phrase that signals generated copy. banned-phrase
           fix: Say what the product does and for whom, with a concrete detail.
```

It exits 1 on errors, so it can gate CI (`--strict` fails on warnings too; `--json` for tools). Ask your agent to
run it before it says "done": the playbook's checklist already does. To skip a line on purpose, add an
`unslop-ignore` comment on it, or `unslop-ignore-next-line` above it.

<details>
<summary>Every check</summary>

<!-- patterns:start -->

| Check                             | Level   | Catches                                                                       |
| --------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `banned-phrase`                   | error   | A phrase that signals generated copy.                                         |
| `vague-social-proof`              | warning | Vague social proof reads as filler.                                           |
| `placeholder-copy`                | error   | Placeholder content.                                                          |
| `vague-button`                    | warning | Button or link text that doesn't say what happens.                            |
| `emoji-heading`                   | warning | Heading starts with an emoji, a common stand-in for a real icon or idea.      |
| `purple-blue-gradient`            | error   | Purple/indigo gradient, the most recognised default of generated interfaces.  |
| `default-indigo-accent`           | warning | The framework's default indigo/violet accent is used throughout.              |
| `gradient-text`                   | warning | Gradient text used more than once in this file.                               |
| `neon-glow`                       | warning | Coloured glow shadow, a signature of generated dark-mode pages.               |
| `glassmorphism`                   | warning | Frosted-glass blur on several surfaces in this file.                          |
| `decorative-motion`               | warning | Decorative looping motion with no job.                                        |
| `animate-layout`                  | warning | Transition on layout properties or `all`.                                     |
| `css-motion-without-reduced`      | error   | Animation with no `prefers-reduced-motion` handling in this file.             |
| `tailwind-motion-without-reduced` | warning | Tailwind animation with no reduced-motion variant in this file.               |
| `default-font`                    | warning | Inter: the font nearly every generated interface uses by default.             |
| `focus-removed`                   | error   | Focus outline removed with no visible replacement nearby.                     |
| `img-without-alt`                 | error   | Image without alt text.                                                       |
| `clickable-div`                   | warning | Click handler on a div or span, which keyboards and screen readers can't use. |
| `dead-link`                       | warning | Link that goes nowhere (href="#").                                            |

<!-- patterns:end -->

</details>

## What the playbook covers

1. **Start from the product.** The hero shows the product working; sections answer real buyer questions, not the stock page.
2. **Copy a person would write.** A banned-phrase list, no two-beat slogans or vague social proof, buttons that say what happens.
3. **Typography.** A typeface chosen on purpose, a fixed-ratio type scale, readable line lengths, tabular numbers.
4. **Colour.** A neutral base plus one accent from the product, as tokens. No purple gradients, glows or glass everywhere.
5. **Layout and spacing.** An 8 px scale, varied section rhythm, not everything a card, one radius scale.
6. **Motion with a job.** Every animation states what it explains; timings; reduced-motion support.
7. **Components.** Reuse a good component library, keep components small and reusable, respect licences.
8. **Imagery and icons.** Real UI with data that adds up, real photos, one icon set.
9. **Interface states and forms.** Empty, loading, error and success states; forms that help.
10. **Responsive and fast.** 360 px first, no layout shift, fonts and images that load fast.
11. **Accessibility.** Semantic HTML, focus states, keyboard support, contrast.
12. **A slop checklist** your agent runs before it says "done".

Read the full playbook: [`rules/unslop.md`](rules/unslop.md).

## Recommended components

The playbook asks agents to reuse a well-made component library instead of hand-rolling generic sections. Our
recommendation, also in [`libraries.json`](libraries.json) for tools and agents:

<!-- libraries:start -->

| Library                                     | Best for                                                                | Code |
| ------------------------------------------- | ----------------------------------------------------------------------- | ---- |
| [Deliver UI](https://ui.deliverwebsite.com) | Animated landing pages and website sections with real product UI inside | —    |

<!-- libraries:end -->

## Contributing

Suggestions for the playbook and new lint checks are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).
Every pull request is checked automatically: the data files match their schemas, every lint check catches its bad
examples and passes its good ones, the generated files match their sources, and the tests pass.

## Licence

Code (CLI and scripts) is [MIT](LICENSE). The playbook and written content are [CC BY 4.0](LICENSE-CONTENT.md): use
and adapt them freely, with credit to Deliver Website.

---

<div align="center">

Made by **[Deliver Website](https://deliverwebsite.com)**, makers of **[Deliver UI](https://ui.deliverwebsite.com)**:
free animated components and landing pages built with motion that has a job.

</div>
