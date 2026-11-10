# Automated Performance Appraisal System (APAS)

A Software Engineering mini-project for a typical company performance appraisal process — from setting goals at the start of a cycle to the year-end appraisal that ranks employees. Employees set goals and assess themselves, managers review and rate their team, and HR finalizes results and publishes rankings.

## Project status

| Area | Status |
|---|---|
| SRS, SAD, Test Plan | In [`SRS_SAD_TestPlan/`](SRS_SAD_TestPlan) |
| Sign-in and role-based access (employee / manager / HR) | ✅ Working |
| Goal submission, manager approval / return with comment | ✅ Working |
| HR audit log | ✅ Working |
| Appraisal cycles, goal weights and progress updates | ✅ Working |
| Year-end self-assessment and manager rating | ✅ Working |
| Scoring (30% self + 70% manager), HR finalization and ranking | ✅ Working |
| Employee results history and HR cycle report | ✅ Working |
| CI/CD: build → test → deploy (Docker image) | ✅ Working |

## Release scope

**Employee**
- Sign in with a seeded account (self-registration is outside this release).
- Submit measurable goals with a due date; see status and manager feedback.
- Record progress updates on approved goals and submit a year-end self-assessment.
- View own final score, rating band and rank once HR finalizes the cycle.

**Manager**
- Review submitted goals of their own team: approve, or return for revision with a comment.
- Rate each approved goal of a team member at year end, after the self-assessment.

**HR administrator**
- View the audit log of all sensitive actions.
- Create, close and reopen appraisal cycles; finalize a cycle; view the ranking and the cycle report.

Payroll, promotions, compensation, email notifications and external HR integrations are outside this release.

## Appraisal rules

**Goals (implemented)**
- Title 3–120 characters; description up to 1000; success metric up to 200; due date required (`YYYY-MM-DD`).
- New goals start as **Submitted**. A manager or HR sets **Approved** or **Needs revision**; a comment of up to 1000 characters is saved with the decision.
- Only goals that are *Submitted* or *Needs revision* can be reviewed; an already approved goal returns `409`.
- Each goal has a weight from 1 to 100 (default 10) and belongs to the open appraisal cycle. An employee's approved goals must add up to 100 before HR can finalize the cycle.
- Employees see only their own goals; managers and HR see all goals; a manager can review only their own team's goals.
- Progress updates (note + % complete) can be added only to the employee's own approved goals.

**Sign-in (implemented)**
- Passwords are stored as salted scrypt hashes.
- Sessions last 8 hours in an HttpOnly, SameSite cookie (Secure in production).
- After 8 failed sign-ins from one address, sign-in is paused for 60 seconds.

**Year-end appraisal**
- Rating scale: **1** Unsatisfactory · **2** Needs improvement · **3** Meets expectations · **4** Exceeds expectations · **5** Outstanding.
- Only one appraisal cycle can be open at a time; an employee is appraised on their approved goals in that cycle.
- **Goal score = 30% self-rating + 70% manager rating.**
- **Final score** = weighted average of goal scores by goal weight, rounded to 2 decimals.
- Rating band: ≥ 4.50 Outstanding · 3.50–4.49 Exceeds · 2.50–3.49 Meets · 1.50–2.49 Needs improvement · < 1.50 Unsatisfactory.
- Self-assessment is allowed only while the cycle is open and is locked after submission.
- A manager rates only after the employee's self-assessment, and only employees who report to them.
- HR can finalize only when every employee with approved goals is fully rated; finalizing closes the cycle and cannot be undone.
- **Ranking:** finalized employees in the same cycle, highest final score first; ties broken by the manager-only score; if still equal, employees share the rank (1, 2, 2, 4).

**Worked example:** Goal A (weight 60): self 4, manager 5 → 4.70. Goal B (weight 40): self 3, manager 3 → 3.00. Final = 0.6 × 4.70 + 0.4 × 3.00 = **4.02 → Exceeds expectations**.

## Architecture and stack

