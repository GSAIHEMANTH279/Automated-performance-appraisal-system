# Software Requirements Specification (SRS)
## Automated Performance Appraisal System

**Version:** 1.0 (Draft for team review)  
**Date:** 28 October 2026  
**Status:** Proposed requirements — not evidence of implementation

## Revision history

| Version | Date | Change |
|---|---|---|
| 1.0 | 28-Oct-2026 | Initial project-specific requirements baseline |

## 1. Introduction

### 1.1 Purpose
This SRS defines the expected behaviour and quality requirements for a system that manages employee goals, progress, appraisal feedback, year-end evaluation, and performance rankings.

### 1.2 Scope
The proposed system covers the appraisal lifecycle from goal creation and approval through periodic progress updates, manager evaluation, final score calculation, and ranking reports. Payroll, recruitment, attendance-device integration, and legally binding employment decisions are outside the initial scope unless explicitly approved later.

### 1.3 Intended audience
Employees, reporting managers, HR administrators, developers, testers, project guide, and evaluators.

### 1.4 Definitions
- **Goal/KPI:** A measurable objective used to evaluate performance.
- **Appraisal cycle:** A defined period over which goals and performance are reviewed.
- **Self-assessment:** Employee's own summary and rating of progress.
- **Manager assessment:** Manager's evidence-based review of employee performance.
- **HR administrator:** User who configures cycles, criteria, weights, and access.
- **RBAC:** Role-based access control.

## 2. Overall description

### 2.1 Product perspective
The system is a role-based web application. It maintains employee profiles, reporting relationships, goals, progress evidence, appraisal records, scores, and reports in a persistent data store. Authentication and access rules protect confidential appraisal information.

### 2.2 User classes
- **Employee:** Creates or views goals, updates progress, submits self-assessment, and views released results.
- **Manager:** Reviews team goals, provides feedback, completes assessments, and submits ratings.
- **HR/Admin:** Configures appraisal cycles, rating scales, criteria, weights, deadlines, and finalization permissions.
- **System operator (optional):** Maintains service health and backups without automatically receiving access to appraisal content.

### 2.3 Assumptions and constraints
- HR defines the appraisal period, rating scale, and scoring weights before a cycle starts.
- Each employee has an assigned reporting manager.
- Rankings are only meaningful when the same approved scoring policy applies to the compared employees.
- Sensitive performance information must only be visible to authorized roles.
- No machine-learning or AI-based ranking is assumed in this baseline.

## 3. External interface requirements

### 3.1 User interface
The application should provide role-appropriate dashboards, forms with validation, clear status indicators, confirmation before submission/finalization, and readable tables/reports.

### 3.2 Software interfaces
The implementation may expose authenticated application APIs for employees, goals, appraisals, and reports. The final API paths and payloads are design decisions to be confirmed in the SAD.

### 3.3 Security interfaces
All authenticated traffic must use HTTPS in the deployed environment. Passwords must not be stored in plaintext, and secrets must be supplied through environment configuration rather than committed to source control.

## 4. Functional requirements

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-001 | The system shall authenticate users and provide role-appropriate access for employees, managers, and HR administrators. | High | Valid users can sign in; invalid credentials are rejected; unauthorized role access is denied. |
| FR-002 | The system shall allow HR to create and configure an appraisal cycle with start/end dates and a defined status. | High | An authorized HR user can create a cycle; invalid dates are rejected; non-HR users cannot change cycle settings. |
| FR-003 | The system shall allow an employee to create and submit goals/KPIs with a description, measurable target, due date, and proposed weight. | High | Valid goals are saved and submitted; required fields and invalid weights/dates are rejected. |
| FR-004 | The system shall allow the assigned manager to approve, reject, or request changes to submitted goals with comments. | High | The goal status and review comment are saved; only the assigned manager or authorized HR role can review it. |
| FR-005 | The system shall allow employees to update goal progress and attach or describe supporting evidence. | High | Progress updates are timestamped, validated against the allowed range, and visible to authorized reviewers. |
| FR-006 | The system shall show employees and managers the status of goals and appraisal tasks for the active cycle. | Medium | Dashboard counts and statuses match stored records for the current user and cycle. |
| FR-007 | The system shall allow employees to submit a self-assessment for an open appraisal cycle. | High | Submission is recorded with a timestamp; edits are blocked after submission unless reopened by an authorized role. |
| FR-008 | The system shall allow managers to rate employee performance against configured criteria and provide evidence-based comments. | High | Required ratings/comments are validated and saved against the correct employee and cycle. |
| FR-009 | The system shall calculate an appraisal score using the approved criteria, rating scale, and weights for the cycle. | High | A test dataset with known inputs produces the expected score; invalid or missing required ratings prevent finalization. |
| FR-010 | The system shall generate rankings for eligible employees within the selected appraisal cycle using the same finalized scoring policy. | High | Ranking order matches independently calculated expected scores; ties follow a documented tie rule; draft appraisals are excluded. |
| FR-011 | The system shall allow HR to review, finalize, and release appraisal results. | High | Only authorized HR users can finalize/release; finalization is logged; employees see results only after release. |
| FR-012 | The system shall allow authorized users to view appraisal history for a selected employee and cycle. | Medium | Results are limited to authorized records and display the correct cycle and status. |
| FR-013 | The system shall generate a summary report of scores and rankings for an authorized cycle. | Medium | Report totals and order match finalized records; unauthorized users cannot access organization-wide reports. |
| FR-014 | The system shall maintain an audit record for important actions such as goal approval, rating changes, finalization, and release. | High | Audit entries identify actor, action, record, and timestamp and are not editable through normal user functions. |
| FR-015 | The system shall allow HR to reopen an appraisal only through an explicitly authorized action with a recorded reason. | Medium | Reopening requires authorization and a reason; the action appears in the audit history. |

