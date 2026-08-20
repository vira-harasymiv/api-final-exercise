import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import { passwordGrantPayload } from "./testData/payloads";
import {
  checkAcceptEncodingHeaders,
  checkMandatoryHeaders,
  checkOKResponse,
  checkUnauthorizedRefreshTokenError,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { invalidDataTypes } from "./testData/testData";

//Positive tests for checking the refresh token revoking
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
    }) => {
      const response =
        await test.step("Post resfresh token to revoke it", async () => {
          return revokeController.revokeToken(
            { token: refreshToken },
            {
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: true,
            },
          );
        });

      //!ASSERT
      await checkOKResponse(response);
      await test.step("Verify of the success is true in the response", async () => {
        const json = await response.json();
        expect(json.success).toBe(true);
      });
    });

    test("Login with revoked refreshToken - should be 401 error", async ({
      apiClient,
    }) => {
      const response = await apiClient.loginWithRevokedToken(
        token,
        refreshToken,
      );
      await checkUnauthorizedRefreshTokenError(response);
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
        await checkMandatoryHeaders(response);
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
      const json = await response.json();
      await checkMandatoryHeaders(response);
      expect(response.status()).toBe(404);
      expect(response.statusText()).toBe("Not Found");
      expect(json.error).toBe("Token not found");
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
