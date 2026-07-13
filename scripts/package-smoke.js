import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const cwd = process.cwd();
const outDir = mkdtempSync(join(tmpdir(), "run-artifact-index-pack-"));

try {
  const packOutput = execFileSync("npm", ["pack", "--json", "--pack-destination", outDir], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const [{ filename, files }] = JSON.parse(packOutput);
  const names = new Set(files.map((file) => file.path));
  const required = [
    "bin/run-artifact-index.js",
    "src/cli.js",
    "src/artifacts.js",
    "docs/OUTPUT_SCHEMA.json",
    "fixtures/sample-run/ledger.json",
    "fixtures/expected-package-only.json",
    "README.md",
    "SKILL.md",
    "LICENSE",
    "CHANGELOG.md",
  ];
  const missing = required.filter((file) => !names.has(file));
  if (missing.length > 0) {
    throw new Error(`npm pack is missing required files: ${missing.join(", ")}`);
  }

  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  if (!packageJson.repository?.url || !packageJson.bugs?.url || !packageJson.homepage) {
    throw new Error("package metadata must include repository, bugs, and homepage URLs");
  }

  console.log(`package smoke passed: ${filename}`);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
