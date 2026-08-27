# Course Purchase — Performance Test Suite

k6 (TypeScript) scenarios that load-test the "client purchases a course" flow
of the Dojo API: register a new user, log in (OAuth2 password grant), and
purchase a course, then list the client's purchases.

## Layout

- `scenarios/` — one k6 entry script per workload profile (smoke, average,
  stress, soak, spike, breakpoint). Each is runnable directly with `k6 run`.
- `scenarios/shared/purchaseCourseFlow.ts` — the actual flow (setup, per-VU
  iteration, teardown) shared by every scenario file above.
- `controllers/DojoApiController.ts` — thin wrapper over `k6/http` for the
  Dojo API endpoints used by the flow (register, login, purchase, admin
  course setup/cleanup).
- `config/` — `env.ts` (BASE_URL / admin credentials / course price) and
  `loadProfiles.ts` (VU/stage definitions per profile).
- `utils/` — response-status checks, HTML report generation, random test
  user generation.
- `reports/` — HTML reports written by `handleSummary()` (git-ignored).

## Prerequisites

- Install k6 (https://k6.io) and ensure `k6` is on your PATH.
- The API server must be running: `npm run dev` (from the repo root).
- The database must be seeded (`npm run db:seed`) so the admin account used
  to set up the test course exists.

k6 does not read `.env` files. `config/env.ts` defaults to the values in the
repo's `.env` (`BASE_URL=http://localhost:3000`,
`ADMIN_EMAIL=admin@dojo.api`, `ADMIN_PASSWORD=Password1`). Override with
`-e KEY=value` if your environment differs, e.g.:

```powershell
k6 run -e BASE_URL=http://localhost:3000 tests\tests\perfomance-tests\scenarios\purchaseCourse-smoke.ts
```

## Running a scenario

- `scenarios/purchaseCourse-smoke.ts`
  - Description: 1 VU for 30s. Quick sanity check that the register -> login
    -> purchase flow works end-to-end before running a heavier profile.

```powershell
k6 run tests\tests\perfomance-tests\scenarios\purchaseCourse-smoke.ts
```

- `scenarios/purchaseCourse-average.ts`
  - Description: Typical load profile modelling the expected number of
    concurrent purchasers.

```powershell
k6 run tests\tests\perfomance-tests\scenarios\purchaseCourse-average.ts
```

- `scenarios/purchaseCourse-stress.ts`
  - Description: Sustained load above average to see how the flow degrades.

```powershell
k6 run tests\tests\perfomance-tests\scenarios\purchaseCourse-stress.ts
```

- `scenarios/purchaseCourse-soak.ts`
  - Description: Moderate load held for longer, to surface leaks or
    stateful degradation.

```powershell
k6 run tests\tests\perfomance-tests\scenarios\purchaseCourse-soak.ts
```

- `scenarios/purchaseCourse-spike.ts`
  - Description: A sudden burst of purchasers (e.g. a promo going live).

```powershell
k6 run tests\tests\perfomance-tests\scenarios\purchaseCourse-spike.ts
```

- `scenarios/purchaseCourse-breakpoint.ts`
  - Description: Iteratively increases load until the failure rate crosses
    10%, then aborts, to find the flow's breaking point.

```powershell
k6 run tests\tests\perfomance-tests\scenarios\purchaseCourse-breakpoint.ts
```

## What each iteration does

1. `POST /api/auth/register` — create a brand-new client account (a repeat
   purchase by the same user returns `409 Already purchased`, so each
   iteration needs a fresh user).
2. `POST /api/oauth/token` (`grant_type=password`) — log in as that client.
3. `POST /api/courses/{courseId}/purchase` — purchase the course created
   once in `setup()`.
4. `GET /api/purchases` — list the client's purchases.

`setup()` logs in as the seeded admin and creates one paid, published course
that every virtual user purchases. `teardown()` deletes that course once the
run finishes.

## Custom metrics

Each request in the flow is tracked as its own `Trend` so latency can be
judged per step rather than as one blended average:
`register_duration_time`, `login_duration_time`,
`purchase_course_duration`, `list_purchases_duration_time`.

## Tuning VU counts

`config/loadProfiles.ts` defaults to a small VU count (`5`, scaled up per
profile) appropriate for a local dev server + local MariaDB. Override with
`-e VUS=<n>` when targeting a real deployment.
