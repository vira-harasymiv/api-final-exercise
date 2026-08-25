import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { oauthClientListSchema } from "../../app/json-schemas/oauthSchemas";

//Positive tests - get clients
test.describe(
  "GET /clients: getting all clients by admin - should be successful",
  { tag: [TAG.oauth, TAG.smoke, TAG.regression] },
  () => {
    test("Getting all clients by admin - should be successful", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Get all clients by the authorized admin", async () => {
          return await clientsController.getClients({ failOnStatusCode: true });
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      const json = await response.json();
      await checkSchema(json, oauthClientListSchema);
    });
  },
);

//Negative test cases on 401/403 errors
test.describe(
  "GET /clients: getting all clients without authorization and permissions",
  { tag: [TAG.negative, TAG.smoke, TAG.oauth, TAG.permissions] },
  () => {
    test.use({ isAuthorized: false });

    test("Take clients list by non-auth client - should be 401 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Try to get clients without authorization", async () => {
          return await clientsController.getClients({
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

    test("Take clients list by client with READ permission - should be 403 error", async ({
      clientsController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to get clients list by client with READ permission", async () => {
          return await clientsController.getClients({
            headers: { Authorization: `Bearer ${readClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Check the error message received in response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Take clients list by client with READ and WRITE permission - should be 403 error", async ({
      clientsController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to get clients list by client with READ and WRITE permission", async () => {
          return await clientsController.getClients({
            headers: { Authorization: `Bearer ${readWriteClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Check the error message received in response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Take clients list by client with READ, WRITE, and ADMIN permission - should be 403 error", async ({
      clientsController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to get clients list by client with READ and WRITE permission", async () => {
          return await clientsController.getClients({
            headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Check the error message received in response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });
  },
);
