# System Validation Report

Generated: 2026-11-10T03:09:45.034Z · Commit: `a35238f` · Node.js v22.20.0 · Command: `npm run report`

Every test case from Test Plan §13. Automated cases are filled in from the test run above. For **Manual** cases, run the step in the browser (`npm start`, http://localhost:3000) and replace the status with **Pass** or **Fail**, the tester's name and the date.

| Test ID | Requirement | Scenario | Expected result | Type | Status |
|---|---|---|---|---|---|
| TC-SMOKE-01 | – | `GET /api/health` | 200, `status: ok` | Automated | Manual: record result |
| TC-AUTH-01 | FR-001 | Sign in with valid employee credentials | 200, user role returned, session cookie set | Automated | Manual: record result |
| TC-AUTH-02 | FR-001 | Sign in with wrong password | 401, generic error message | Automated | Pass (automated) |
| TC-AUTH-03 | FR-001 | Call `GET /api/goals` without a session | 401 | Automated | Manual: record result |
| TC-CYCLE-01 | FR-002 | HR creates cycle with valid dates | 201, cycle stored as Open | Automated | Pass (automated) |
| TC-CYCLE-02 | FR-002 | End date before start date; employee tries to create cycle | 400; 403 | Automated | Pass (automated) |
| TC-DASH-01 | FR-006 | Each role opens dashboard | Only permitted records and correct counts shown | Manual | Manual: record result |
| TC-GOAL-01 | FR-003 | Employee submits valid goal | 201, status Submitted | Automated | Manual: record result |
| TC-GOAL-02 | FR-003 | Submit goal with 2-character title / invalid date | 400 with clear message | Automated | Pass (automated) |
| TC-GOAL-03 | FR-004 | Manager approves a submitted goal | 200, status Approved, comment saved | Automated | Manual: record result |
| TC-GOAL-04 | FR-004, NFR-003 | Manager reviews a goal of an employee they don't manage | 403, goal unchanged | Automated | Pass (automated) |
| TC-GOAL-05 | FR-005 | Employee adds progress update to approved goal | 201, timestamp stored | Automated | Pass (automated) |
| TC-APP-01 | FR-007 | Employee submits self-assessment in open cycle | 200, status SelfSubmitted | Automated | Pass (automated) |
| TC-APP-02 | FR-007 | Employee edits self-assessment after submit | 409 | Automated | Pass (automated) |
| TC-APP-03 | FR-008 | Manager submits ratings; rating 6; unassigned manager | 200; 400; 403 | Automated | Pass (automated) |
| TC-SCORE-01 | FR-009 | Score fixture from SRS §4.5.1 | Final score 4.02, band Exceeds | Unit | Pass (automated) |
| TC-SCORE-02 | FR-009 | Calculate with a missing manager rating | Calculation/finalization rejected | Unit | Pass (automated) |
| TC-SCORE-03 | FR-010 | Rank three finalized employees | Ordered by final score descending | Unit | Pass (automated) |
| TC-SCORE-04 | FR-010 | Two employees with equal final score | Tie rule applied (manager score, then shared rank) | Unit | Pass (automated) |
| TC-SCORE-05 | FR-010 | Cycle containing a non-finalized appraisal | Excluded from ranking | Unit | Pass (automated) |
| TC-SCORE-06 | NFR-004 | Recalculate same inputs twice | Identical scores and ranks | Unit | Pass (automated) |
| TC-REL-01 | FR-011 | HR finalizes the cycle (finalizing also releases the results) | 200, results visible to employees, audited | Automated + manual | Pass (automated) |
| TC-REL-02 | FR-011 | Manager attempts to finalize | 403 | Automated | Pass (automated) |
| TC-REL-03 | FR-015 | HR reopens without reason; with reason | 400; 200 and audited | Automated | Manual: record result |
| TC-REL-04 | NFR-002 | Send finalize twice / simulate write failure | No duplicate or partial results | Automated | Pass (automated) |
| TC-HIST-01 | FR-012 | Employee views own history; another employee's | 200; 403 | Automated | Pass (automated) |
| TC-REP-01 | FR-013 | HR generates cycle report; manager tries | Totals match finalized records; 403 | Automated | Pass (automated) |
| TC-AUD-01 | FR-014 | HR reads audit after a goal approval | GOAL_APPROVED event present | Automated | Pass (automated) |
| TC-AUD-02 | SR-005 | Attempt PUT/DELETE on `/api/audit` | 404, no change to audit log | Automated | Pass (automated) |
| TC-SEC-01 | SR-003, NFR-003 | Employee calls review endpoint | 403 | Automated | Manual: record result |
| TC-SEC-02 | SR-001 | Access deployed instance over HTTP | Redirect/refusal; HTTPS only | Manual | Manual: record result |
| TC-SEC-03 | SR-002 | Inspect `data/store.json` user records | Only `salt:hash` values, no plaintext | Automated | Pass (automated) |
| TC-SEC-04 | SR-004 | Invalid review decision; body > 32 KB | 400; 413, no state change | Automated | Pass (automated) |
| TC-PERF-01 | NFR-001 | 20 concurrent users run common operations for their role, including `/api/goals`, for 60 s | p95 ≤ 3 s | Tool | Manual: record result |
| TC-UX-01 | NFR-005 | Submit empty form; use at 360 px width; double-click final action | Clear message; usable layout; single record | Manual | Manual: record result |
