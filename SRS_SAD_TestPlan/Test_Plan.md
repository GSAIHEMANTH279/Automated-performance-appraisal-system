# Software Test Plan (STP) – Automated Performance Appraisal System

**Project:** Automated Performance Appraisal System (APAS)
**Version:** 2.0
**Authors:** G Sai Hemanth (PES1UG24AM101), Nivas Reddy D (PES1UG24AM075), D A V Sreeram (PES1UG24AM076), J Karthik (PES1UG25AM804)
**Date:** 06-11-2026
**Status:** Final, awaiting guide sign-off

## Revision history

| Version | Date | Author | Change summary |
|---|---|---|---|
| 1.0 | 27-10-2026 | Team 9 | Initial test plan |
| 1.1 | 28-10-2026 | Team 9 | Template alignment and MVP scope |
| 1.2 | 29-10-2026 | G Sai Hemanth | Test IDs aligned with SRS; full test case list; roles and dates assigned |
| 2.0 | 06-11-2026 | Nivas Reddy D | Final status: results recorded from the code on `main`; expected results aligned with the built API; manual and performance results added |

## 1. Introduction

**Purpose:** This document defines the test plan for APAS v1.0. It outlines objectives, scope, strategy, resources, schedule and responsibilities for testing.

**Scope:** Testing covers authentication and role access, appraisal cycles, goal setting and review, progress updates, self-assessment, manager rating, scoring, ranking, finalization, reporting and audit logging. Payroll, recruitment and external HR integrations are excluded.

