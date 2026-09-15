import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkNotFoundStatusCode,
  checkOKStatusCode,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { prisma } from "@/lib/prisma";

//Positive tests for checking the client deactivating
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

    test(
      "Deactivate created client by admin - it should be successful",
      { tag: [TAG.oauth, TAG.smoke, TAG.regression] },
      async ({ clientsController }) => {
        const response =
          await test.step("Deactivate client by admin", async () => {
            return await clientsController.deactivateClient(clientId, {
              failOnStatusCode: true,
            });
          });

        await checkMandatoryHeaders(response);
        await checkOKStatusCode(response);
        await test.step("Verify if the success message is true", async () => {
          const json = await response.json();
          expect.soft(json.success).toBe(true);
        });
      },
    );
  },
);

//Negative tests for checking permissions to delete client
test.describe(
  "DELETE /clients - Deactivate client by ID: negative tests",
  { tag: [TAG.oauth, TAG.negative, TAG.regression, TAG.permissions] },
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
            await clientsController.deactivateClient(id, {
              headers: { Authorization: `Bearer ${token}` },
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
          return await clientsController.deactivateClient(adminClientId, {
            headers: { Authorization: `Bearer ${adminToken}` },
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

    test("Client with write permission can not deactivate admin: 403 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Login as client with 'write' permission and try to delete admin", async () => {
          return await clientsController.deactivateClient(adminClientId, {
            headers: { Authorization: `Bearer ${writeAndReadToken}` },
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

    test("Client with read permission can not deactivate admin: 403 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Login as client with 'read' permission and try to delete admin", async () => {
          return await clientsController.deactivateClient(adminClientId, {
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

    test("Client with read permission can not deactivate client with write permission: 403 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Login as client with 'read' permission and try to delete client with write permission", async () => {
          return await clientsController.deactivateClient(
            writeAndReadClientId,
            {
              headers: { Authorization: `Bearer ${readClientToken}` },
              failOnStatusCode: false,
            },
          );
        });
      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Check the error message received in response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Client with write permission can not deactivate client with read permission: 403 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Login as client with 'read' permission and try to delete client with write permission", async () => {
          return await clientsController.deactivateClient(readClientId, {
            headers: { Authorization: `Bearer ${writeAndReadToken}` },
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

    test("Delete any client by ID without auth: 401 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Try to delete any client by ID without auth", async () => {
          return await clientsController.deactivateClient(readClientId, {
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
  },
);

//Negative tests (deleting client by non-existing ID)
test.describe(
  "DELETE /clients - Deactivate client by ID: negative tests",
  { tag: [TAG.oauth, TAG.negative, TAG.regression] },
  () => {
    test("Delete any client by non-existing ID: 404 error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Try to delete any client by non-existing ID", async () => {
          return await clientsController.deactivateClient(
            "dsdsdsdsdsdsdsdsfsfsfsdfsfsfsf",
            { failOnStatusCode: false },
          );
        });
      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);
      await test.step("Verify the error message", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Client not found");
      });
    });
  },
);
