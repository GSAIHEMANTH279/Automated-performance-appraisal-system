# Software Requirements Specification (SRS)
**Project:** Automated Performance Appraisal System (APAS)  
**Version:** 1.1  
**Date:** 28 October 2026  
**Authors:** APAS project team  
**Status:** Draft for review; requirements are not all implemented.

## Revision history
| Version | Date | Author | Change summary | Approval |
|---|---|---|---|---|
| 1.0 | 28-Oct-2026 | Project team | Initial requirements | Pending |
| 1.1 | 28-Oct-2026 | Project team | Template alignment; clarified implemented vs planned scope | Pending |

## Approvals
| Role | Name | Signature/email | Date |
|---|---|---|---|
| Project guide / evaluator | To be assigned | Pending | Pending |
| Team representative | To be assigned | Pending | Pending |

## Table of contents
1. Introduction; 2. Overall description; 3. External interfaces; 4. System features; 5. Non-functional requirements; 6. Quality attributes & acceptance tests; 7. UML use-case diagrams; 8. Requirements traceability matrix.

## 1. Introduction

### 1.1 Purpose
Define requirements for APAS, a role-based system intended to support employee goals, manager feedback, appraisal scoring, and HR review.

### 1.2 Scope
The planned product covers goal creation/review, progress updates, self-assessment, manager ratings, score calculation, ranking, HR finalization, release, reporting and audit. Payroll, recruitment and automated employment decisions are out of scope. The current repository contains an MVP for demo login, goal submission, manager/HR goal review, and HR audit visibility; other features below are planned unless explicitly marked implemented.

### 1.3 Audience
Employees, managers, HR administrators, developers, testers, project guide and evaluators.

### 1.4 Definitions
KPI: key performance indicator; appraisal cycle: defined review period; RBAC: role-based access control; RTM: requirements traceability matrix; MVP: minimum viable prototype.

## 2. Overall description

### 2.1 Product perspective
APAS is a browser-based application with a Node.js/Express API. Current prototype persistence is a local JSON file and sessions are held in server memory. This is for a single-process classroom demo, not production deployment.

### 2.2 Major product functions
- Sign in as demo employee, manager or HR.
- Employee submits a goal with title, description, metric and due date.
- Manager/HR approves a submitted goal or returns it for revision with feedback.
- HR views recent audit events.
- Planned: configure appraisal cycles, update progress, self-assess, rate employees, calculate scores, rank finalized results, release reports and reopen appraisals under authorization.

### 2.3 User roles and characteristics
- Employee: submit/view own goals; future self-assessment and released results.
- Manager: review goals; future team assessment, ratings and feedback.
- HR/Admin: current audit view; future cycle configuration, finalization and reports.

### 2.4 Operating environment
Current MVP: Node.js 20+ and npm, modern desktop/mobile browser, local machine. Automated CI uses GitHub Actions with Node.js 22. Production hosting/database are not selected.

### 2.5 Constraints and assumptions
- Scoring criteria, rating scale, weights and tie policy require team/guide approval.
- Each employee should have an assigned manager before record-level manager access is implemented.
- Demo accounts and synthetic data only; never use real employee records.
- No AI-based scoring or ranking is assumed.

## 3. External interface requirements

### 3.1 User interface
Responsive browser interface with login, role-specific workspace, goal submission form, status indicators, review controls and HR audit events.

### 3.2 Hardware interfaces
No special hardware interface is required for the current web MVP.

### 3.3 Software interfaces
Current API includes `/api/health`, `/api/login`, `/api/logout`, `/api/me`, `/api/goals`, `/api/goals/:id/review`, and `/api/audit`. Future cycle, assessment and report APIs must be specified when implemented.

### 3.4 Communications
Local demo uses HTTP. A deployed production version must use HTTPS/TLS; this requirement is not satisfied merely by running localhost.

## 4. System features (detailed)

Requirements below are target requirements. Status is explicit: **Implemented** means present in current MVP; **Planned** means not yet implemented.

| ID | Requirement (“shall”) | Type | Priority | Status | Acceptance criteria / test reference | Dependencies |
|---|---|---|---|---|---|---|
| FR-001 | System shall authenticate users and enforce role-appropriate access. | Functional | High | Partial | Valid demo login succeeds; invalid credentials fail; protected API rejects anonymous calls. TC-AUTH-01–03 | User/session store |
| FR-002 | HR shall configure appraisal cycles with dates and status. | Functional | High | Planned | HR can create a valid cycle; invalid date ranges and non-HR attempts are rejected. TC-CYCLE-01–02 | Cycle model |
| FR-003 | Employee shall submit a goal with title, description, metric/target and due date. | Functional | High | Partial | Valid goal saved as Submitted; missing/invalid fields rejected. TC-GOAL-01–02 | Goal API |
| FR-004 | Only the assigned manager or authorized HR shall approve, reject or request goal changes with a comment. | Functional | High | Partial | Decision/comment saved; unauthorized or unassigned reviewer is denied. TC-GOAL-03–04 | Manager assignment and record-level authorization |
| FR-005 | Employee shall submit timestamped goal progress updates and evidence. | Functional | High | Planned | Valid progress update stored and visible to authorized reviewers. TC-GOAL-05 | Progress model |
| FR-006 | System shall show role- and cycle-specific appraisal task/status dashboards. | Functional | Medium | Partial | Displayed status/counts match records permitted to current user. TC-DASH-01 | Cycle model and scoped queries |
| FR-007 | Employee shall submit self-assessment during an open cycle. | Functional | High | Planned | Submission timestamped; locked after submit unless authorized reopen. TC-APP-01–02 | Assessment model |
| FR-008 | Manager shall rate employee against approved criteria and provide comments/evidence. | Functional | High | Planned | Required ratings validated and saved to correct employee/cycle. TC-APP-03 | Criteria and assessment model |
| FR-009 | System shall calculate scores using an approved rating scale and weight policy. | Functional | High | Planned | Known fixture returns independently calculated expected score; incomplete ratings block finalization. TC-SCORE-01–02 | Approved formula |
| FR-010 | System shall rank eligible finalized employees within the same cycle and policy version. | Functional | High | Planned | Correct order; documented tie policy; drafts excluded. TC-SCORE-03–05 | FR-009 |
| FR-011 | HR shall finalize and release results. | Functional | High | Planned | Only HR can finalize/release; result release and action are logged. TC-REL-01–02 | Scoring and audit |
| FR-012 | Authorized users shall view permitted appraisal history by employee and cycle. | Functional | Medium | Planned | Correct records shown; unauthorized access denied. TC-HIST-01 | Record-level authorization |
| FR-013 | Authorized HR shall generate a summary/ranking report for a cycle. | Functional | Medium | Planned | Report matches finalized records; other roles cannot access organization-wide report. TC-REP-01 | Final results |
| FR-014 | System shall record important actions with actor, action, target and timestamp. | Functional | High | Partial | Goal submission/review and login actions create audit events; ordinary API users cannot edit audit entries. TC-AUD-01–02 | Audit store |
| FR-015 | HR shall reopen a finalized appraisal only with authorization and a recorded reason. | Functional | Medium | Planned | Missing reason denied; valid reopen audited. TC-REL-03 | Finalization workflow |

