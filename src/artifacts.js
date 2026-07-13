import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DEFAULT_EXCLUDES = ["node_modules", ".git", "dist", "coverage"];

export function scanArtifacts(root, options = {}) {
  const absoluteRoot = path.resolve(root);
  const includeHidden = Boolean(options.includeHidden);
  const excludes = new Set([...(options.exclude ?? []), ...DEFAULT_EXCLUDES]);
  const ledger = loadLedger(options.ledger);
  const artifacts = [];

  walk(absoluteRoot, absoluteRoot, { includeHidden, excludes, artifacts, maxDepth: options.maxDepth ?? Infinity });

  return {
    root: redactHome(absoluteRoot),
    artifactCount: artifacts.length,
    artifacts: artifacts
      .filter((artifact) => !options.category || artifact.category === options.category)
      .map((artifact) => maybeAddChecksum(artifact, absoluteRoot, options))
      .map((artifact) => attachLedger(artifact, ledger))
      .sort((a, b) => a.path.localeCompare(b.path)),
    categories: summarizeCategories(artifacts)
  };
}

function walk(root, current, context, depth = 0) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (shouldSkip(entry.name, context)) continue;
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      if (depth < context.maxDepth) walk(root, absolute, context, depth + 1);
      continue;
    }
    if (!entry.isFile()) continue;
    const relative = path.relative(root, absolute).split(path.sep).join("/");
    const stat = fs.statSync(absolute);
    context.artifacts.push({
      path: relative,
      displayPath: redactHome(absolute),
      category: classifyArtifact(relative),
      bytes: stat.size
    });
  }
}

function maybeAddChecksum(artifact, root, options) {
  if (!options.checksum) return artifact;
  const absolute = path.join(root, artifact.path);
  const sha256 = crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
  return { ...artifact, sha256 };
}

function shouldSkip(name, { includeHidden, excludes }) {
  if (!includeHidden && name.startsWith(".")) return true;
  return excludes.has(name);
}

export function classifyArtifact(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower.includes("fixture") || lower.includes("sample")) return "fixture";
  if (lower.endsWith(".log") || lower.includes("evidence") || lower.includes("screenshot")) return "evidence";
  if (lower.includes("report") || lower.endsWith(".md") || lower.endsWith(".html")) return "report";
  if (lower.endsWith(".tgz") || lower.endsWith(".zip") || lower.includes("package")) return "package";
  if (lower.includes("tmp") || lower.includes("cache")) return "disposable";
  return "generated output";
}

function loadLedger(ledgerPath) {
  if (!ledgerPath) return new Map();
  const parsed = JSON.parse(fs.readFileSync(path.resolve(ledgerPath), "utf8"));
  const entries = Array.isArray(parsed) ? parsed : parsed.commands ?? [];
  return new Map(entries.flatMap((entry) => (entry.artifacts ?? []).map((artifact) => [artifact, entry])));
}

function attachLedger(artifact, ledger) {
  const command = ledger.get(artifact.path);
  if (!command) return artifact;
  return {
    ...artifact,
    command: command.command,
    result: command.result ?? "unknown"
  };
}

function summarizeCategories(artifacts) {
  return artifacts.reduce((summary, artifact) => {
    summary[artifact.category] = (summary[artifact.category] ?? 0) + 1;
    return summary;
  }, {});
}

export function redactHome(value) {
  const home = process.env.HOME;
  if (!home) return value;
  return value.replaceAll(home, "~");
}
