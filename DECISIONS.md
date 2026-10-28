# Project Decision Register

This register prevents assumptions from silently becoming requirements. Update each entry when the team/guide makes a decision.

## ADR-001 — Architecture style

- **Status:** Proposed
- **Context:** This is a student mini-project with a short delivery window. The system needs clear separation between UI, workflow logic, scoring, persistence, and reporting without unnecessary deployment complexity.
- **Decision proposal:** Use a layered monolithic web application. Keep authentication/authorization, goal workflow, appraisal workflow, scoring/ranking, reporting, and audit logic in separate modules.
- **Consequences:** Easier local development and deployment; modules remain testable. Independent scaling and deployment of services are not part of the initial scope.
- **Approval:** Pending team/guide confirmation.

## ADR-002 — Technology stack

- **Status:** Pending
- **Context:** The repository currently contains requirements/design documents but no application implementation, so the actual stack cannot yet be verified.
- **Decision needed:** Choose frontend framework, backend runtime/framework, database, test framework, supported runtime versions, and demo deployment target.
- **Acceptance:** A teammate can follow the README from a clean checkout and start the app; CI uses the same supported versions and documented commands.
- **Important:** Do not claim a stack is selected or implemented until the team agrees and the code exists.

## ADR-003 — Appraisal scoring and ranking

- **Status:** Pending approval
- **Context:** A ranking is only defensible if employees in the same comparison group are scored under a consistent policy.
- **Decision needed:** Define criteria, rating scale, criterion weights, any goal weights, normalization, missing-rating behaviour, rounding, eligibility, and tie handling.
- **Candidate formula for discussion only:** weighted normalized score = sum(weight × normalized rating) / sum(applicable weights).
- **Required safeguards:** validate weights; reject incomplete assessments at finalization unless an explicit policy says otherwise; store the scoring-policy version used for finalized results; test with independently calculated fixtures; do not include draft results in released rankings.
- **Approval:** Pending team/guide confirmation. The candidate formula is not an approved policy.

## ADR-004 — Employee data privacy

- **Status:** Proposed baseline
- **Decision proposal:** Use synthetic data in development and demos; enforce role and record-level authorization on the server; do not commit secrets or real confidential appraisal records; record sensitive actions in an audit trail.
- **Acceptance:** Negative authorization tests verify that users cannot access unrelated employee records or perform actions outside their role.
- **Approval:** Team should review before production-like deployment.

## ADR-005 — CI/CD meaning for this project

- **Status:** In progress
- **Current verified state:** GitHub Actions checks required documentation and status labels. This is documentation validation only.
- **Target state:** CI checks formatting/lint, builds the application, runs unit/integration tests, and publishes a deployable artifact. Deployment should be added only after a demo target and secret management are configured.
- **Acceptance:** A failing required check prevents a PR from being treated as ready to merge; workflow results are linked to the reviewed commit.
