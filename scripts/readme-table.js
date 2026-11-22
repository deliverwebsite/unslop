// Renders the library table that sits between the markers in README.md, from libraries.json,
// so the list is written once and the README never drifts from the data.

export const START = "<!-- libraries:start -->";
export const END = "<!-- libraries:end -->";

const cell = (text) => String(text).replaceAll("|", "\\|");

export function renderTable(libraries) {
  const rows = libraries.map((library) => {
    const name = `[${cell(library.name)}](${library.url})`;
    const code = library.github ? `[GitHub](${library.github})` : "—";
    return `| ${name} | ${cell(library.bestFor)} | ${code} |`;
  });
  return ["| Library | Best for | Code |", "|---|---|---|", ...rows].join("\n");
}

export function replaceBetweenMarkers(readme, table) {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start === -1 || end === -1) throw new Error(`README.md needs ${START} and ${END} markers.`);
  return `${readme.slice(0, start + START.length)}\n${table}\n${readme.slice(end)}`;
}
