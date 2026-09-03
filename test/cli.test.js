import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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

for (const format of ["json", "markdown"]) {
  test(`writes ${format} to nested and existing output parents without stdout`, () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "run-artifact-index-output-"));
    try {
      const output = format === "json"
        ? path.join(directory, "new", "nested", "index.json")
        : path.join(directory, "index.md");
      const result = spawnSync(process.execPath, [
        "bin/run-artifact-index.js", "fixtures/sample-run", "--format", format, "--output", output
      ], { encoding: "utf8" });

      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, "");
      const contents = fs.readFileSync(output, "utf8");
      if (format === "json") assert.ok(Array.isArray(JSON.parse(contents).artifacts));
      else assert.match(contents, /^# Run Artifact Index/m);
    } finally {
      fs.rmSync(directory, { recursive: true });
    }
  });
}

for (const format of ["json", "markdown"]) {
  test(`excludes a nested ${format} output from repeated scans`, () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "run-artifact-index-self-output-"));
    try {
      fs.mkdirSync(path.join(directory, "reports"), { recursive: true });
      fs.mkdirSync(path.join(directory, "other"), { recursive: true });
      fs.writeFileSync(path.join(directory, "reports", "summary.md"), "summary\n");
      fs.writeFileSync(path.join(directory, "other", format === "json" ? "index.json" : "index.md"), "input\n");
      const output = path.join(directory, "nested", format === "json" ? "index.json" : "index.md");
      const args = ["bin/run-artifact-index.js", directory, "--format", format, "--output", output];

      const first = spawnSync(process.execPath, args, { encoding: "utf8" });
      assert.equal(first.status, 0, first.stderr);
      const firstContents = fs.readFileSync(output, "utf8");
      const second = spawnSync(process.execPath, args, { encoding: "utf8" });
      assert.equal(second.status, 0, second.stderr);
      const secondContents = fs.readFileSync(output, "utf8");

      if (format === "json") {
        const firstIndex = JSON.parse(firstContents);
        const secondIndex = JSON.parse(secondContents);
        assert.equal(secondIndex.artifactCount, firstIndex.artifactCount);
        assert.deepEqual(secondIndex.artifacts.map(({ path }) => path), firstIndex.artifacts.map(({ path }) => path));
        assert.deepEqual(secondIndex.artifacts.map(({ path }) => path), ["other/index.json", "reports/summary.md"]);
      } else {
        assert.equal(secondContents, firstContents);
        assert.match(secondContents, /Artifacts: 2/);
        assert.match(secondContents, /other\/index\.md/);
        assert.doesNotMatch(secondContents, /nested\/index\.md/);
      }
    } finally {
      fs.rmSync(directory, { recursive: true });
    }
  });
}

test("help documents the complete supported option set", () => {
  const result = spawnSync(process.execPath, ["bin/run-artifact-index.js", "--help"], { encoding: "utf8" });

  assert.equal(result.status, 0);
  for (const option of [
    "[root]",
    "--ledger <ledger.json>",
    "--format <json|markdown>",
    "--output <file>",
    "--include-hidden",
    "--category <name>",
    "--checksum",
    "--max-depth <integer>",
    "--exclude <pattern>",
    "--help, -h"
  ]) {
    assert.match(result.stdout, new RegExp(option.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(result.stdout, /default: current directory/);
  assert.match(result.stdout, /default: json/);
  assert.match(result.stdout, /json or markdown/);
  assert.match(result.stdout, /repeatable/);
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
