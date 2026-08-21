import { APIResponse, expect, test } from "@playwright/test";
import {
  checkBadStatusCode,
  checkMandatoryHeaders,
  checkOKStatusCode,
} from "../../../app/utils/general-expect-helpers";

export async function checkUnauthorizedStatusCodeForPasswordGrant(
  response: APIResponse,
) {
  await checkMandatoryHeaders(response);
  await test.step("Verify Unauthorized error receiving", async () => {
    const json = await response.json();
    expect(response.status()).toBe(401);
    expect(response.statusText()).toBe("Unauthorized");
    expect.soft(json.error).toBe("invalid_grant");
    expect.soft(json.error_description).toContain("Invalid email or password");
  });
}

export async function checkUnauthorizedStatusCodeForCredentialsGrant(
  response: APIResponse,
) {
  await checkMandatoryHeaders(response);
  await test.step("Verify Unauthorized error receiving", async () => {
    const json = await response.json();
    expect(response.status()).toBe(401);
    expect(response.statusText()).toBe("Unauthorized");
    expect.soft(json.error).toBe("invalid_client");
    expect.soft(json.error_description).toContain("Invalid client credentials");
  });
}

export async function checkUnauthorizedStatusCodeForRefreshToken(
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

export async function checkInvalidEmail(response: APIResponse) {
  await test.step("Verify error message", async () => {
    const json = await response.json();
    expect.soft(json.error_description).toBe("Invalid email address");
  });
}

export async function checkInvalidGrantType(response: APIResponse) {
  await checkBadStatusCode(response);
  await test.step("Verify error message", async () => {
    const json = await response.json();
    expect
      .soft(json.error_description)
      .toBe(
        "Invalid discriminator value. Expected 'password' | 'client_credentials' | 'refresh_token'",
      );
  });
}

//Check successful response for taking token by using different grants
export async function checkSuccessfulTokenResponse(
  response: APIResponse,
  options: { expectRefreshToken: boolean },
  expectedScope: string,
) {
  const json = await response.json();
  await checkOKStatusCode(response);

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

export async function checkEmptyProperty(response: APIResponse) {
  await checkBadStatusCode(response);
  await test.step("Verify error message", async () => {
    const json = await response.json();
    expect
      .soft(json.error_description)
      .toBe("Too small: expected string to have >=1 characters");
  });
}
