import fs from "node:fs";
import path from "node:path";
import { scanArtifacts } from "./artifacts.js";
import { renderJson, renderMarkdown } from "./render.js";

export async function runCli(argv) {
  const options = parseArgs(argv);
  if (options.help) {
    process.stdout.write(helpText());
    return;
  }

  const index = scanArtifacts(options.root, options);
  const output = options.format === "json" ? renderJson(index) : renderMarkdown(index);
  if (options.output) {
    fs.mkdirSync(path.dirname(path.resolve(options.output)), { recursive: true });
    fs.writeFileSync(options.output, output);
    return;
  }
  process.stdout.write(output);
}

export function parseArgs(argv) {
  const options = { root: ".", format: "json", exclude: [] };
  let hasRoot = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--include-hidden") options.includeHidden = true;
    else if (arg === "--format") options.format = readValue(argv, ++index, "--format");
    else if (arg === "--ledger") options.ledger = readValue(argv, ++index, "--ledger");
    else if (arg === "--output") options.output = readValue(argv, ++index, "--output");
    else if (arg === "--category") options.category = readValue(argv, ++index, "--category");
    else if (arg === "--checksum") options.checksum = true;
    else if (arg === "--max-depth") options.maxDepth = parseMaxDepth(readValue(argv, ++index, "--max-depth"));
    else if (arg === "--exclude") options.exclude.push(readValue(argv, ++index, "--exclude"));
    else if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
    else {
      if (hasRoot) throw new Error("Expected at most one root argument");
      options.root = arg;
      hasRoot = true;
    }
  }
  if (!["json", "markdown"].includes(options.format)) {
    throw new Error("--format must be json or markdown");
  }
  return options;
}

function parseMaxDepth(value) {
  const maxDepth = Number(value);
  if (!Number.isFinite(maxDepth) || !Number.isInteger(maxDepth) || maxDepth < 0) {
    throw new Error("--max-depth must be a finite non-negative integer");
  }
  return maxDepth;
}

function readValue(argv, index, name) {
  if (!argv[index]) throw new Error(`${name} requires a value`);
  return argv[index];
}

function helpText() {
  return `Usage: run-artifact-index [root] [options]

Indexes local agent-run artifacts without deleting or uploading anything.

Arguments:
  [root]                     Directory to scan (default: current directory)

Options:
  --ledger <ledger.json>     Join command-ledger evidence
  --format <json|markdown>   Output format: json or markdown (default: json)
  --output <file>            Write output; exclude that exact file when it is inside root
  --include-hidden           Include hidden files and directories
  --category <name>          Include only artifacts in this category
  --checksum                 Include SHA-256 checksums
  --max-depth <integer>      Limit traversal depth (non-negative integer)
  --exclude <pattern>        Exclude basenames or root-relative paths (repeatable; * and ? stay within a path segment)
  --help, -h                 Show this help

Accepts at most one root. Ledgers must be a command array or {"commands": [...]}.
`;
}
