import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkBadStatusCode,
  checkConflictStatusCode,
  checkMandatoryHeaders,
} from "../../app/utils/expect-helpers";
import { PromoCodeBuilder } from "../../app/utils/builders/PromoCodeBuilder";
import {
  futureDate,
  invalidCodes,
  invalidDataTypesForCode,
  invalidDiscountPercents,
  invalidExpiresAtValues,
  invalidMaxUsesValues,
  randomCode,
} from "./testData/testData";

//Negative tests for creating a promo code
test.describe(
  "POST /admin/courses/{courseId}/promo-codes - create promo code with invalid code: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.promoCodes, TAG.courses] },
  () => {
    let courseId: string;

    test.beforeAll(
      "Prepare test data: create a course to attach promo codes to",
      async ({ coursesController, randomString }) => {
        const response = await coursesController.createCourse(
          { title: "Promo Code Course " + randomString },
          { failOnStatusCode: true },
        );
        const json = await response.json();
        courseId = json.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created course",
      async ({ coursesController }) => {
        await coursesController.deleteCourseById(courseId, {
          failOnStatusCode: true,
        });
      },
    );

    //Negative tests for creating a promo code with an invalid code
    for (const { id, description, code, expectedError } of invalidCodes) {
      test(`${id}. Create a promo code with ${description} - should be 400 error`, async ({
        promoCodesController,
      }) => {
        const data = new PromoCodeBuilder()
          .withDiscountPercent(10)
          .withExpiresAt(futureDate())
          .build();
        if (code !== undefined) data.code = code;

        const response =
          await test.step(`Try to create a promo code with ${description}`, async () => {
            return await promoCodesController.createPromoCodeWithInvalidData(
              courseId,
              data,
              { failOnStatusCode: false },
            );
          });

        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        const json = await response.json();
        expect.soft(json.error).toBe(expectedError);
      });
    }

    //Negative tests for creating a promo code with invalid code data types
    for (const {
      id,
      dataType,
      data,
      expectedError,
    } of invalidDataTypesForCode) {
      test(
        `${id}. Create a promo code using an invalid data type for code = ${dataType} - should be 400 error`,
        { tag: [TAG.invalidDataTypes] },
        async ({ promoCodesController }) => {
          const response =
            await test.step(`Try to create a promo code with code = ${dataType}`, async () => {
              return await promoCodesController.createPromoCodeWithInvalidData(
                courseId,
                {
                  code: data,
                  discountPercent: 10,
                  expiresAt: futureDate(),
                },
                { failOnStatusCode: false },
              );
            });

          await checkMandatoryHeaders(response);
          await checkBadStatusCode(response);
          const json = await response.json();
          expect.soft(json.error).toBe(expectedError);
        },
      );
    }

    //Negative tests for creating a promo code with duplicate code
    test("Create a promo code with a code that already exists - should be 409 error", async ({
      promoCodesController,
    }) => {
      const code = randomCode("DUP");
      const data = new PromoCodeBuilder()
        .withCode(code)
        .withDiscountPercent(10)
        .withExpiresAt(futureDate())
        .build();
      let promoCodeId: string;

      //!ARRANGE
      await test.step("Create the first promo code with this code", async () => {
        const response = await promoCodesController.createPromoCode(
          courseId,
          data,
          { failOnStatusCode: true },
        );
        const json = await response.json();
        promoCodeId = json.id;
      });

      //!ACT
      const response =
        await test.step("Try to create a second promo code with the same code", async () => {
          return await promoCodesController.createPromoCode(courseId, data, {
            failOnStatusCode: false,
          });
        });

      //!ASSERT
      await checkMandatoryHeaders(response);
      await checkConflictStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Promo code with this code already exists");
    });

    //Negative tests for creating a promo code with an invalid discountPercent
    for (const {
      id,
      description,
      data,
      expectedError,
    } of invalidDiscountPercents) {
      test(`${id}. Create a promo code with discountPercent = ${description} - should be 400 error`, async ({
        promoCodesController,
      }) => {
        const body: Record<string, unknown> = {
          code: randomCode("DISC"),
          expiresAt: futureDate(),
        };
        if (data !== undefined) body.discountPercent = data;

        const response =
          await test.step(`Try to create a promo code with discountPercent = ${description}`, async () => {
            return await promoCodesController.createPromoCodeWithInvalidData(
              courseId,
              body,
              { failOnStatusCode: false },
            );
          });

        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        const json = await response.json();
        expect.soft(json.error).toBe(expectedError);
      });
    }

    //Negative tests for creating a promo code with an invalid expiresAt
    for (const {
      id,
      description,
      data,
      expectedError,
    } of invalidExpiresAtValues) {
      test(`${id}. Create a promo code with expiresAt = ${description} - should be 400 error`, async ({
        promoCodesController,
      }) => {
        const body: Record<string, unknown> = {
          code: randomCode("EXP"),
          discountPercent: 10,
        };
        if (data !== undefined) body.expiresAt = data;

        const response =
          await test.step(`Try to create a promo code with expiresAt = ${description}`, async () => {
            return await promoCodesController.createPromoCodeWithInvalidData(
              courseId,
              body,
              { failOnStatusCode: false },
            );
          });

        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        const json = await response.json();
        expect.soft(json.error).toBe(expectedError);
      });
    }

    //Negative tests for creating a promo code with an invalid optional maxUses
    for (const {
      id,
      description,
      data,
      expectedError,
    } of invalidMaxUsesValues) {
      test(`${id}. Create a promo code with maxUses = ${description} - should be 400 error`, async ({
        promoCodesController,
      }) => {
        const response =
          await test.step(`Try to create a promo code with maxUses = ${description}`, async () => {
            return await promoCodesController.createPromoCodeWithInvalidData(
              courseId,
              {
                code: randomCode("MAXU"),
                discountPercent: 10,
                maxUses: data,
                expiresAt: futureDate(),
              },
              { failOnStatusCode: false },
            );
          });

        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        const json = await response.json();
        expect.soft(json.error).toBe(expectedError);
      });
    }
  },
);
