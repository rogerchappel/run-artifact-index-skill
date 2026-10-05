import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const workflow = fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");

test("CI Node matrix covers the package's declared engine lower bound", () => {
  const engine = packageJson.engines?.node;
  assert.match(engine ?? "", /^>=\d+(?:\.\d+)?$/,
    "this check expects a simple inclusive Node engine minimum");
  const minimum = Number(engine.slice(2));
  const matrix = workflow.match(/node-version:\s*\[([^\]]+)\]/);
  assert.ok(matrix, "CI must declare a Node version matrix");
  const versions = [...matrix[1].matchAll(/\d+(?:\.\d+)?/g)].map(([v]) => Number(v));
  assert.ok(versions.some((version) => version <= minimum),
    `CI versions ${versions.join(", ")} must include the supported minimum Node ${minimum}`);
});
