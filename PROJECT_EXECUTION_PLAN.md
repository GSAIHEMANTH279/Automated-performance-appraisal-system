# Project Execution Plan

**Project:** Automated Performance Appraisal System  
**Team:** PES1UG24AM101, PES1UG24AM075, PES1UG24AM076, PES1UG25AM804  
**Status:** Proposed working plan; update issues and dates to reflect the team's actual board and progress.

## 1. Delivery objective

Deliver a demonstrable, testable employee-appraisal workflow—not only screens or documents. The first vertical slice should let an authorized employee submit a goal, an assigned manager review it, and the system preserve the decision. Later work adds self-assessment, manager evaluation, score calculation, HR finalization, ranking, and reporting.

## 2. Sprint plan

The initial Sprint 1 work items have been created as GitHub issues:
- [APAS-01 — Review course-template documents](https://github.com/GSAIHEMANTH279/Automated-performance-appraisal-system/issues/2)
- [APAS-02 — Approve scoring and ranking policy](https://github.com/GSAIHEMANTH279/Automated-performance-appraisal-system/issues/3)
- [APAS-03 — Confirm stack and local setup](https://github.com/GSAIHEMANTH279/Automated-performance-appraisal-system/issues/4)
- [APAS-04 — Establish PR and CI workflow](https://github.com/GSAIHEMANTH279/Automated-performance-appraisal-system/issues/5)
- [APAS-05 — Authentication and role authorization](https://github.com/GSAIHEMANTH279/Automated-performance-appraisal-system/issues/6)
- [APAS-06 — Goal submission and manager review](https://github.com/GSAIHEMANTH279/Automated-performance-appraisal-system/issues/7)
- [APAS-07 — Automated tests for the vertical slice](https://github.com/GSAIHEMANTH279/Automated-performance-appraisal-system/issues/8)

These issues are currently unassigned; the team must assign real owners and add them to the actual sprint/project board. The estimates below are proposals, not evidence of completed work.


Dates below follow the current course schedule as understood by the team. If the instructor's latest announcement differs, use the instructor's dates and update this file.

### Sprint 1 — 27–31 October 2026

**Sprint goal:** establish the reviewed requirements/design baseline, repository workflow, and a small working vertical slice.

| ID | Backlog item | Estimate | Acceptance criteria | Priority |
|---|---|---:|---|---|
| APAS-01 | Confirm requirements and project scope | 3 | SRS, SAD, and Test Plan are reviewed against the course templates; scope and open decisions are recorded. | Must |
| APAS-02 | Agree appraisal scoring policy | 2 | Rating scale, criteria, weights, missing-rating behaviour, and tie rule are documented and approved by the team/guide. | Must |
| APAS-03 | Confirm stack and local run instructions | 2 | Frontend, backend, database, versions, setup commands, and environment configuration are documented and reproducible. | Must |
| APAS-04 | Establish PR and issue workflow | 2 | Feature branches, PR template, review expectation, issue labels, and CI checks are documented; a real PR passes checks. | Must |
| APAS-05 | Implement role/authorization foundation | 5 | Employee, manager, and HR roles are represented; protected operations reject unauthorized access in tests. | Must |
| APAS-06 | Implement goal submission and manager decision | 5 | Employee can submit a valid goal; authorized manager can approve/request changes; invalid data and unauthorized decisions are rejected. | Must |
| APAS-07 | Add automated tests for the vertical slice | 3 | Tests cover success, validation failure, and unauthorized access; results are available in CI. | Must |

**Sprint 1 demo evidence:** one-minute recording showing the tested vertical slice, a passing workflow run, and the relevant PR/issue history. Do not present a static mock-up as a working backend.

### Sprint 2 — 2–7 November 2026

**Sprint goal:** complete a minimal end-to-end appraisal cycle and strengthen quality evidence.

| ID | Backlog item | Estimate | Acceptance criteria | Priority |
|---|---|---:|---|---|
| APAS-08 | Add employee progress and self-assessment | 5 | Progress updates are validated and timestamped; self-assessment is submitted only while the cycle is open. | Must |
| APAS-09 | Add manager assessment | 5 | Assigned manager can submit required ratings/comments; unauthorized manager cannot assess another manager's employee. | Must |
| APAS-10 | Implement deterministic score calculation | 5 | Approved formula is implemented; unit tests use independently calculated expected results and cover boundaries/missing values. | Must |
| APAS-11 | Add HR finalization and ranking | 5 | Incomplete appraisals cannot be finalized; finalized scores rank correctly; tie rule is tested; action is audited. | Must |
| APAS-12 | Add report and audit history | 3 | Authorized HR can view a cycle summary; important changes record actor, action, target, and timestamp. | Should |
| APAS-13 | Expand CI and regression/security checks | 3 | CI runs lint/build/tests; failures block merge according to repository policy; no secrets are committed. | Must |
| APAS-14 | Prepare final demo and test summary | 2 | Demo uses synthetic data; known limitations, test results, and requirement traceability are documented. | Must |

Estimates are initial planning suggestions, not completed work or confirmed commitments. The team should re-estimate and assign issues in its actual GitHub/Jira board.

## 3. Working agreements

- Every sprint item must have an owner, acceptance criteria, estimate, and linked issue.
- Branch names should include the issue key, e.g. `feat/APAS-06-goal-review`.
- A PR must state what changed, the linked issue, tests run, evidence, and limitations.
- At least one teammate should review a PR before it is merged.
- The assignee updates the issue when work actually starts, is blocked, or is completed.
- Do not move an issue to Done until acceptance criteria are met and evidence exists.
- Update the sprint board/burndown from actual issue status; never fabricate progress to make the chart look complete.

## 4. Definition of Ready

An item is ready when it has:
- a user/problem statement;
- acceptance criteria that can be tested;
- dependencies and risks identified;
- an estimate agreed by the team;
- a clear owner or team responsible.

## 5. Definition of Done

An item is done only when:
- the agreed behaviour is implemented;
- validation and authorization are enforced server-side where applicable;
- relevant tests pass;
- documentation/diagrams are updated;
- CI checks pass;
- a teammate has reviewed the PR;
- the issue and demo evidence are updated.

## 6. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Scoring policy remains ambiguous | Incorrect or indefensible rankings | Obtain team/guide agreement before implementing final score calculation. |
| Scope expands too far | Incomplete end-to-end demo | Prioritize a thin, working vertical slice and defer optional integrations. |
| Role checks exist only in the UI | Exposure of confidential appraisal data | Enforce authorization on every protected API/service operation and test negative cases. |
| Documentation diverges from code | Review/demo inconsistency | Update SRS/SAD/traceability whenever behaviour or architecture changes. |
| CI only checks documents | Application defects reach main | Add stack-specific build, lint, and automated tests after implementation stack is selected. |
| Sprint board does not reflect reality | Unreliable burndown and weak process evidence | Update issues promptly and use actual work status only. |

## 7. Demo acceptance checklist

- [ ] Show the repository and project documentation.
- [ ] Show one issue with acceptance criteria and story points.
- [ ] Show a feature branch and reviewed PR.
- [ ] Show CI passing for the relevant commit.
- [ ] Run the app locally using documented commands.
- [ ] Demonstrate employee goal submission.
- [ ] Demonstrate manager review and an authorization failure.
- [ ] Demonstrate scoring with known test values once scoring is approved.
- [ ] Explain what is implemented, what is planned, and what remains incomplete.
- [ ] Show test evidence and known limitations.
