import { test } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import { checkSchema } from "../../app/utils/general-expect-helpers";
import {
  checkSuccessfulTokenResponse,
  checkInvalidGrantType,
  checkUnauthorizedStatusCodeForRefreshToken,
} from "./helpers/expect-helpers";
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

      await checkSuccessfulTokenResponse(
        response,
        { expectRefreshToken: true },
        "read write admin",
      );

      const json = await response.json();
      await checkSchema(
        json,
        tokenResponseSchema,
        "Refresh Token Grant Response JSON does NOT match expected schema",
      );
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

    for (const {
      title,
      stepLabel,
      buildPayload,
      checkError,
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
        await checkError(response);
      });
    }

    // Wrong data type (number, null, boolean, etc.) substituted into grant_type
    for (const { dataType, data } of invalidDataTypes) {
      test(`Logging with grant type = ${dataType} - should be 400 error`, async ({
        oauthController,
      }) => {
        const payload = {
          grant_type: data,
          refresh_token: refreshToken,
        };

        const response =
          await test.step(`Take token with grant type = ${dataType}`, async () => {
            return await oauthController.withRefreshTokenGrant(payload as any, {
              failOnStatusCode: false,
            });
          });
        await checkInvalidGrantType(response);
      });
    }

    // Wrong data type (number, null, boolean, etc.) substituted into refresh_token
    for (const { dataType, data, check } of invalidDataTypesForCredentials) {
      test(`Logging with refresh token = ${dataType} - should be 400 error`, async ({
        oauthController,
      }) => {
        const payload = {
          grant_type: "refresh_token",
          refresh_token: data,
        };

        const response =
          await test.step(`Take token with refresh token = ${dataType}`, async () => {
            return await oauthController.withRefreshTokenGrant(payload as any, {
              failOnStatusCode: false,
            });
          });
        await check(response);
      });
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
      await checkUnauthorizedStatusCodeForRefreshToken(response);
    });
  },
);
