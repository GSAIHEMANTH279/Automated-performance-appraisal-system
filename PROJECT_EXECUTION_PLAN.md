# Project Execution Plan & Sprint Backlog

**Project:** Automated Performance Appraisal System (APAS)
**Team 9:** G Sai Hemanth (PES1UG24AM101), Nivas Reddy D (PES1UG24AM075), D A V Sreeram (PES1UG24AM076), J Karthik (PES1UG25AM804)
**Repository owner / reviewer:** G Sai Hemanth
**Tracking:** Jira board (sprints, statuses, burndown) mirrored by GitHub issues on this repository
**Last updated:** 29 October 2026

## 1. Delivery objective

Deliver a working, tested appraisal workflow that starts with goal setting and ends with year-end appraisal results ranked within a cycle. Sprint 1 delivers the goal-setting vertical slice; Sprint 2 completes self-assessment, manager rating, scoring, HR finalization, ranking and reporting.

## 2. Sprint calendar

Dates follow the instructor announcement of 27 October 2026, which supersedes the earlier timeline image.

| Sprint | Dates | Sprint goal | Evidence |
|---|---|---|---|
| Sprint 1 | 27–31 Oct 2026 | Requirements baseline, PR/CI workflow, working goal-setting slice | 1-minute demo video in repo, merged PRs, green CI |
| Sprint 2 | 2–7 Nov 2026 | End-to-end appraisal cycle with scores and rankings | 2-minute demo video in repo, test report, final docs |
| Presentation | From 9 Nov 2026 | Final demo | Deviation log (section 6) explained |

## 3. Product backlog

Story points use the Fibonacci scale (1, 2, 3, 5, 8). Each item is a GitHub issue / Jira story and links back to the SRS requirement it implements.

### Sprint 1 — 27–31 October 2026 (22 points)

| ID | Story | SRS ref | Points | Owner | Acceptance criteria | Status (29 Oct) |
|---|---|---|---:|---|---|---|
| APAS-01 | Review SRS, SAD and Test Plan against course templates | All | 3 | G Sai Hemanth | Documents follow template sections; IDs consistent across SRS, SAD, Test Plan and RTM | In progress |
| APAS-02 | Agree appraisal scoring and ranking policy | FR-009, FR-010, NFR-004 | 2 | J Karthik | Rating scale, weights, missing-rating rule and tie rule approved by team (proposal in SRS §4.3) | To do |
| APAS-03 | Confirm stack and local run instructions | §2.4 | 2 | J Karthik | `npm install && npm start` works from README on a clean machine | Done |
| APAS-04 | Establish branch, PR and CI workflow | NFR-005 (process) | 2 | G Sai Hemanth | PR template, issue templates, GitHub Actions run on every PR; one real PR merged after review | Done |
| APAS-05 | As a user, I can sign in and only see actions allowed for my role | FR-001, SR-002, SR-003 | 5 | Nivas Reddy D | Valid login succeeds; wrong password rejected; anonymous and wrong-role requests return 401/403 | Done |
| APAS-06 | As an employee, I can submit a goal; as a manager, I can approve or return it | FR-003, FR-004, FR-014 | 5 | D A V Sreeram | Valid goal saved as Submitted; invalid input rejected; decision and comment saved and audited | Done (assigned-manager check moved to APAS-15) |
| APAS-07 | Automated tests for the goal-setting slice | TC-AUTH, TC-GOAL, TC-AUD | 3 | J Karthik | Tests cover success, validation failure and unauthorized access; run in CI | Done (5 tests) |

### Sprint 2 — 2–7 November 2026 (34 points)

