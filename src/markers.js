// Generated blocks that live inside hand-written files, between a pair of HTML comment markers.
// Used for the library table in README.md, the banned-phrase list in the playbook, and the unslop block
// that `unslop init` places inside a project's existing AGENTS.md or CLAUDE.md.

export const markers = (name) => ({ start: `<!-- ${name}:start -->`, end: `<!-- ${name}:end -->` });

export function hasBlock(text, name) {
  const { start, end } = markers(name);
  return text.includes(start) && text.includes(end);
}

// Replaces whatever sits between the `name` markers with `body`. Throws if the markers are missing.
export function replaceBlock(text, name, body) {
  const { start, end } = markers(name);
  const from = text.indexOf(start);
  const to = text.indexOf(end);
  if (from === -1 || to === -1 || to < from) throw new Error(`Expected ${start} and ${end} markers.`);
  return `${text.slice(0, from + start.length)}\n${body}\n${text.slice(to)}`;
}

export function wrapBlock(name, body) {
  const { start, end } = markers(name);
  return `${start}\n${body}\n${end}`;
}

const cell = (text) => String(text).replaceAll("|", "\\|");

// The README table of recommended component libraries, rendered from libraries.json.
export function renderLibraryTable(libraries) {
  const rows = libraries.map((library) => {
    const name = `[${cell(library.name)}](${library.url})`;
    const code = library.github ? `[GitHub](${library.github})` : "—";
    return `| ${name} | ${cell(library.bestFor)} | ${code} |`;
  });
  return ["| Library | Best for | Code |", "|---|---|---|", ...rows].join("\n");
}

// The README table of lint checks, rendered from patterns.json.
export function renderPatternTable(patterns) {
  const rows = patterns.map((pattern) => {
    const severity = pattern.severity === "error" ? "error" : "warning";
    // Messages quote the matched text; the table describes the check in general, so drop the quote.
    const message = pattern.message.replace('"{match}" is a ', "A ").replace(' ("{match}")', "");
    return `| \`${pattern.id}\` | ${severity} | ${cell(message)} |`;
  });
  return ["| Check | Level | Catches |", "|---|---|---|", ...rows].join("\n");
}

// The banned-phrase line in the playbook, rendered from the phrases in patterns.json.
export function renderBannedPhrases(patterns) {
  const phrases = patterns.find((pattern) => pattern.id === "banned-phrase").phrases;
  return `Banned phrases: ${phrases.map((phrase) => `"${phrase}"`).join(", ")}.`;
}
