import { test } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkOKResponse,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { oauthClientListSchema } from "../../app/json-schemas/oauthSchemas";

//Poitive tests - get clients
test.describe(
  "GET /clients: getting all clients by admin - should be successful",
  { tag: [TAG.oauth, TAG.smoke, TAG.regression] },
  () => {
    test("Getting all clients by admin - should be successful", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Get all clients by the authorized admin", async () => {
          return clientsController.getClients({ failOnStatusCode: true });
        });

      await checkOKResponse(response);
      const json = await response.json();
      await checkSchema(
        json,
        oauthClientListSchema,
        "JSON of the clients list does NOT match expected schema",
      );
    });
  },
);

test.describe(
  "GET /clients: getting all clients by non-auth admin & user - should be 401 error",
  { tag: [TAG.negative, TAG.smoke, TAG.oauth] },
  () => {
    test.use({ isAuthorized: false });

    let token: string;

    test.beforeAll("Get user token", async ({ apiClient, randomString }) => {
      await test.step("Get user token", async () => {
        const result = await apiClient.getUserTokenAndRefreshToken(
          randomString,
          randomString + "@mail.com",
          "Password123",
        );
        token = result.token;
        console.log(token);
      });

      test("Take clients list by non-auth client - should be 401 error", async ({
        clientsController,
      }) => {
        const response =
          await test.step("Try to get clients list using user token", async () => {
            return clientsController.getClients({ failOnStatusCode: false });
          });
        await checkUnauthorizedStatusCode(response);
      });

      test("Take clients list by user - should be 401 error", async ({
        clientsController,
      }) => {
        const response =
          await test.step("Try to get clients list using user token", async () => {
            return clientsController.getClients({
              headers: {
                Authorization: `Bearer ${token}`,
              },
              failOnStatusCode: false,
            });
          });
        await checkUnauthorizedStatusCode(response);
      });
    });
  },
);