**References:** [APAS SRS v2.0](SRS.md), [APAS SAD v2.0](SAD.md), [Sprint schedule & Jira backlog](../README.md#sprint-schedule-and-jira), OWASP Top 10.

**Definitions:** TC – Test Case; STP – Software Test Plan; RTM – Requirements Traceability Matrix; UAT – User Acceptance Testing; p95 – 95th percentile latency; CI – Continuous Integration.

## 2. Test Items

- Authentication and RBAC middleware
- Goal service (submit, list, review, progress)
- Appraisal cycle service
- Assessment service (self-assessment, manager rating)
- Scoring and ranking service
- Finalization, reporting and history
- Audit service
- Web UI

## 3. Features to be Tested

Features mapped to SRS requirement IDs:
- FR-001: Sign-in and role access
- FR-002: Appraisal cycle creation
- FR-003 / FR-004 / FR-005: Goal submission, review, progress
- FR-006: Role dashboard
- FR-007 / FR-008: Self-assessment and manager rating
- FR-009 / FR-010: Score calculation and ranking
- FR-011 / FR-015: Finalization, release and reopen
- FR-012 / FR-013: History and cycle report
- FR-014: Audit logging
- NFR-001 to NFR-005: performance, integrity, privacy, reproducibility, usability
- SR-001 to SR-005: security requirements

## 4. Features Not to be Tested

- Payroll, compensation and recruitment (out of scope)
- Third-party HR / identity provider integrations (not used)
- Express framework and Node.js internals (assumed tested by maintainers)
- Production-scale availability (no production deployment)

## 5. Test Approach / Strategy

**Levels:**
- Unit tests – scoring formula, rating bands, tie rule, input validation
- Integration / API tests – authentication, authorization, goal, cycle, assessment and audit endpoints over HTTP
- System tests – full flow: employee goal → manager approval → self-assessment → manager rating → HR finalize → ranking
- Acceptance tests (UAT) – team walkthrough with demo employee, manager and HR accounts

**Types:**
- Functional testing (positive and negative)
- Regression testing (full automated suite on every push and PR via GitHub Actions)
- Security testing (role bypass, input validation)
- Performance testing (p95 latency)
- Usability testing (forms, mobile width)

**Entry Criteria:** feature merged to a branch with a passing build, Node.js 20+ installed, synthetic test data available, test cases written.
**Exit Criteria:** 100% of planned high-priority test cases executed, 0 critical defects open, scoring fixtures pass, RTM updated.

### 5.1 Security Validation
- Wrong-role and cross-employee access attempts (expect 403)
- Anonymous access to protected routes (expect 401)
- Password storage inspection (scrypt hash, no plaintext)
- Malformed, oversized and boundary input on all forms and endpoints
- Session cookie flags (HttpOnly, SameSite, Secure in production)
- Login throttling after repeated failures (expect 429)
- Absence of any audit mutation endpoint

## 6. Test Environment

**Hardware:** team laptops (Windows/macOS/Linux) and GitHub-hosted Ubuntu runners.
**Software:** APAS (current commit on `main`), Node.js 20+ locally, Node.js 22 in CI, Chrome/Edge latest.
**Tools:** Node built-in test runner with fetch (API tests), GitHub Actions (CI), browser DevTools (UI and cookie checks), `npm run perf` (`scripts/perf-check.js`, performance), Jira (defect tracking).
**Test Data:** synthetic demo accounts (`employee@apas.local`, `manager@apas.local`, `hr@apas.local`) and generated goals; automated tests use a temporary data file.

## 7. Test Schedule

| Milestone | Date |
|---|---|
| Test case design (Sprint 1 scope) | 27-Oct-2026 |
| Environment and CI setup | 28-Oct-2026 |
| Sprint 1 test execution | 29-Oct-2026 to 31-Oct-2026 |
| Sprint 2 test case design | 02-Nov-2026 |
| Sprint 2 test execution | 03-Nov-2026 to 06-Nov-2026 |
| UAT and test summary report | 07-Nov-2026 |
| Presentation | from 09-Nov-2026 |

## 8. Test Deliverables

- Test Plan (this document)
- Test cases (section 13)
- Automated test scripts (`test/`)
- Test data (synthetic seed)
- Test execution logs (GitHub Actions runs)
- Defect reports (Jira / GitHub issues)
- Test summary report

## 9. Roles and Responsibilities

| Role | Name | Responsibility |
|---|---|---|
| QA Lead | J Karthik | Prepare plan, maintain test cases and RTM, coordinate execution |
| Test Engineer | D A V Sreeram | Design and execute test cases, log defects |
| Developer | Nivas Reddy D | Support defect fixes and triage |
| Product Owner | G Sai Hemanth | Review PRs, approve test results, sign off readiness |

## 10. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Sprint 2 features delivered late, leaving little test time | Write tests with each feature PR; CI blocks merge on failure |
| Scoring policy changes after tests are written | Keep fixtures tied to policy version; update fixtures in the same PR |
| Shared JSON data affects test results | Each test run uses an isolated temporary data file |
| Manager–employee assignment missing at the start of Sprint 2 | Resolved: `managerId` and own-team checks merged with APAS-11; TC-GOAL-04 passes |

## 11. Assumptions & Dependencies

- GitHub Actions remains enabled for the repository
- Scoring policy v1 is confirmed by the team on Jira APAS-12
- All team members can run the app locally with Node.js 20+
- Only synthetic data is used

## 12. Suspension & Resumption Criteria

Suspend testing if:
- The build fails to start or CI is unavailable for more than 4 hours
- A blocking defect prevents more than 30% of test cases from running

Resume testing if:
- Blocking defects are fixed and merged
- The build starts and the smoke test (TC-SMOKE-01) passes

## 13. Test Case Management & Traceability

Each test case maps to an SRS requirement; the full matrix is in SRS §8 and `diagrams/requirements-traceability.csv`.
Status as of 06-Nov-2026: **Pass** = automated test passing in `npm run check`, or a recorded manual or tool run (section 13.1); **Partial** = part of the case executed; **Not run** = test not yet executed; **Not built** = feature left out of this release; **Not applicable** = cannot be executed in this release. Differences from the original documents are listed in `docs/DEVIATIONS.md`.

| Test ID | Req ID | Scenario | Expected result | Type | Status |
|---|---|---|---|---|---|
| TC-SMOKE-01 | – | `GET /api/health` | 200, `status: ok` | Automated | Pass |
| TC-AUTH-01 | FR-001 | Sign in with valid employee credentials | 200, user role returned, session cookie set | Automated | Pass |
| TC-AUTH-02 | FR-001 | Sign in with wrong password | 401, generic error message | Automated | Pass |
| TC-AUTH-03 | FR-001 | Call `GET /api/goals` without a session | 401 | Automated | Pass |
| TC-CYCLE-01 | FR-002 | HR creates cycle with valid dates | 201, cycle stored as Open | Automated | Pass |
| TC-CYCLE-02 | FR-002 | End date before start date; employee tries to create cycle | 400; 403 | Automated | Pass |
| TC-DASH-01 | FR-006 | Each role opens dashboard | Only permitted records and correct counts shown | Manual | Pass (manual) |
| TC-GOAL-01 | FR-003 | Employee submits valid goal | 201, status Submitted | Automated | Pass |
| TC-GOAL-02 | FR-003 | Submit goal with 2-character title / invalid date | 400 with clear message | Automated | Pass |
| TC-GOAL-03 | FR-004 | Manager approves a submitted goal | 200, status Approved, comment saved | Automated | Pass |
| TC-GOAL-04 | FR-004, NFR-003 | Manager reviews a goal of an employee they don't manage | 403, goal unchanged | Automated | Pass |
| TC-GOAL-05 | FR-005 | Employee adds progress update to approved goal | 201, timestamp stored | Automated | Pass |
| TC-APP-01 | FR-007 | Employee submits self-assessment in open cycle | 200, status SelfSubmitted | Automated | Pass |
| TC-APP-02 | FR-007 | Employee edits self-assessment after submit | 409 | Automated | Pass |
| TC-APP-03 | FR-008 | Manager submits ratings; rating 6; unassigned manager | 200; 400; 403 | Automated | Pass |
| TC-SCORE-01 | FR-009 | Score fixture from SRS §4.5.1 | Final score 4.02, band Exceeds | Unit | Pass |
| TC-SCORE-02 | FR-009 | Calculate with a missing manager rating | Calculation/finalization rejected | Unit | Pass |
| TC-SCORE-03 | FR-010 | Rank three finalized employees | Ordered by final score descending | Unit | Pass |
| TC-SCORE-04 | FR-010 | Two employees with equal final score | Tie rule applied (manager score, then shared rank) | Unit | Pass |
| TC-SCORE-05 | FR-010 | Cycle containing a non-finalized appraisal | Excluded from ranking | Unit | Pass |
| TC-SCORE-06 | NFR-004 | Recalculate same inputs twice | Identical scores and ranks | Unit | Pass |
| TC-REL-01 | FR-011 | HR finalizes the cycle (finalizing also releases the results) | 200, results visible to employees, audited | Automated + manual | Pass |
| TC-REL-02 | FR-011 | Manager attempts to finalize | 403 | Automated | Pass |
| TC-REL-03 | FR-015 | HR reopens without reason; with reason | 400; 200 and audited | Automated | Not built (FR-015) |
| TC-REL-04 | NFR-002 | Send finalize twice / simulate write failure | No duplicate or partial results | Automated | Partial: finalizing twice passes (409, no duplicates); write failure not simulated |
| TC-HIST-01 | FR-012 | Employee views own history; another employee's | 200; 403 | Automated | Pass |
| TC-REP-01 | FR-013 | HR generates cycle report; manager tries | Totals match finalized records; 403 | Automated | Pass |
| TC-AUD-01 | FR-014 | HR reads audit after a goal approval | GOAL_APPROVED event present | Automated | Pass |
| TC-AUD-02 | SR-005 | Attempt PUT/DELETE on `/api/audit` | 404, no change to audit log | Automated | Not run (test due with APAS-16) |
| TC-SEC-01 | SR-003, NFR-003 | Employee calls review endpoint | 403 | Automated | Pass |
| TC-SEC-02 | SR-001 | Access deployed instance over HTTP | Redirect/refusal; HTTPS only | Manual | Not applicable (no deployed instance) |
| TC-SEC-03 | SR-002 | Inspect `data/store.json` user records | Only `salt:hash` values, no plaintext | Automated | Pass |
| TC-SEC-04 | SR-004 | Invalid review decision; body > 32 KB | 400; 413, no state change | Automated | Pass |
| TC-PERF-01 | NFR-001 | 20 concurrent users run common operations for their role, including `/api/goals`, for 60 s | p95 ≤ 3 s | Tool | Pass (p95 42 ms) |
| TC-UX-01 | NFR-005 | Submit empty form; use at 360 px width; double-click final action | Clear message; usable layout; single record | Manual | Pass (manual) |

**Automated test mapping (47 tests passing in `npm run check` on 06-Nov-2026):**

| Test file | Test cases |
|---|---|
| `test/app.test.js` | TC-SMOKE-01, TC-AUTH-01, TC-AUTH-03, TC-GOAL-01, TC-GOAL-02, TC-GOAL-03, TC-AUD-01, TC-SEC-01, TC-SEC-04 (invalid decision) |
| `test/auth.test.js` | TC-AUTH-02, TC-SEC-03, TC-SEC-04 (oversized and malformed requests) |
| `test/cycles.test.js` | TC-CYCLE-01, TC-CYCLE-02 |
| `test/progress.test.js` | TC-GOAL-05 |
| `test/self-assessment.test.js` | TC-APP-01, TC-APP-02 |
| `test/manager-rating.test.js` | TC-APP-03, TC-GOAL-04 |
| `test/scoring.test.js` | TC-SCORE-01, TC-SCORE-02, TC-SCORE-06 |
| `test/ranking.test.js` | TC-SCORE-04 |
| `test/finalize.test.js` | TC-REL-01, TC-REL-02, TC-REL-04 (finalizing twice), TC-SCORE-03, TC-SCORE-05 |
| `test/reports.test.js` | TC-HIST-01, TC-REP-01 |

### 13.1 Manual and tool results (06-Nov-2026)

Run in the browser on the code from `main` with fresh demo data. TC-UX-01 was run at a 360 px wide viewport.

| Test ID | Steps | Observed result |
|---|---|---|
| TC-DASH-01 | Signed in as Asha Rao (employee), Demo Manager and Demo HR | Asha saw 2 goals (2 approved) and her own panels. The manager saw 7 goals (1 awaiting review, 6 approved) and the team panel. HR saw the same goals plus ranking, report, cycles and audit panels. All three saw the FY 2026 banner. |
| TC-UX-01 | Submitted an empty goal form; checked the page width; clicked **Finalize cycle** twice quickly | The browser asked for the required field and no goal was created. No horizontal scrolling on the employee or HR pages. The double click sent two requests, the second returned 409 and only one CYCLE_FINALIZED event and one set of results were recorded. |
| TC-REL-01 (audit and results) | Completed the appraisal for Asha, finalized as HR, then read the audit log and signed in as Asha | The audit log held SELF_ASSESSMENT_SUBMITTED, MANAGER_RATED and CYCLE_FINALIZED. *My results* showed 4.02, Exceeds expectations, rank 2 of 3. |
| TC-PERF-01 | `npm run perf` | Overall p95 42 ms against the 3 s target, 0 failed requests out of 1,180. Details and limits are in `docs/PERFORMANCE.md`. |

**Observation (not blocking):** after a double click on **Finalize cycle**, the cycle is finalized correctly but the toast shows "This cycle is already finalized." because the second request is refused.

## 14. Test Metrics & Reporting

**Metrics collected:**
- % test cases executed (current: 32 of 35 executed, 0 failing: 31 Pass, 1 Partial; 1 Not run, 1 Not built, 1 Not applicable)
- % passed / failed
- Defect density (defects per feature)
- Defect aging (days open)
- Requirement coverage (requirements with at least one passing test)

**Reports:**
- CI run status on every push and pull request
- Sprint-end test status (31-Oct and 07-Nov)
- Final Test Summary Report before the presentation

## 15. Approvals

| Role | Name | Signature / Date |
|---|---|---|
| QA Lead | J Karthik | |
| Dev Lead | Nivas Reddy D | |
| Product Owner | G Sai Hemanth | |
