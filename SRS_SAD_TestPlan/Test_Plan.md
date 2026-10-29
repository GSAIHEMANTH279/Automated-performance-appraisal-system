# Software Test Plan (STP)
**Project:** Automated Performance Appraisal System (APAS)  
**Version:** 1.1 | **Date:** 28 October 2026  
**Authors:** APAS project team  
**Status:** Draft; distinguish planned test cases from executed results.

## Revision history
| Version | Date | Change summary | Approval |
|---|---|---|---|
| 1.0 | 28-Oct-2026 | Initial test plan | Pending |
| 1.1 | 28-Oct-2026 | Template alignment and MVP scope clarification | Pending |

## 1. Introduction

### 1.1 Purpose
Define test objectives, scope, strategy, resources, schedule, responsibilities, risks and exit criteria for APAS.

### 1.2 Scope
Current executable MVP scope: authentication, goal submission, manager/HR review, role checks and HR audit view. Planned product scope also includes cycles, progress updates, self-assessment, manager ratings, scoring, ranking, finalization, release and reporting; those features are not yet testable as implemented functionality.

### 1.3 References
- [SRS](SRS.md)
- [SAD](SAD.md)
- GitHub Actions application CI workflow.

### 1.4 Definitions
TC: test case; STP: Software Test Plan; RTM: requirements traceability matrix; UAT: user acceptance testing; p95: 95th percentile latency.

## 2. Test items
- Login/logout and session handling
- Protected API and role middleware
- Goal creation and validation
- Goal review and status transitions
- HR audit endpoint and event creation
- Browser UI smoke check
- Planned future: cycles, progress, assessment, scoring/ranking, finalization/release and reports.

## 3. Features to be tested
- FR-001 (partial), FR-003 (partial), FR-004 (partial), FR-014 (partial).
- Relevant security requirements SR-002 and SR-003, subject to limitations below.
- Automated tests currently in `test/app.test.js`: health response, anonymous access rejection, employee goal submission, employee forbidden from review, manager approval, HR audit visibility, invalid review decision.
- Future requirements FR-002, FR-005–FR-013, FR-015 and remaining NFR/SR tests are planned, not passed.

## 4. Features not to be tested in the current MVP
- Appraisal-cycle configuration and cycle date validation.
- Progress evidence, self-assessment and manager rating forms.
- Score calculation, ranking/tie handling, finalization and result release.
- Reports and history screens not implemented.
- Production-scale availability, production TLS configuration and real employee-data security.
- Payroll, recruitment or external HR integrations.

## 5. Test approach / strategy

### 5.1 Test levels
- **Unit:** input validation and future scoring/status logic.
- **Integration/API:** authentication, authorization, goal workflow and audit events.
- **System:** employee submission through manager review, followed by HR audit inspection.
- **Acceptance/UAT:** demo employee, manager and HR scenarios against approved requirements.
- **Regression:** rerun automated tests after changes.

### 5.2 Test types
Functional, negative, boundary, authorization/security, data-integrity, usability, performance and regression testing.

### 5.3 Entry criteria
Testable commit available; Node.js 20+ and npm installed; dependencies installed; isolated synthetic test data; test accounts prepared; test instructions available.

### 5.4 Exit criteria
All planned high-priority tests executed; no unresolved critical defect; role/record authorization verified; scoring fixtures pass before scoring is claimed; failures and limitations recorded; test summary reviewed by team/guide. Current MVP does not meet full-product exit criteria.

### 5.5 Security validation
Check invalid login, role-protected endpoints, password hashes, input validation, cookie flags, unauthorized review attempts and audit integrity. Production HTTPS/TLS and full record-level manager authorization are not yet demonstrated. Do not claim production security compliance.

## 6. Test environment
- Runtime: Node.js 20+; CI currently configures Node.js 22.
- Server: local Express process.
- Storage: temporary JSON file for automated tests; local demo store for manual demonstration.
- Client: current Chrome/Edge or another modern browser.
- Tools: npm, Node built-in test runner, GitHub Actions.
- Test data: synthetic demo users and goals only.
Record operating system, browser version, commit SHA, run URL and date in the execution report. Performance thresholds are not measured yet.

## 7. Test schedule
| Milestone | Planned period | Responsibility |
|---|---|---|
| Review SRS/SAD/STP and approve scoring policy | Sprint 1 | Whole team/guide |
| Execute current API tests and record results | Sprint 1 | Assigned test owner |
| Fix authorization and expand negative tests | Sprint 1–2 | Backend owner/test owner |
| Test full appraisal workflow when implemented | Sprint 2 or later | Whole team |
| Produce execution report and demo evidence | Before presentation | Test owner/team |

