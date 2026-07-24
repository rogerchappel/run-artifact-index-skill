import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { parseArgs } from "../src/cli.js";

test("accepts a non-negative integer max depth", () => {
  assert.equal(parseArgs(["--max-depth", "0"]).maxDepth, 0);
  assert.equal(parseArgs(["--max-depth", "2"]).maxDepth, 2);
});

for (const value of ["nope", "-1", "1.5", "Infinity"]) {
  test(`rejects invalid max depth ${value}`, () => {
    assert.throws(
      () => parseArgs(["--max-depth", value]),
      { message: "--max-depth must be a finite non-negative integer" }
    );
  });
}

test("reports a missing max depth value as a CLI error", () => {
  const result = spawnSync(
    process.execPath,
    ["bin/run-artifact-index.js", "fixtures/sample-run", "--max-depth"],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /--max-depth requires a value/);
});

test("reports an invalid max depth value as a CLI error", () => {
  const result = spawnSync(
    process.execPath,
    ["bin/run-artifact-index.js", "fixtures/sample-run", "--max-depth", "nope"],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /--max-depth must be a finite non-negative integer/);
});
