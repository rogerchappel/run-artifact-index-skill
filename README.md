# run-artifact-index-skill

`run-artifact-index-skill` is a local-first CLI and agent skill for turning scattered run outputs into a reviewable artifact map. It is designed for agent handoffs, release-candidate PR bodies, and audit notes where reviewers need to know which files matter.

## Quickstart

Node.js 22 or newer is required. CI and release checks cover Node.js 22 and 24.

From a repository checkout, install the locked development environment and run the full validation suite:

```bash
npm ci
npm test
npm run smoke
npm run release:check
node ./bin/run-artifact-index.js fixtures/sample-run --ledger fixtures/sample-run/ledger.json --format json
```

`npm ci`, `npm test`, and `npm run release:check` are checkout-only maintainer commands: the published package intentionally omits the lockfile, tests, and validation scripts. `npm run release:check` runs the repository test suite, syntax/build checks, CLI fixture smoke, and a packed-package consumer smoke before a release PR or package candidate is opened.

No npm version has been published yet. Until the first release, build the package
from the public source repository and install its tarball into a clean consumer:

```bash
git clone https://github.com/rogerchappel/run-artifact-index-skill.git source
mkdir consumer
cd source
npm ci
npm pack --pack-destination ../consumer
cd ../consumer
npm init --yes
npm install --ignore-scripts ./run-artifact-index-skill-0.1.0.tgz
npx run-artifact-index ./run-output --ledger ./run-output/ledger.json --format json
```

The package smoke runs the same pack and clean-consumer install as part of
`npm run release:check`. It also executes every Validation and Example command
shipped in `SKILL.md` from the installed package, and requires those commands
to produce meaningful artifact evidence. After an npm release exists, consumers will
be able to replace the source-pack steps with `npm install run-artifact-index-skill`.

## CLI

```bash
run-artifact-index [root] \
  --ledger ledger.json \
  --format json|markdown \
  --output artifact-index.md \
  --include-hidden \
  --category report \
  --checksum \
  --max-depth 2 \
  --exclude tmp
```

The command accepts zero or one positional `root` (default: the current directory), scans files under it, classifies each artifact, optionally joins command-ledger evidence, and emits JSON or markdown. Extra positional arguments are rejected instead of being treated as replacement roots.

Repeat `--exclude` to combine exclusions. Patterns without `/` match a file or directory basename at any depth, so `--exclude tmp` omits every `tmp` entry. Patterns containing `/` match the complete root-relative path, so `--exclude 'reports/*'` omits files directly inside `reports`. `*` and `?` match within one path segment and never cross `/`. Quote wildcard patterns so the shell does not expand them. When `--output` names a missing directory tree, the command creates it before writing valid JSON or Markdown; output continues to go only to that file rather than stdout. If the output file is inside the scanned root, that exact file is excluded from the scan, including when it already exists, so repeated invocations over unchanged inputs produce the same artifact paths and count. Files with the same basename elsewhere remain eligible.

## Package Contents

The npm package intentionally ships the CLI, source modules, docs, sample fixtures, changelog, license, and skill file. The fixtures provide examples and are exercised by the repository's package smoke after it installs the produced tarball into a disposable consumer. `SKILL.md` therefore uses the shipped CLI and fixtures for installed-package validation; `npm test`, validation scripts, and the lockfile remain checkout-only, so an installed artifact cannot report a misleading zero-test release check.

## Ledger Format

```json
{
  "commands": [
    {
      "command": "npm test",
      "result": "pass",
      "artifacts": ["reports/summary.md"]
    }
  ]
}
```

Ledger artifact paths are file paths relative to the scanned root and use `/` separators. Harmless `.` segments and repeated separators are normalized to the scanner's canonical slash form, so `./reports//summary.md` joins `reports/summary.md`. Absolute paths, `..` segments, backslashes, and directory-only paths are rejected. Each normalized path may be claimed only once across the ledger; duplicate claims are reported with both command and artifact indices instead of choosing one command as provenance.

The ledger must be either the object form above or the `commands` array itself. Each command entry must be an object with a non-empty string `command` and an `artifacts` array containing non-empty relative file-path strings. The optional `result` must be a string. Invalid JSON, schema shapes, paths, and duplicate normalized claims are rejected before the scan begins.

In Markdown output, roots, artifact paths, and ledger commands are represented as code spans with a delimiter long enough to contain any backticks in the value. Ledger results remain readable text, with Markdown-significant characters escaped and continuation lines indented under the result item. JSON output preserves the original strings without Markdown escaping.

## Categories

- `evidence`: logs, screenshots, or explicit evidence files.
- `fixture`: sample and fixture inputs.
- `report`: markdown, HTML, and report paths.
- `package`: archive and packaged outputs.
- `disposable`: temporary or cache files.
- `generated output`: anything useful but not otherwise classified.

## Safety Notes

- Reads local files only.
- Does not delete, upload, or call external services.
- Skips dot-directories unless `--include-hidden` is set.
- Redacts an exact local home directory or its path prefix in rendered paths, without changing similar or embedded path segments.

## Limitations

Classification is path based. Treat the output as a review aid, not a proof that a file is safe to publish.