Dates are planning targets; update with actual completion dates rather than marking planned work complete.

## 8. Test deliverables
- This STP and test case list
- Automated test scripts
- Synthetic test data
- CI run links and execution logs
- Defect reports and retest evidence
- RTM and final test summary report.

## 9. Roles and responsibilities
| Role | Name | Responsibility |
|---|---|---|
| Test coordinator | To be assigned | Plan, coordinate and report test status |
| Developer(s) | Project team | Implement/fix code and support triage |
| Reviewer | Teammate/guide to be assigned | Review results and acceptance evidence |
| Product representative | Team representative to be assigned | Confirm requirements and approve scope |

Do not assign names until the team confirms ownership.

## 10. Risks and mitigation
| Risk | Mitigation |
|---|---|
| Assigned-manager authorization is not enforced | Implement relationship check and add negative test before claiming secure review |
| Features are planned but not implemented | Mark their test cases Planned/Blocked, not Passed |
| JSON persistence is fragile | Use isolated test files; plan database migration |
| Scoring policy undecided | Obtain approval and add known-score fixtures before implementation |
| Limited time before evaluation | Prioritize working vertical slice, test evidence and clear limitations |

## 11. Assumptions and dependencies
- Node.js and npm are available.
- GitHub Actions is enabled for the repository.
- The team will provide confirmed scoring rules and guide requirements.
- Tests use synthetic data only.
- Browser and runtime versions will be recorded at execution time.

## 12. Suspension and resumption criteria
Suspend tests if the build cannot start, test data is corrupted, or the environment produces unreliable results. Resume after the build/environment is stable and test data is reset. Record skipped tests and reasons.

## 13. Test case management and traceability

| Test ID | Requirement | Scenario | Expected result | Status |
|---|---|---|---|---|
| TC-SMOKE-01 | N/A | Request `GET /api/health` | HTTP 200 and status ok | Automated test exists |
| TC-AUTH-01 | FR-001 | Access private goals without session | HTTP 401 | Automated test exists |
| TC-AUTH-02 | FR-001/SR-003 | Employee attempts review action | HTTP 403 | Automated test exists |
| TC-GOAL-01 | FR-003 | Employee submits valid goal | HTTP 201; goal stored | Automated test exists |
| TC-GOAL-02 | FR-003 | Submit invalid goal fields | HTTP 400 and clear error | Planned additional test |
| TC-GOAL-03 | FR-004 | Manager approves submitted goal | Status becomes Approved | Automated test exists |
| TC-GOAL-04 | FR-004/SR-003 | Unassigned manager reviews employee goal | Denied; no state change | Blocked until manager assignment exists |
| TC-AUD-01 | FR-014 | HR reads audit events after approval | Approval event visible | Automated test exists |
| TC-AUD-02 | SR-005 | Attempt to alter audit events as ordinary user | Denied/no mutation endpoint | Manual/API review required |
| TC-CYCLE-01 | FR-002 | HR creates cycle | Valid cycle stored | Not implemented |
| TC-APP-01 | FR-007/008 | Submit self and manager assessment | Correct records saved | Not implemented |
| TC-SCORE-01 | FR-009 | Score known ratings/weights | Expected score exactly matches | Not implemented |
| TC-SCORE-02 | FR-010 | Rank finalized records with tie fixture | Documented order/tie policy applied | Not implemented |
| TC-REL-01 | FR-011/015 | Finalize/reopen cycle | Authorized, audited state transition | Not implemented |
| TC-PERF-01 | NFR-001 | Measure p95 for agreed workload | p95 ≤ 3 seconds | Not measured |
| TC-SEC-01 | SR-001 | Verify deployed HTTPS | HTTPS policy satisfied | Not applicable to localhost; deployment not configured |
| TC-SEC-02 | SR-002 | Inspect stored credentials | No plaintext password stored | Automated code/test review required |
| TC-SEC-03 | SR-004 | Submit malformed input | Safe rejection/no unintended state change | Partially covered; expand tests |

## 14. Test metrics and reporting
Report planned, executed, passed, failed and blocked counts; pass rate among executed tests; open defects by severity/age; requirement coverage; and p95 latency with environment/workload. Do not claim results until a run has been inspected. Link the GitHub Actions run and record commit SHA/date in the final execution report.

## 15. Approvals
| Role | Name | Signature/date |
|---|---|---|
| Test coordinator | To be assigned | Pending |
| Development lead | To be assigned | Pending |
| Project guide/evaluator | To be assigned | Pending |
