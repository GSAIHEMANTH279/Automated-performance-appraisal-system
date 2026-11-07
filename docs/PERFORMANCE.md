# Performance check (APAS-17 · NFR-001 · TC-PERF-01)

**Target:** common operations respond within 3 seconds at the 95th percentile (p95) under normal concurrent use (20 users).

**Result: PASS.** Overall p95 was 42 ms, with no failed requests.

## How to repeat it

```bash
npm run perf
```

The script starts its own server on a temporary data file, so the demo data is not touched. It fails with a non-zero exit code if p95 is over 3 s or any request fails. Settings: `PERF_USERS`, `PERF_SECONDS`, `PERF_THINK_MS`, `PERF_TARGET_MS`.

## What it does

20 signed-in users (employees, managers and HR in rotation) sign in at the same moment, then repeat what their role does in the app. Each user waits 1 second between requests.

- **Employee:** read goals, cycles and own self-assessment; one request in ten submits a goal
- **Manager:** read goals and team appraisals
- **HR:** read goals, cycle report and audit log

## Results (6 Nov 2026)

Measured on a developer laptop (Windows 11, Node 24, 20 logical CPUs), with client and server on the same machine.

### Normal use: 20 users, 60 s, 1 s between requests

| Operation | Requests | p50 (ms) | p95 (ms) | Max (ms) |
|---|---:|---:|---:|---:|
| GET /api/audit | 57 | 11 | 40 | 52 |
| GET /api/cycles | 245 | 12 | 35 | 1058 |
| GET /api/goals | 390 | 13 | 36 | 969 |
| GET report | 57 | 12 | 31 | 35 |
| GET self-assessment | 242 | 12 | 31 | 1013 |
| GET team | 87 | 13 | 48 | 864 |
| POST /api/goals | 82 | 13 | 28 | 592 |
| POST /api/login | 20 | 511 | 1036 | 1094 |
| **All operations** | 1180 | 13 | 42 | 1094 |

Failed requests: 0.

### Heavier than normal: 20 users, 30 s, no wait between requests

Run with `PERF_THINK_MS=0 PERF_SECONDS=30 npm run perf`.

| Operation | Requests | p50 (ms) | p95 (ms) | Max (ms) |
|---|---:|---:|---:|---:|
| GET /api/audit | 210 | 132 | 186 | 234 |
| GET /api/cycles | 917 | 130 | 185 | 1144 |
| GET /api/goals | 1449 | 132 | 191 | 1045 |
| GET report | 211 | 129 | 184 | 225 |
| GET self-assessment | 920 | 130 | 191 | 1097 |
| GET team | 318 | 131 | 188 | 951 |
| POST /api/goals | 308 | 85 | 139 | 656 |
| POST /api/login | 20 | 543 | 1130 | 1188 |
| **All operations** | 4353 | 129 | 188 | 1188 |

Failed requests: 0.

## Reading the results

- **Sign-in is the slowest operation** (p95 about 1 s) because password hashing (scrypt) is deliberately slow and 20 users sign in at the same moment. The maximums of about 1 s on other operations come from requests that waited behind those sign-ins at the start of the run.
- **Limits of this check:** it runs on one machine with no real network, starts from the small demo data set, and covers one server process. It shows the demo release meets NFR-001, not how a production deployment would behave.
- **Not exercised:** self-assessment and manager-rating submissions and cycle finalization, because they can only run once per employee or cycle. Other than sign-in, the write tested here (goal submission) uses the same read-file, write-file steps.
