import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkForbiddenStatusCode,
  checkNotFoundStatusCode,
  checkOKStatusCode,
  checkUnauthorizedStatusCode,
} from "../../app/utils/general-expect-helpers";

//Positive tests for checking the client deleting
test.describe(
  "DELETE /clients - Deactivate client by ID using ADMIN credentials: should be successful",
  { tag: [TAG.oauth, TAG.smoke, TAG.regression] },
  () => {
    let clientId: string;
    let token: string;

    test.beforeEach(
      "Create a new client",
      async ({ apiClient, randomString }) => {
        const result = await apiClient.loginWithCredentialsOfNewClient(
          randomString,
          ["read", "write"],
        );
        clientId = result.clientId;
        token = result.token;
      },
    );

    test.afterEach(
      "Deactivate the created clients",
      async ({ clientsController }) => {
        await test.step("Delete the prepared test data", async () => {
          await clientsController.deactivateClient({
            clientId: clientId,
            failOnStatusCode: true,
          });
        });
      },
    );

    test(
      "Deactivate created client by admin - it should be successful",
      { tag: [TAG.oauth, TAG.smoke, TAG.regression] },
      async ({ clientsController, userInfoController }) => {
        const response =
          await test.step("Deactivate client by admin", async () => {
            return clientsController.deactivateClient({
              clientId: clientId,
              failOnStatusCode: true,
            });
          });
        await checkOKStatusCode(response);
        await test.step("Verify if the success message is true", async () => {
          const json = await response.json();
          expect.soft(json.success).toBe(true);
        });
      },
    );
  },
);

//Negative tests for checking the client deleting
test.describe(
  "DELETE /clients - Deactivate client by ID: negative tests",
  { tag: [TAG.oauth, TAG.negative, TAG.regression] },
  () => {
    test.use({ isAuthorized: false });

    let adminClientId: string;
    let adminToken: string;
    let writeAndReadClientId: string;
    let writeAndReadToken: string;
    let readClientId: string;
    let readClientToken: string;

    test.beforeAll(
      "Create clients with different permissions",
      async ({ apiClient, randomString }) => {
        const adminResult = await apiClient.loginWithCredentialsOfNewClient(
          randomString,
          ["read", "write", "admin"],
        );
        adminClientId = adminResult.clientId;
        adminToken = adminResult.token;

        const writeAndReadResult =
          await apiClient.loginWithCredentialsOfNewClient(randomString, [
            "read",
            "write",
          ]);
        writeAndReadClientId = writeAndReadResult.clientId;
        writeAndReadToken = writeAndReadResult.token;

        const readResult = await apiClient.loginWithCredentialsOfNewClient(
          randomString,
          ["read"],
        );
        readClientId = readResult.clientId;
        readClientToken = readResult.token;
      },
    );

    test.afterAll(
      "Deactivate the created clients",
      async ({ oauthController, clientsController }) => {
        const token = await oauthController.takeAdminToken();
        const ids = [adminClientId, writeAndReadClientId, readClientId];

        for (const id of ids) {
          await test.step("Delete the prepared test data", async () => {
            await clientsController.deactivateClient({
              headers: { Authorization: `Bearer ${token}` },
              clientId: id,
              failOnStatusCode: true,
            });
          });
        }
      },
    );

    test("The logged admin can not deactivate himself: 403 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Login as admin and send request using the logged admin ID", async () => {
          return clientsController.deactivateClient({
            headers: { Authorization: `Bearer ${adminToken}` },
            clientId: adminClientId,
            failOnStatusCode: false,
          });
        });
      await checkForbiddenStatusCode(response);
    });

    test("Client with write permission can not deactivate admin: 403 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Login as client with 'write' permission and try to delete admin", async () => {
          return clientsController.deactivateClient({
            headers: { Authorization: `Bearer ${writeAndReadToken}` },
            clientId: adminClientId,
            failOnStatusCode: false,
          });
        });
      await checkForbiddenStatusCode(response);
    });

    test("Client with read permission can not deactivate admin: 403 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Login as client with 'read' permission and try to delete admin", async () => {
          return clientsController.deactivateClient({
            headers: { Authorization: `Bearer ${readClientToken}` },
            clientId: adminClientId,
            failOnStatusCode: false,
          });
        });
      await checkForbiddenStatusCode(response);
    });

    test("Client with read permission can not deactivate client with write permission: 403 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Login as client with 'read' permission and try to delete client with write permission", async () => {
          return clientsController.deactivateClient({
            headers: { Authorization: `Bearer ${readClientToken}` },
            clientId: writeAndReadClientId,
            failOnStatusCode: false,
          });
        });
      await checkForbiddenStatusCode(response);
    });

    test("Client with write permission can not deactivate client with read permission: 403 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Login as client with 'read' permission and try to delete client with write permission", async () => {
          return clientsController.deactivateClient({
            headers: { Authorization: `Bearer ${writeAndReadToken}` },
            clientId: readClientId,
            failOnStatusCode: false,
          });
        });
      await checkForbiddenStatusCode(response);
    });

    test("Delete any client by ID without auth: 401 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Try to delete any client by ID without auth", async () => {
          return clientsController.deactivateClient({
            clientId: readClientId,
            failOnStatusCode: false,
          });
        });
      await checkUnauthorizedStatusCode(response);
    });

    //! 403 Status Code (instead of 404) is received after deleting client by non-existing ID. It should be 404 according to the doc
    test("Delete any client by non-existing ID: 404 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Try to delete any client by non-existing ID", async () => {
          return clientsController.deactivateClient({
            headers: { Authorization: `Bearer ${adminToken}` },
            clientId: "dsdsdsdsdsdsdsdsfsfsfsdfsfsfsf",
            failOnStatusCode: false,
          });
        });
      await checkNotFoundStatusCode(response);
    });
  },
);
