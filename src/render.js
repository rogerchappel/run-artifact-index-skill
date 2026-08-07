export function renderJson(index) {
  return `${JSON.stringify(index, null, 2)}\n`;
}

function inlineCode(value) {
  const text = String(value);
  const longestRun = Math.max(0, ...Array.from(text.matchAll(/`+/g), (match) => match[0].length));
  const delimiter = "`".repeat(longestRun + 1);
  const needsPadding = text.startsWith("`") || text.endsWith("`") || text.startsWith(" ") || text.endsWith(" ");
  const content = needsPadding ? ` ${text} ` : text;
  return `${delimiter}${content}${delimiter}`;
}

function markdownText(value) {
  return String(value)
    .replace(/\r\n?/g, "\n")
    .replace(/([\\`*_[\]{}<>()#+\-.!|>])/g, "\\$1")
    .replace(/\n/g, "\n    ");
}

export function renderMarkdown(index) {
  const lines = [
    "# Run Artifact Index",
    "",
    `Root: ${inlineCode(index.root)}`,
    `Artifacts: ${index.artifactCount}`,
    "",
    "## Category Summary",
    ""
  ];

  for (const [category, count] of Object.entries(index.categories).sort()) {
    lines.push(`- ${category}: ${count}`);
  }

  lines.push("", "## Artifacts", "");
  for (const artifact of index.artifacts) {
    lines.push(`- ${inlineCode(artifact.path)} - ${artifact.category} (${artifact.bytes} bytes)`);
    if (artifact.command) {
      lines.push(`  - command: ${inlineCode(artifact.command)}`);
      lines.push(`  - result: ${markdownText(artifact.result)}`);
    }
    if (artifact.sha256) {
      lines.push(`  - sha256: \`${artifact.sha256}\``);
    }
  }

  return `${lines.join("\n")}\n`;
}
