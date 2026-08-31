import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
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
  const tarball = join(outDir, filename);
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

  const repositoryOnly = ["package-lock.json", "scripts/validate.sh", "scripts/package-smoke.js", "test/artifacts.test.js"];
  const leaked = repositoryOnly.filter((file) => names.has(file));
  if (leaked.length > 0) {
    throw new Error(`npm pack includes repository-only validation files: ${leaked.join(", ")}`);
  }

  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const readme = readFileSync("README.md", "utf8");
  if (!packageJson.repository?.url || !packageJson.bugs?.url || !packageJson.homepage) {
    throw new Error("package metadata must include repository, bugs, and homepage URLs");
  }
  for (const command of [
    "npm pack --pack-destination ../consumer",
    `npm install --ignore-scripts ./${filename}`,
    "npx run-artifact-index ./run-output --ledger ./run-output/ledger.json --format json",
  ]) {
    if (!readme.includes(command)) {
      throw new Error(`README pre-publication quickstart is missing: ${command}`);
    }
  }

  const consumerDir = join(outDir, "consumer");
  mkdirSync(consumerDir);
  execFileSync("npm", ["init", "--yes"], { cwd: consumerDir, stdio: "ignore" });
  execFileSync("npm", ["install", "--ignore-scripts", tarball], { cwd: consumerDir, stdio: "ignore" });

  const installedPackage = join(consumerDir, "node_modules", packageJson.name);
  const installedBinary = join(consumerDir, "node_modules", ".bin", "run-artifact-index");
  const fixtureRoot = join(installedPackage, "fixtures", "sample-run");
  const fixtureLedger = join(fixtureRoot, "ledger.json");
  if (!existsSync(installedBinary) || !existsSync(fixtureLedger)) {
    throw new Error("installed package is missing its CLI link or shipped fixture ledger");
  }

  const jsonOutput = execFileSync(installedBinary, [fixtureRoot, "--ledger", fixtureLedger, "--format", "json"], {
    cwd: consumerDir,
    encoding: "utf8",
  });
  const index = JSON.parse(jsonOutput);
  if (!Array.isArray(index.artifacts) || index.artifacts.length < 3) {
    throw new Error("installed CLI JSON output did not include the shipped fixture artifacts");
  }
  if (!index.artifacts.some((artifact) => artifact.path === "reports/summary.md" && artifact.command === "npm test")) {
    throw new Error("installed CLI JSON output did not join shipped ledger evidence");
  }

  const nestedOutput = join(consumerDir, "generated", "nested", "index.json");
  const fileOutput = execFileSync(installedBinary, [
    fixtureRoot,
    "--exclude", "reports/*",
    "--exclude", "packages",
    "--format", "json",
    "--output", nestedOutput,
  ], { cwd: consumerDir, encoding: "utf8" });
  if (fileOutput !== "") throw new Error("installed CLI --output unexpectedly wrote to stdout");
  const filtered = JSON.parse(readFileSync(nestedOutput, "utf8"));
  if (filtered.artifacts.some((artifact) => artifact.path === "reports/summary.md" || artifact.path.startsWith("packages/"))) {
    throw new Error("installed CLI did not combine wildcard and basename exclusions");
  }

  const markdownOutput = execFileSync(installedBinary, [fixtureRoot, "--ledger", fixtureLedger, "--format", "markdown"], {
    cwd: consumerDir,
    encoding: "utf8",
  });
  if (!markdownOutput.includes("# Run Artifact Index") || !markdownOutput.includes("`reports/summary.md`")) {
    throw new Error("installed CLI Markdown output did not render meaningful shipped fixture evidence");
  }

  console.log(`package smoke passed: ${filename} installed and exercised in a disposable consumer`);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
