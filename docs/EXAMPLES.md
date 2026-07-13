# Examples

## Markdown Handoff

```bash
run-artifact-index ./run-output --ledger ./run-output/ledger.json --format markdown
```

## Package Evidence Only

```bash
run-artifact-index ./run-output --category package --checksum --format json
```

## Shallow Scan

```bash
run-artifact-index ./run-output --max-depth 1 --format markdown
```
