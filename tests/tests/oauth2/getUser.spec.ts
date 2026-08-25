import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkUnauthorizedStatusCode,
  checkOKStatusCode,
  checkMandatoryHeaders,
  checkAcceptEncodingHeaders,
} from "../../app/utils/expect-helpers";

//Positive smoke tests for getting client's and admin's info
test.describe(
  "GET /userinfo: get current client - it should be successful",
  { tag: [TAG.oauth, TAG.smoke, TAG.regression] },
  () => {
    test.use({ isAuthorized: false });

    test("Verify getting client info with permission = READ", async ({
      userInfoController,
      readClientToken,
    }) => {
      const response =
        await test.step("Get info about the authorized user with permission = READ", async () => {
          return await userInfoController.getUserInfo({
            headers: { Authorization: `Bearer ${readClientToken}` },
            failOnStatusCode: true,
          });
        });
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Verify response properties", async () => {
        const json = await response.json();
        expect.soft(json.sub).toContain("client");
        expect.soft(json.type).toBe("client");
        expect.soft(json.scopes).toEqual(["read"]);
      });
    });

    test("Verify getting client info with permission = READ and WRITE", async ({
      userInfoController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Get info about the authorized user with permission = READ and WRITE", async () => {
          return await userInfoController.getUserInfo({
            headers: { Authorization: `Bearer ${readWriteClientToken}` },
            failOnStatusCode: true,
          });
        });
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Verify response properties", async () => {
        const json = await response.json();
        expect.soft(json.sub).toContain("client");
        expect.soft(json.type).toBe("client");
        expect.soft(json.scopes).toEqual(["read", "write"]);
      });
    });

    test("Verify getting client info with permission = READ, WRITE, and ADMIN", async ({
      userInfoController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Get info about the authorized user with permission = READ, WRITE, and ADMIN", async () => {
          return await userInfoController.getUserInfo({
            headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
            failOnStatusCode: true,
          });
        });
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Verify response properties", async () => {
        const json = await response.json();
        expect.soft(json.sub).toContain("client");
        expect.soft(json.type).toBe("client");
        expect.soft(json.scopes).toEqual(["read", "write", "admin"]);
      });
    });
  },
);

//Positive smoke tests for getting client's and admin's info
test.describe(
  "GET /userinfo: get current admin - it should be successful",
  { tag: [TAG.oauth, TAG.smoke, TAG.regression] },
  () => {
    test("Verify getting ADMIN info", async ({ userInfoController }) => {
      const response =
        await test.step("Get info as the authorized admin", async () => {
          return await userInfoController.getUserInfo({
            failOnStatusCode: true,
          });
        });
      await checkMandatoryHeaders(response);
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
          return await userInfoController.getUserInfo({
            failOnStatusCode: false,
          });
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      await test.step("Check the error message received in response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Unauthorized");
      });
    });
  },
);
