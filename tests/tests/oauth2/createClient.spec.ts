import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkBadStatusCode,
  checkCreatedStatusCode,
  checkForbiddenStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/general-expect-helpers";
import { oauthCreatedClientSchema } from "../../app/json-schemas/oauthSchemas";
import { createClientPositiveCases } from "./testData/testDataPositiveCases";
import { invalidDataTypes } from "./testData/testData";

//POSITIVE cases for creating a new client
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

        const json = await response.json();
        await checkSchema(
          json,
          oauthCreatedClientSchema,
          "JSON of the the created client does NOT match expected schema",
        );

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

//NEGATIVE cases on checking 401 and 403 errors
test.describe(
  "POST /clients - Create a new client without auth and permissions",
  { tag: [TAG.oauth, TAG.negative, TAG.regression, TAG.smoke] },
  () => {
    test.use({ isAuthorized: false });

    test("Create a new client without auth - should be 401 Error", async ({
      clientsController,
    }) => {
      const response =
        await test.step("Try to create a new client without auth", async () => {
          return await clientsController.createClient({ name: "test" });
        });
      await checkUnauthorizedStatusCode(response);
    });

    test("Create a new client without permissions - should be 403 Error", async ({
      apiClient,
      clientsController,
    }) => {
      await test.step("Take token of a client with READ permission", async () => {
        const result = await apiClient.loginWithCredentialsOfNewClient(
          "OnlyRead",
          ["read"],
        );
        const token = result.token;

        const response =
          await test.step("Try to create a new client with READ permission", async () => {
            return await clientsController.createClient(
              { name: "test" },
              {
                headers: { Authorization: `Bearer ${token}` },
                failOnStatusCode: false,
              },
            );
          });
        await checkForbiddenStatusCode(response);
      });
    });
  },
);

//NEGATIVE cases with incorrect data types
test.describe(
  "POST /clients - Create a new client: negative tests",
  { tag: [TAG.oauth, TAG.negative, TAG.regression] },
  () => {
    for (const { id, dataType, data } of invalidDataTypes) {
      test(`${id} Check the ability to create client with name = ${dataType}`, async ({
        clientsController,
      }) => {
        const response = await clientsController.createClientWithInvalidData({
          name: data,
        });
        await checkBadStatusCode(response);
      });
    }
  },
);
