import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkCreatedResponse,
  checkSchema,
} from "../../app/utils/expect-helpers";
import { oauthCreatedClientSchema } from "../../app/json-schemas/oauthSchemas";
import { createClientPositiveCases } from "./testData/testData";

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
          return clientsController.createClient(buildPayload(name), {
            failOnStatusCode: true,
          });
        });

        await checkCreatedResponse(response);

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
