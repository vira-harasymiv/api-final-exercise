import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { promoCodesListResponseSchema } from "../../app/json-schemas/promoCodeSchemas";
import { PromoCodeBuilder } from "../../app/utils/builders/PromoCodeBuilder";
import { futureDate, randomCode } from "./testData/testData";

//Positive tests for listing the promo codes of a course by an admin
test.describe(
  "GET /admin/courses/{courseId}/promo-codes - list promo codes: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.promoCodes, TAG.courses] },
  () => {
    let courseId: string;
    const code = randomCode("LIST");
    let promoCodeId: string;

    test.beforeEach(
      "Prepare test data: create a course and promo code",
      async ({ coursesController, randomString, promoCodesController }) => {
        const response = await test.step("Create a course", async () => {
          return await coursesController.createCourse(
            { title: "Promo Code Course " + randomString },
            { failOnStatusCode: true },
          );
        });
        const json = await response.json();
        courseId = json.id;

        await test.step("Create a promo code for the course", async () => {
          const data = new PromoCodeBuilder()
            .withCode(code)
            .withDiscountPercent(10)
            .withExpiresAt(futureDate())
            .build();
          const responseCreate = await promoCodesController.createPromoCode(
            courseId,
            data,
            { failOnStatusCode: true },
          );
          const jsonCreate = await responseCreate.json();
          promoCodeId = jsonCreate.id;
        });
      },
    );

    test.afterEach(
      "Clear test data: delete the created course",
      async ({ coursesController, promoCodesController }) => {
        await test.step("Delete the created course", async () => {
          await coursesController.deleteCourseById(courseId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Get promo codes list - should be successful", async ({
      promoCodesController,
    }) => {
      const response = await test.step("Get the promo codes list", async () => {
        return await promoCodesController.getPromoCodes(courseId, {
          failOnStatusCode: true,
        });
      });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      const json = await response.json();
      await checkSchema(json, promoCodesListResponseSchema);

      await test.step("Verify the created promo code is present with the correct usage count", async () => {
        const created = json.find(
          (promoCode: { id: string }) => promoCode.id === promoCodeId,
        );
        expect.soft(created).toBeTruthy();
        expect.soft(created.code).toBe(code);
        expect.soft(created._count.usages).toBe(0);
      });
    });
  },
);

//Negative test for listing promo codes of a non-existing course
test.describe(
  "GET /admin/courses/{courseId}/promo-codes - list promo codes for a non-existing course: negative tests",
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
    //! The route does not verify that the course exists before querying its promo codes,
    //! so a non-existing courseId returns 200 with an empty array instead of a 404.
    test("List promo codes for a non-existing course - returns 200 ", async ({
      promoCodesController,
    }) => {
      const response =
        await test.step("Try to get the promo codes list for a non-existing course", async () => {
          return await promoCodesController.getPromoCodes(
            "non-existing-course-id",
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      const json = await response.json();
      expect.soft(json).toEqual([]);
    });
  },
);

//Negative tests for listing promo codes without proper authorization
test.describe(
  "GET /admin/courses/{courseId}/promo-codes - list promo codes without proper authorization: negative tests",
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
    let adminToken: string;

    test.beforeAll(
      "Prepare test data: create a course as admin",
      async ({ coursesController, oauthController, randomString }) => {
        adminToken = await oauthController.takeAdminToken();

        const response = await coursesController.createCourse(
          { title: "Promo Code Course " + randomString },
          {
            headers: { Authorization: `Bearer ${adminToken}` },
            failOnStatusCode: true,
          },
        );
        const json = await response.json();
        courseId = json.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created course",
      async ({ coursesController }) => {
        await coursesController.deleteCourseById(courseId, {
          headers: { Authorization: `Bearer ${adminToken}` },
          failOnStatusCode: true,
        });
      },
    );

    test("List promo codes without authorization - should be 401 error", async ({
      promoCodesController,
    }) => {
      const response =
        await test.step("Try to list promo codes without authorization", async () => {
          return await promoCodesController.getPromoCodes(courseId, {
            failOnStatusCode: false,
          });
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });

    test("List promo codes as a client with READ role - should be 403 error", async ({
      promoCodesController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to list promo codes as a client with READ role", async () => {
          return await promoCodesController.getPromoCodes(courseId, {
            headers: { Authorization: `Bearer ${readClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("List promo codes as a client with READ and WRITE role - should be 403 error", async ({
      promoCodesController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to list promo codes as a client with READ and WRITE role", async () => {
          return await promoCodesController.getPromoCodes(courseId, {
            headers: { Authorization: `Bearer ${readWriteClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("List promo codes as a client with READ, WRITE, and ADMIN role - should be 403 error", async ({
      promoCodesController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to list promo codes as a client with READ, WRITE, and ADMIN role", async () => {
          return await promoCodesController.getPromoCodes(courseId, {
            headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });
  },
);
