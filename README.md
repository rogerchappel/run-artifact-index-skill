# run-artifact-index-skill

`run-artifact-index-skill` is a local-first CLI and agent skill for turning scattered run outputs into a reviewable artifact map. It is designed for agent handoffs, release-candidate PR bodies, and audit notes where reviewers need to know which files matter.

## Quickstart

```bash
npm install
npm test
npm run smoke
npm run release:check
node ./bin/run-artifact-index.js fixtures/sample-run --ledger fixtures/sample-run/ledger.json --format json
```

`npm run release:check` runs the test suite, syntax/build checks, CLI fixture smoke, and npm pack smoke. Use it before opening a release PR or publishing a package candidate.

## CLI

```bash
run-artifact-index [root] \
  --ledger ledger.json \
  --format json|markdown \
  --output artifact-index.md \
  --include-hidden \
  --category report \
  --checksum \
  --max-depth 2 \
  --exclude tmp
```

The command accepts zero or one positional `root` (default: the current directory), scans files under it, classifies each artifact, optionally joins command-ledger evidence, and emits JSON or markdown. Extra positional arguments are rejected instead of being treated as replacement roots.

## Package Contents

The npm package intentionally ships the CLI, source modules, docs, sample fixtures, changelog, license, and skill file. The fixture files are included so consumers can run the quickstart and release smoke checks from the installed package.

## Ledger Format

```json
{
  "commands": [
    {
      "command": "npm test",
      "result": "pass",
      "artifacts": ["reports/summary.md"]
    }
  ]
}
```

Ledger artifact paths are relative to the scanned root.

The ledger must be either the object form above or the `commands` array itself. Each command entry must be an object with a non-empty string `command` and an `artifacts` array containing non-empty relative-path strings. The optional `result` must be a string. Invalid JSON or schema shapes are rejected before the scan begins.

## Categories

- `evidence`: logs, screenshots, or explicit evidence files.
- `fixture`: sample and fixture inputs.
- `report`: markdown, HTML, and report paths.
- `package`: archive and packaged outputs.
- `disposable`: temporary or cache files.
- `generated output`: anything useful but not otherwise classified.

## Safety Notes

- Reads local files only.
- Does not delete, upload, or call external services.
- Skips dot-directories unless `--include-hidden` is set.
- Redacts an exact local home directory or its path prefix in rendered paths, without changing similar or embedded path segments.

## Limitations

Classification is path based. Treat the output as a review aid, not a proof that a file is safe to publish.
