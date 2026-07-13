# Run Artifact Index Skill

Use this skill when an agent run produced logs, reports, screenshots, fixtures, packages, or other files that need a concise handoff index.

## Required Inputs

- A local run directory to scan.
- Optional JSON command ledger with `command`, `result`, and `artifacts` fields.

## Side-Effect Boundaries

- Read local files only.
- Do not delete or move artifacts.
- Do not upload artifacts or call external services.
- Write output only when the user or workflow provides `--output`.

## Workflow

1. Run `run-artifact-index <root> --format markdown`.
2. Add `--ledger <file>` when verification commands emitted artifact paths.
3. Review hidden directories separately; use `--include-hidden` only when intended.
4. Paste the markdown into handoff notes or a release-candidate PR.
5. Keep private paths redacted and avoid publishing sensitive artifact contents.

## Validation

Run:

```bash
npm test
npm run smoke
bash scripts/validate.sh
```

## Example

```bash
run-artifact-index fixtures/sample-run --ledger fixtures/sample-run/ledger.json --format markdown
```
