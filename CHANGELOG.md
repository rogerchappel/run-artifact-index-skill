# Changelog

## Unreleased

- Made shipped skill validation executable from the installed package and added
  package-smoke enforcement for every documented Validation and Example command.
- Replaced the unavailable npm-registry quickstart with a tested source-tarball
  consumer install until the first package version is published.
- Normalized safe ledger artifact path spellings and rejected invalid or duplicate provenance claims.
- Kept Markdown output structurally valid when artifact and ledger strings contain backticks, line breaks, or Markdown punctuation.
- Added CI coverage for the release-readiness gate.
- Added npm package smoke coverage for shipped CLI, source, docs, and fixtures.

## 0.1.0

- Initial public release candidate for local artifact index generation.
