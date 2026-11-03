import { register } from "node:module";

// Tools import via the `@/` alias and extensionless relative paths, which
// plain Node cannot resolve; the hooks below map them to `.ts` files.
register("./ts-resolver-hooks.mjs", import.meta.url);
