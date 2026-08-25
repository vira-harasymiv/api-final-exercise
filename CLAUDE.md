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

Layers in `tests/app/`:

- `controllers/Base/BaseController.ts` — thin wrapper over `APIRequestContext`; all resource controllers extend it.
- `controllers/*Controller.ts` — one class per API resource (`CoursesController`, `OauthController`, `ClientsController`, `CategoriesController`, `AdminController`, `UploadController`, `RevokeController`, `AuthController`, `UserInfoController`), each method mapping 1:1 to an endpoint using paths from `utils/Endpoints.ts`.
- `controllers/Base/ApiClient.ts` — composes multiple controllers for multi-step flows (e.g. `loginWithCredentialsOfNewClient` registers a client, then logs in as it) — reach for this instead of re-choreographing the same multi-request setup in a spec.
- `utils/expect-helpers.ts` — shared response assertions: `checkOKStatusCode`, `checkCreatedStatusCode`, `checkBadStatusCode`, `checkNotFoundStatusCode`, `checkUnauthorizedStatusCode`, `checkForbiddenStatusCode`, `checkSchema` (Zod validation), `checkSuccessfulTokenResponse`. These also assert on response headers — `checkMandatoryHeaders` for routes rendered through Next.js RSC (most routes), `checkAcceptEncodingHeaders` for routes that vary on `Accept-Encoding` instead (e.g. OAuth/userinfo, 401 responses). Use the matching helper for the route's caching behavior, don't hand-roll status/header assertions.
- `utils/tags.ts` — `TAG` enum for `test.describe`/`test` blocks; run subsets via `--grep @tagname`.
- `utils/builders/` — object builders for constructing request payloads (e.g. `CourseBuilder`, `ChapterBuilder`).
- `utils/interfaces/` — shared TS types for request bodies (`CourseUpdateBody`, `ChapterUpdateBody`).
- `json-schemas/` — Zod schemas for response validation via `checkSchema`.

Fixtures (two layers, both required — import specs from `tests/tests/fixtures/api-fixtures`, not directly from Playwright):

- `tests/tests/fixtures/fixture.ts` — extends Playwright's `test` with `isAuthorized` (default `true`), `randomString`, `readClientToken`, `readWriteClientToken`. When `isAuthorized` is true, the `request` fixture is auto-authenticated as admin: it reads a cached token from `.accessToken` (gitignored), validates it against `/api/oauth/userinfo`, and re-logs-in on failure. `readClientToken`/`readWriteClientToken` follow the same cache-then-validate pattern against `.accessTokenRead`/`.accessTokenReadWrite`, backing a client created with `read`-only or `read`+`write` scopes. Avoid bypassing these caches (don't force a fresh login per test). Use `test.use({ isAuthorized: false })` for unauthenticated/negative-auth test suites.
- `tests/tests/fixtures/api-fixtures.ts` — extends the above further, injecting one fixture per controller (`coursesController`, `oauthController`, `apiClient`, etc.) so specs just destructure what they need from the test callback.

You should follow these conventions (see `tests/tests/courses/publishCourse.spec.ts` as the reference example):

- Wrap `test.describe` blocks with relevant `TAG`s.
- Use `test.beforeEach`, `test.beforeAll`, `test.afterEach`, `test.afterAll` if applicable, and clean up any data created in `beforeAll`/`beforeEach` via the matching `afterAll`/`afterEach`.
- Each test SHOULD be independent.
- Wrap individual request/assertion groups in `test.step(...)` with clear, concise test step descriptions.
- Positive and negative cases live in separate `test.describe` blocks within the same spec file.
- Pass `failOnStatusCode: true` for setup calls that must succeed, `false` when asserting on an error response.
- Add a concise, clear explanation before functions, methods, `test.describe` blocks, and tests.

## CI

`.github/workflows/playwright.yaml` is a manually-triggered (`workflow_dispatch`) workflow: spins up MySQL, runs `db:push` + `db:seed`, starts `npm run dev` in the background, waits on the server, then runs `npx playwright test --workers=<input>` against a configurable `url` input. Publishes the HTML report as both a build artifact and a GitHub Pages deployment.
