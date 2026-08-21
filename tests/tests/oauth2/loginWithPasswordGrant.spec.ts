import { test } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import { checkSchema } from "../../app/utils/general-expect-helpers";
import {
  checkSuccessfulTokenResponse,
  checkInvalidGrantType,
} from "./helpers/expect-helpers";
import {
  passwordGrantPayload,
  passwordGrantPayloadWithScope,
} from "./testData/payloads";
import {
  invalidDataTypes,
  testDataForInvalidEmail,
  invalidDataTypesForPassword,
} from "./testData/testData";
import { invalidCasesForPasswordGrant } from "./testData/testDataNegativeCases";
import { tokenResponseWithRefreshTokenSchema } from "../../app/json-schemas/oauthSchemas";

//Positive smoke tests for taking token with Password Grant
test.describe(
  "POST /token with Password Grant- positive tests",
  { tag: [TAG.oauth, TAG.smoke, TAG.passwordGrant] },
  () => {
    test.use({ isAuthorized: false });

    test("Verify taking token with Password Grant and only required fields", async ({
      oauthController,
    }) => {
      const response =
        await test.step("Take token with using Password Grant and only required fields", async () => {
          return await oauthController.withPasswordGrant(passwordGrantPayload, {
            failOnStatusCode: true,
          });
        });

      await checkSuccessfulTokenResponse(
        response,
        { expectRefreshToken: true },
        "read write admin",
      );

      const json = await response.json();
      await checkSchema(
        json,
        tokenResponseWithRefreshTokenSchema,
        "Password Grant Response JSON does NOT match expected schema",
      );
    });

    test("Verify taking token with Password Grant and optional scope field", async ({
      oauthController,
    }) => {
      const response =
        await test.step("Take token with using Password Grant and optional scope field", async () => {
          return await oauthController.withPasswordGrant(
            passwordGrantPayloadWithScope,
            { failOnStatusCode: true },
          );
        });

      await checkSuccessfulTokenResponse(
        response,
        { expectRefreshToken: true },
        "read write admin",
      );

      const json = await response.json();
      await checkSchema(
        json,
        tokenResponseWithRefreshTokenSchema,
        "Password Grant Response JSON does NOT match expected schema",
      );
    });
  },
);

//Negative tests for taking token with Password Grant
test.describe(
  "POST /token with Password Grant - negative tests",
  { tag: [TAG.negative, TAG.oauth, TAG.regression, TAG.passwordGrant] },
  () => {
    test.use({ isAuthorized: false });

    for (const {
      title,
      stepLabel,
      payload,
      checkError,
    } of invalidCasesForPasswordGrant) {
      test(title, async ({ oauthController }) => {
        const response = await test.step(stepLabel, async () => {
          return await oauthController.withPasswordGrant(payload, {
            failOnStatusCode: false,
          });
        });
        await checkError(response);
      });
    }

    for (const { id, dataType, data } of invalidDataTypes) {
      test(`${id} Check logging with grant data type = ${dataType} `, async ({
        oauthController,
      }) => {
        const payload = {
          ...passwordGrantPayload,
          grant_type: data,
        };

        const response =
          await test.step(`Login with grant data type = ${dataType}`, async () => {
            return await oauthController.withInvalidPasswordGrant(payload);
          });
        await checkInvalidGrantType(response);
      });
    }

    for (const { id, dataType, data, check } of testDataForInvalidEmail) {
      test(`${id} Check logging with invalid email = ${dataType} `, async ({
        oauthController,
      }) => {
        const payload = {
          ...passwordGrantPayload,
          email: data,
        };

        const response =
          await test.step(`Login with invalid email = ${dataType}`, async () => {
            return await oauthController.withInvalidPasswordGrant(payload);
          });
        await check(response);
      });
    }

    for (const { id, dataType, data, check } of invalidDataTypesForPassword) {
      test(`${id} Check logging with invalid password = ${dataType} `, async ({
        oauthController,
      }) => {
        const payload = {
          ...passwordGrantPayload,
          password: data,
        };

        const response =
          await test.step(`Login with invalid password = ${dataType}`, async () => {
            return await oauthController.withInvalidPasswordGrant(payload);
          });
        await check(response);
      });
    }
  },
);
