import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkForbiddenStatusCode,
  checkUnauthorizedStatusCode,
} from "../../app/utils/general-expect-helpers";

//Negative tests on 401/403 errors
test.describe(
  "GET/admin/users - search users by email and name: negative tests",
  { tag: [TAG.negative, TAG.admin, TAG.regression] },
  () => {
    test.use({ isAuthorized: false });
    const searchTerm = "test";

    let token: string;

    test.beforeAll(
      "Take token without admin permission",
      async ({ apiClient }) => {
        const result = await apiClient.loginWithCredentialsOfNewClient(
          "new client",
          ["read", "write"],
        );
        token = result.token;
      },
    );

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
      await checkUnauthorizedStatusCode(response);
    });

    test("Search without admin's permission - should be 403 error", async ({
      adminController,
    }) => {
      const response =
        await test.step("Search user without admin's permission", async () => {
          return await adminController.searchUser(
            { search: searchTerm },
            {
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false,
            },
          );
        });
      await checkForbiddenStatusCode(response);
    });
  },
);
