import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkCreatedStatusCode,
  checkMandatoryHeaders,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { purchaseSchema } from "../../app/json-schemas/purchaseSchemas";
import { PromoCodeBuilder } from "../../app/utils/builders/PromoCodeBuilder";
import {
  createPurchasableCourse,
  futureDate,
  randomCode,
} from "./testData/testData";

//Positive tests for purchasing a course without a promo code
test.describe(
  "POST /courses/{courseId}/purchase - purchase a course without a promo code: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.purchases, TAG.courses] },
  () => {
    let paidCourseId: string;
    let freeCourseId: string;

    test.beforeAll(
      "Prepare test data: a paid course and a free course, both published",
      async ({ coursesController, randomString }) => {
        await test.step("1. Create a paid, published course", async () => {
          ({ courseId: paidCourseId } = await createPurchasableCourse(
            coursesController,
            "Paid Course " + randomString,
            100,
          ));
        });

        await test.step("2. Create a free, published course", async () => {
          ({ courseId: freeCourseId } = await createPurchasableCourse(
            coursesController,
            "Free Course " + randomString,
            0,
          ));
        });
      },
    );

    test.afterAll(
      "Clear test data: delete the created courses",
      async ({ coursesController }) => {
        await test.step("Delete the paid course", async () => {
          await coursesController.deleteCourseById(paidCourseId, {
            failOnStatusCode: true,
          });
        });

        await test.step("Delete the free course", async () => {
          await coursesController.deleteCourseById(freeCourseId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Purchase a paid course with an empty request body - should be successful at full price", async ({
      purchasesController,
    }) => {
      const response = await test.step("Purchase the course", async () => {
        return await purchasesController.purchaseCourse(
          paidCourseId,
          {},
          { failOnStatusCode: true },
        );
      });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      await checkSchema(json, purchaseSchema);

      await test.step("Verify the purchase fields", async () => {
        expect.soft(json.courseId).toBe(paidCourseId);
        expect.soft(Number(json.amount)).toBe(100);
        expect.soft(json.promoCode).toBeNull();
      });

      await test.step("Verify the purchase shows up in the purchases list", async () => {
        const responseList = await purchasesController.getPurchases({
          failOnStatusCode: true,
        });
        const jsonList = await responseList.json();
        const created = jsonList.find(
          (purchase: { id: string }) => purchase.id === json.id,
        );
        expect.soft(created).toBeTruthy();
        expect.soft(created.course.id).toBe(paidCourseId);
      });
    });

    test("Purchase a free course - should be successful at zero amount", async ({
      purchasesController,
    }) => {
      const response = await test.step("Purchase the free course", async () => {
        return await purchasesController.purchaseCourse(
          freeCourseId,
          {},
          { failOnStatusCode: true },
        );
      });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      await checkSchema(json, purchaseSchema);

      await test.step("Verify the amount is zero and no promo code is applied", async () => {
        expect.soft(json.courseId).toBe(freeCourseId);
        expect.soft(Number(json.amount)).toBe(0);
        expect.soft(json.promoCode).toBeNull();
      });
    });

    //! Omitting the request body entirely (instead of sending {}) makes the route's
    //! `req.json()` throw on an empty body, producing an uncaught 500 with no JSON body
    test("Purchase a course without sending any request body - should be error", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Try to purchase without a request body", async () => {
          return await purchasesController.purchaseCourse(
            paidCourseId,
            undefined,
            {
              failOnStatusCode: false,
            },
          );
        });
      expect(response.status()).toBeLessThan(500);
    });
  },
);

//Positive tests for purchasing a course with a promo code
test.describe(
  "POST /courses/{courseId}/purchase - purchase a course with a promo code: positive tests",
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
    let code: string;
    let promoCodeId: string;

    test.beforeAll(
      "Create valid promo codes",
      async ({ coursesController, randomString, promoCodesController }) => {
        ({ courseId } =
          await test.step("1. Create a purchasable course", async () => {
            return await createPurchasableCourse(
              coursesController,
              "Active Promo Purchase Course " + randomString,
              100,
            );
          }));

        code = randomCode("ACTIVE");

        await test.step("2. Create an active promo code with a 50% discount", async () => {
          const data = new PromoCodeBuilder()
            .withCode(code)
            .withDiscountPercent(50)
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

    test.afterAll(
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
      coursesController,
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
        expect.soft(json.courseId).toBe(courseId);
        expect.soft(Number(json.amount)).toBe(50);
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
  },
);

//Negative test for purchasing a course without proper authorization
test.describe(
  "POST /courses/{courseId}/purchase - purchase a course without proper authorization: negative tests",
  {
    tag: [
      TAG.negative,
      TAG.regression,
      TAG.purchases,
      TAG.courses,
      TAG.permissions,
    ],
  },
  () => {
    test.use({ isAuthorized: false });

    test("Purchase a course without authorization - should be 401 error", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Try to purchase a course without authorization", async () => {
          return await purchasesController.purchaseCourse(
            "any-course-id",
            {},
            { failOnStatusCode: false },
          );
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });
  },
);
