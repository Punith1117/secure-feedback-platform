# Testing Guide

This project uses a separate PostgreSQL 16 test database + Vitest + Playwright.

---

## 1. Prerequisites

- Node.js + pnpm installed
- Podman
- `.env.test` created from `.env.test.example`

---

## 2. Install Dependencies

    pnpm install

Install Playwright browsers:

    pnpm exec playwright install

---

## 3. Start Test Database (Postgres 16 via Podman)

Start DB:

    pnpm db:test:up

Stop DB:

    pnpm db:test:down

Reset DB (wipe all data):

    pnpm db:test:reset

Test DB runs at:

    localhost:5433
    user: sf_app
    db: secure_feedback_test

---

## 4. Run Migrations (Test DB)

Apply schema:

    pnpm db:test:migrate

(Use push only as a fallback if migrate doesn't work as expected)

    pnpm db:test:push

---

## 5. Run Integration Tests

    pnpm test:run

---

## 6. Run End-to-End Tests (Playwright)

Build app for test environment:

    pnpm run test:e2e:build

Run E2E tests:

    pnpm test:e2e

---

## 7. Full Validation (Recommended)

Run everything in order:

    pnpm run test:e2e:build
    pnpm test:run
    pnpm test:e2e

---

## Notes (Important)

- Always ensure Postgres 16 container is running before tests
- If port 5433 is busy, tests will fail silently or partially
- Do NOT run `pnpm dev` on port 3000 while running E2E tests
- Database is fully isolated via Docker/Podman volume for repeatable runs
