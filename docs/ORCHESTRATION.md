# Orchestration

## Agent Flow

1. Identify the run output directory.
2. Check whether a command ledger exists.
3. Run the CLI in markdown mode for human review.
4. Run JSON mode when another tool needs structured input.
5. Include the generated summary in the PR or handoff.

## Approval Boundary

No approval is required for local read-only scans. Ask for approval before sharing or publishing any generated artifact index that names private files.

## Failure Handling

- If a ledger path is missing, rerun without `--ledger` and record the missing evidence.
- If hidden outputs are expected, rerun with `--include-hidden`.
- If classification looks wrong, keep the raw JSON and mention the limitation in the handoff.
