import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";

//Negative tests on 401/403 errors
test.describe(
  "GET/admin/users - search users by email and name: negative tests",
  { tag: [TAG.negative, TAG.admin, TAG.regression, TAG.permissions] },
  () => {
    test.use({ isAuthorized: false });
    const searchTerm = "test";

    test("Search without authorization - should be 401 error", async ({
      adminController,
    }) => {
      const response =
        await test.step("Search user without authorization", async () => {
          return await adminController.searchUser(
            { search: searchTerm },
            { failOnStatusCode: false },
          );
        });
      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Unauthorized");
      });
    });

    test("Search any user as a client with READ permission - should be 403 error", async ({
      adminController,
      readClientToken,
    }) => {
      const response =
        await test.step("Search user was a client with READ permission", async () => {
          return await adminController.searchUser(
            { search: searchTerm },
            {
              headers: { Authorization: `Bearer ${readClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Search any user as a client with READ and WRITE permission - should be 403 error", async ({
      adminController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Search user was a client with READ and WRITE permission", async () => {
          return await adminController.searchUser(
            { search: searchTerm },
            {
              headers: { Authorization: `Bearer ${readWriteClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Search any user as a client with READ, WRITE, and ADMIN permissions - should be 403 error", async ({
      adminController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Search user was a client with READ, WRITE, and ADMIN permission", async () => {
          return await adminController.searchUser(
            { search: searchTerm },
            {
              headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });
  },
);
