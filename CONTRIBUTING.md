# Contributing

Please keep changes local-first, deterministic, and covered by the existing
fixture-backed checks.

Before opening a pull request, run:

```bash
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```
