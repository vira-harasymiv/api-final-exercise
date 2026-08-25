import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkBadStatusCode,
  checkCreatedStatusCode,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { oauthCreatedClientSchema } from "../../app/json-schemas/oauthSchemas";
import { createClientPositiveCases } from "./testData/testDataPositiveCases";
import { invalidDataTypes } from "./testData/testData";

//Positive cases for creating a new client
test.describe(
  "POST /clients - Create a new client: should be successful",
  { tag: [TAG.oauth, TAG.smoke, TAG.regression] },
  () => {
    for (const {
      title,
      stepLabel,
      buildPayload,
    } of createClientPositiveCases) {
      test(title, async ({ clientsController, randomString, apiClient }) => {
        const name = randomString;

        const response = await test.step(stepLabel, async () => {
          return await clientsController.createClient(buildPayload(name), {
            failOnStatusCode: true,
          });
        });

        await checkCreatedStatusCode(response);
        await checkMandatoryHeaders(response);

        const json = await response.json();
        await checkSchema(json, oauthCreatedClientSchema);

        await test.step("Verify if the item has been created", async () => {
          const result = await apiClient.getClientInfo(
            json.clientId,
            json.clientSecret,
          );
          expect(json.clientId).toBe(result.sub);
        });
      });
    }
  },
);

//Negative cases on checking 401 and 403 errors
test.describe(
  "POST /clients - Create a new client without auth and permissions",
  {
    tag: [TAG.oauth, TAG.negative, TAG.regression, TAG.smoke, TAG.permissions],
  },
  () => {
    test.use({ isAuthorized: false });

    test("Create a new client without authorization - should be 401 Error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Try to create a new client without authorization", async () => {
          return await clientsController.createClient({ name: "test" });
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      await test.step("Check the error message received in response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Unauthorized");
      });
    });

    test("Create a new client with only READ permission - should be 403 Error", async ({
      readClientToken,
      clientsController,
    }) => {
      const response =
        await test.step("Try to create a new client with READ permission", async () => {
          return await clientsController.createClient(
            { name: "test" },
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

    test("Create a new client with only READ and WRITE permissions - should be 403 Error", async ({
      readWriteClientToken,
      clientsController,
    }) => {
      const response =
        await test.step("Try to create a new client with READ and WRITE permissions", async () => {
          return await clientsController.createClient(
            { name: "test" },
            {
              headers: { Authorization: `Bearer ${readWriteClientToken}` },
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

    test("Create a new client with only READ, WRITE, and ADMIN permissions - should be 403 Error", async ({
      readWriteAdminClientToken,
      clientsController,
    }) => {
      const response =
        await test.step("Try to create a new client with READ, WRITE, and ADMIN permissions", async () => {
          return await clientsController.createClient(
            { name: "test" },
            {
              headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
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
  },
);

//NEGATIVE cases with invalid data types
test.describe(
  "POST /clients - Create a new client using invalid data types: negative tests",
  { tag: [TAG.oauth, TAG.negative, TAG.regression, TAG.invalidDataTypes] },
  () => {
    for (const { id, dataType, data } of invalidDataTypes) {
      test(`${id} Check the ability to create client with name = ${dataType}`, async ({
        clientsController,
      }) => {
        const response = await clientsController.createClientWithInvalidData({
          name: data,
        });
        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        await test.step("Check the error message received in response", async () => {
          const json = await response.json();
          expect.soft(json.error).toBe("Name must be at least 2 characters");
        });
      });
    }
  },
);