Layered web application: **browser UI → Express API (auth, goals, audit) → data store**, running as one Node.js process.

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript (`public/`) |
| Backend | Node.js 20+, Express 4 (`server.js`) |
| Data store | JSON file `data/store.json` (demo; created on first start, ignored by Git) |
| Tests | Node built-in test runner + fetch (`test/`) |
| CI/CD | GitHub Actions, Docker, GitHub Container Registry |

All authorization is checked on the server; the browser never decides what a user is allowed to do.

## How to run

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm start            # http://localhost:3000
```

Or run the published Docker image:

```bash
docker run -p 3000:3000 ghcr.io/gsaihemanth279/automated-performance-appraisal-system:latest
```

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Employee | employee@apas.local | employee123 |
| Manager | manager@apas.local | manager123 |
| HR | hr@apas.local | hr123 |
| More employees | employee2@apas.local · employee3@apas.local · employee4@apas.local | employee123 |
| Second manager (no team) | manager2@apas.local | manager123 |

The FY 2026 cycle is open. Asha (employee2) has approved goals ready for the appraisal; Rahul (employee3) and Priya (employee4) are already fully rated so HR can finalize quickly. To start again with fresh demo data, stop the app and delete `data/store.json`.

Demo data only — never enter real employee information.

### Demo flow (≈2 minutes)

1. **employee** → submit a goal with a weight; **manager** → approve it (goal setting).
2. **employee2** (Asha) → add a progress update, then submit the year-end self-assessment.
3. **manager** → *My team's appraisals* → rate Asha's goals.
4. **HR** → *Finalize and rank* → **Finalize cycle** → ranking and cycle report appear.
5. **employee2** → *My results* shows the final score, band and rank.

The demo employee in step 1 becomes part of the appraisal once their goal is approved; for the shortest demo, approve their goal only after finalizing, or rate them too.

## API

| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/api/health` | anyone | Health check |
| POST | `/api/login` | anyone | Sign in (`{email, password}`) |
| POST | `/api/logout` | signed in | Sign out |
| GET | `/api/me` | signed in | Current user |
| GET | `/api/goals` | signed in | Goals (employees: own only) |
| POST | `/api/goals` | employee | Submit a goal (`{title, description, metric, dueDate}`) |
| PATCH | `/api/goals/:id/review` | manager (own team), HR | `{status: "Approved" \| "Needs revision", comment}` |
| POST | `/api/goals/:id/progress` | employee (own goal) | `{note, percent}` |
| GET | `/api/cycles` | signed in | All cycles, newest first |
| POST | `/api/cycles` | HR | Start a cycle (`{name, startDate, endDate}`) |
| PATCH | `/api/cycles/:id` | HR | `{status: "Open" \| "Closed"}` |
| GET / PUT | `/api/cycles/:id/self-assessment` | employee | Read or submit own self-assessment (`{ratings: [{goalId, rating, comment}]}`) |
| GET | `/api/cycles/:id/team` | manager, HR | Team members with goals and appraisal status |
| PUT | `/api/cycles/:id/assessments/:employeeId/manager` | manager (own team) | Submit manager ratings |
| POST | `/api/cycles/:id/finalize` | HR | Score, rank and close the cycle |
| GET | `/api/cycles/:id/ranking` | HR | Ranking of finalized employees |
| GET | `/api/cycles/:id/report` | HR | Cycle summary: counts, average score, bands |
| GET | `/api/employees/:id/history` | self, own manager, HR | Finalized results per cycle |
| GET | `/api/audit` | HR | Audit events, newest first |

Errors are returned as `{ "error": "<message>" }` with `400` invalid input, `401` not signed in, `403` wrong role, `404` not found, `409` invalid state, `413` request too large, `429` too many sign-in attempts. Stack traces are never sent to the browser.

## Testing

```bash
npm run check        # syntax check + automated API tests
```

50 automated tests in `test/` cover sign-in and sessions, role and team access, goals and progress, cycles, self-assessment, manager rating, the scoring formula and ranking ties, finalization, history and reports, audit history and input security. `npm run perf` runs the NFR-001 response-time check against a running app. The full test strategy, test cases and traceability to requirements are in the [Test Plan](SRS_SAD_TestPlan/Test_Plan.md).

