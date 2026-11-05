import assert from "node:assert/strict";
import test from "node:test";

// Intentionally failing test: used to verify that the required `verify`
// status check blocks merging. Do not merge this branch.
test("intentional failure for required status check", () => {
  assert.equal(1, 2);
});
