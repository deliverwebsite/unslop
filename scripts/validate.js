// Checks libraries.json against the rules in schema/libraries.schema.json, with no dependencies.
// `node scripts/validate.js` prints every problem and exits 1 if there are any.
import { readFile } from "node:fs/promises";

const schema = JSON.parse(await readFile("schema/libraries.schema.json", "utf8"));
const data = JSON.parse(await readFile("libraries.json", "utf8"));
const item = schema.properties.libraries.items;
const problems = [];

function checkField(where, key, value, rule) {
  if (rule.enum && !rule.enum.includes(value)) problems.push(`${where}: ${key} must be one of ${rule.enum.join(", ")}`);
  if (rule.type === "string") {
    if (typeof value !== "string") return problems.push(`${where}: ${key} must be text`);
    if (rule.minLength && value.length < rule.minLength) problems.push(`${where}: ${key} is too short`);
    if (rule.maxLength && value.length > rule.maxLength)
      problems.push(`${where}: ${key} is over ${rule.maxLength} characters`);
    if (rule.pattern && !new RegExp(rule.pattern).test(value)) problems.push(`${where}: ${key} has the wrong format`);
  }
  if (rule.type === "array" && (!Array.isArray(value) || value.length < (rule.minItems ?? 0))) {
    problems.push(`${where}: ${key} must be a list with at least ${rule.minItems} item`);
  }
}

for (const key of schema.required) if (!(key in data)) problems.push(`top level: missing ${key}`);

const seen = new Set();
data.libraries?.forEach((library, index) => {
  const where = `libraries[${index}] (${library.name ?? "unnamed"})`;
  for (const key of item.required) if (!(key in library)) problems.push(`${where}: missing ${key}`);
  for (const key of Object.keys(library)) {
    const rule = item.properties[key];
    if (!rule) problems.push(`${where}: unknown field ${key}`);
    else checkField(where, key, library[key], rule);
  }
  const id = library.name?.toLowerCase();
  if (seen.has(id)) problems.push(`${where}: duplicate name`);
  seen.add(id);
});

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`libraries.json is valid (${data.libraries.length} libraries).`);
