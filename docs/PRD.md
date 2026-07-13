# run-artifact-index-skill PRD

## Summary

Build a local-first agent skill that indexes files produced during an agent run, groups them by purpose, and emits a reviewable artifact map for handoff notes, PR bodies, and release-candidate evidence.

## MVP

- CLI scans a directory tree using include/exclude controls.
- Classifies artifacts as evidence, fixture, report, generated output, package, or disposable.
- Reads optional command ledger JSON to connect artifacts to verification commands.
- Emits markdown and JSON summaries.
- Includes skill instructions and validation workflow.

## Non-Goals

- No artifact deletion or cleanup.
- No remote uploads.
- No content-level secret scanning in the first release.

## Success Criteria

- Fixture-backed tests cover classification, hidden-path handling, redaction, and ledger joins.
- Smoke command emits a useful markdown artifact index.
- Package can be run as a Node CLI on Node 18 or newer.
