import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkCreatedStatusCode,
  checkMandatoryHeaders,
  checkNotFoundStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { purchaseSchema } from "../../app/json-schemas/purchaseSchemas";

//Positive tests for purchasing a course without a promo code
test.describe(
  "POST /courses/{courseId}/purchase - purchase a course without a promo code: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.purchases, TAG.courses] },
  () => {
    let paidCourseId: string;
    let freeCourseId: string;

    const priceOfPaidCourse = 100;

    test.beforeAll(
      "Prepare test data: a paid course and a free course, both published",
      async ({ apiClient, randomString }) => {
        await test.step("1. Create a paid, published course", async () => {
          const result = await apiClient.createPurchasableCourse(
            "Paid Course " + randomString,
            priceOfPaidCourse,
          );
          paidCourseId = result.courseId;
        });

        await test.step("2. Create a free, published course", async () => {
          const result = await apiClient.createPurchasableCourse(
            "Free Course " + randomString,
            0,
          );
          freeCourseId = result.courseId;
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

    test("Purchase a paid course without Promo Code - should be successful at full price", async ({
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
        expect.soft(Number(json.amount)).toBe(priceOfPaidCourse);
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

    test("Purchase a free course - should be successful", async ({
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

      await test.step("Verify the purchase shows up in the purchases list", async () => {
        const responseList = await purchasesController.getPurchases({
          failOnStatusCode: true,
        });
        const jsonList = await responseList.json();
        const created = jsonList.find(
          (purchase: { id: string }) => purchase.id === json.id,
        );
        expect.soft(created).toBeTruthy();
        expect.soft(created.course.id).toBe(freeCourseId);
      });
    });
  },
);

//Negative tests for purchasing a course: without request body and non-existing course
test.describe(
  "POST /courses/{courseId}/purchase",
  { tag: [TAG.negative, TAG.regression, TAG.purchases, TAG.courses] },
  () => {
    let paidCourseId: string;

    test.beforeAll(
      "Prepare test data: create a paid published course",
      async ({ apiClient, randomString }) => {
        await test.step("1. Create a paid, published course", async () => {
          const result = await apiClient.createPurchasableCourse(
            "Paid Course " + randomString,
            200,
          );
          paidCourseId = result.courseId;
        });
      },
    );

    test.afterAll(
      "Clear test data: delete the created course",
      async ({ coursesController }) => {
        await test.step("Delete the paid course", async () => {
          await coursesController.deleteCourseById(paidCourseId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Purchase a non-existing course - should be 404 error", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Try to purchase a non-existing course", async () => {
          return await purchasesController.purchaseCourse(
            "non-existing-course-id",
            {},
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Course not found");
    });

    //! 500 Error is returned after purchasing a course without request body
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
