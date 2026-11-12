#!/usr/bin/env bash
set -euo pipefail
npm test
npm run check
npm run build
npm run smoke >/tmp/run-artifact-index-smoke.md
npm run package:smoke
node ./bin/run-artifact-index.js fixtures/sample-run --category package --checksum --format json >/tmp/run-artifact-index-package.json
test -s /tmp/run-artifact-index-smoke.md
grep -q '"sha256"' /tmp/run-artifact-index-package.json
echo "validation passed"
