# Command Ledger Schema

The optional ledger is a JSON object with a `commands` array.

| Field | Required | Description |
| --- | --- | --- |
| `command` | yes | Verification command that produced or checked artifacts. |
| `result` | no | Short status such as `pass`, `fail`, or `skipped`. |
| `artifacts` | yes | Relative artifact paths under the scanned root. |

The scanner performs exact relative-path joins. It does not infer which command produced a file when the ledger path differs from the scanned path.
