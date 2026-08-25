import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkBadStatusCode,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import {
  invalidDataTypesForEmail,
  invalidDataTypesForIsActive,
  invalidDataTypesForName,
} from "./testData/testData";

//Update user by admin: negative tests for checking invalid types
test.describe(
  "PATCH/admin/users/{userId} - update user info by admin: negative tests",
  { tag: [TAG.negative, TAG.admin, TAG.regression] },
  () => {
    const userPassword = "Password123";
    let userId: string;

    //Register a fresh user before each test so an invalid update in one test case
    //(e.g. a value that is silently accepted) can't leak into the next test case
    test.beforeEach(
      "Prepare test data: register a new user",
      async ({ authController, randomString }) => {
        const response = await test.step("Register as a new user", async () => {
          return await authController.registerUser(
            {
              name: "New user " + randomString,
              email: randomString + "@mail.com",
              password: userPassword,
            },
            { failOnStatusCode: true },
          );
        });
        userId = (await response.json()).id;
      },
    );

    for (const { id, dataType, data } of invalidDataTypesForName) {
      test(
        `${id} Update user's name using invalid data type = ${dataType} - should be 400 error`,
        { tag: [TAG.invalidDataTypes] },
        async ({ adminController }) => {
          const response =
            await test.step(`Try to update user's name using name = ${dataType}`, async () => {
              return await adminController.updateUserWithInvalidData(userId, {
                name: data,
              });
            });
          await checkMandatoryHeaders(response);
          await checkBadStatusCode(response);
          const json = await response.json();
          await test.step("Verify error message", async () => {
            expect.soft(json.error).toBe("No valid fields to update");
          });
        },
      );
    }

    for (const { id, dataType, data, message } of invalidDataTypesForEmail) {
      test(
        `${id} Update user's email using invalid data type = ${dataType} - should be 400 error`,
        { tag: [TAG.invalidDataTypes] },
        async ({ adminController }) => {
          const response =
            await test.step(`Try to update user's email using email = ${dataType}`, async () => {
              return await adminController.updateUserWithInvalidData(userId, {
                email: data,
              });
            });
          await checkMandatoryHeaders(response);
          await checkBadStatusCode(response);
          const json = await response.json();
          await test.step("Verify error message", async () => {
            expect.soft(json.error).toBe(message);
          });
        },
      );
    }

    for (const { id, dataType, data } of invalidDataTypesForIsActive) {
      test(
        `${id} Update user's state (isActive) using invalid data type = ${dataType} - should be 400 error`,
        { tag: [TAG.invalidDataTypes] },
        async ({ adminController }) => {
          const response =
            await test.step(`Try to update user's state using isActive = ${dataType}`, async () => {
              return await adminController.updateUserWithInvalidData(userId, {
                isActive: data,
              });
            });
          await checkMandatoryHeaders(response);
          await checkBadStatusCode(response);
          const json = await response.json();
          await test.step("Verify error message", async () => {
            expect.soft(json.error).toBe("No valid fields to update");
          });
        },
      );
    }

    test("Update user without any fields in the body - should be 400 error", async ({
      adminController,
    }) => {
      const response =
        await test.step("Try to update user without any fields", async () => {
          return await adminController.updateUser(
            userId,
            {},
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkBadStatusCode(response);
      const json = await response.json();
      await test.step("Verify error message", async () => {
        expect.soft(json.error).toBe("No valid fields to update");
      });
    });

    test("Update user with incorrect property (role) - should be 400 error", async ({
      adminController,
    }) => {
      const response =
        await test.step("Try to update user's role", async () => {
          return await adminController.updateUserWithInvalidData(
            userId,
            { role: "ADMIN" },
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkBadStatusCode(response);
      const json = await response.json();
      await test.step("Verify error message", async () => {
        expect.soft(json.error).toBe("No valid fields to update");
      });
    });

    test("Update a non-existing user - should be 400 error", async ({
      adminController,
    }) => {
      const response =
        await test.step("Try to update a non-existing user", async () => {
          return await adminController.updateUser(
            "non-existing-id",
            { name: "Test" },
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkBadStatusCode(response);
      const json = await response.json();
      await test.step("Verify the error message", async () => {
        expect.soft(json.error).toBe("Failed to update user");
      });
    });
  },
);

//Update user by admin: negative tests for auth/permission errors
test.describe(
  "PATCH/admin/users/{userId} - update user without auth or admin permission - should be 401/403 error",
  {
    tag: [TAG.negative, TAG.admin, TAG.regression, TAG.smoke, TAG.permissions],
  },
  () => {
    test.use({ isAuthorized: false });

    test("Update user without auth - should be 401 error", async ({
      adminController,
    }) => {
      const response =
        await test.step("Try to update user without auth", async () => {
          return await adminController.updateUser(
            "some-user-id",
            { name: "Test" },
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

    test("Update user as a client with READ permission - should be 403 error", async ({
      adminController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to update user as a client with READ permission", async () => {
          return await adminController.updateUser(
            "some-user-id",
            { name: "Test" },
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

    test("Update user as a client with READ and WRITE permission - should be 403 error", async ({
      adminController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to update user as a client with READ and WRITE permission", async () => {
          return await adminController.updateUser(
            "some-user-id",
            { name: "Test" },
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

    test("Update user as a client with READ, WRITE, and ADMIN permissions - should be 403 error", async ({
      adminController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to update user as a client with READ, WRITE, and ADMIN permissions", async () => {
          return await adminController.updateUser(
            "some-user-id",
            { name: "Test" },
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
