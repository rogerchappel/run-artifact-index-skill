# Command Ledger Schema

The optional ledger is a JSON object with a `commands` array.

| Field | Required | Description |
| --- | --- | --- |
| `command` | yes | Verification command that produced or checked artifacts. |
| `result` | no | Short status such as `pass`, `fail`, or `skipped`. |
| `artifacts` | yes | Relative artifact file paths under the scanned root, using `/` separators. |

Before joining provenance, the scanner normalizes harmless relative spellings to its canonical slash form. Leading or interior `.` segments and repeated separators are removed, so `./reports//summary.md` matches the scanned path `reports/summary.md`.

Artifact claims must remain unambiguous:

- paths must identify files relative to the scanned root;
- absolute paths, `..` segments, backslashes, and directory-only paths are invalid; and
- a canonical path may appear only once across all command entries.

Invalid paths identify the originating `commands[n].artifacts[n]` index. Duplicate claims identify both the duplicate and original indices, and the scanner rejects the ledger rather than silently replacing provenance.

When rendering Markdown, `command` values use backtick-safe code spans. `result`
values are escaped as Markdown text, and each line after the first is indented so
multiline results remain part of the result list item. JSON rendering leaves both
values unchanged.
