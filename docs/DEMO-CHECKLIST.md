# Live Demo Checklist (APAS-8)

Use this for the final presentation on 9 Nov 2026 and for the 2-minute Sprint 2 video.

## Before the presentation (the night before)

- [ ] `git checkout main` and `git pull`, so the laptop has the final code
- [ ] `npm install` finishes without errors
- [ ] `npm run check` ends with `# fail 0`
- [ ] GitHub Actions on `main` show Build, Test and Deploy green (take a screenshot)
- [ ] Jira: Sprint 2 completed, burndown chart open in a browser tab
- [ ] GitHub tabs open: repository, Pull requests (closed), the APAS Sprint Board project, Actions
- [ ] Documents open: `SRS_SAD_TestPlan/` (SRS, SAD, Test Plan), `docs/DEVIATIONS.md`, `docs/test-reports/`
- [ ] Sprint 1 and Sprint 2 videos play from `demo/`
- [ ] Laptop charged, notifications off, browser zoom 100%

## Start with fresh demo data (2 minutes before the demo)

```bash
rm -f data/store.json   # Windows Git Bash: same command
npm start
```

Open http://localhost:3000. Finalizing closes the cycle, so **delete `data/store.json` and restart before every new run**.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Employee | `employee@apas.local` | `employee123` |
| Employee (Asha Rao) | `employee2@apas.local` | `employee123` |
| Manager | `manager@apas.local` | `manager123` |
| HR | `hr@apas.local` | `hr123` |

## Demo script (about 5 minutes)

| # | Sign in as | Do this | Show / say | Owner |
|---|---|---|---|---|
| 1 | HR | Open **Appraisal cycles** | HR sets up the cycle (FY 2026, Open) and goal weights (APAS-14) | Sreeram |
| 2 | Employee | Submit a goal: title, metric, due date, weight | Goal saved as Submitted; an invalid goal shows a clear error (APAS-9) | Nivas |
| 3 | Manager | Approve the goal with a comment | Only the employee's own manager can review | Nivas |
| 4 | Employee (Asha) | Add a progress update (80%, note) | Timestamped progress on an approved goal (APAS-21) | Hemanth |
| 5 | Employee (Asha) | **My self-assessment** → submit (rating 1–5 + comment per goal) | Locked after submit (APAS-10) | Karthik |
| 6 | Manager | **My team's appraisals** → rate Asha | Manager can rate only their own team (APAS-11) | Sreeram |
| 7 | HR | **Finalize and rank** → **Finalize cycle** | Score = 30% self + 70% manager, weighted by goal weight; ranking with tie rule (APAS-12, APAS-13) | Nivas, Karthik |
| 8 | HR | Open **Cycle report** | Counts, average score, band breakdown, ranking (APAS-22) | Hemanth |
| 9 | Employee (Asha) | **My results** | Score, band and rank; employees cannot see others' results (APAS-22) | Hemanth |
| 10 | HR | **Recent audit events** | Every action recorded with who, what and when (APAS-16) | Sreeram |

Order matters: approve the new goal in step 3 **after** step 7 if you want finalization to succeed, because every employee with approved goals must be rated first and their weights must add up to 100.

## If something goes wrong

| Problem | Fix |
|---|---|
| "Still waiting for ratings: …" on finalize | That employee has approved goals but no ratings. Restart with fresh data and approve the new goal after finalizing |
| "…approved goals must add up to 100" | Goal weights of one employee don't total 100. Restart with fresh data |
| Login fails | Check the email ends in `@apas.local` and the password is role + `123` |
| Port 3000 busy | `PORT=3001 npm start` and open http://localhost:3001 |
| App shows old data | Stop the server, `rm -f data/store.json`, `npm start` |
| Live demo fails completely | Play `demo/sprint2-demo.mp4` instead |

## Presentation flow (who speaks)

| Part | Time | Speaker |
|---|---|---|
| Problem statement and scope | 1 min | Hemanth |
| Agile process: Jira sprints, story points, burndown, GitHub board | 2 min | Hemanth |
| Requirements and design (SRS, SAD, architecture, API) | 2 min | Nivas |
| Live demo (script above) | 5 min | all, each shows their own feature |
| Testing: unit, coverage, system validation, performance | 2 min | Karthik |
| CI/CD pipeline and security | 1 min | Sreeram |
| Deviations and lessons learned | 1 min | Karthik |
| Questions | — | all |

Each person must be able to explain their own pull requests and Jira items.
