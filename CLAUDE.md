# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Two things living in one repo:

1. **Dojo API** (`src/`) — a standalone REST API built with Next.js 16 (App Router, API routes only — no pages/UI), Prisma 7, and MariaDB/MySQL. OAuth2 (password / client_credentials / refresh_token grants) with JWT access tokens.
2. **API test suite** (`tests/`) — a Playwright-based API test suite exercising the Dojo API, written as a QA-course exercise.

## Commands

```bash
npm run dev          # start API server (Next.js, turbopack) on :3000
npm run build         # prisma generate && next build
npm run db:push        # push Prisma schema to the database (no migrations in this project)
npm run db:seed        # seed sample data (prisma/seed.ts) — creates admin/user accounts, a test OAuth client, promo codes
npm run db:studio      # open Prisma Studio on :5555
npm run lint          # eslint

npm run test           # run the full Playwright suite (tests/ dir)
npx playwright test tests/tests/courses/publishCourse.spec.ts   # run a single spec file
npx playwright test --grep @smoke                              # run by tag (see tests/app/utils/tags.ts)
npx playwright show-report                                     # open the last HTML report
```

The API server must be running (`npm run dev`) before running tests — Playwright does not start it automatically (`playwright.config.ts` has no `webServer` block). `playwright.config.ts` runs `fullyParallel: false` with 0 retries.

## Environment

`.env` Required: `DATABASE_URL`, `JWT_SECRET` (32+ chars), `UPLOAD_DIR`, plus `ADMIN_EMAIL`/`ADMIN_PASSWORD` (used by `tests/tests/fixtures/fixture.ts` to log in as admin — must match a seeded account, e.g. `admin@dojo.api` / `Password1`) and optionally `BASE_URL` (defaults to `http://localhost:3000`, overridden in CI).

## Architecture — Tests (`tests/`)

Two parallel trees with different purposes:

- `tests/tests/` — the real, growing suite, organized by domain (`admin/`, `courses/`, `oauth2/`, `upload/`) using a Controller + fixture pattern. **Add new tests here.**
- `tests/app/` — shared test infrastructure imported by `tests/tests/`.

## CI

`.github/workflows/playwright.yaml` is a manually-triggered (`workflow_dispatch`) workflow: spins up MySQL, runs `db:push` + `db:seed`, starts `npm run dev` in the background, waits on the server, then runs `npx playwright test --workers=<input>` against a configurable `url` input. Publishes the HTML report as both a build artifact and a GitHub Pages deployment.
