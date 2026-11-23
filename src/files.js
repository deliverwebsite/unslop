// File-system helpers: where the package's own files live, and which project files to lint.
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EXTENSIONS } from "./lint.js";

export const PACKAGE_ROOT = fileURLToPath(new URL("..", import.meta.url));

export const readPackageFile = (path) => readFile(join(PACKAGE_ROOT, path), "utf8");

export async function loadPatterns() {
  return JSON.parse(await readPackageFile("patterns.json")).patterns;
}

// Folders that hold dependencies, build output or tool state, never hand-written UI.
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  "vendor",
  ".next",
  ".nuxt",
  ".output",
  ".svelte-kit",
  ".astro",
  ".vercel",
  ".turbo",
  ".cache",
  "storybook-static",
]);

export const extensionOf = (path) => extname(path).slice(1).toLowerCase();

const isLintable = (path) => EXTENSIONS.includes(extensionOf(path)) && !/\.min\.[a-z]+$/.test(path);

// Every lintable file under the given paths (files or folders), relative to `cwd`, in a stable order.
export async function collectFiles(paths, cwd = process.cwd()) {
  const found = new Set();

  async function walk(path) {
    const info = await stat(path).catch(() => null);
    if (!info) throw new Error(`No such file or folder: ${relative(cwd, path) || path}`);
    if (info.isFile()) {
      if (isLintable(path)) found.add(relative(cwd, path));
      return;
    }
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
      if (entry.isDirectory() || entry.isFile()) await walk(join(path, entry.name));
    }
  }

  for (const path of paths) await walk(resolve(cwd, path));
  return [...found].sort();
}
