# Contributing

## Before starting
- Read the project README and the relevant SRS/SAD sections.
- Pick or create a GitHub issue before starting a non-trivial task.
- Confirm the scope and acceptance criteria with the team.

## Branch and commit conventions
Use one focused branch per issue:
- `feat/<issue-key>-short-description`
- `fix/<issue-key>-short-description`
- `docs/<issue-key>-short-description`
- `test/<issue-key>-short-description`

Use clear commit messages, preferably with the issue key, for example:
`APAS-12 Add goal submission validation`.

## Pull requests
- Open a PR against `main`; do not push unreviewed feature work directly to `main`.
- Explain what changed and why.
- Link the issue and list the tests/checks actually run.
- Include screenshots for user-interface changes when applicable.
- State known limitations and any documentation changes.
- Resolve review comments and wait for required checks before merging.

## Testing and honesty about status
- Add tests for new business rules, especially authorization, score calculation, ranking, and appraisal state transitions.
- Never report tests as passing if they were not run.
- The current workflow checks documentation only; it does not yet build or test an application.
- Keep requirements and diagrams aligned with the actual implementation.

## Security and data
- Use synthetic employee and appraisal data.
- Never commit passwords, API tokens, database credentials, or confidential employee records.
- Enforce authorization server-side; hiding a UI control is not an access-control mechanism.
