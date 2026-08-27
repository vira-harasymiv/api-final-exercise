import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkCreatedStatusCode,
  checkMandatoryHeaders,
  checkSchema,
} from "../../app/utils/expect-helpers";
import { purchaseSchema } from "../../app/json-schemas/purchaseSchemas";
import { PromoCodeBuilder } from "../../app/utils/builders/PromoCodeBuilder";
import { futureDate, randomCode } from "./testData/testData";

//Positive tests for purchasing a course with a valid and non-existing promo code
test.describe(
  "POST /courses/{courseId}/purchase - purchase a course with a valid and non-existing promo code",
  {
    tag: [
      TAG.smoke,
      TAG.regression,
      TAG.purchases,
      TAG.courses,
      TAG.promoCodes,
    ],
  },
  () => {
    let courseId: string;
    let promoCodeId: string;
    let code: string;

    const coursePrice = 100;
    const discountPercent = 50;

    test.beforeEach(
      "Create valid promo codes",
      async ({ apiClient, randomString, promoCodesController }) => {
        const result =
          await test.step("1. Create a purchasable course", async () => {
            return await apiClient.createPurchasableCourse(
              "Active Promo Purchase Course " + randomString,
              coursePrice,
            );
          });

        courseId = result.courseId;

        code = randomCode("ACTIVE");

        await test.step("2. Create an active promo code with a 50% discount", async () => {
          const data = new PromoCodeBuilder()
            .withCode(code)
            .withDiscountPercent(discountPercent)
            .withExpiresAt(futureDate())
            .build();
          const responsePromo = await promoCodesController.createPromoCode(
            courseId,
            data,
            { failOnStatusCode: true },
          );
          const jsonPromo = await responsePromo.json();
          promoCodeId = jsonPromo.id;
        });
      },
    );

    test.afterEach(
      "Delete the created course",
      async ({ coursesController }) => {
        await test.step("Delete the created course", async () => {
          await coursesController.deleteCourseById(courseId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Purchase a course with an active promo code - discount should be applied", async ({
      purchasesController,
      promoCodesController,
    }) => {
      const response =
        await test.step("Purchase the course using the active promo code", async () => {
          return await purchasesController.purchaseCourse(
            courseId,
            { promoCode: code },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      await checkSchema(json, purchaseSchema);

      await test.step("Verify the discount was applied to the purchase amount", async () => {
        const expectedPrice =
          coursePrice - (coursePrice * discountPercent) / 100;
        expect.soft(json.courseId).toBe(courseId);
        expect.soft(Number(json.amount)).toBe(expectedPrice);
        expect.soft(json.promoCode).toBe(code);
      });

      await test.step("Verify the promo code's usage counter was incremented", async () => {
        const responsePromoCodes = await promoCodesController.getPromoCodes(
          courseId,
          { failOnStatusCode: true },
        );
        const jsonPromoCodes = await responsePromoCodes.json();
        const usedPromoCode = jsonPromoCodes.find(
          (promoCode: { id: string }) => promoCode.id === promoCodeId,
        );
        expect.soft(usedPromoCode.currentUses).toBe(1);
        expect.soft(usedPromoCode._count.usages).toBe(1);
      });
    });

    test("Purchase a course with an non-existing promo code - should succeed at full price without applying the discount", async ({
      purchasesController,
      promoCodesController,
    }) => {
      const response =
        await test.step("Purchase the course using a promo code that was never created", async () => {
          return await purchasesController.purchaseCourse(
            courseId,
            { promoCode: "DOES-NOT-EXIST" },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      await test.step("Verify the purchase was charged at full price with no promo code applied", async () => {
        expect.soft(Number(json.amount)).toBe(coursePrice);
        expect.soft(json.promoCode).toBeNull();
      });

      await test.step("Verify the promo code's usage counter was NOT incremented", async () => {
        const responsePromoCodes = await promoCodesController.getPromoCodes(
          courseId,
          { failOnStatusCode: true },
        );
        const jsonPromoCodes = await responsePromoCodes.json();
        const usedPromoCode = jsonPromoCodes.find(
          (promoCode: { id: string }) => promoCode.id === promoCodeId,
        );
        expect.soft(usedPromoCode.currentUses).toBe(0);
        expect.soft(usedPromoCode._count.usages).toBe(0);
      });
    });
  },
);
