import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { classifyArtifact, redactHome, scanArtifacts } from "../src/artifacts.js";
import { renderJson, renderMarkdown } from "../src/render.js";

test("classifies common artifact paths", () => {
  assert.equal(classifyArtifact("reports/summary.md"), "report");
  assert.equal(classifyArtifact("logs/build.log"), "evidence");
  assert.equal(classifyArtifact("packages/output.tgz"), "package");
  assert.equal(classifyArtifact("fixtures/input.json"), "fixture");
  assert.equal(classifyArtifact("tmp/cache.json"), "disposable");
});

test("scans fixtures and joins command ledger", () => {
  const index = scanArtifacts("fixtures/sample-run", { ledger: "fixtures/sample-run/ledger.json" });
  const report = index.artifacts.find((artifact) => artifact.path === "reports/summary.md");
  assert.equal(report.category, "report");
  assert.equal(report.command, "npm test");
  assert.equal(index.categories.report, 1);
});

test("accepts a top-level ledger array", () => {
  withLedger([
    { command: "npm test", artifacts: ["reports/summary.md"] }
  ], (ledger) => {
    const index = scanArtifacts("fixtures/sample-run", { ledger });
    assert.equal(index.artifacts.find((artifact) => artifact.path === "reports/summary.md").command, "npm test");
  });
});

for (const [name, ledger, message] of [
  ["a non-array commands property", { commands: {} }, 'Ledger must be an array or an object with a "commands" array'],
  ["an unrelated object", {}, 'Ledger must be an array or an object with a "commands" array'],
  ["a primitive", true, 'Ledger must be an array or an object with a "commands" array'],
  ["a non-object command", [null], "Ledger command at index 0 must be an object"],
  ["a missing command string", [{ artifacts: [] }], 'Ledger command at index 0 must have a non-empty "command" string'],
  ["a missing artifacts array", [{ command: "npm test" }], 'Ledger command at index 0 must have an "artifacts" array'],
  ["a non-string result", [{ command: "npm test", result: false, artifacts: [] }], 'Ledger command at index 0 must have a string "result" when provided'],
  ["a non-string artifact", [{ command: "npm test", artifacts: [42] }], "Ledger artifact at commands[0].artifacts[0] must be a non-empty string"]
]) {
  test(`rejects ${name} in a ledger`, () => {
    withLedger(ledger, (ledgerPath) => {
      assert.throws(() => scanArtifacts("fixtures/sample-run", { ledger: ledgerPath }), { message });
    });
  });
}

test("reports invalid ledger JSON deterministically", () => {
  withLedgerText("{", (ledger) => {
    assert.throws(
      () => scanArtifacts("fixtures/sample-run", { ledger }),
      { message: "Ledger must contain valid JSON" }
    );
  });
});

test("skips hidden paths by default", () => {
  const hidden = scanArtifacts("fixtures/sample-run").artifacts.find((artifact) => artifact.path.includes(".hidden"));
  assert.equal(hidden, undefined);
});

test("can include hidden paths explicitly", () => {
  const hidden = scanArtifacts("fixtures/sample-run", { includeHidden: true }).artifacts.find((artifact) => artifact.path === ".hidden/secret.txt");
  assert.ok(hidden);
});

test("filters by category", () => {
  const index = scanArtifacts("fixtures/sample-run", { category: "package" });
  assert.deepEqual(index.artifacts.map((artifact) => artifact.category), ["package"]);
  assert.equal(index.artifactCount, 1);
  assert.deepEqual(index.categories, { package: 1 });
});

test("renders summaries for only the filtered artifacts", () => {
  const index = scanArtifacts("fixtures/sample-run", { category: "package" });
  const json = JSON.parse(renderJson(index));
  const markdown = renderMarkdown(index);

  assert.equal(json.artifactCount, json.artifacts.length);
  assert.deepEqual(json.categories, { package: 1 });
  assert.match(markdown, /Artifacts: 1/);
  assert.match(markdown, /- package: 1/);
  assert.doesNotMatch(markdown, /- report:/);
});

test("can add sha256 checksums", () => {
  const index = scanArtifacts("fixtures/sample-run", { category: "report", checksum: true });
  assert.match(index.artifacts[0].sha256, /^[a-f0-9]{64}$/);
});

test("honors max depth", () => {
  const index = scanArtifacts("fixtures/sample-run", { maxDepth: 0 });
  assert.equal(index.artifacts.some((artifact) => artifact.path === "reports/summary.md"), false);
});

test("matches expected package-only fixture", () => {
  const expected = JSON.parse(fs.readFileSync("fixtures/expected-package-only.json", "utf8"));
  const index = scanArtifacts("fixtures/sample-run", { category: expected.category });
  assert.equal(index.artifacts.length, expected.artifactCount);
  assert.deepEqual(index.artifacts.map((artifact) => artifact.path), expected.paths);
});

test("redacts only the home directory and its descendants", () => {
  const originalHome = process.env.HOME;
  process.env.HOME = "/Users/al";

  try {
    assert.equal(redactHome("/Users/al"), "~");
    assert.equal(redactHome("/Users/al/workspace/file.txt"), "~/workspace/file.txt");
    assert.equal(redactHome("/Users/alice/workspace/file.txt"), "/Users/alice/workspace/file.txt");
    assert.equal(redactHome("/backup/Users/al/workspace/file.txt"), "/backup/Users/al/workspace/file.txt");
  } finally {
    if (originalHome === undefined) delete process.env.HOME;
    else process.env.HOME = originalHome;
  }
});

function withLedger(value, callback) {
  withLedgerText(JSON.stringify(value), callback);
}

function withLedgerText(contents, callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "run-artifact-index-ledger-"));
  const ledger = path.join(directory, "ledger.json");
  try {
    fs.writeFileSync(ledger, contents);
    callback(ledger);
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
}
