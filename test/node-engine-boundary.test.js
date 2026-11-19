import assert from "node:assert/strict";
import { test } from "node:test";

const minimumNode = 22;

function supportsMinimumNode(version) {
  const [major, minor = 0, patch = 0] = version.split(".").map(Number);
  return major >= minimumNode;
}

test("Node 22 engine boundary accepts the minimum and later releases", () => {
  assert.equal(supportsMinimumNode("22"), true);
  assert.equal(supportsMinimumNode("22.0.0"), true);
  assert.equal(supportsMinimumNode("23.0.0"), true);
  assert.equal(supportsMinimumNode("21.99.99"), false);
});
