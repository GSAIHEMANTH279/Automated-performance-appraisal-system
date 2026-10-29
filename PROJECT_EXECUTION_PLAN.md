# Project Execution Plan & Sprint Backlog

**Project:** Automated Performance Appraisal System (APAS)
**Team 9:** G Sai Hemanth (PES1UG24AM101), Nivas Reddy D (PES1UG24AM075), D A V Sreeram (PES1UG24AM076), J Karthik (PES1UG25AM804)
**Repository owner / reviewer:** G Sai Hemanth
**Tracking:** Jira project **APAS** (https://saihemanthg.atlassian.net, board 4) — Jira is the source of truth; this file mirrors it.
**Last synced with Jira:** 29 October 2026

## 1. Delivery objective

Deliver a working, tested appraisal workflow that starts with goal setting and ends with year-end appraisal results ranked within a cycle. Sprint 1 delivers the goal-setting slice and the verified CI pipeline; Sprint 2 completes self-assessment, manager rating, scoring, HR finalization and ranking.

## 2. Sprint calendar

Dates follow the instructor announcement of 27 October 2026, which supersedes the earlier timeline image.

| Sprint | Dates | Jira sprint goal | Evidence |
|---|---|---|---|
| APAS Sprint 1 | 27–31 Oct 2026 | Verify the current APAS MVP and GitHub Actions CI | 1-minute demo video in repo, merged PRs, green CI |
| APAS Sprint 2 | 2–7 Nov 2026 | Complete remaining features, tests, documentation and demo preparation | 2-minute demo video in repo, test report, final docs |
| Presentation | From 9 Nov 2026 | Final demo | Deviation log (section 6) explained |

## 3. Sprint backlog (mirrors Jira)

Story points are Jira "Story point estimate" values. SRS refs use the IDs in `SRS_SAD_TestPlan/SRS.md`.

### APAS Sprint 1 — 27–31 October 2026 (18 points)

| Jira key | Item | SRS ref | Points | Assignee | Status (29 Oct) |
|---|---|---|---:|---|---|
| APAS-1 | Verify the existing APAS MVP end-to-end | FR-001, FR-003, FR-004 | 3 | G Sai Hemanth | In Progress |
| APAS-2 | Verify GitHub Actions CI on pull requests | NFR-005 (process) | 2 | G Sai Hemanth | Done |
| APAS-9 | Goal submission, manager review and progress updates | FR-003, FR-004, FR-005 | 5 | Nivas Reddy D | To Do |
| APAS-15 | Role and assigned-manager access control | NFR-003, SR-003 | 3 | D A V Sreeram | To Do |
| APAS-18 | CI/CD — validate PR checks and document deployment stage | SR-004, NFR-005 | 3 | G Sai Hemanth | In Progress |
| APAS-19 | Capture Sprint 1 verification and demo evidence | §6 Acceptance | 2 | J Karthik | To Do |

### APAS Sprint 2 — 2–7 November 2026 (55 points)

| Jira key | Item | SRS ref | Points | Assignee |
|---|---|---|---:|---|
| APAS-3 | Review and finalize SRS, SAD and Test Plan | All | 3 | Nivas Reddy D |
| APAS-4 | Create and execute an APAS test checklist | Test Plan §13 | 5 | J Karthik |
| APAS-5 | Review authentication and role-protected API behavior | FR-001, SR-002 | 3 | D A V Sreeram |
| APAS-6 | Reproducible local setup and demo instructions | §2.4 | 2 | Nivas Reddy D |
| APAS-7 | Validate Jira backlog, sprint dates and story estimates | – | 2 | G Sai Hemanth |
| APAS-8 | Final presentation and live demo checklist | – | 3 | G Sai Hemanth |
| APAS-10 | Employee self-assessment and comments | FR-007 | 5 | J Karthik |
| APAS-11 | Manager feedback and 1–5 goal ratings | FR-008 | 5 | D A V Sreeram |
| APAS-12 | Year-end appraisal and overall score (scoring policy v1) | FR-009, NFR-004 | 8 | Nivas Reddy D |
| APAS-13 | HR finalization and performance rankings | FR-010, FR-011 | 5 | J Karthik |
| APAS-14 | Configure appraisal cycles, criteria and rating scale | FR-002, FR-006 | 5 | D A V Sreeram |
| APAS-16 | Verify audit trail for appraisal changes | FR-014, SR-005 | 3 | D A V Sreeram |
| APAS-17 | Responsiveness under normal concurrent use | NFR-001 | 3 | Nivas Reddy D |
| APAS-20 | Record demo, deviations and final documentation | §6 Acceptance | 3 | J Karthik |

**Points per member (73 total):** G Sai Hemanth 13 · Nivas Reddy D 21 · D A V Sreeram 19 · J Karthik 20.

### Not yet in Jira (recommended)

| Item | SRS ref | Suggested points |
|---|---|---:|
| Appraisal history and HR cycle report | FR-012, FR-013 | 3 |
| HR reopens a finalized appraisal with a recorded reason | FR-015 | 2 |

## 4. Working agreements

- Every Jira item has an owner, estimate and acceptance criteria.
- The assignee creates a branch named with the Jira key, e.g. `feat/APAS-10-self-assessment`, and raises the PR from their own GitHub account. Putting the key in the branch/PR title links it to Jira's Development panel.
- The repository owner reviews and merges; CI must pass before merge.
- The assignee moves the Jira item To Do → In Progress → In Review → Done so the burndown reflects real progress.

**Definition of Done:** behaviour implemented with server-side validation and authorization; tests added and passing in CI; SRS/SAD/Test Plan updated if behaviour changed; PR reviewed and merged; Jira item moved to Done.

## 5. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Scoring policy not agreed in time | Sprint 2 scoring/ranking blocked | Proposal in SRS §4.5.1; decide by 31 Oct (APAS-12) |
| Sprint 2 holds 75% of the points | Incomplete demo | Build the thin end-to-end path first (APAS-14 → 10 → 11 → 12 → 13) |
| Role checks only in UI | Confidential data exposed | Enforce on every API route; negative tests per role (APAS-15) |
| Docs diverge from code | Inconsistent evaluation | Update docs in the same PR as the code change |
| Board not updated | Inaccurate burndown | Assignees update status at least daily |

## 6. Deviation log

Deviations from the submitted SRS/SAD/Test Plan, to be explained in the final demo.

| Date | Area | Deviation | Reason |
|---|---|---|---|
| 28 Oct 2026 | Data store | Local JSON file instead of a database | Keeps the classroom MVP simple |
| 28 Oct 2026 | Sessions | In-memory sessions | Single-process demo; persistent store needed before deployment |
| 29 Oct 2026 | Authorization | Any manager can review any goal | Manager↔employee assignment scheduled in APAS-15 |
| 29 Oct 2026 | Requirement IDs | SRS requirement IDs renumbered by feature area in v1.2; Jira summaries updated to match | Template alignment |

## 7. Demo checklist

- [ ] Repository, documents and Jira board with story points and burndown
- [ ] One Jira item → feature branch → reviewed PR → green CI
- [ ] App running locally from README commands
- [ ] Employee submits goal; manager approves/returns it; wrong role is refused
- [ ] (Sprint 2) Self-assessment, manager rating, score, HR finalization and ranking
- [ ] Test results and deviation log
