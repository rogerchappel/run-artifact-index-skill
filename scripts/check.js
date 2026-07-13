import fs from "node:fs";

const required = [
  "README.md",
  "SKILL.md",
  "LICENSE",
  "SECURITY.md",
  "CHANGELOG.md",
  "docs/PRD.md",
  "docs/TASKS.md",
  "docs/ORCHESTRATION.md",
  "docs/OUTPUT_SCHEMA.json"
];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length > 0) {
  console.error(`Missing required files: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("check passed");
