// Formats lint results for people (grouped by file, with the fix under each finding) or for tools (JSON).

const useColour = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColour ? `\x1b[${code}m${text}\x1b[0m` : text);
const dim = paint(2);
const bold = paint(1);
const red = paint(31);
const yellow = paint(33);

export function summarise(results) {
  const all = results.flatMap((result) => result.findings);
  return {
    files: results.length,
    errors: all.filter((finding) => finding.severity === "error").length,
    warnings: all.filter((finding) => finding.severity === "warn").length,
  };
}

export function formatText(results) {
  const out = [];
  for (const { file, findings } of results) {
    if (findings.length === 0) continue;
    out.push(bold(file));
    for (const finding of findings) {
      const label = finding.severity === "error" ? red("error") : yellow("warn ");
      out.push(
        `  ${dim(`${finding.line}:${finding.column}`.padEnd(8))} ${label}  ${finding.message} ${dim(finding.id)}`,
      );
      out.push(`  ${" ".repeat(8)} ${dim(`fix: ${finding.fix}`)}`);
    }
    out.push("");
  }
  const { files, errors, warnings } = summarise(results);
  const noun = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
  if (errors + warnings === 0) out.push(`No slop found in ${noun(files, "file")}.`);
  else out.push(`${noun(errors, "error")} and ${noun(warnings, "warning")} in ${noun(files, "file")} checked.`);
  return out.join("\n");
}

export const formatJson = (results) => JSON.stringify({ ...summarise(results), results }, null, 2);
