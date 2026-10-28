# Software Test Plan (STP)
## Automated Performance Appraisal System

**Version:** 1.0 (Draft for team review)  
**Date:** 28 October 2026  
**Status:** Planned test approach — execution results must be recorded after tests run

## 1. Introduction

### 1.1 Purpose
This plan defines the testing scope, strategy, environment, responsibilities, schedule, risks, and exit criteria for the Automated Performance Appraisal System.

### 1.2 Scope
Testing covers authentication and authorization, appraisal-cycle configuration, goal creation and approval, progress updates, self-assessment, manager evaluation, score calculation, ranking, release, reports, and audit events.

### 1.3 Out of scope
Payroll calculations, recruitment, production HR integrations, third-party identity providers, and legal validation of employment decisions are outside the initial scope unless later approved.

### 1.4 References and definitions
- SRS: `SRS.md`
- SAD: `SAD.md`
- FR: Functional Requirement; NFR: Non-functional Requirement; TC: Test Case; UAT: User Acceptance Testing; RTM: Requirements Traceability Matrix.

## 2. Test items
- Authentication and role authorization
- Appraisal-cycle configuration
- Goal management and manager approval
- Progress update workflow
- Employee self-assessment
- Manager ratings and comments
- Scoring and ranking
- HR finalization and release
- Reports and audit trail
- API validation and user interface

## 3. Features to be tested
- FR-001 to FR-015 listed in the SRS.
- NFR-001 to NFR-005 listed in the SRS.
- SR-001 to SR-005 listed in the SRS.

## 4. Features not to be tested in the initial release
- External payroll or attendance integrations not included in scope.
- Production-scale availability claims that cannot be established in the student test environment.
- Actual employment decisions or legal compliance of the organization's appraisal policy.
- Any feature not implemented or explicitly included in the agreed release.

## 5. Test approach and strategy

### 5.1 Test levels
- **Unit testing:** validation rules, status transitions, scoring formula, tie handling, and ranking eligibility.
- **Integration testing:** API-to-service and service-to-database behaviour, authorization, transactions, and audit events.
- **System testing:** complete employee-to-manager-to-HR appraisal flow.
- **Acceptance testing:** representative employee, manager, and HR scenarios against the agreed requirements.
- **Regression testing:** rerun critical tests after changes to scoring, access control, or lifecycle logic.

### 5.2 Test types
Functional, negative, boundary, authorization/security, data integrity, usability, performance, and regression testing.

### 5.3 Entry criteria
- Requirements and scoring policy are reviewed and agreed.
- A testable build is available.
- Test accounts exist for employee, manager, and HR roles.
- A test database and safe sample data are prepared.
- Build/test instructions are documented.

### 5.4 Exit criteria
- All planned high-priority test cases have been executed.
- No open critical defect remains.
- Scoring and ranking test cases pass against independently calculated expected results.
- Role and record-level authorization tests pass.
- Failures and known limitations are documented.
- The team/guide reviews the test summary before claiming release readiness.

## 6. Test environment

The final environment depends on the stack selected by the team. Record OS, runtime/framework versions, database version, browser, test framework, commit SHA, and deployment target in the execution log. Use synthetic test employees and ratings; do not use real confidential employee data.

**Proposed tools:** the selected language's unit-test framework, API testing tool, browser automation if applicable, and GitHub Actions for continuous integration once build commands are established.

## 7. Test schedule and responsibilities

| Activity | Planned period | Responsible role |
|---|---|---|
| Review requirements and scoring policy | Sprint 1 | Whole team / project lead |
| Prepare test cases and synthetic data | Sprint 1 | Test owner with developer review |
| Unit and integration tests | Sprint 1–2 | Developers |
| End-to-end appraisal workflow tests | Sprint 2 | Test owner and team |
| Regression, security, and performance checks | Sprint 2 | Assigned team members |
| Test summary and demo evidence | Before presentation | Whole team |

Assign actual names in Jira before execution; this table does not imply that the work has already occurred.

## 8. Initial test cases

