# run-artifact-index-skill

`run-artifact-index-skill` is a local-first CLI and agent skill for turning scattered run outputs into a reviewable artifact map. It is designed for agent handoffs, release-candidate PR bodies, and audit notes where reviewers need to know which files matter.

## Quickstart

```bash
npm install
npm run smoke
node ./bin/run-artifact-index.js fixtures/sample-run --ledger fixtures/sample-run/ledger.json --format json
```

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

The command scans files under `root`, classifies each artifact, optionally joins command-ledger evidence, and emits JSON or markdown.

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
- Redacts the local home directory prefix in rendered paths.

## Limitations

Classification is path based. Treat the output as a review aid, not a proof that a file is safe to publish.
