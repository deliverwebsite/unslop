import { test } from "node:test";
import assert from "node:assert/strict";
import { compile, lintText } from "../src/lint.js";
import { loadPatterns } from "../src/files.js";
import { check } from "../src/schema.js";

const compiled = (await loadPatterns()).map(compile);
const ids = (text, ext = "html") => lintText(text, ext, compiled).map((f) => f.id);

test("reports line and column of each finding", () => {
  const [finding] = lintText("<main>\n  <h1>Supercharge sales</h1>\n</main>", "html", compiled);
  assert.equal(finding.id, "banned-phrase");
  assert.deepEqual([finding.line, finding.column], [2, 7]);
  assert.match(finding.message, /"Supercharge"/);
});

test("banned phrases match common endings and curly apostrophes, not identifiers", () => {
  assert.deepEqual(ids("<p>Supercharged reports</p>"), ["banned-phrase"]);
  assert.deepEqual(ids("<p>In today’s fast-paced world</p>"), ["banned-phrase"]);
  assert.deepEqual(ids("<SeamlessScroll />"), []);
});

test("copy checks skip stylesheets; style checks cover stylesheets and markup", () => {
  assert.deepEqual(ids("/* Seamless */ a { color: red }", "css"), []);
  assert.ok(ids("a { background: linear-gradient(#667eea, #764ba2) }", "css").includes("purple-blue-gradient"));
  assert.ok(ids('<div class="from-violet-500 to-blue-500">').includes("purple-blue-gradient"));
});

test("max allows a number of uses per file before reporting", () => {
  const one = '<h1 class="bg-clip-text"></h1>';
  assert.deepEqual(ids(one), []);
  assert.deepEqual(ids(one + one + one), ["gradient-text", "gradient-text"]);
});

test("unless skips a file that already handles the concern, once reports it a single time", () => {
  const css = "@keyframes a {} @keyframes b {}";
  assert.deepEqual(ids(css, "css"), ["css-motion-without-reduced"]);
  assert.deepEqual(ids(`${css} @media (prefers-reduced-motion: reduce) {}`, "css"), []);
});

test("unslop-ignore comments skip a line, the next line, or the whole file", () => {
  assert.deepEqual(ids("<p>Seamless</p> <!-- unslop-ignore -->"), []);
  assert.deepEqual(ids("<!-- unslop-ignore-next-line -->\n<p>Seamless</p>\n<p>Seamless</p>"), ["banned-phrase"]);
  assert.deepEqual(ids("<!-- unslop-ignore-file -->\n<p>Seamless</p>"), []);
});

test("multi-line tags are matched as a whole", () => {
  assert.deepEqual(ids('<img\n  src="/a.png"\n/>'), ["img-without-alt"]);
  assert.deepEqual(ids('<img\n  src="/a.png"\n  alt="Chart of weekly sign-ups"\n/>'), []);
});

test("schema check reports missing, unknown and malformed fields", () => {
  const schema = {
    type: "object",
    required: ["id"],
    additionalProperties: false,
    properties: { id: { type: "string", pattern: "^[a-z]+$" } },
  };
  assert.deepEqual(check({ id: "ok" }, schema), []);
  assert.deepEqual(check({ id: "Bad", extra: 1 }, schema), [
    "top level.id has the wrong format",
    "top level: unknown field extra",
  ]);
  assert.deepEqual(check({}, schema), ["top level: missing id"]);
});
