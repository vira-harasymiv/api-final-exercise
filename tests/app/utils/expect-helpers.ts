import { APIResponse, expect, test } from "@playwright/test";
import { z, ZodType } from "zod";

//Shared response headers expected on every API response, regardless of route
async function generalHeaders(response: APIResponse) {
  const headers = response.headers();
  expect.soft(headers["connection"]).toBe("keep-alive");
  expect.soft(headers["content-type"]).toBe("application/json");
  expect.soft(headers["date"]).toBeTruthy();
  expect.soft(headers["transfer-encoding"]).toBe("chunked");
}

//Verify headers for routes rendered through Next.js RSC (adds the "rsc" Vary header) - use for most API routes
export async function checkMandatoryHeaders(response: APIResponse) {
  await test.step("Verify headers", async () => {
    const headers = response.headers();
    await generalHeaders(response);
    expect
      .soft(headers["vary"])
      .toBe(
        "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
      );
  });
}

//Verify headers for routes that vary on Accept-Encoding instead of the RSC headers (e.g. OAuth/userinfo)
export async function checkAcceptEncodingHeaders(response: APIResponse) {
  await test.step("Verify headers", async () => {
    const headers = response.headers();
    await generalHeaders(response);
    expect.soft(headers["vary"]).toBe("Accept-Encoding");
  });
}

//Assert a 400 Bad Request response
export async function checkBadStatusCode(response: APIResponse) {
  await test.step("Verify if the Status Code is 400 Bad Request", async () => {
    expect.soft(response.status()).toBe(400);
    expect.soft(response.statusText()).toBe("Bad Request");
  });
}

//Assert a 404 Not Found response
export async function checkNotFoundStatusCode(response: APIResponse) {
  await test.step("Verify if the Status Code is 404 Not Found", async () => {
    expect.soft(response.status()).toBe(404);
    expect.soft(response.statusText()).toBe("Not Found");
  });
}

//Assert a 401 Unauthorized response
export async function checkUnauthorizedStatusCode(response: APIResponse) {
  await test.step("Verify if the Status Code is 401 Unauthorized", async () => {
    expect.soft(response.status()).toBe(401);
    expect.soft(response.statusText()).toBe("Unauthorized");
  });
}

//Assert a 200 OK response
export async function checkOKStatusCode(response: APIResponse) {
  await test.step("Verify if the status Code is 200 OK", async () => {
    expect.soft(response.status()).toBe(200);
    expect.soft(response.statusText()).toBe("OK");
  });
}

//Assert a 201 Created respons
export async function checkCreatedStatusCode(response: APIResponse) {
  await test.step("Verify if the status Code is 201 Created", async () => {
    expect.soft(response.status()).toBe(201);
    expect.soft(response.statusText()).toBe("Created");
  });
}

//Assert a 403 Forbidden response
export async function checkForbiddenStatusCode(response: APIResponse) {
  await test.step("Verify if the status Code is  403 Forbidden", async () => {
    expect.soft(response.status()).toBe(403);
    expect.soft(response.statusText()).toBe("Forbidden");
  });
}

//Assert a 409 Conflict response
export async function checkConflictStatusCode(response: APIResponse) {
  await test.step("Verify if the status Code is 409 Conflict", async () => {
    expect.soft(response.status()).toBe(409);
    expect.soft(response.statusText()).toBe("Conflict");
  });
}

//Validate a JSON body against a Zod schema; used to catch response shape/type regressions
export async function checkSchema<Schema extends ZodType>(
  json: z.infer<Schema>,
  schema: Schema,
  errorMessage: string = "JSON does NOT match the expected schema",
) {
  await test.step("Verify that json received in the response corresponds to schema", async () => {
    const result = schema.safeParse(json);
    expect.soft(result.success, errorMessage).toBeTruthy();
  });
}

//Check successful response for login by using different grants
export async function checkSuccessfulTokenResponse(
  response: APIResponse,
  options: { expectRefreshToken: boolean },
  expectedScope: string,
) {
  const json = await response.json();
  await checkOKStatusCode(response);

  await test.step("Verify if the token type is Bearer and it expires in 900 seconds", async () => {
    expect.soft(json.token_type).toBe("Bearer");
    expect.soft(json.expires_in).toBe(900);
  });

  await test.step("Verify permissions of the logged client", async () => {
    expect.soft(json.scope).toBe(expectedScope);
  });

  options.expectRefreshToken
    ? await checkTokens(response)
    : await checkAccessToken(response);
}

//Used for grants that return a refresh_token - verify both tokens are present and distinct
async function checkTokens(response: APIResponse) {
  await test.step("Verify that access token is NOT equal to refresh token", async () => {
    const json = await response.json();
    expect.soft(json.access_token).toBeTruthy();
    expect.soft(json.access_token.length).toBeGreaterThan(0);
    expect.soft(json.refresh_token).toBeTruthy();
    expect.soft(json.refresh_token.length).toBeGreaterThan(0);
    expect.soft(json.access_token).not.toBe(json.refresh_token);
  });
}

//Used for grants without a refresh_token - verify the access token is present
async function checkAccessToken(response: APIResponse) {
  await test.step("Verify if the returned token contains 32 characters or more", async () => {
    const json = await response.json();
    expect.soft(json.access_token).toBeTruthy();
    expect.soft(json.access_token.length).toBeGreaterThanOrEqual(32);
  });
}
