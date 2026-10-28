# Automated Performance Appraisal System

Software Engineering mini-project for managing the employee appraisal lifecycle, from goal setting to year-end appraisal and rankings.

## Problem statement

A typical performance appraisal system for any company starting from setting goals to the year-end appraisal resulting in rankings.

## Team

| SRN | Name |
|---|---|
| PES1UG24AM101 | G Sai Hemanth |
| PES1UG24AM075 | Nivas Reddy D |
| PES1UG24AM076 | D A V Sreeram |
| PES1UG25AM804 | J Karthik |

## Project documents

- [Software Requirements Specification (SRS)](SRS_SAD_TestPlan/SRS.md)
- [Software Architecture and Design Specification (SAD)](SRS_SAD_TestPlan/SAD.md)
- [Software Test Plan (STP)](SRS_SAD_TestPlan/Test_Plan.md)
- [UML diagram sources](SRS_SAD_TestPlan/diagrams/)

## Proposed scope

The initial system is planned to support role-based access for employees, managers, and HR administrators; goal setting and approvals; progress updates; self-assessments; manager reviews; score calculation; year-end ranking; reporting; and audit history.

The scoring formula, rating scales, tie handling, technology stack, and final feature scope must be agreed by the team and project guide.

## Repository structure

```text
.
├── SRS_SAD_TestPlan/
│   ├── SRS.md
│   ├── SAD.md
│   ├── Test_Plan.md
│   └── diagrams/
├── .github/
│   └── workflows/
└── README.md
```

## Project status

Documentation baseline. This repository currently records planned requirements and design; features must not be described as implemented until they are coded and verified.

## Development workflow

- Create a feature branch for changes.
- Open pull requests for review.
- Run the GitHub Actions documentation checks.
- Add application build, automated tests, and deployment stages when the technology stack and run commands are confirmed.

## Privacy and security

Use synthetic test data only. Never commit secrets, tokens, passwords, or real confidential employee appraisal records.
