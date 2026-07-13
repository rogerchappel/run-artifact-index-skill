export function renderJson(index) {
  return `${JSON.stringify(index, null, 2)}\n`;
}

export function renderMarkdown(index) {
  const lines = [
    "# Run Artifact Index",
    "",
    `Root: \`${index.root}\``,
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
    lines.push(`- \`${artifact.path}\` - ${artifact.category} (${artifact.bytes} bytes)`);
    if (artifact.command) {
      lines.push(`  - command: \`${artifact.command}\``);
      lines.push(`  - result: ${artifact.result}`);
    }
    if (artifact.sha256) {
      lines.push(`  - sha256: \`${artifact.sha256}\``);
    }
  }

  return `${lines.join("\n")}\n`;
}
