# Examples

## Markdown Handoff

```bash
run-artifact-index ./run-output --ledger ./run-output/ledger.json --format markdown
```

## Package Evidence Only

```bash
run-artifact-index ./run-output --category package --checksum --format json
```

When a category filter is present, `artifactCount` and `categories` describe only
the returned artifacts. For example, one matching package produces
`artifactCount: 1` and `categories: { "package": 1 }`.

## Shallow Scan

```bash
run-artifact-index ./run-output --max-depth 1 --format markdown
```

Depth must be a non-negative integer. A depth of `0` indexes files directly in
the root without descending into subdirectories.
