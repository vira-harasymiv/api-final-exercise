import { test } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkOKStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/general-expect-helpers";
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

      await checkOKStatusCode(response);
      const json = await response.json();
      await checkSchema(
        json,
        oauthClientListSchema,
        "JSON of the clients list does NOT match expected schema",
      );
    });
  },
);

//Negative test cases
test.describe(
  "GET /clients: getting all clients by non-auth admin",
  { tag: [TAG.negative, TAG.smoke, TAG.oauth] },
  () => {
    test.use({ isAuthorized: false });

    test("Take clients list by non-auth client - should be 401 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Try to get clients list using user token", async () => {
          return clientsController.getClients({ failOnStatusCode: false });
        });
      await checkUnauthorizedStatusCode(response);
    });
  },
);
