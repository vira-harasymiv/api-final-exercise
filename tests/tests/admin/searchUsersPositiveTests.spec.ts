import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
} from "../../app/utils/expect-helpers";
import { userSearchResultSchema } from "../../app/json-schemas/userSchemas";
import { faker } from "@faker-js/faker";

//Smoke tests for checking the ability to search by email
test.describe(
  "GET/admin/users - search users by email: positive tests",
  { tag: [TAG.admin, TAG.smoke, TAG.regression] },
  () => {
    //Payload for the test user to search
    const partOfUserName = "New user";
    const partOfUserEmail = "newUser";
    const userPassword = "Password123";

    test.beforeAll(
      "Prepare test data: register a new user",
      async ({ authController, randomString }) => {
        await test.step("Register as a new user", async () => {
          return await authController.registerUser(
            {
              name: partOfUserName + randomString,
              email: partOfUserEmail + randomString + "@gmail.com",
              password: userPassword,
            },
            { failOnStatusCode: true },
          );
        });
      },
    );

    test("Search by a part of user's email - should be successful", async ({
      adminController,
    }) => {
      const response =
        await test.step("Search user using a part of his email", async () => {
          return await adminController.searchUser(
            { search: partOfUserEmail },
            { failOnStatusCode: true },
          );
        });
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Observe if the name OR email properties contain the searched part of user's email", async () => {
        for (const user of json) {
          expect
            .soft(
              (user.name
                ?.toLowerCase()
                .includes(partOfUserEmail.toLowerCase()) ??
                false) ||
                user.email
                  .toLowerCase()
                  .includes(partOfUserEmail.toLowerCase()),
            )
            .toBeTruthy();
        }
      });
      await checkSchema(
        json,
        userSearchResultSchema,
        "JSON array of searched users does NOT match the schema",
      );
    });

    test("Search by the first letter of a user's email - should be successful", async ({
      adminController,
    }) => {
      const searchTerm = partOfUserEmail.slice(0, 1);
      const response =
        await test.step("Search user using the first letter of his email", async () => {
          return await adminController.searchUser(
            { search: searchTerm },
            { failOnStatusCode: true },
          );
        });
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Observe if the name OR email properties contain the searched letter", async () => {
        for (const user of json) {
          expect
            .soft(
              (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .toBeTruthy();
        }
      });
      await checkSchema(
        json,
        userSearchResultSchema,
        "JSON array of searched users does NOT match the schema",
      );
    });

    test("Search by two adjacent letters of a user's email - should be successful", async ({
      adminController,
    }) => {
      const searchTerm = partOfUserEmail.slice(0, 2);
      const response =
        await test.step("Search user using two adjacent letters of his email", async () => {
          return await adminController.searchUser(
            { search: searchTerm },
            { failOnStatusCode: true },
          );
        });
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Observe if the name OR email properties contain the searched letters", async () => {
        for (const user of json) {
          expect
            .soft(
              (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .toBeTruthy();
        }
      });
      await checkSchema(
        json,
        userSearchResultSchema,
        "JSON array of searched users does NOT match the schema",
      );
    });

    test("Search by non-existing email or name - should be empty array", async ({
      adminController,
    }) => {
      const searchTerm = faker.lorem.words(2);
      const response =
        await test.step("Search user using a non-existing email or name", async () => {
          return await adminController.searchUser(
            { search: searchTerm },
            { failOnStatusCode: true },
          );
        });
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Observe if the empty array is received", async () => {
        expect(json).toEqual([]);
      });
    });
  },
);

//Smoke tests for checking the ability to search by name:
test.describe(
  "GET/admin/users - search users by name: positive tests",
  { tag: [TAG.admin, TAG.smoke, TAG.regression] },
  () => {
    //Payload for the test user
    const partOfUserName = "Test User";
    const partOfUserEmail = "testUser";
    const userPassword = "Password123";

    test.beforeAll(
      "Prepare test data: register a new user",
      async ({ authController, randomString }) => {
        await test.step("Register as a new user", async () => {
          return await authController.registerUser(
            {
              name: partOfUserName + randomString,
              email: partOfUserEmail + randomString + "@gmail.com",
              password: userPassword,
            },
            { failOnStatusCode: true },
          );
        });
      },
    );

    test("Search by a part user's name - should be successful", async ({
      adminController,
    }) => {
      const response =
        await test.step("Search user using a part of his name", async () => {
          return await adminController.searchUser(
            { search: partOfUserName },
            { failOnStatusCode: true },
          );
        });
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Observe if the name OR email properties contain the searched letter", async () => {
        for (const user of json) {
          expect
            .soft(
              (user.name
                ?.toLowerCase()
                .includes(partOfUserName.toLowerCase()) ??
                false) ||
                user.email.toLowerCase().includes(partOfUserName.toLowerCase()),
            )
            .toBeTruthy();
        }
      });
      await checkSchema(
        json,
        userSearchResultSchema,
        "JSON array of searched users does NOT match the schema",
      );
    });

    test("Search by the first letter of a user's name - should be successful", async ({
      adminController,
    }) => {
      const searchTerm = partOfUserName.slice(0, 1);
      const response =
        await test.step("Search user using the first letter of his name", async () => {
          return await adminController.searchUser(
            { search: searchTerm },
            { failOnStatusCode: true },
          );
        });
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Observe if the name OR email properties contain the searched letter", async () => {
        for (const user of json) {
          expect
            .soft(
              (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .toBeTruthy();
        }
      });
      await checkSchema(
        json,
        userSearchResultSchema,
        "JSON array of searched users does NOT match the schema",
      );
    });

    //Min length of user name is 2
    test("Search by two adjacent letters of a user's name - should be successful", async ({
      adminController,
    }) => {
      const searchTerm = partOfUserName.slice(0, 2);
      const response =
        await test.step("Search user using two adjacent letters of his name", async () => {
          return await adminController.searchUser(
            { search: searchTerm },
            { failOnStatusCode: true },
          );
        });
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Observe if the name OR email properties contain the searched letters", async () => {
        for (const user of json) {
          expect
            .soft(
              (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .toBeTruthy();
        }
      });
      await checkSchema(
        json,
        userSearchResultSchema,
        "JSON array of searched users does NOT match the schema",
      );
    });
  },
);
