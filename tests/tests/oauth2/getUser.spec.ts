import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkUnauthorizedStatusCode,
  checkOKResponse,
} from "../../app/utils/expect-helpers";

//Positive smoke test scenario for getting user's info
test.describe(
  "GET /userinfo: get current info - it should be successful",
  { tag: [TAG.oauth, TAG.smoke, TAG.regression] },
  () => {
    let token: string;
    let clientId: string;
    const scopes = ["read"];

    test.beforeAll(
      "Login with credentials of the created client",
      async ({ apiClient, randomString }) => {
        const result = await apiClient.loginWithCredentialsOfNewClient(
          randomString,
          scopes,
        );
        clientId = result.clientId;

        const json = await result.response.json();
        token = json.access_token;
      },
    );

    test("Verify getting user's info", async ({ userInfoController }) => {
      const response =
        await test.step("Get info about the authorized user", async () => {
          return userInfoController.getUserInfo({
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: true,
          });
        });
      await checkOKResponse(response);
      await test.step("Verify response properties", async () => {
        const json = await response.json();
        expect.soft(json.sub).toBe(clientId);
        expect.soft(json.type).toBe("client");
        expect.soft(json.scopes).toEqual(scopes);
      });
    });
  },
);

//Negative smoke test for getting info by the non-authorized user
test.describe(
  "GET /userinfo: get current info by non-authorized user - it should be 401 Error",
  { tag: [TAG.oauth, TAG.smoke, TAG.regression, TAG.negative] },
  () => {
    test.use({ isAuthorized: false });

    test("Verify getting user's info", async ({ userInfoController }) => {
      const response =
        await test.step("Get info by the non-authorized user", async () => {
          return userInfoController.getUserInfo({ failOnStatusCode: false });
        });

      await checkUnauthorizedStatusCode(response);
    });
  },
);
