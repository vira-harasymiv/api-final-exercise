import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { purchasesListResponseSchema } from "../../app/json-schemas/purchaseSchemas";

//Positive tests for listing the authenticated user's purchases
test.describe(
  "GET /purchases - list purchases: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.purchases] },
  () => {
    let courseId: string;
    let purchaseCourseId: string;

    test.beforeAll(
      "Prepare test data: purchase a course",
      async ({ apiClient, randomString, purchasesController }) => {
        const course = await apiClient.createPurchasableCourse(
          randomString,
          100,
        );
        courseId = course.courseId;
        const response = await purchasesController.purchaseCourse(
          courseId,
          {},
          { failOnStatusCode: true },
        );
        const json = await response.json();
        purchaseCourseId = json.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the course (cascades to the purchase)",
      async ({ coursesController }) => {
        await coursesController.deleteCourseById(courseId, {
          failOnStatusCode: true,
        });
      },
    );

    test("List purchases - should include the purchased course with its details", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Get the list of purchases", async () => {
          return await purchasesController.getPurchases({
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(json, purchasesListResponseSchema);

      await test.step("Verify the purchased course is present with the expected fields", async () => {
        const purchase = json.find(
          (item: { id: string }) => item.id === purchaseCourseId,
        );
        expect.soft(purchase).toBeTruthy();
        expect.soft(purchase.courseId).toBe(courseId);
      });
    });
  },
);

//Negative test for listing purchases without proper authorization
test.describe(
  "GET /purchases - list purchases without proper authorization: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.purchases, TAG.permissions] },
  () => {
    test.use({ isAuthorized: false });

    test("List purchases without authorization - should be 401 error", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Try to get the list of purchases without authorization", async () => {
          return await purchasesController.getPurchases({
            failOnStatusCode: false,
          });
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });
  },
);
