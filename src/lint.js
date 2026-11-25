// The lint engine: turns the patterns in patterns/*.json into checks and runs them over one file's text.
// It knows nothing about the file system or output format; see files.js and report.js for those.

const MARKUP = ["html", "htm", "jsx", "tsx", "vue", "svelte", "astro"];
const STYLE = ["css", "scss", "sass", "less"];

// Which file extensions each pattern scope applies to. Styles live in stylesheets and also inside markup
// (Tailwind classes, <style> blocks, inline styles); copy and markup checks only make sense in markup.
export const SCOPES = {
  copy: MARKUP,
  markup: MARKUP,
  style: [...MARKUP, ...STYLE],
};

export const EXTENSIONS = [...new Set(Object.values(SCOPES).flat())];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A phrase matches as a whole word, in any case, with common endings ("Supercharged", "Empowering"),
// and with either a straight or curly apostrophe.
function phraseSource(phrases) {
  const alternatives = [...phrases]
    .sort((a, b) => b.length - a.length)
    .map((phrase) => escapeRegex(phrase).replace(/'/g, "['’]").replace(/ /g, "\\s+"));
  return `\\b(?:${alternatives.join("|")})(?:s|d|ed|ing|ly|r|rs)?\\b`;
}

export function compile(pattern) {
  const source = pattern.phrases ? phraseSource(pattern.phrases) : pattern.regex;
  const flags = pattern.flags ?? "gi";
  return {
    ...pattern,
    regex: new RegExp(source, flags.includes("g") ? flags : `${flags}g`),
    unless: pattern.unless ? new RegExp(pattern.unless, "i") : null,
    extensions: new Set(SCOPES[pattern.scope]),
  };
}

// 1-based line and column for an offset, from a sorted list of line-start offsets.
function position(lineStarts, offset) {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (lineStarts[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return { line: low + 1, column: offset - lineStarts[low] + 1 };
}

function lineStartsOf(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
  return starts;
}

// A finding is skipped when its line says `unslop-ignore` or the line above says `unslop-ignore-next-line`.
function isIgnored(lines, line) {
  const current = lines[line - 1] ?? "";
  const previous = lines[line - 2] ?? "";
  return /unslop-ignore(?!-)/.test(current) || previous.includes("unslop-ignore-next-line");
}

const shorten = (text) => {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 60 ? `${flat.slice(0, 57)}…` : flat;
};

// Runs every compiled pattern that applies to `extension` over `text`. Returns findings sorted by position.
export function lintText(text, extension, compiled) {
  if (text.includes("unslop-ignore-file")) return [];
  const lineStarts = lineStartsOf(text);
  const lines = text.split("\n");
  const findings = [];

  for (const pattern of compiled) {
    if (!pattern.extensions.has(extension)) continue;
    if (pattern.unless?.test(text)) continue;
    const matches = [...text.matchAll(pattern.regex)];
    const reported = matches.slice(pattern.max ?? 0, pattern.once ? (pattern.max ?? 0) + 1 : undefined);
    for (const match of reported) {
      const { line, column } = position(lineStarts, match.index);
      if (isIgnored(lines, line)) continue;
      findings.push({
        id: pattern.id,
        severity: pattern.severity,
        line,
        column,
        message: pattern.message.replace("{match}", shorten(match[0])),
        fix: pattern.fix,
      });
    }
  }
  return findings.sort((a, b) => a.line - b.line || a.column - b.column);
}
