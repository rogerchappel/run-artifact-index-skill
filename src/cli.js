import fs from "node:fs";
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
    fs.writeFileSync(options.output, output);
    return;
  }
  process.stdout.write(output);
}

export function parseArgs(argv) {
  const options = { root: ".", format: "json", exclude: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--include-hidden") options.includeHidden = true;
    else if (arg === "--format") options.format = readValue(argv, ++index, "--format");
    else if (arg === "--ledger") options.ledger = readValue(argv, ++index, "--ledger");
    else if (arg === "--output") options.output = readValue(argv, ++index, "--output");
    else if (arg === "--exclude") options.exclude.push(readValue(argv, ++index, "--exclude"));
    else if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
    else options.root = arg;
  }
  if (!["json", "markdown"].includes(options.format)) {
    throw new Error("--format must be json or markdown");
  }
  return options;
}

function readValue(argv, index, name) {
  if (!argv[index]) throw new Error(`${name} requires a value`);
  return argv[index];
}

function helpText() {
  return `run-artifact-index [root] [--ledger ledger.json] [--format json|markdown]\n\nIndexes local agent-run artifacts without deleting or uploading anything.\n`;
}