| Test ID | Requirement | Scenario / steps | Expected result | Priority |
|---|---|---|---|---|
| TC-AUTH-01 | FR-001 | Sign in with valid employee credentials. | Sign-in succeeds and employee dashboard appears. | High |
| TC-AUTH-02 | FR-001 / SR-003 | Submit invalid credentials. | Access is denied without revealing sensitive details. | High |
| TC-AUTH-03 | SR-003 | Employee attempts to access HR-only cycle configuration. | Request is denied. | High |
| TC-AUTH-04 | SR-003 | Employee A attempts to read Employee B's private appraisal. | Request is denied unless an explicit authorized relationship permits it. | High |
| TC-CYCLE-01 | FR-002 | HR creates a cycle with valid dates. | Cycle is saved with the correct dates and status. | High |
| TC-CYCLE-02 | FR-002 | Submit a cycle whose end date precedes its start date. | Validation rejects the cycle. | High |
| TC-GOAL-01 | FR-003 | Employee submits a goal with all required fields. | Goal is saved as Submitted. | High |
| TC-GOAL-02 | FR-003 | Submit a goal with missing title or invalid target/weight. | Validation rejects invalid data and explains the issue. | High |
| TC-GOAL-03 | FR-004 | Assigned manager approves a submitted goal. | Status becomes Approved and the decision is recorded. | High |
| TC-GOAL-04 | FR-004 | Unassigned manager attempts to approve the goal. | Operation is denied and no state change occurs. | High |
| TC-GOAL-05 | FR-005 | Employee records a valid progress update. | Progress and timestamp are saved and displayed to authorized users. | Medium |
| TC-APP-01 | FR-007 | Employee submits self-assessment for an open cycle. | Assessment is saved and marked Submitted. | High |
| TC-APP-02 | FR-007 | Employee tries to edit a submitted assessment after the edit lock. | Edit is blocked unless an authorized reopen occurs. | High |
| TC-APP-03 | FR-008 | Manager submits all required ratings and comments. | Assessment is stored against the correct employee and cycle. | High |
| TC-SCORE-01 | FR-009 | Calculate score using a small fixture with known ratings and weights. | Output equals the independently calculated expected score. | High |
| TC-SCORE-02 | FR-009 | Finalize while a required rating is missing. | Finalization is blocked with a clear explanation. | High |
| TC-SCORE-03 | FR-010 | Rank three finalized employees with distinct known scores. | Ranking order matches expected descending score order. | High |
| TC-SCORE-04 | FR-010 | Two employees have equal final scores. | Documented tie-breaking rule is applied consistently. | High |
| TC-SCORE-05 | FR-010 | Include a draft appraisal alongside finalized appraisals. | Draft result is excluded from released rankings. | High |
| TC-REL-01 | FR-011 | HR finalizes a complete appraisal cycle. | Results are finalized once and an audit event is created. | High |
| TC-REL-02 | FR-011 / SR-003 | Employee attempts to release organization-wide results. | Operation is denied. | High |
| TC-REL-03 | FR-015 | HR reopens a finalized appraisal without a reason. | Request is rejected; result remains finalized. | Medium |
| TC-AUD-01 | FR-014 / SR-005 | Approve a goal or change a rating. | Audit record includes actor, action, target, and timestamp. | High |
| TC-AUD-02 | SR-005 | Ordinary user attempts to edit/delete audit history. | Operation is denied. | High |
| TC-REP-01 | FR-013 | Authorized HR generates a cycle ranking report. | Report matches finalized scores and ranks. | Medium |
| TC-PERF-01 | NFR-001 | Measure p95 latency for the agreed common-read workload. | p95 is at or below 3 seconds in the documented environment. | Medium |
| TC-SEC-01 | SR-001 | Access the deployed application over HTTPS. | HTTPS is used; insecure access is redirected or rejected according to deployment configuration. | High |
| TC-SEC-02 | SR-002 | Inspect stored test-account credentials. | Passwords are not stored in plaintext. | High |
| TC-SEC-03 | SR-004 | Submit malformed or injection-like input. | Input is safely rejected/handled; no unauthorized query or state change occurs. | High |

## 9. Test data
Use synthetic users representing at least two employees, two managers, and one HR administrator; multiple appraisal cycles; approved and rejected goals; complete and incomplete assessments; known rating/weight fixtures; tied scores; and draft/finalized results. Do not place real passwords, personal employee records, or production secrets in the repository.

## 10. Defect management
Record each defect with ID, summary, environment/commit, reproduction steps, expected and actual results, severity, priority, evidence, assignee, and status. Re-test fixes and run relevant regression tests. A defect is not considered fixed until the failing test passes on the corrected build.

## 11. Suspension and resumption criteria
Suspend affected tests if the build is unavailable, test data is corrupted, or the environment prevents reliable results. Resume after the environment/build is stable and data is restored or recreated. Record any skipped tests and reasons.

## 12. Traceability and metrics
Maintain a requirements-to-test-case mapping using the SRS RTM. Report:
- planned, executed, passed, failed, and blocked test cases;
- pass rate among executed tests;
- open defects by severity and age;
- requirement coverage;
- scoring/ranking fixture results;
- performance test conditions and p95 latency.

Do not report metrics before tests are actually executed.

## 13. Test deliverables
- This test plan
- Test cases and synthetic test data
- Automated test scripts
- Test execution logs and evidence
- Defect records
- Requirements traceability matrix
- Final test summary report

## 14. Approvals
| Role | Name | Approval/date |
|---|---|---|
| Team representative | To be assigned | Pending |
| Project guide / evaluator | To be assigned | Pending |
