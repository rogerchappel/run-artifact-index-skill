import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyArtifact, redactHome, scanArtifacts } from "../src/artifacts.js";

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

test("skips hidden paths by default", () => {
  const hidden = scanArtifacts("fixtures/sample-run").artifacts.find((artifact) => artifact.path.includes(".hidden"));
  assert.equal(hidden, undefined);
});

test("can include hidden paths explicitly", () => {
  const hidden = scanArtifacts("fixtures/sample-run", { includeHidden: true }).artifacts.find((artifact) => artifact.path === ".hidden/secret.txt");
  assert.ok(hidden);
});

test("redacts home directory prefixes", () => {
  const redacted = redactHome(`${process.env.HOME}/workspace/file.txt`);
  assert.equal(redacted, "~/workspace/file.txt");
});
