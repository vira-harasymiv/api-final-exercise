import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkBadStatusCode,
  checkMandatoryHeaders,
  checkSchema,
  checkSuccessfulTokenResponse,
} from "../../app/utils/expect-helpers";
import {
  invalidDataTypesForCredentials,
  invalidDataTypes,
} from "./testData/testData";
import { invalidCasesForClientCredentialsGrant } from "./testData/testDataNegativeCases";
import { tokenResponseSchema } from "../../app/json-schemas/oauthSchemas";

//Positive smoke tests for taking token with Client Credentials Grant
test.describe(
  "POST /token with Client Credentials Grant - positive tests",
  { tag: [TAG.smoke, TAG.oauth, TAG.clientCredentialsGrant] },
  () => {
    let clientId: string;
    let clientSecret: string;

    test.beforeEach(async ({ clientsController, randomString }) => {
      const responseCreate =
        await test.step("Create a new client", async () => {
          return await clientsController.createClient(
            {
              name: randomString,
              grants: ["client_credentials"],
              scopes: ["read", "write"],
            },
            { failOnStatusCode: true },
          );
        });
      const jsonCreate = await responseCreate.json();
      clientId = jsonCreate.clientId;
      clientSecret = jsonCreate.clientSecret;
    });

    test.afterEach(
      "Deactivate the created client",
      async ({ clientsController }) => {
        await test.step("Deactivate the created client", async () => {
          await clientsController.deactivateClient(clientId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Verify taking token with Client Credentials Grant and only required fields", async ({
      oauthController,
    }) => {
      const response =
        await test.step("Take token with using Client Credentials Grant and only required fields", async () => {
          return await oauthController.withClientIdAndSecret(
            {
              grant_type: "client_credentials",
              client_id: clientId,
              client_secret: clientSecret,
            },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkSuccessfulTokenResponse(
        response,
        { expectRefreshToken: false },
        "read write",
      );

      const json = await response.json();
      await checkSchema(
        json,
        tokenResponseSchema,
        "Client Credentials Grant Response JSON does NOT match expected schema",
      );
    });

    test("Verify taking token with Client Credentials Grant and optional scope field", async ({
      oauthController,
    }) => {
      const response =
        await test.step("Take token with using Client Credentials Grant and and optional scope field", async () => {
          return await oauthController.withClientIdAndSecret(
            {
              grant_type: "client_credentials",
              client_id: clientId,
              client_secret: clientSecret,
              scope: "read write",
            },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkSuccessfulTokenResponse(
        response,
        { expectRefreshToken: false },
        "read write",
      );

      const json = await response.json();
      await checkSchema(
        json,
        tokenResponseSchema,
        "Client Credentials Grant Response JSON does NOT match expected schema",
      );
    });
  },
);

//Negative tests for taking token with Client Credentials Grant
test.describe(
  "POST /token with Client Credentials Grant - negative tests",
  {
    tag: [TAG.negative, TAG.oauth, TAG.clientCredentialsGrant, TAG.regression],
  },
  () => {
    let clientId: string;
    let clientSecret: string;

    test.beforeEach(async ({ clientsController, randomString }) => {
      const responseCreate =
        await test.step("Create a new client", async () => {
          return await clientsController.createClient(
            {
              name: randomString,
              grants: ["client_credentials"],
              scopes: ["read", "write"],
            },
            { failOnStatusCode: true },
          );
        });
      const jsonCreate = await responseCreate.json();
      clientId = jsonCreate.clientId;
      clientSecret = jsonCreate.clientSecret;
    });

    test.afterEach(
      "Deactivate the created clients",
      async ({ clientsController }) => {
        await test.step("Deactivate the created client", async () => {
          await clientsController.deactivateClient(clientId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    for (const {
      title,
      stepLabel,
      buildPayload,
      checkStatusCode,
      error,
      errorDescription,
    } of invalidCasesForClientCredentialsGrant) {
      test(title, async ({ oauthController }) => {
        const response = await test.step(
          stepLabel,
          async () =>
            await oauthController.withClientIdAndSecret(
              buildPayload(clientId, clientSecret),
              {
                failOnStatusCode: false,
              },
            ),
        );
        (await checkMandatoryHeaders(response),
          await checkStatusCode(response));
        await test.step("Check the error message", async () => {
          const json = await response.json();
          expect.soft(json.error).toBe(error);
          expect.soft(json.error_description).toBe(errorDescription);
        });
      });
    }

    // Wrong data type (number, null, array, etc.) substituted into client_id
    for (const {
      dataType,
      data,
      errorDescription,
    } of invalidDataTypesForCredentials) {
      test(`Logging with client ID = ${dataType} - should be 400 error`, async ({
        oauthController,
      }) => {
        const payload = {
          client_id: data,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        };

        const response =
          await test.step(`Take token with client ID = ${dataType}`, async () => {
            return await oauthController.withClientIdAndSecret(payload as any, {
              failOnStatusCode: false,
            });
          });
        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        await test.step("Check the error message", async () => {
          const json = await response.json();
          expect.soft(json.error).toBe("invalid_request");
          expect.soft(json.error_description).toBe(errorDescription);
        });
      });
    }

    // Same invalid data types, this time substituted into client_secret
    for (const {
      dataType,
      data,
      errorDescription,
    } of invalidDataTypesForCredentials) {
      test(`Logging with Client Secret = ${dataType} - should be 400 error`, async ({
        oauthController,
      }) => {
        const payload = {
          client_id: clientId,
          client_secret: data,
          grant_type: "client_credentials",
        };

        const response =
          await test.step(`Take token with client secret = ${dataType}`, async () => {
            return await oauthController.withClientIdAndSecret(payload as any, {
              failOnStatusCode: false,
            });
          });
        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        await test.step("Check the error message", async () => {
          const json = await response.json();
          expect.soft(json.error).toBe("invalid_request");
          expect.soft(json.error_description).toBe(errorDescription);
        });
      });
    }

    // Invalid data types substituted into grant_type
    for (const { dataType, data } of invalidDataTypes) {
      test(`Logging with grant type = ${dataType} - should be 400 error`, async ({
        oauthController,
      }) => {
        const payload = {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: data,
        };

        const response =
          await test.step(`Take token with grant type = ${dataType}`, async () => {
            return await oauthController.withClientIdAndSecret(payload as any, {
              failOnStatusCode: false,
            });
          });
        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        await test.step("Check the error message", async () => {
          const json = await response.json();
          expect.soft(json.error).toBe("invalid_request");
          expect
            .soft(json.error_description)
            .toBe(
              "Invalid discriminator value. Expected 'password' | 'client_credentials' | 'refresh_token'",
            );
        });
      });
    }
  },
);
