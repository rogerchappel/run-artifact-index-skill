#!/usr/bin/env bash
set -euo pipefail
npm test
npm run check
npm run build
npm run smoke >/tmp/run-artifact-index-smoke.md
test -s /tmp/run-artifact-index-smoke.md
echo "validation passed"
