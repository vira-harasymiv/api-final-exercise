---
name: create-api-tests
description: use it when you need to create api tests to cover features or bugs, using playwright and typescript best practices
---

- if you need more information regarding requirements, use this skill:
  `.claude\skills\read-api-requirements\SKILL.md`

- use playwright-test framework and typescript to cover features with API tests.

- focus only on critical business scenarios and cover edge cases if I directly ask you about

- use controllers for creating API tests. if you need to create a controller for test use skill:
  `.claude/skills/create-api-controller/SKILL.md`

- use fixtures for receiving tokens:

`tests/tests/fixtures/fixture.ts` — extends Playwright's `test` with `isAuthorized` (default `true`), `randomString`, `readClientToken`, `readWriteClientToken`, `readWriteClientAdminToken`. When `isAuthorized` is true, the `request` fixture is auto-authenticated as admin: it reads a cached token from `.accessToken` (gitignored), validates it against `/api/oauth/userinfo`, and re-logs-in on failure. `readClientToken`/`readWriteClientToken` `readWriteAdminClientToken` follow the same cache-then-validate pattern against `.accessTokenRead`/`.accessTokenReadWrite` /`.accessTokenReadWriteAdmin`, backing a client created with `read`-only or `read`+`write` or `read`+`write + admin` scopes. Avoid bypassing these caches (don't force a fresh login per test). Use `test.use({ isAuthorized: false })` for unauthenticated/negative-auth test suites.

- `tests/tests/fixtures/api-fixtures.ts` — extends the above further, injecting one fixture per controller (`coursesController`, `oauthController`, `apiClient`, etc.) so specs just destructure what they need from the test callback.

- Wrap `test.describe` blocks with relevant `TAG`s. How to write tags read this skill:
  `.claude/skills/tags/SKILL.md`

- Use `test.beforeEach`, `test.beforeAll`, `test.afterEach`, `test.afterAll` if applicable, and clean up any data created in `beforeAll`/`beforeEach` via the matching `afterAll`/`afterEach`.

- Wrap individual request/assertion groups in `test.step(...)` with clear, concise test step descriptions.

- Pass `failOnStatusCode: true` for setup calls that must succeed, `false` when asserting on an error response.

- Add a concise, clear explanation before functions, methods, `test.describe` blocks, and tests.

- Use shared assertions for tests from here `utils/expect-helpers.ts`.`checkOKStatusCode`, `checkCreatedStatusCode`, `checkBadStatusCode`, `checkNotFoundStatusCode`, `checkUnauthorizedStatusCode`, `checkForbiddenStatusCode`, `checkSchema` (Zod validation), `checkSuccessfulTokenResponse`. These also assert on response headers — `checkMandatoryHeaders` for routes rendered through Next.js RSC (most routes), `checkAcceptEncodingHeaders` for routes that vary on `Accept-Encoding` instead (e.g. OAuth/userinfo, 401 responses).

- **For testing permissions**, do not use use role. Use admin (he is auto-authenticated due to fixture here: `tests\tests\fixtures\fixture.ts` if `isAuthorized` is true) and clients with different permissions: "read", "write", "admin". For example:

```ts
//Negative tests for creating a tag without proper authorization
test.describe(
  "POST /tags - create tag without proper authorization: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.tags, TAG.permissions] },
  () => {
    test.use({ isAuthorized: false });

    test("Create tag without authorization - should be 401 error", async ({
      tagsController,
    }) => {
      const response =
        await test.step("Try to create a tag without authorization", async () => {
          return await tagsController.createTag(
            { name: "Unauthorized Tag" },
            { failOnStatusCode: false },
          );
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });

    test("Create tag as a client with READ role - should be 403 error", async ({
      tagsController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to create a tag as a non-admin user", async () => {
          return await tagsController.createTag(
            { name: "Forbidden Tag" },
            {
              headers: { Authorization: `Bearer ${readClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("Create tag as a client with READ and WRITE role - should be 403 error", async ({
      tagsController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to create a tag as a client with READ and WRITE role", async () => {
          return await tagsController.createTag(
            { name: "Forbidden Tag" },
            {
              headers: { Authorization: `Bearer ${readWriteClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("Create tag as a client with READ, WRITE, and ADMIN role - should be 403 error", async ({
      tagsController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to create a tag as a client with READ, WRITE, and ADMIN role", async () => {
          return await tagsController.createTag(
            { name: "Forbidden Tag" },
            {
              headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });
  },
);
```
