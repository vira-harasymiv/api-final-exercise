import { test } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkSuccessfulTokenResponse,
  checkSchema,
  checkInvalidGrantType,
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
          return clientsController.createClient(
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

    test("Verify taking token with Client Credentials Grant and only required fields", async ({
      oauthController,
    }) => {
      const response =
        await test.step("Take token with using Client Credentials Grant and only required fields", async () => {
          return oauthController.withClientIdAndSecret(
            {
              grant_type: "client_credentials",
              client_id: clientId,
              client_secret: clientSecret,
            },
            { failOnStatusCode: true },
          );
        });

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
        await test.step("Take token with using Client Credentials Grant and only required fields", async () => {
          return oauthController.withClientIdAndSecret(
            {
              grant_type: "client_credentials",
              client_id: clientId,
              client_secret: clientSecret,
              scope: "read write",
            },
            { failOnStatusCode: true },
          );
        });

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
    let clientCredentialsPayload: Object;

    test.beforeEach(async ({ clientsController, randomString }) => {
      const responseCreate =
        await test.step("Create a new client", async () => {
          return clientsController.createClient(
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

      clientCredentialsPayload = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      };
    });

    for (const {
      title,
      stepLabel,
      buildPayload,
      checkError,
    } of invalidCasesForClientCredentialsGrant) {
      test(title, async ({ oauthController }) => {
        const response = await test.step(stepLabel, async () =>
          oauthController.withClientIdAndSecret(
            buildPayload(clientId, clientSecret),
            {
              failOnStatusCode: false,
            },
          ),
        );
        await checkError(response);
      });
    }

    for (const { dataType, data, check } of invalidDataTypesForCredentials) {
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
            return oauthController.withClientIdAndSecret(payload as any, {
              failOnStatusCode: false,
            });
          });
        await check(response);
      });
    }

    for (const { dataType, data, check } of invalidDataTypesForCredentials) {
      test(`Logging with Client Secret = ${dataType} - should be 400 error`, async ({
        oauthController,
      }) => {
        const payload = {
          client_id: clientId,
          client_secret: data,
          grant_type: "client_credentials",
        };

        const response =
          await test.step(`Take token with client ID = ${dataType}`, async () => {
            return oauthController.withClientIdAndSecret(payload as any, {
              failOnStatusCode: false,
            });
          });
        await check(response);
      });
    }

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
            return oauthController.withClientIdAndSecret(payload as any, {
              failOnStatusCode: false,
            });
          });
        await checkInvalidGrantType(response);
      });
    }
  },
);
