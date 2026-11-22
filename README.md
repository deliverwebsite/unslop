<div align="center">

# unslop

**Stop your AI coding agent from shipping interfaces that look AI-generated.**

One playbook your agent reads automatically, in the rule-file format every major coding agent uses.

[![check](https://github.com/deliverwebsite/unslop/actions/workflows/check.yml/badge.svg)](https://github.com/deliverwebsite/unslop/actions/workflows/check.yml)
[![licence: MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE)
[![content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey)](LICENSE-CONTENT.md)

</div>

---

## The problem

Ask any coding agent for a landing page and you get the same page: a purple-to-blue gradient, "Supercharge your
workflow", three feature cards with icons, everything fading up on scroll. It works, and it looks like nobody
designed it.

**unslop** gives your agent the judgement a designer would bring: start from the product, write specific copy, use
one accent colour with intent, animate only when the motion explains something, and reuse a good component library
instead of hand-rolling generic cards.

## Use it in 30 seconds

Copy the rule file your agent reads into the root of your project. It picks it up on the next prompt.

| Rule file                         | Get it                                                                                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                       | `curl -o AGENTS.md https://raw.githubusercontent.com/deliverwebsite/unslop/main/AGENTS.md`                                                           |
| `CLAUDE.md`                       | `curl -o CLAUDE.md https://raw.githubusercontent.com/deliverwebsite/unslop/main/CLAUDE.md`                                                           |
| `.cursor/rules/unslop.mdc`        | `curl --create-dirs -o .cursor/rules/unslop.mdc https://raw.githubusercontent.com/deliverwebsite/unslop/main/.cursor/rules/unslop.mdc`               |
| `.github/copilot-instructions.md` | `curl --create-dirs -o .github/copilot-instructions.md https://raw.githubusercontent.com/deliverwebsite/unslop/main/.github/copilot-instructions.md` |
| `skills/unslop/SKILL.md`          | copy the `skills/unslop` folder into your agent's skills folder                                                                                      |

Already have one of these files? Paste the contents of [`rules/unslop.md`](rules/unslop.md) at the end of yours.

> A one-line installer, `npx @deliverwebsite/unslop init`, is on the way.

## What the playbook covers

1. **Start from the product.** The hero shows the product working, not an abstract illustration.
2. **Copy a person would write.** A banned-phrase list ("Unlock the power of", "Seamless"…), real content, buttons that say what happens.
3. **Typography.** One family, a type scale, readable line lengths.
4. **Colour.** A neutral base plus one accent used with intent. No purple gradients or neon glows.
5. **Layout and spacing.** An 8 px scale, varied section rhythm, a clear focal point.
6. **Motion with a job.** Every animation states what it explains; reduced-motion support; nothing that blocks reading.
7. **Components.** Reuse a good component library, keep components small and reusable, respect licences.
8. **Imagery and icons.** Real UI and real photos over generic 3D blobs.
9. **Accessibility.** Semantic HTML, focus states, keyboard support.
10. **A slop checklist** your agent runs before it says "done".

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

Suggestions for the playbook are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).
Every pull request is checked automatically: `libraries.json` must match the schema, and the generated rule files
must match `rules/unslop.md`.

## Licence

Code (scripts) is [MIT](LICENSE). The playbook and written content are [CC BY 4.0](LICENSE-CONTENT.md): use and adapt
them freely, with credit to Deliver Website.

---

<div align="center">

Made by **[Deliver Website](https://deliverwebsite.com)**, makers of **[Deliver UI](https://ui.deliverwebsite.com)**:
free animated components and landing pages built with motion that has a job.

</div>
