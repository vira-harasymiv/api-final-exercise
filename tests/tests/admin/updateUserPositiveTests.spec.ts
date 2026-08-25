import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
} from "../../app/utils/expect-helpers";
import { userSchema } from "../../app/json-schemas/userSchemas";

//Update user by admin: positive tests
test.describe(
  "PATCH/admin/users/{userId} - update user info by admin: positive tests",
  { tag: [TAG.smoke, TAG.admin, TAG.regression] },
  () => {
    //Payload for the test user
    const userName = "New user" + Math.floor(Math.random() * 1_000);
    const userEmail =
      "newUser" + Math.floor(Math.random() * 1_000) + "@mail.com";
    const userPassword = "Password123";
    let userId: string;

    test.beforeAll(
      "Prepare test data: register a new user",
      async ({ authController }) => {
        const response = await test.step("Register as a new user", async () => {
          return await authController.registerUser(
            { name: userName, email: userEmail, password: userPassword },
            { failOnStatusCode: true },
          );
        });
        userId = (await response.json()).id;
      },
    );

    test("Update user's name - should be successful", async ({
      adminController,
      randomString,
    }) => {
      const updatedName = randomString;
      const response =
        await test.step("Update user's name as admin", async () => {
          return await adminController.updateUser(
            userId,
            {
              name: updatedName,
            },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      const json = await response.json();
      await checkSchema(json, userSchema);
      await test.step("Check if the user's name has been updated", async () => {
        expect.soft(json.name).toBe(updatedName);
        expect.soft(json.id).toBe(userId);
      });
    });

    test("Update user's email - should be successful", async ({
      adminController,
      randomString,
    }) => {
      const updatedEmail = randomString + "@mail.com";
      const response =
        await test.step("Update user's email as admin", async () => {
          return await adminController.updateUser(
            userId,
            {
              email: updatedEmail,
            },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      const json = await response.json();
      await checkSchema(json, userSchema);
      await test.step("Check if the user's email has been updated", async () => {
        expect.soft(json.email).toBe(updatedEmail);
        expect.soft(json.id).toBe(userId);
      });
    });

    test("Update user's state (isActive) - should be successful", async ({
      adminController,
    }) => {
      const response = await test.step("Update user's state", async () => {
        return await adminController.updateUser(
          userId,
          { isActive: false },
          { failOnStatusCode: true },
        );
      });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      const json = await response.json();
      await checkSchema(json, userSchema);
      await test.step("Check if the user's state has been updated", async () => {
        expect.soft(json.isActive).toBe(false);
        expect.soft(json.id).toBe(userId);
      });
    });

    test("Update user's email, name, state (isActive) at once - should be successful", async ({
      adminController,
      randomString,
    }) => {
      const updatedName = randomString;
      const updatedEmail = randomString + "@gmail.com";
      const response =
        await test.step("Update user's email, name, state as admin", async () => {
          return await adminController.updateUser(
            userId,
            {
              name: updatedName,
              email: updatedEmail,
              isActive: false,
            },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      const json = await response.json();
      await checkSchema(json, userSchema);
      await test.step("Check if the user's email, name, state has been updated", async () => {
        expect.soft(json.name).toBe(updatedName);
        expect.soft(json.email).toBe(updatedEmail);
        expect.soft(json.isActive).toBe(false);
        expect.soft(json.id).toBe(userId);
      });
    });
  },
);
