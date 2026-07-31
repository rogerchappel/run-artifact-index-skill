import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { parseArgs } from "../src/cli.js";

test("accepts a non-negative integer max depth", () => {
  assert.equal(parseArgs(["--max-depth", "0"]).maxDepth, 0);
  assert.equal(parseArgs(["--max-depth", "2"]).maxDepth, 2);
});

test("accepts zero or one positional root", () => {
  assert.equal(parseArgs([]).root, ".");
  assert.equal(parseArgs(["fixtures/sample-run"]).root, "fixtures/sample-run");
});

test("rejects extra positional roots", () => {
  assert.throws(
    () => parseArgs(["first", "second"]),
    { message: "Expected at most one root argument" }
  );
});

test("reports extra positional roots as a CLI error", () => {
  const result = spawnSync(
    process.execPath,
    ["bin/run-artifact-index.js", "fixtures/sample-run", "fixtures/sample-run"],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 1);
  assert.equal(result.stderr, "Expected at most one root argument\n");
  assert.equal(result.stdout, "");
});

test("help states the root and ledger shape contracts", () => {
  const result = spawnSync(process.execPath, ["bin/run-artifact-index.js", "--help"], { encoding: "utf8" });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Accepts at most one root/);
  assert.match(result.stdout, /Ledgers must be a command array/);
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
