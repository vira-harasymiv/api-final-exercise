import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import { passwordGrantPayload } from "./testData/payloads";
import {
  checkBadStatusCode,
  checkNotFoundStatusCode,
  checkOKStatusCode,
  checkUnauthorizedStatusCode,
} from "../../app/utils/general-expect-helpers";
import { checkUnauthorizedStatusCodeForRefreshToken } from "./helpers/expect-helpers";
import { invalidDataTypes } from "./testData/testData";

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
          return oauthController.withPasswordGrant(passwordGrantPayload, {
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
          return revokeController.revokeToken(
            { token: refreshToken },
            {
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: true,
            },
          );
        });

      //!ASSERT
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
        await checkUnauthorizedStatusCodeForRefreshToken(response);
      });
    });
  },
);

//Negative tests for checking the refresh token revoking
//! For token = boolean and number - 500 Error is received
test.describe(
  "POST /token - Revoke refresh token: negative scenarios",
  {
    tag: [TAG.oauth, TAG.negative, TAG.regression],
  },
  () => {
    for (const { id, dataType, data } of invalidDataTypes) {
      test(`${id} Check the ability to revoke refresh token = ${dataType}`, async ({
        revokeController,
      }) => {
        const response = await revokeController.revokeInvalidToken({
          token: data,
        });
        expect(response.status()).toBe(400);
      });
    }

    test("Verify revoking non-existing refresh token", async ({
      revokeController,
    }) => {
      const response =
        await test.step("Try to revoke non-existing refresh token", async () => {
          return revokeController.revokeInvalidToken({
            token: "dsdsdsdjskdjskd",
          });
        });
      await checkNotFoundStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Token not found");
    });
  },
);

//Negative test for checking Unauthorized request
test.describe(
  "POST /token - Revoke refresh token: negative scenarios",
  {
    tag: [TAG.oauth, TAG.negative, TAG.smoke],
  },
  () => {
    test.use({ isAuthorized: false });

    test("Verify revoking refresh token by Non-Authorized user", async ({
      revokeController,
    }) => {
      const response =
        await test.step("Try to revoke refresh token without authorization", async () => {
          return revokeController.revokeToken({
            token: "any token",
          });
        });
      await checkUnauthorizedStatusCode(response);
    });
  },
);
