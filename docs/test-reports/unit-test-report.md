# Unit and Integration Test Report

Generated: 2026-11-10T03:09:45.034Z · Commit: `a35238f` · Node.js v22.20.0 · Command: `npm run report`

**Result: 51 passed, 0 failed, 51 total.**

Tests use the Node.js built-in test runner. Unit tests call `lib/` functions directly; integration tests start the real server on a free port and call the HTTP API with fresh demo data.

| # | Test | Result |
|---|---|---|
| 1 | health endpoint reports ready | Pass |
| 2 | private routes reject anonymous requests | Pass |
| 3 | employee can sign in and submit a goal, but cannot review it | Pass |
| 4 | manager can approve a submitted goal and HR can read audit events | Pass |
| 5 | invalid review decisions are rejected | Pass |
| 6 | TC-AUD-01: every appraisal change records who, what, which record and when | Pass |
| 7 | TC-AUD-02: nobody can change or delete audit history through the API | Pass |
| 8 | only HR can read the audit log | Pass |
| 9 | TC-AUTH-02: a wrong password is rejected with a generic message and no session | Pass |
| 10 | the session cookie is HttpOnly and SameSite | Pass |
| 11 | signing out ends the session | Pass |
| 12 | TC-SEC-03: passwords are stored only as salted scrypt hashes | Pass |
| 13 | TC-SEC-04: oversized or malformed requests are refused without changing data | Pass |
| 14 | repeated wrong passwords pause sign-in (429) | Pass |
| 15 | every role sees the seeded open cycle | Pass |
| 16 | the extra demo employees can sign in | Pass |
| 17 | TC-CYCLE-02: only HR can create a cycle and dates must be valid | Pass |
| 18 | a second cycle cannot open while one is open | Pass |
| 19 | TC-CYCLE-01: HR closes the open cycle and starts a new one | Pass |
| 20 | new goals join the open cycle and carry a weight | Pass |
| 21 | finalization is blocked until every employee is rated | Pass |
| 22 | TC-REL-02: only HR can finalize or see the ranking | Pass |
| 23 | TC-REL-01 and TC-SCORE-03: HR finalizes and the ranking follows the scores | Pass |
| 24 | TC-SCORE-05: employees without approved goals are not ranked | Pass |
| 25 | TC-REL-04: finalizing twice or reopening a finalized cycle is refused | Pass |
| 26 | TC-GOAL-02: goals with a short title, bad date or bad weight are rejected and not saved | Pass |
| 27 | test\helpers.js | Pass |
| 28 | the manager sees their team with self-assessment status | Pass |
| 29 | TC-APP-03: ratings are validated, saved once and locked | Pass |
| 30 | a manager cannot rate before the self-assessment | Pass |
| 31 | only the employee's own manager can rate; employees and HR cannot | Pass |
| 32 | TC-GOAL-04: a manager cannot review goals of another manager's employee | Pass |
| 33 | TC-GOAL-05: an employee records progress on an approved goal | Pass |
| 34 | progress input is validated | Pass |
| 35 | progress is refused on someone else's goal or a goal not yet approved | Pass |
| 36 | TC-SCORE-04: highest score first; ties use the manager score, then share a rank (1, 2, 2, 4) | Pass |
| 37 | ranking does not change the input list | Pass |
| 38 | before finalization the report is empty and history has no results | Pass |
| 39 | TC-REP-01: the HR report matches the finalized results | Pass |
| 40 | TC-HIST-01: employees see only their own history; managers only their team | Pass |
| 41 | TC-SCORE-01: the SRS fixture scores 4.02, Exceeds expectations | Pass |
| 42 | TC-SCORE-02: a missing manager rating blocks the calculation | Pass |
| 43 | TC-SCORE-06: recalculating the same inputs gives identical results | Pass |
| 44 | final score rounds to two decimals without float drift | Pass |
| 45 | ratings, weights and goal lists are validated | Pass |
| 46 | rating bands follow the policy boundaries | Pass |
| 47 | an employee sees their approved goals for the open cycle | Pass |
| 48 | ratings are validated: every goal, whole numbers 1–5 | Pass |
| 49 | TC-APP-01 and TC-APP-02: submitted once, then locked | Pass |
| 50 | managers cannot submit a self-assessment, and employees need approved goals | Pass |
| 51 | no self-assessment once the cycle is closed | Pass |