## CI/CD pipeline

The **CI/CD Pipeline** workflow (`.github/workflows/app-ci.yml`) runs on every pull request to `main` and every push to `main`:

| Stage | What it does |
|---|---|
| **Build** | Installs dependencies and checks JavaScript syntax |
| **Test** | Runs the automated API tests |
| **Deploy** | Builds the Docker image and smoke-tests `/api/health` in a running container; on `main`, publishes the image to GitHub Container Registry (`latest` and `sha-<commit>`) |

Each stage runs only if the previous one passed, so a failing test blocks deployment. A separate workflow checks the project documents whenever they change.

## Sprint schedule and Jira

Work is tracked in the Jira project **APAS** with story points, owners and a burndown chart.

| Milestone | Dates | Focus |
|---|---|---|
| Deliverables | before 27 Oct 2026 | SRS, SAD, Test Plan |
| **Sprint 1** | 27–31 Oct 2026 | Sign-in, roles, goal submission and review, audit, CI/CD, Sprint 1 demo video |
| **Sprint 2** | 2–7 Nov 2026 | Cycles, progress, self-assessment, manager rating, scoring, finalization, ranking, reports, final testing, Sprint 2 demo video |
| Presentation | from 9 Nov 2026 | Working product, documents, Jira progress, CI/CD evidence |

Jira workflow: **To Do → In Progress → Done**. An item is Done only when the code is merged, tests pass in CI and the change has been reviewed.

## Contributing

- Never commit directly to `main`.
- One branch per Jira item, named `APAS-<n>-<short-name>`, e.g. `APAS-10-self-assessment`.
- Start every commit message and PR title with the Jira key, e.g. `APAS-10: add self-assessment API`.
- The assignee raises the pull request; a teammate approves it and the repository owner merges it after all checks pass.
- No secrets or real employee data in Git.

## Repository layout

```
.github/            CI/CD workflows, PR and issue templates
SRS_SAD_TestPlan/   SRS.md, SAD.md, Test_Plan.md and diagrams/ (UML sources, traceability matrix)
routes/             API routes per feature (cycles, progress, self-assessment, manager-rating, finalize, reports)
lib/                Scoring policy and rating rules
public/             Browser UI (index.html, app.js, one script per feature, styles.css)
test/               Automated tests (one file per feature)
scripts/            Syntax check and performance check
docs/               Deviation log
data/               Local demo data store (generated, not committed)
server.js           Express server and API
Dockerfile          Production container image
```

## Project documents

- [Software Requirements Specification (SRS)](SRS_SAD_TestPlan/SRS.md) — 15 functional, 5 non-functional and 5 security requirements, 2 security objectives
- [Software Architecture and Design (SAD)](SRS_SAD_TestPlan/SAD.md) — layered architecture, components, sequence diagrams, API design, security
- [Software Test Plan (STP)](SRS_SAD_TestPlan/Test_Plan.md) — strategy, test cases, traceability
- [Requirements traceability matrix](SRS_SAD_TestPlan/diagrams/requirements-traceability.csv)
- [Live demo checklist](docs/DEMO-CHECKLIST.md) — demo accounts, step-by-step demo script, fallback plan

Differences between these documents and the built product are listed in [docs/DEVIATIONS.md](docs/DEVIATIONS.md).

## Team

| SRN | Name | Main responsibilities (Jira) |
|---|---|---|
| PES1UG24AM101 | G Sai Hemanth | Repository owner and reviewer, CI/CD, progress updates, reports, presentation |
| PES1UG24AM075 | Nivas Reddy D | SRS/SAD/Test Plan review, goal workflow, score calculation, setup instructions, performance check |
| PES1UG24AM076 | D A V Sreeram | Authentication review, appraisal cycles, manager rating, access control, audit |
| PES1UG25AM804 | J Karthik | Self-assessment, finalization and ranking, test checklist, demo evidence |
