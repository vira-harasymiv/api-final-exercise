import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkUnauthorizedStatusCode,
  checkOKStatusCode,
} from "../../app/utils/general-expect-helpers";

//Positive smoke tests for getting client's and admin's info
test.describe(
  "GET /userinfo: get current info by client - it should be successful",
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

        const json = await result.responseLogin.json();
        token = json.access_token;
      },
    );

    test.afterAll(
      "Deactivate the created client",
      async ({ clientsController }) => {
        await test.step("Delete the created client", async () => {
          await clientsController.deactivateClient({
            clientId: clientId,
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Verify getting USER info", async ({ userInfoController }) => {
      const response =
        await test.step("Get info about the authorized user", async () => {
          return userInfoController.getUserInfo({
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: true,
          });
        });
      await checkOKStatusCode(response);
      await test.step("Verify response properties", async () => {
        const json = await response.json();
        expect.soft(json.sub).toBe(clientId);
        expect.soft(json.type).toBe("client");
        expect.soft(json.scopes).toEqual(scopes);
      });
    });

    test("Verify getting ADMIN info", async ({ userInfoController }) => {
      const response =
        await test.step("Get info about the authorized admin", async () => {
          return userInfoController.getUserInfo({ failOnStatusCode: true });
        });
      await checkOKStatusCode(response);
      await test.step("Verify response properties", async () => {
        const json = await response.json();
        expect.soft(json.email).toBe(process.env.ADMIN_EMAIL);
        expect.soft(json.isActive).toBe(true);
        expect.soft(json.name).toBe("Admin User");
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
