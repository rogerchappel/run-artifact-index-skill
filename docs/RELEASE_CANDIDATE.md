# Release Candidate Notes

## Verification

Use Node.js 22 or 24 and install the exact committed dependency tree with `npm ci` before running these checks.

- `npm test`
- `npm run check`
- `npm run build`
- `npm run smoke`
- `node ./bin/run-artifact-index.js fixtures/sample-run --category package --checksum --format json`
- `bash scripts/validate.sh`

## Classification

ship

## Known Limitations

- Path-based classification can mislabel unusual file names.
- Ledger joins require exact relative artifact paths.
- Hidden directories are skipped by default and must be intentionally included.
