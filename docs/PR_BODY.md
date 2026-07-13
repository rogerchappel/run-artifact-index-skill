# Release Candidate PR Body

## Summary

- Adds a local-first run artifact index CLI.
- Classifies artifacts into evidence, fixture, report, package, disposable, or generated output.
- Joins optional verification command ledger entries into JSON or markdown output.

## Verification

- `npm test` - pass
- `npm run check` - pass
- `npm run build` - pass
- `npm run smoke` - pass
- `bash scripts/validate.sh` - pass

## Classification

ship