## 5. Non-functional requirements

| ID | Category | Requirement | Priority | Acceptance criteria |
|---|---|---|---|---|
| NFR-001 | Performance | Under the agreed test environment and normal demo load, 95% of common dashboard and record-read requests should complete within 3 seconds. | High | A documented load test reports p95 latency at or below 3 seconds for the agreed workload; test conditions are recorded. |
| NFR-002 | Availability/reliability | The application should recover cleanly from a failed request without corrupting appraisal records. | High | Fault/error tests show clear failure responses and no partial or duplicate finalization. |
| NFR-003 | Security/privacy | Users shall only access records permitted by their role and reporting relationship. | High | Positive and negative authorization tests pass for employee, manager, and HR roles. |
| NFR-004 | Integrity/auditability | Final scores and ranking reports shall be reproducible from stored ratings, configured weights, and the documented scoring formula. | High | Recalculation from the same inputs yields the same result; changes to relevant inputs are auditable. |
| NFR-005 | Usability | Forms shall provide understandable validation messages and prevent accidental duplicate submission of final actions. | Medium | Usability checks confirm validation messages are visible and repeated submission does not create duplicate finalization records. |

## 6. Security objectives and requirements

### 6.1 Security objectives
1. **Confidentiality:** Protect employee performance data from unauthorized disclosure.
2. **Integrity and accountability:** Prevent unauthorized changes to goals, ratings, scores, and released rankings, and maintain traceable records of sensitive actions.

### 6.2 Security requirements

| ID | Requirement | Priority | Verification |
|---|---|---|---|
| SR-001 | All production network communication shall use HTTPS/TLS. | High | Verify deployed endpoints use HTTPS and reject insecure access where configured. |
| SR-002 | Passwords shall be stored using a suitable salted password-hashing mechanism; plaintext passwords shall never be stored. | High | Inspect authentication implementation and stored credential representation. |
| SR-003 | The server shall enforce role and record-level authorization on every protected operation. | High | Attempt cross-role and cross-employee access using automated negative tests. |
| SR-004 | The system shall validate and sanitize user input and use safe database access patterns to reduce injection risks. | High | Run input validation and security tests against forms and APIs. |
| SR-005 | Important appraisal actions shall be recorded in an audit trail that ordinary users cannot alter. | High | Verify audit entries are created and normal user endpoints cannot edit or delete them. |

## 7. Quality attributes and acceptance tests

Acceptance requires that high-priority functional requirements pass their agreed tests, no unresolved critical security defect remains, score calculations are reproducible, and the requirements traceability matrix is reviewed. The project guide/team should approve the final thresholds and scoring policy before implementation is evaluated.

## 8. UML use-case diagrams

At least two diagrams should be produced and maintained in the project repository:
1. **Appraisal lifecycle:** Employee, Manager, and HR/Admin; set goals, approve goals, update progress, submit self-assessment, assess performance, calculate score, finalize and release results. Include relationships should represent mandatory reused behaviour; extend relationships should represent optional/conditional behaviour.
2. **Reporting and administration:** HR/Admin and authorized Manager; configure cycle, manage criteria/weights, view team reports, generate ranking report, reopen appraisal, and inspect audit history.

Source files for the diagrams are under `diagrams/`.

## 9. Requirements Traceability Matrix (initial)

| Requirement | Design area | Planned verification |
|---|---|---|
| FR-001 / SR-003 | Authentication and authorization | TC-AUTH-01 to TC-AUTH-04 |
| FR-003 / FR-004 | Goal workflow | TC-GOAL-01 to TC-GOAL-06 |
| FR-007 / FR-008 | Self and manager assessment | TC-APP-01 to TC-APP-06 |
| FR-009 / FR-010 | Scoring and ranking service | TC-SCORE-01 to TC-SCORE-06 |
| FR-011 / FR-014 / SR-005 | Finalization and audit | TC-REL-01 to TC-REL-05 |
| NFR-001 | Application/API performance | TC-PERF-01 |
| SR-001 / SR-002 / SR-004 | Deployment and input security | TC-SEC-01 to TC-SEC-06 |

## 10. Open decisions

- Confirm the scoring formula, criteria, weights, rating scale, and tie-breaking rule with the team/guide.
- Confirm the implementation technology stack and authentication approach.
- Confirm whether evidence attachments and downloadable reports are in the first release.
- Replace draft thresholds with guide-approved values if required.
