# Deviation log

Differences between the submitted SRS / SAD / Test Plan and the product built in Sprints 1 and 2. Each line is explained in the final demo.

| # | Area | Documents say | Built product | Reason |
|---|---|---|---|---|
| 1 | Data store | A database before multi-user deployment | A local JSON file (`data/store.json`) written atomically | Keeps the classroom demo simple; one server process only |
| 2 | Sessions | Persistent session store before deployment | In-memory sessions; signing in again is needed after a restart | Single-process demo |
| 3 | Goal weights | Weights of an employee's goals add up to 100 | Each goal gets a weight from 1 to 100; the total is checked when HR finalizes, and finalization is refused with the employee's name if their approved goals do not add up to 100 | Employees add goals one at a time, so the total can only be checked once all goals are approved |
| 4 | Result release (FR-011) | Separate finalize and release steps | Finalizing scores, ranks, closes the cycle and shows results to employees at once | One HR action is enough for the demo |
| 5 | Reopen a finalized appraisal (FR-015) | HR may reopen with a recorded reason | Not built; a finalized cycle cannot be reopened | Lower priority; kept out of Sprint 2 scope |
| 6 | Dashboard (FR-006) | Cycle-specific task dashboards | Role panels plus a current-cycle banner | Covers the tasks each role needs in the demo |
| 7 | HTTPS (SR-001) | HTTPS for any deployed instance | The Docker image serves HTTP; no public deployment | Deployment target is a local container for the demo |
| 8 | Demo data | — | Two employees are seeded as already rated so HR can finalize quickly in a demo | Shortens the live demo; delete `data/store.json` to reset |

Add a row whenever the built behaviour differs from the documents.