| ID | Story | SRS ref | Points | Owner | Acceptance criteria |
|---|---|---|---:|---|---|
| APAS-08 | As an employee, I can post progress updates and submit a self-assessment | FR-005, FR-007 | 5 | D A V Sreeram | Updates timestamped; self-assessment allowed only while cycle is open and locked after submit |
| APAS-09 | As a manager, I can rate each goal of my team members 1–5 with comments | FR-008 | 5 | Nivas Reddy D | All approved goals must be rated; manager cannot rate another manager's employee |
| APAS-10 | System calculates the final score using the approved policy | FR-009, NFR-004 | 5 | J Karthik | Unit tests with known fixtures (SRS §4.3 example = 4.02) pass; recalculation is reproducible |
| APAS-11 | As HR, I can finalize appraisals and view the cycle ranking | FR-010, FR-011, NFR-002 | 5 | Nivas Reddy D | Incomplete appraisals cannot be finalized; ranking order and tie rule tested; action audited |
| APAS-12 | As HR, I can view a cycle report and appraisal history | FR-012, FR-013 | 3 | D A V Sreeram | Report matches finalized records; non-HR users denied |
| APAS-13 | Extend CI/CD with build, test and deploy stages | NFR-005, SR-004 | 3 | G Sai Hemanth | Pipeline stages visible in Actions; failing tests block merge |
| APAS-14 | Prepare final demo, test summary and deviation log | §6 Acceptance | 2 | G Sai Hemanth | 2-minute video uploaded; Test Plan §13 statuses updated from actual runs |
| APAS-15 | Restrict goal review and rating to the assigned manager | FR-004, NFR-003, SR-003 | 3 | G Sai Hemanth | Unassigned manager receives 403 and no state change (TC-GOAL-04) |
| APAS-16 | As HR, I can create an appraisal cycle with start/end dates | FR-002, FR-006 | 3 | J Karthik | Valid cycle stored; end before start and non-HR attempts rejected |

**Points per member (both sprints, 56 total):** G Sai Hemanth 13 · Nivas Reddy D 15 · D A V Sreeram 13 · J Karthik 15.

### Backlog (not committed)

| ID | Story | SRS ref | Points |
|---|---|---|---:|
| APAS-17 | HR can reopen a finalized appraisal with a recorded reason | FR-015 | 3 |
| APAS-18 | Measure p95 response time under demo load | NFR-001 | 2 |
| APAS-19 | Accessibility and usability review of forms | NFR-005 | 2 |
| APAS-20 | Replace JSON file storage with a database | NFR-002 | 5 |

## 4. Working agreements

- Each story has an owner, estimate, acceptance criteria and a linked GitHub issue / Jira story.
- The owner creates a branch named with the issue key, e.g. `feat/APAS-08-self-assessment`, and raises the PR from their own GitHub account.
- The repository owner reviews and merges; CI must pass before merge.
- The owner moves the Jira story through To do → In progress → In review → Done so the burndown reflects real progress.

**Definition of Done:** behaviour implemented with server-side validation and authorization; tests added and passing in CI; SRS/SAD/Test Plan updated if behaviour changed; PR reviewed and merged; Jira story closed.

## 5. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Scoring policy not agreed in time | Sprint 2 ranking blocked | Proposal documented in SRS §4.3; decide by 31 Oct (APAS-02) |
| Scope too large for Sprint 2 | Incomplete demo | Build thin end-to-end path first; APAS-17–20 stay in backlog |
| Role checks only in UI | Confidential data exposed | Enforce on every API route; negative tests for each role |
| Docs diverge from code | Inconsistent evaluation | Update docs in the same PR as the code change |
| Board not updated | Inaccurate burndown | Owners update status at least daily |

## 6. Deviation log

Deviations from the submitted SRS/SAD/Test Plan, to be explained in the final demo.

| Date | Area | Deviation | Reason |
|---|---|---|---|
| 28 Oct 2026 | Data store | Local JSON file instead of a database | Keeps the classroom MVP simple; database move is APAS-20 |
| 28 Oct 2026 | Sessions | In-memory sessions | Single-process demo; persistent store needed before deployment |
| 29 Oct 2026 | Authorization | Any manager can review any goal | Manager↔employee assignment deferred to APAS-15 (Sprint 2) |

## 7. Demo checklist

- [ ] Repository, documents and Jira board with story points
- [ ] One story → feature branch → reviewed PR → green CI
- [ ] App running locally from README commands
- [ ] Employee submits goal; manager approves/returns it; wrong role is refused
- [ ] (Sprint 2) Self-assessment, manager rating, score, HR finalization and ranking
- [ ] Test results and deviation log