## 5. Non-functional requirements (detailed)

| ID | Requirement | Category | Priority | Acceptance criteria / test |
|---|---|---|---|---|
| NFR-001 | Under agreed demo workload, 95% of common read requests should complete within 3 seconds. | Performance | Medium | Record workload, environment and p95 latency in TC-PERF-01; not yet measured. |
| NFR-002 | A failed request shall not leave a partially finalized appraisal or corrupt stored records. | Reliability/integrity | High | Fault/retry tests show no partial or duplicate finalization. TC-REL-04 |
| NFR-003 | Users shall access only records permitted by role and reporting relationship. | Security/privacy | High | Positive and negative role/record-level tests pass. TC-SEC-01 |
| NFR-004 | Scores and rankings shall be reproducible from stored ratings and a versioned policy. | Integrity | High | Recalculation from identical inputs returns identical results. TC-SCORE-06 |
| NFR-005 | Forms shall provide understandable validation and avoid accidental duplicate final actions. | Usability | Medium | Validation is visible and repeated finalization does not duplicate records. TC-UX-01 |

### 5.1 Security objectives
1. **Confidentiality:** prevent unauthorized disclosure of appraisal information.
2. **Integrity and accountability:** prevent unauthorized changes and maintain traceable records of sensitive actions.

### 5.2 Security requirements
| ID | Requirement | Priority | Acceptance / test |
|---|---|---|---|
| SR-001 | Deployed production communication shall use HTTPS/TLS. | High | Verify deployed endpoint and insecure-access policy. TC-SEC-02 |
| SR-002 | Passwords shall not be stored in plaintext. | High | Inspect stored credential representation. Current demo uses scrypt password hashes. TC-SEC-03 |
| SR-003 | Server shall enforce role and record-level authorization on protected operations. | High | Cross-role and cross-employee negative tests. TC-SEC-01 |
| SR-004 | Server shall validate input and use safe data access patterns. | High | Malformed input safely rejected; no unintended state change. TC-SEC-04 |
| SR-005 | Ordinary users shall not be able to alter or delete audit history through application endpoints. | High | Attempt unauthorized mutation and verify denial. TC-AUD-02 |

## 6. Quality attributes & acceptance tests
Acceptance requires high-priority requirements to be verified, no unresolved critical security defect, reproducible scoring, and a reviewed RTM. Since scoring, cycle management and release are not implemented, the complete product does not yet meet acceptance. Current automated tests cover a smaller MVP subset; see Test Plan and CI results.

## 7. UML use-case diagrams
Required diagrams:
1. **Appraisal lifecycle** — Employee, Manager and HR/Admin; submit/review goals, progress, self-assessment, ratings, scoring, finalization and release.
2. **Reporting and administration** — HR/Admin and authorized Manager; configure cycle/policy, view reports, reopen appraisal and inspect audit history.
Store diagram source/rendered diagrams in `SRS_SAD_TestPlan/diagrams/`. Do not mark a diagram complete until the actual file is present.

## 8. Requirements Traceability Matrix (RTM)
| Requirement group | Design/module | Planned test cases | Status |
|---|---|---|---|
| FR-001 / SR-002 / SR-003 | Authentication and authorization | TC-AUTH-01–03; TC-SEC-01, 03 | Partial; MVP tests exist |
| FR-003 / FR-004 | Goal workflow | TC-GOAL-01–04 | Partial; assigned-manager restriction still required |
| FR-005 / FR-006 | Progress/dashboard | TC-GOAL-05; TC-DASH-01 | Planned |
| FR-007 / FR-008 | Assessment | TC-APP-01–03 | Planned |
| FR-009 / FR-010 | Scoring/ranking | TC-SCORE-01–06 | Planned |
| FR-011 / FR-015 / SR-005 | Finalization/audit | TC-REL-01–04; TC-AUD-01–02 | Partial audit; finalization planned |
| FR-013 | Reporting | TC-REP-01 | Planned |
| NFR-001 | Performance | TC-PERF-01 | Not measured |
| SR-001 / SR-004 | Deployment/input security | TC-SEC-02, 04 | Partial/planned |

## Open decisions
Approve scoring criteria, weights, rating scale, missing-rating handling and tie policy with the guide/team. Confirm cycle scope and database choice before claiming the full appraisal product is implemented.
