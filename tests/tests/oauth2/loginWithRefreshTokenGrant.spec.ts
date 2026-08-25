import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkSchema,
  checkSuccessfulTokenResponse,
  checkMandatoryHeaders,
  checkBadStatusCode,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { passwordGrantPayload } from "./testData/payloads";
import {
  invalidDataTypes,
  invalidDataTypesForCredentials,
} from "./testData/testData";
import { invalidCasesForRefreshTokenGrant } from "./testData/testDataNegativeCases";
import { tokenResponseSchema } from "../../app/json-schemas/oauthSchemas";

//Positive smoke tests for taking token with Refresh Token Grant
test.describe(
  "POST /token with Refresh Token Grant - positive tests",
  { tag: [TAG.oauth, TAG.smoke, TAG.RefreshTokenGrant] },
  () => {
    test.use({ isAuthorized: false });

    let refreshToken: string;

    test.beforeEach(async ({ oauthController }) => {
      const responseTakeToken =
        await test.step("Prepare refresh token by logging with Password Grant", async () => {
          return await oauthController.withPasswordGrant(passwordGrantPayload, {
            failOnStatusCode: true,
          });
        });
      const jsonTakeToken = await responseTakeToken.json();
      refreshToken = jsonTakeToken.refresh_token;
    });

    test("Verify taking token with Refresh Token Grant", async ({
      oauthController,
    }) => {
      const response =
        await test.step("Take token with using Refresh Token Grant", async () => {
          return await oauthController.withRefreshTokenGrant(
            {
              grant_type: "refresh_token",
              refresh_token: refreshToken,
            },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkSuccessfulTokenResponse(
        response,
        { expectRefreshToken: true },
        "read write admin",
      );

      const json = await response.json();
      await checkSchema(json, tokenResponseSchema);
    });
  },
);

//Negative tests for taking token with Refresh Token Grant
test.describe(
  "POST /token with Refresh Token Grant - negative tests",
  {
    tag: [TAG.negative, TAG.oauth, TAG.RefreshTokenGrant, TAG.regression],
  },
  () => {
    let refreshToken: string;
    let token: string;

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

    //Logging without grant_type/refresh token, incorrect grant_type (e.g., client_credentials instead of refresh_token), non-existent refresh token, empty refresh token, refresh token contained only spaces
    for (const {
      title,
      stepLabel,
      buildPayload,
      checkStatusCode,
      error,
      errorDescription,
    } of invalidCasesForRefreshTokenGrant) {
      test(title, async ({ oauthController }) => {
        const response = await test.step(
          stepLabel,
          async () =>
            await oauthController.withRefreshTokenGrant(
              buildPayload(refreshToken),
              {
                failOnStatusCode: false,
              },
            ),
        );
        await checkMandatoryHeaders(response);
        await checkStatusCode(response);
        await test.step("Verify the error message in the response", async () => {
          const json = await response.json();
          expect.soft(json.error).toBe(error);
          expect.soft(json.error_description).toBe(errorDescription);
        });
      });
    }

    // Wrong data type (number, null, boolean, etc.) substituted into grant_type
    for (const { dataType, data } of invalidDataTypes) {
      test(
        `Logging with grant type = ${dataType} - should be 400 error`,
        { tag: [TAG.invalidDataTypes] },
        async ({ oauthController }) => {
          const payload = {
            grant_type: data,
            refresh_token: refreshToken,
          };

          const response =
            await test.step(`Take token with grant type = ${dataType}`, async () => {
              return await oauthController.withRefreshTokenGrant(
                payload as any,
                {
                  failOnStatusCode: false,
                },
              );
            });
          await checkMandatoryHeaders(response);
          await checkBadStatusCode(response);
          await test.step("Check the error message", async () => {
            const json = await response.json();
            expect.soft(json.error).toBe("invalid_request");
            expect
              .soft(json.error_description)
              .toBe(
                "Invalid discriminator value. Expected 'password' | 'client_credentials' | 'refresh_token'",
              );
          });
        },
      );
    }

    // Wrong data type (number, null, boolean, etc.) substituted into refresh_token
    for (const {
      dataType,
      data,
      errorDescription,
    } of invalidDataTypesForCredentials) {
      test(
        `Logging with refresh token = ${dataType} - should be 400 error`,
        { tag: [TAG.invalidDataTypes] },
        async ({ oauthController }) => {
          const payload = {
            grant_type: "refresh_token",
            refresh_token: data,
          };

          const response =
            await test.step(`Take token with refresh token = ${dataType}`, async () => {
              return await oauthController.withRefreshTokenGrant(
                payload as any,
                {
                  failOnStatusCode: false,
                },
              );
            });

          await checkMandatoryHeaders(response);
          await checkBadStatusCode(response);
          await test.step("Check the error message", async () => {
            const json = await response.json();
            expect.soft(json.error).toBe("invalid_request");
            expect.soft(json.error_description).toBe(errorDescription);
          });
        },
      );
    }

    test("Verify logging with using access token instead of refresh token", async ({
      oauthController,
    }) => {
      const response =
        await test.step("Login with using access token instead of refresh token", async () => {
          return await oauthController.withRefreshTokenGrant(
            {
              grant_type: "refresh_token",
              refresh_token: token,
            },
            { failOnStatusCode: false },
          );
        });
      await checkMandatoryHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("invalid_grant");
      expect.soft(json.error_description).toContain("Invalid refresh token");
    });
  },
);
