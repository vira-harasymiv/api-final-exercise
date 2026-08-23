# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Two things living in one repo:

1. **Dojo API** (`src/`) — a standalone REST API built with Next.js 16, Prisma 7, and MariaDB/MySQL. OAuth2 (password / client_credentials / refresh_token grants) with JWT access tokens.
2. **API test suite** (`tests/`) — a Playwright-based API test suite exercising the Dojo API, written as a QA-course exercise.

## Commands

```bash
npm run dev          # start API server (Next.js, turbopack) on :3000

npm run test           # run the full Playwright suite (tests/ dir)
npx playwright test --grep @smoke                              # run by tag (see tests/app/utils/tags.ts)
npx playwright show-report                                     # open the last HTML report
```

The API server must be running (`npm run dev`) before running tests — Playwright does not start it automatically (`playwright.config.ts` has no `webServer` block).

## Environment

`.env`. Required: `DATABASE_URL`, `JWT_SECRET` (32+ chars), `UPLOAD_DIR`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in the environment (used by `tests/tests/fixtures/fixture.ts` and `tests/tests/oauth2/testData/payloads.ts` to log in as admin)

## Architecture — Tests (`tests/`)

Two parallel trees with different purposes:

- `tests/tests/` — the real, growing suite, organized by domain (`courses/`, `oauth2/`) using a Controller + fixture pattern. **Add new tests here.**
- `tests/app/` — shared test infrastructure imported by `tests/tests/`.

Layers in `tests/app/`:

- `controllers/Base/BaseController.ts` — thin wrapper over `APIRequestContext`.
- `controllers/*Controller.ts` — one class per API resource (`CoursesController`, `OauthController`, `ClientsController`, `CategoriesController`, etc.), each method mapping 1:1 to an endpoint using paths from `utils/Endpoints.ts`.
- `controllers/Base/ApiClient.ts` — composes multiple controllers for multi-step flows (e.g. `loginWithCredentialsOfNewClient` registers a client, then logs in as it) — reach for this instead of re-choreographing the same multi-request setup in a spec.
- `utils/general-expect-helpers.ts` — shared response assertions (`checkOKStatusCode`, `checkNotFoundStatusCode`, `checkUnauthorizedStatusCode`, `checkForbiddenStatusCode`, `checkSchema` for Zod schema validation). These also assert on response headers (`checkMandatoryHeaders`/`checkAcceptEncodingHeaders`) — use the matching helper for the route's caching behavior, don't hand-roll status assertions.
- `utils/tags.ts` — `TAG` enum for `test.describe(..., { tag: [...] })`; run subsets via `--grep @tagname`.
- `utils/builders/` — object builders for constructing request payloads (e.g. `CourseBuilder`, `ChapterBuilder`).
- `utils/interfaces/` — shared TS types for request bodies (`CourseUpdateBody`, `ChapterUpdateBody`, `RequestOptions`).
- `json-schemas/` — Zod schemas for response validation via `checkSchema`.

Fixtures (two layers, both required — import specs from `tests/tests/fixtures/api-fixtures`, not directly from Playwright):

- `tests/tests/fixtures/fixture.ts` — extends Playwright's `test` with `isAuthorized` (default `true`) and `randomString`. When `isAuthorized` is true, the `request` fixture is auto-authenticated as admin: it reads a cached token from `.accessToken` (gitignored), validates it against `/api/oauth/userinfo`, and re-logs-in on failure — avoid repeated logins by not bypassing this cache. Use `test.use({ isAuthorized: false })` for unauthenticated/negative-auth test suites.
- `tests/tests/fixtures/api-fixtures.ts` — extends the above further, injecting one fixture per controller (`coursesController`, `oauthController`, `apiClient`, etc.) so specs just destructure what they need from the test callback.

You should follow instructions (see `tests/tests/courses/publishCourse.spec.ts` as the reference example):

- Wrap `test.describe` blocks with relevant `TAG`s.
- Use `test.beforeEach`, `test.beforeAll`, `test.afterEach`, `test.afterAll` if applicable
- Each test SHOULD be independent
- Wrap individual request/assertion groups in `test.step(...)` with clear, concise test step.
- Positive and negative cases live in separate `test.describe` blocks within the same spec file.
- Pass `failOnStatusCode: true` for setup calls that must succeed, `false` when asserting on an error response.
- Add a concise, clear explanations before functions, methods, `test.describe` blocks, tests
