// A small JSON Schema checker covering only the keywords this repository's schemas use, so validation needs no
// dependencies. Returns a list of readable problems; an empty list means the value is valid.

const TYPES = {
  object: (v) => typeof v === "object" && v !== null && !Array.isArray(v),
  array: Array.isArray,
  string: (v) => typeof v === "string",
  integer: Number.isInteger,
  boolean: (v) => typeof v === "boolean",
};

export function check(value, schema, where = "top level") {
  const problems = [];
  if (schema.enum && !schema.enum.includes(value)) {
    problems.push(`${where} must be one of ${schema.enum.join(", ")}`);
  }
  if (schema.type && !TYPES[schema.type](value)) {
    problems.push(`${where} must be ${schema.type === "array" ? "a list" : `a ${schema.type}`}`);
    return problems;
  }
  if (schema.type === "string") {
    if (schema.minLength && value.length < schema.minLength) problems.push(`${where} is too short`);
    if (schema.maxLength && value.length > schema.maxLength)
      problems.push(`${where} is over ${schema.maxLength} characters`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) problems.push(`${where} has the wrong format`);
  }
  if (schema.type === "array") {
    if (value.length < (schema.minItems ?? 0)) problems.push(`${where} needs at least ${schema.minItems} item(s)`);
    if (schema.items) value.forEach((item, i) => problems.push(...check(item, schema.items, `${where}[${i}]`)));
  }
  if (schema.type === "object") {
    for (const key of schema.required ?? []) if (!(key in value)) problems.push(`${where}: missing ${key}`);
    for (const [key, item] of Object.entries(value)) {
      const rule = schema.properties?.[key];
      if (rule) problems.push(...check(item, rule, `${where}.${key}`));
      else if (schema.additionalProperties === false) problems.push(`${where}: unknown field ${key}`);
    }
  }
  return problems;
}
