# Command Ledger Schema

The optional ledger is a JSON object with a `commands` array.

| Field | Required | Description |
| --- | --- | --- |
| `command` | yes | Verification command that produced or checked artifacts. |
| `result` | no | Short status such as `pass`, `fail`, or `skipped`. |
| `artifacts` | yes | Relative artifact paths under the scanned root. |

The scanner performs exact relative-path joins. It does not infer which command produced a file when the ledger path differs from the scanned path.

When rendering Markdown, `command` values use backtick-safe code spans. `result`
values are escaped as Markdown text, and each line after the first is indented so
multiline results remain part of the result list item. JSON rendering leaves both
values unchanged.
