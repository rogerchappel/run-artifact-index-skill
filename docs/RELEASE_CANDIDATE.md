# Release Candidate Notes

## Verification

- `npm test`
- `npm run check`
- `npm run build`
- `npm run smoke`
- `bash scripts/validate.sh`

## Classification

ship

## Known Limitations

- Path-based classification can mislabel unusual file names.
- Ledger joins require exact relative artifact paths.
- Hidden directories are skipped by default and must be intentionally included.
