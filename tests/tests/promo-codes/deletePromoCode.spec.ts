import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { PromoCodeBuilder } from "../../app/utils/builders/PromoCodeBuilder";
import { futureDate, randomCode } from "./testData/testData";

//Positive tests for deleting a promo code by an admin
test.describe(
  "DELETE /admin/courses/{courseId}/promo-codes/{promoCodeId} - delete promo code: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.promoCodes, TAG.courses] },
  () => {
    let courseId: string;
    let promoCodeId: string;

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

    test.beforeEach(
      "Prepare test data: create a new promo code",
      async ({ promoCodesController }) => {
        const data = new PromoCodeBuilder()
          .withCode(randomCode("DEL"))
          .withDiscountPercent(10)
          .withExpiresAt(futureDate())
          .build();
        const response = await promoCodesController.createPromoCode(
          courseId,
          data,
          { failOnStatusCode: true },
        );
        const json = await response.json();
        promoCodeId = json.id;
      },
    );

    test("Delete an existing promo code by admin - should be successful", async ({
      promoCodesController,
    }) => {
      const response =
        await test.step("Delete the created promo code", async () => {
          return await promoCodesController.deletePromoCode(
            courseId,
            promoCodeId,
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      const json = await response.json();
      expect.soft(json.success).toBe(true);

      await test.step("Verify the promo code is no longer present in the promo codes list", async () => {
        const responseList = await promoCodesController.getPromoCodes(
          courseId,
          { failOnStatusCode: true },
        );
        const jsonList = await responseList.json();
        expect
          .soft(
            jsonList.find(
              (promoCode: { id: string }) => promoCode.id === promoCodeId,
            ),
          )
          .toBeFalsy();
      });
    });
  },
);

//Negative test for deleting a promo code by a non-existing ID
test.describe(
  "DELETE /admin/courses/{courseId}/promo-codes/{promoCodeId} - delete promo code with non-existing ID: negative tests",
  {
    tag: [
      TAG.negative,
      TAG.regression,
      TAG.promoCodes,
      TAG.courses,
      TAG.nonExistingValues,
    ],
  },
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

    //! The route does not catch Prisma's "record not found" error on delete, so a
    //! non-existing promoCodeId currently produces an uncaught 500 with an empty body
    //! instead of a 404 - this looks like a real bug in
    //! src/app/api/admin/courses/[courseId]/promo-codes/[promoCodeId]/route.ts.
    test("Delete promo code with non-existing ID - returns an uncaught 500 error instead of 404", async ({
      promoCodesController,
    }) => {
      const response =
        await test.step("Try to delete a promo code with a non-existing ID", async () => {
          return await promoCodesController.deletePromoCode(
            courseId,
            "non-existing-promo-code-id",
            { failOnStatusCode: false },
          );
        });
      expect(response.status()).toBeLessThan(500);
    });
  },
);

//Negative tests for deleting a promo code without proper authorization
test.describe(
  "DELETE /admin/courses/{courseId}/promo-codes/{promoCodeId} - delete promo code without proper authorization: negative tests",
  {
    tag: [
      TAG.negative,
      TAG.regression,
      TAG.promoCodes,
      TAG.courses,
      TAG.permissions,
    ],
  },
  () => {
    test.use({ isAuthorized: false });

    let courseId: string;
    let promoCodeId: string;
    let adminToken: string;

    test.beforeAll(
      "Prepare test data: create a course and a promo code as admin",
      async ({
        coursesController,
        promoCodesController,
        oauthController,
        randomString,
      }) => {
        adminToken = await oauthController.takeAdminToken();

        const responseCourse = await coursesController.createCourse(
          { title: "Promo Code Course " + randomString },
          {
            headers: { Authorization: `Bearer ${adminToken}` },
            failOnStatusCode: true,
          },
        );
        const jsonCourse = await responseCourse.json();
        courseId = jsonCourse.id;

        const data = new PromoCodeBuilder()
          .withCode(randomCode("DELAUTH"))
          .withDiscountPercent(10)
          .withExpiresAt(futureDate())
          .build();
        const responsePromoCode = await promoCodesController.createPromoCode(
          courseId,
          data,
          {
            headers: { Authorization: `Bearer ${adminToken}` },
            failOnStatusCode: true,
          },
        );
        const jsonPromoCode = await responsePromoCode.json();
        promoCodeId = jsonPromoCode.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created promo code and course",
      async ({ coursesController, promoCodesController }) => {
        await promoCodesController.deletePromoCode(courseId, promoCodeId, {
          headers: { Authorization: `Bearer ${adminToken}` },
          failOnStatusCode: true,
        });
        await coursesController.deleteCourseById(courseId, {
          headers: { Authorization: `Bearer ${adminToken}` },
          failOnStatusCode: true,
        });
      },
    );

    test("Delete promo code without authorization - should be 401 error", async ({
      promoCodesController,
    }) => {
      const response =
        await test.step("Try to delete a promo code without authorization", async () => {
          return await promoCodesController.deletePromoCode(
            courseId,
            promoCodeId,
            { failOnStatusCode: false },
          );
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });

    test("Delete promo code as a client with READ permissions - should be 403 error", async ({
      promoCodesController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to delete a promo code as a client with READ permissions", async () => {
          return await promoCodesController.deletePromoCode(
            courseId,
            promoCodeId,
            {
              headers: { Authorization: `Bearer ${readClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("Delete promo code as a client with READ and WRITE permissions - should be 403 error", async ({
      promoCodesController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to delete a promo code as a client with READ and WRITE permissions", async () => {
          return await promoCodesController.deletePromoCode(
            courseId,
            promoCodeId,
            {
              headers: { Authorization: `Bearer ${readWriteClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("Delete promo code as a client with READ, WRITE, and ADMIN permissions - should be 403 error", async ({
      promoCodesController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to delete a promo code as a client with READ, WRITE, and ADMIN permissions", async () => {
          return await promoCodesController.deletePromoCode(
            courseId,
            promoCodeId,
            {
              headers: {
                Authorization: `Bearer ${readWriteAdminClientToken}`,
              },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });
  },
);
