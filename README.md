# Automated Performance Appraisal System (APAS)

A Software Engineering mini-project prototype for employee goal submission, manager review, and HR audit visibility.

> **Current implementation:** the `main` branch contains a runnable Node.js/Express MVP. It supports demo sign-in, employee goal submission, manager/HR approval or return for revision, role-protected API routes, and an HR audit view. This is not yet the complete year-end appraisal product: scoring formulas, appraisal-cycle configuration, self-assessment, reporting/ranking, persistent production database, deployment, and final instructor approval remain future work. Sprint 2 (2–7 Nov 2026) adds these features — see the [sprint backlog](PROJECT_EXECUTION_PLAN.md).

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm start
```

Open http://localhost:3000.

### Local demo accounts

| Role | Email | Password |
|---|---|---|
| Employee | employee@apas.local | employee123 |
| Manager | manager@apas.local | manager123 |
| HR | hr@apas.local | hr123 |

These accounts are for local demonstration only. The app creates demo data on first start and stores it in `data/store.json`, which is ignored by Git. Do not use these credentials or this prototype for real employee information.

## Implemented MVP flow

1. Sign in as an employee and submit a measurable goal with a due date.
2. Sign in as a manager to see goals and either approve them or return them for revision with feedback.
3. Sign in as HR to inspect goal status and recent audit events.
4. The server checks roles for protected endpoints, hashes demo passwords using Node's scrypt, uses an HttpOnly SameSite session cookie, validates inputs, and records login/review/goal events.

The starter goal in the local data store is synthetic sample data. Each fresh local data file is seeded with one demo goal; existing data is not overwritten.

## Tests and CI

Run the syntax checks and automated API tests:

```bash
npm run check
```

The `App CI` GitHub Actions workflow installs dependencies, checks JavaScript syntax, and runs tests on pushes to `main` and `chore/strengthen-project-workflow`, and on pull requests targeting `main`. A separate documentation-check workflow validates project documentation when relevant files change. CI passing is evidence for these checks only; it is not a deployment or production-readiness claim.

## Contributor pull-request workflow

1. Create a feature branch from the latest `main`.
2. Make a focused change and run `npm run check` locally.
3. Push the feature branch and open a pull request targeting `main`.
4. Wait for the applicable GitHub Actions checks to pass and request a teammate review.
5. Address review feedback, then merge after approval and successful checks.
6. Update the local `main` branch after the pull request is merged.

The workflow should be demonstrated with a real project change; never treat a green CI result alone as proof that a change has been reviewed or deployed.

## Scope and architecture

The current implementation is a small layered web prototype:
- **UI:** HTML, CSS, browser JavaScript
- **API:** Node.js + Express
- **Local persistence:** JSON file for demonstration only
- **Tests:** Node's built-in test runner and fetch

The JSON-file storage and in-memory sessions are suitable only for a single-process classroom demo. They are not production-grade persistence/session management. Before real use, move to a database, shared secure session storage, stronger operational controls, and a reviewed security design.

## Planned next increments

Sprint 2 Jira stories (owners and story points mirrored in [PROJECT_EXECUTION_PLAN.md](PROJECT_EXECUTION_PLAN.md)):
- APAS-14 appraisal cycles · APAS-10 self-assessment · APAS-11 manager rating
- APAS-12 score calculation · APAS-13 HR finalization and ranking · APAS-16 audit trail
- APAS-15 assigned-manager access control · APAS-18 CI/CD deploy stage · APAS-20 final demo

## Project documents

- [SRS](SRS_SAD_TestPlan/SRS.md) – requirements, scoring policy, use-case diagrams, RTM
- [SAD](SRS_SAD_TestPlan/SAD.md) – architecture, UML class and sequence diagrams, API design
- [Test Plan](SRS_SAD_TestPlan/Test_Plan.md) – strategy and full test case list
- [Requirements traceability matrix (CSV)](SRS_SAD_TestPlan/diagrams/requirements-traceability.csv)
- [Project execution plan, sprint backlog and deviation log](PROJECT_EXECUTION_PLAN.md)

## Team

| SRN | Name |
|---|---|
| PES1UG24AM101 | G Sai Hemanth |
| PES1UG24AM075 | Nivas Reddy D |
| PES1UG24AM076 | D A V Sreeram |
| PES1UG25AM804 | J Karthik |
