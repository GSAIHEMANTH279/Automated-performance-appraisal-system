# Automated Performance Appraisal System

A Software Engineering mini-project to manage an employee's performance-appraisal lifecycle—from goal setting and progress tracking to manager evaluation, HR review, and year-end ranking.

> **Project status:** Documentation baseline. The repository currently contains draft requirements/design/test documents and a documentation-check workflow. The application and application-level CI/CD are not yet implemented. Features below are planned unless explicitly marked otherwise.

## Problem statement

Many organizations need a consistent, traceable process for setting employee goals, reviewing progress, conducting self- and manager assessments, calculating performance scores, and preparing year-end rankings. This project proposes a role-based system to centralize that process and make scoring rules and review decisions auditable.

## Project objectives

- Define a complete appraisal workflow for employees, managers, and HR.
- Apply an approved, consistent scoring policy and ranking rule.
- Protect confidential appraisal information through role- and record-level authorization.
- Preserve an audit trail for sensitive decisions and changes.
- Validate the system with traceable test cases and a repeatable CI workflow.

## User roles and planned capabilities

| Role | Planned capabilities |
|---|---|
| Employee | Create goals, submit goals for review, record progress/evidence, submit self-assessment, view released results. |
| Reporting manager | Review assigned employees' goals, request changes or approve them, provide ratings and feedback, complete manager assessments. |
| HR administrator | Configure appraisal cycles, rating criteria and weights; monitor completion; review/finalize results; release reports; authorize reopening with a reason. |

### Planned end-to-end workflow

1. HR configures an appraisal cycle and the approved scoring policy.
2. Employees create measurable goals and submit them.
3. Assigned managers approve goals or request changes.
4. Employees record progress and supporting evidence.
5. Employees submit self-assessments; managers complete evidence-based reviews.
6. The system validates completeness and calculates scores using the approved formula.
7. HR reviews and finalizes results; rankings are generated using the same policy and documented tie rules.
8. Results are released to authorized users, and important actions remain auditable.

## Scope boundaries

**Initial scope:** authentication and authorization, appraisal-cycle configuration, goals and approvals, progress updates, self-assessment, manager assessment, score calculation, rankings, reports, and audit history.

**Out of scope unless approved:** payroll, recruitment, attendance-device integrations, production HR integrations, and automatic employment decisions. The system is intended to support appraisal administration—not make employment decisions autonomously.

## Architecture direction

The current design proposes a **layered monolithic web application** with:
- Presentation layer (role-specific user interface)
- Application/API layer
- Authentication and authorization
- Goal-management and appraisal services
- Scoring/ranking and reporting services
- Audit service
- Persistent data layer

The implementation language, framework, database, and deployment target remain **to be confirmed**. They must be selected by the team and documented before application build/test commands are added to CI.

## Repository structure

```text
.
├── .github/
│   ├── workflows/
│   │   └── appraisal-docs-check.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── SRS_SAD_TestPlan/
│   ├── SRS.md
│   ├── SAD.md
│   ├── Test_Plan.md
│   └── diagrams/
└── README.md
```

## Project documents

- [Software Requirements Specification (SRS)](SRS_SAD_TestPlan/SRS.md)
- [Software Architecture and Design Specification (SAD)](SRS_SAD_TestPlan/SAD.md)
- [Software Test Plan](SRS_SAD_TestPlan/Test_Plan.md)
- [UML diagram sources](SRS_SAD_TestPlan/diagrams/)
- [Project execution plan and sprint backlog](PROJECT_EXECUTION_PLAN.md)
- [Architecture/scoring decision register](DECISIONS.md)
- [Requirements traceability matrix](SRS_SAD_TestPlan/diagrams/requirements-traceability.csv)

These are currently Markdown drafts. They must be aligned with the course-provided templates before submission; the team should not claim template compliance until that review is complete.

## Development workflow

1. Select an issue from the agreed sprint backlog.
2. Create a focused branch, preferably including the issue key (for example, `feat/APAS-12-goal-submission`).
3. Implement only the scoped change and add/update relevant tests or documentation.
4. Commit with a meaningful message and the issue key where applicable.
5. Open a pull request against `main`; describe the change, tests, risks, and screenshots/evidence where useful.
6. Wait for CI checks and a teammate review. Fix requested changes, then merge according to team policy.
7. Update the issue status and sprint board based on actual work completed.

Do not merge unreviewed work merely to show activity. Sprint issues, story points, burndown, commits, and PRs should reflect real progress.

## CI/CD status

The existing GitHub Actions workflow checks that the required Markdown documents exist and include the project title. This is a **documentation check only**, not an application build, automated test suite, or deployment pipeline.

Planned pipeline stages after the technology stack is selected:
1. Static checks/linting
2. Dependency installation
3. Application build
4. Unit and integration tests
5. Optional security/dependency checks
6. Deployment to an agreed demo environment, if required and configured

## Quality and security principles

- Enforce authorization on the server for every protected action and record.
- Never store plaintext passwords or commit tokens, credentials, or secrets.
- Use synthetic employee/appraisal data in development and tests.
- Record actor, action, target, and timestamp for sensitive workflow changes.
- Make the scoring formula, policy version, missing-rating behaviour, and tie rule explicit.
- Keep draft results separate from finalized and released results.
- Do not describe a feature as implemented or tested without verifiable evidence.

## Team

| SRN | Name |
|---|---|
| PES1UG24AM101 | G Sai Hemanth |
| PES1UG24AM075 | Nivas Reddy D |
| PES1UG24AM076 | D A V Sreeram |
| PES1UG25AM804 | J Karthik |

## Current next steps

- Review SRS, SAD, and Test Plan against the exact course templates.
- Confirm the scoring policy, rating scale, tie handling, and technology stack with the team/guide.
- Convert the agreed backlog into sprint issues with owners and story points.
- Implement a small vertical slice: sign-in/role checks → goal submission → manager review.
- Add automated tests and application-level CI once the stack is confirmed.
- Demonstrate the full appraisal workflow with synthetic data and record evidence of what actually works.
