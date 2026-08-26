---
paths: ["tests/**"]
---

## API Tests

- **Built-in `request` (`APIRequestContext`)** for HTTP requests — do not use `axios`, `node-fetch`, etc. This ensures a shared configuration and better integration.

- **Extract helper logic into Controllers** (`tests/app/controllers/*Controller.ts`). A test should only contain a sequence of steps and assertions, not low-level request details.

- **Use controllers from fixtures**

- **Validate the response body and headers, not just the status code.** Verify the structure and types using a Zod schema (`tests/app/json-schemas`)

- **Use `expect.soft` for non-critical assertions** (e.g., headers, specific fields) so that a single failure does not halt the execution of subsequent assertions.

- **Data isolation and cleanup.** Store payloads and expected schemas in separate fixtures or factories. Entities created via POST/PUT requests must be deleted in `afterEach` or `afterAll` hooks.

- **Centralized authorization.** Obtain authentication tokens via a global setup or fixtures; do not duplicate the login logic in every test.

- **Cover negative scenarios** (4xx/5xx): invalid payloads, missing permissions, incorrect parameters — do not test only the happy path.

- **Focus on the critical path.** Prioritize key business scenarios instead of chasing after every edge case

- **Each test SHOULD be independent**.

- **If test fails or the result is not expected, add a comment above it and leave it failing (red)** For example:

```typescript
//! For token = boolean and number - 500 Error is received
```

- **If test returns 500 error**, put only this expect:

```typescript
expect(response.status()).toBeLessThan(500);
```

- **DO NOT write** a lot this in parenthesis:

```ts
tagId = (await responseCreate.json()).id;
```

**Instead write in a such way**:

```ts
const jsonCreate = await responseCreate.json();
tagId = jsonCreate.id;
```

- **If request body contains optional fields**, test it at least twice: only with required fields and with optional fields

- **If the feature is a new one**, create a separate folder here: `tests/tests`. The folder name should replicate the feature name.

- follow **AAA** pattern:

```ts
//Positive test scenario for checking the refresh token revoking
test.describe(
  "POST /token - Revoke refresh token: should be successful",
  { tag: [TAG.smoke, TAG.oauth, TAG.regression] },
  async () => {
    test.use({ isAuthorized: false });
    let refreshToken: string;
    let token: string;

    //!ARRANGE
    test.beforeEach(async ({ oauthController }) => {
      const responseTakeToken =
        await test.step("Prepare refresh token by logging with Password Grant", async () => {
          return await oauthController.withPasswordGrant(passwordGrantPayload, {
            failOnStatusCode: true,
          });
        });
      const jsonTakeToken = await responseTakeToken.json();
      refreshToken = jsonTakeToken.refresh_token;
      token = jsonTakeToken.access_token;
    });

    //!ACT
    test("Revoke refresh token - should be successful", async ({
      revokeController,
      oauthController,
    }) => {
      const response =
        await test.step("Post refresh token to revoke it", async () => {
          return await revokeController.revokeToken(
            { token: refreshToken },
            {
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: true,
            },
          );
        });

      //!ASSERT
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      await test.step("Verify of the success is true in the response", async () => {
        const json = await response.json();
        expect(json.success).toBe(true);
      });

      await test.step("Verify if the token has been revoked by login with Refresh Token Grant", async () => {
        const response = await oauthController.withRefreshTokenGrant(
          {
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          },
          { failOnStatusCode: false },
        );
        await checkUnauthorizedStatusCode(response);
      });
    });
  },
);
```

- Use these tests as reference:
  `tests/tests/courses`
