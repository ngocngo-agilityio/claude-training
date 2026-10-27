import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC_DIR = new URL("../../src/", import.meta.url);

const withTsExtension = (url) => {
  const path = fileURLToPath(url);
  for (const candidate of [`${path}.ts`, `${path}/index.ts`]) {
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return undefined;
};

export const resolve = (specifier, context, nextResolve) => {
  let target;
  if (specifier.startsWith("@/")) {
    target = new URL(specifier.slice(2), SRC_DIR);
  } else if (
    specifier.startsWith(".") &&
    !/\.[cm]?[jt]sx?$|\.json$/.test(specifier) &&
    context.parentURL
  ) {
    target = new URL(specifier, context.parentURL);
  }
  const resolved = target && withTsExtension(target);
  return resolved
    ? { url: resolved, shortCircuit: true }
    : nextResolve(specifier, context);
};
