import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
} from "../../app/utils/expect-helpers";
import { userSearchResultSchema } from "../../app/json-schemas/userSchemas";
import { faker } from "@faker-js/faker";

//Smoke tests for checking the ability to search by email: email is unique, so only one result with searched full email should be returned
test.describe(
  "GET/admin/users - search users by email: positive tests",
  { tag: [TAG.admin, TAG.smoke, TAG.regression] },
  () => {
    //Payload for the test user
    const userName = "New user" + Math.floor(Math.random() * 1_000);
    const userEmail =
      "newUser" + Math.floor(Math.random() * 1_000) + "@mail.com";
    const userPassword = "Password123";

    test.beforeAll(
      "Prepare test data: register a new user",
      async ({ authController }) => {
        await test.step("Register as a new user", async () => {
          return await authController.registerUser(
            { name: userName, email: userEmail, password: userPassword },
            { failOnStatusCode: true },
          );
        });
      },
    );

    test("Search by a full user's email - should be successful", async ({
      adminController,
    }) => {
      const response =
        await test.step("Search user using his full email", async () => {
          return await adminController.searchUser(
            { search: userEmail },
            { failOnStatusCode: true },
          );
        });
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Observe if 1 result is returned as the email is unique", async () => {
        expect.soft(json.length).toBe(1);
        expect.soft(json[0].email).toBe(userEmail);
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
      const searchTerm = userEmail.slice(0, 1);
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
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const searchTerm = userEmail.slice(0, 2);
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
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

//Smoke tests for checking the ability to search by name: name is unique, so only one result with searched full name should be returned
test.describe(
  "GET/admin/users - search users by name: positive tests",
  { tag: [TAG.admin, TAG.smoke, TAG.regression] },
  () => {
    //Payload for the test user
    const userName = "New user" + Math.floor(Math.random() * 1_000);
    const userEmail =
      "newUser" + Math.floor(Math.random() * 1_000) + "@mail.com";
    const userPassword = "Password123";

    test.beforeAll(
      "Prepare test data: register a new user",
      async ({ authController }) => {
        await test.step("Register as a new user", async () => {
          return await authController.registerUser(
            { name: userName, email: userEmail, password: userPassword },
            { failOnStatusCode: true },
          );
        });
      },
    );

    test("Search by a full user's name - should be successful", async ({
      adminController,
    }) => {
      const response =
        await test.step("Search user using his full name", async () => {
          return await adminController.searchUser(
            { search: userName },
            { failOnStatusCode: true },
          );
        });
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      await test.step("Observe if the one result is returned as the user's name is unique", async () => {
        expect.soft(json.length).toBe(1);
        expect.soft(json[0].name).toBe(userName);
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
      const searchTerm = userName.slice(0, 1);
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
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const searchTerm = userName.slice(0, 2);
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
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
