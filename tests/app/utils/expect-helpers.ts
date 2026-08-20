import { APIResponse, expect, test } from "@playwright/test";
import { z, ZodType } from "zod";

async function generalHeaders(response: APIResponse) {
  const headers = response.headers();
  expect.soft(headers["connection"]).toBe("keep-alive");
  expect.soft(headers["content-type"]).toBe("application/json");
  expect.soft(headers["date"]).toBeTruthy();
  expect.soft(headers["transfer-encoding"]).toBe("chunked");
}
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

export async function checkAcceptEncodingHeaders(response: APIResponse) {
  await test.step("Verify headers", async () => {
    const headers = response.headers();
    await generalHeaders(response);
    expect.soft(headers["vary"]).toBe("Accept-Encoding");
  });
}

export async function checkBadRequest(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify response", async () => {
    const json = await response.json();
    expect(response.status()).toBe(400);
    expect(response.statusText()).toBe("Bad Request");
    expect.soft(json.error).toBe("invalid_request");
    await test.step("Verify error message", async () => {
      expect.soft(json.error_description).toContain("Invalid input");
    });
  });
}

async function checkBadRequestWithoutMessage(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify response", async () => {
    const json = await response.json();
    expect(response.status()).toBe(400);
    expect(response.statusText()).toBe("Bad Request");
    expect.soft(json.error).toBe("invalid_request");
  });
}

export async function checkEmptyProperty(response: APIResponse) {
  await checkBadRequestWithoutMessage(response);
  await test.step("Verify error message", async () => {
    const json = await response.json();
    expect
      .soft(json.error_description)
      .toBe("Too small: expected string to have >=1 characters");
  });
}

export async function checkInvalidEmail(response: APIResponse) {
  await checkBadRequestWithoutMessage(response);
  await test.step("Verify error message", async () => {
    const json = await response.json();
    expect.soft(json.error_description).toBe("Invalid email address");
  });
}

export async function checkInvalidGrantType(response: APIResponse) {
  await checkBadRequestWithoutMessage(response);
  await test.step("Verify error message", async () => {
    const json = await response.json();
    expect
      .soft(json.error_description)
      .toBe(
        "Invalid discriminator value. Expected 'password' | 'client_credentials' | 'refresh_token'",
      );
  });
}

export async function checkUnauthorizedStatusCode(response: APIResponse) {
  const json = await response.json();
  await checkAcceptEncodingHeaders(response);
  expect(response.status()).toBe(401);
  expect(response.statusText()).toBe("Unauthorized");
  expect(json.error).toBe("Unauthorized");
}

export async function checkUnauthorizedError(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify Unauthorized error receiving", async () => {
    const json = await response.json();
    expect(response.status()).toBe(401);
    expect(response.statusText()).toBe("Unauthorized");
    expect.soft(json.error).toBe("invalid_grant");
    expect.soft(json.error_description).toContain("Invalid email or password");
  });
}

export async function checkUnauthorizedClientError(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify Unauthorized error receiving", async () => {
    const json = await response.json();
    expect(response.status()).toBe(401);
    expect(response.statusText()).toBe("Unauthorized");
    expect.soft(json.error).toBe("invalid_client");
    expect.soft(json.error_description).toContain("Invalid client credentials");
  });
}

export async function checkUnauthorizedRefreshTokenError(
  response: APIResponse,
) {
  await checkMandatoryHeaders(response);
  await test.step("Verify Unauthorized error", async () => {
    const json = await response.json();
    expect(response.status()).toBe(401);
    expect(response.statusText()).toBe("Unauthorized");
    expect.soft(json.error).toBe("invalid_grant");
    expect.soft(json.error_description).toContain("Invalid refresh token");
  });
}

export async function checkOKResponse(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify if the status Code is 200 OK", async () => {
    expect(response.status()).toBe(200);
    expect(response.statusText()).toBe("OK");
  });
}

export async function checkCreatedResponse(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify if the status Code is 201 Created", async () => {
    expect(response.status()).toBe(201);
    expect(response.statusText()).toBe("Created");
  });
}

export async function checkSuccessfulTokenResponse(
  response: APIResponse,
  options: { expectRefreshToken: boolean },
  expectedScope: string,
) {
  await checkMandatoryHeaders(response);
  const json = await response.json();
  await checkMandatoryHeaders(response);
  await checkOKResponse(response);

  expect.soft(json.token_type).toBe("Bearer");
  expect.soft(json.expires_in).toBe(900);

  expect.soft(json.scope).toBe(expectedScope);

  options.expectRefreshToken
    ? await checkTokens(response)
    : await checkAccessToken(response);
}

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

async function checkAccessToken(response: APIResponse) {
  await test.step("Verify access token", async () => {
    const json = await response.json();
    expect.soft(json.access_token).toBeTruthy();
    expect.soft(json.access_token.length).toBeGreaterThan(0);
  });
}

export async function checkSchema<Schema extends ZodType>(
  json: z.infer<Schema>,
  schema: Schema,
  errorMessage: string = "JSON does NOT match the expected schema",
) {
  await test.step("Verify that json corresponds to schema", async () => {
    const result = schema.safeParse(json);
    expect.soft(result.success, errorMessage).toBeTruthy();
  });
}
