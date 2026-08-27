import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkNotFoundStatusCode,
  checkOKStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { promoCodeSchema } from "../../app/json-schemas/promoCodeSchemas";
import { PromoCodeBuilder } from "../../app/utils/builders/PromoCodeBuilder";
import { futureDate, randomCode } from "./testData/testData";

//Positive tests for toggling a promo code's active status by an admin
test.describe(
  "PATCH /admin/courses/{courseId}/promo-codes/{promoCodeId} - toggle promo code: positive tests",
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
      "Prepare test data: create a new active promo code",
      async ({ promoCodesController }) => {
        const data = new PromoCodeBuilder()
          .withCode(randomCode("TGL"))
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

    test.afterEach(
      "Clear test data: delete the created promo code",
      async ({ promoCodesController }) => {
        await promoCodesController.deletePromoCode(courseId, promoCodeId, {
          failOnStatusCode: true,
        });
      },
    );

    test("Toggle an active promo code - should be deactivated", async ({
      promoCodesController,
    }) => {
      const response =
        await test.step("Toggle the promo code's active status", async () => {
          return await promoCodesController.togglePromoCode(
            courseId,
            promoCodeId,
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(json, promoCodeSchema);

      await test.step("Verify the promo code is now inactive", async () => {
        expect.soft(json.id).toBe(promoCodeId);
        expect.soft(json.isActive).toBe(false);
      });

      await test.step("Verify the change is reflected in the promo codes list", async () => {
        const responseList = await promoCodesController.getPromoCodes(
          courseId,
          { failOnStatusCode: true },
        );
        const jsonList = await responseList.json();
        const updated = jsonList.find(
          (promoCode: { id: string }) => promoCode.id === promoCodeId,
        );
        expect.soft(updated.isActive).toBe(false);
      });
    });

    test("Toggle a promo code twice - should return to the active status", async ({
      promoCodesController,
    }) => {
      await test.step("Toggle the promo code's active status the first time", async () => {
        await promoCodesController.togglePromoCode(courseId, promoCodeId, {
          failOnStatusCode: true,
        });
      });

      const response =
        await test.step("Toggle the promo code's active status the second time", async () => {
          return await promoCodesController.togglePromoCode(
            courseId,
            promoCodeId,
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      expect.soft(json.isActive).toBe(true);
    });
  },
);

//Negative test for toggling a promo code with a non-existing ID
test.describe(
  "PATCH /admin/courses/{courseId}/promo-codes/{promoCodeId} - toggle promo code with non-existing ID: negative tests",
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

    test("Toggle promo code with a non-existing ID - should be 404 error", async ({
      promoCodesController,
    }) => {
      const response =
        await test.step("Try to toggle a promo code with a non-existing ID", async () => {
          return await promoCodesController.togglePromoCode(
            courseId,
            "non-existing-promo-code-id",
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Not found");
    });
  },
);

//Negative tests for toggling a promo code without proper authorization
test.describe(
  "PATCH /admin/courses/{courseId}/promo-codes/{promoCodeId} - toggle promo code without proper authorization: negative tests",
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
          .withCode(randomCode("TGLAUTH"))
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

    test("Toggle promo code without authorization - should be 401 error", async ({
      promoCodesController,
    }) => {
      const response =
        await test.step("Try to toggle a promo code without authorization", async () => {
          return await promoCodesController.togglePromoCode(
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

    test("Toggle promo code as a client with READ role - should be 403 error", async ({
      promoCodesController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to toggle a promo code as a client with READ role", async () => {
          return await promoCodesController.togglePromoCode(
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

    test("Toggle promo code as a client with READ and WRITE role - should be 403 error", async ({
      promoCodesController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to toggle a promo code as a client with READ and WRITE role", async () => {
          return await promoCodesController.togglePromoCode(
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

    test("Toggle promo code as a client with READ, WRITE, and ADMIN role - should be 403 error", async ({
      promoCodesController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to toggle a promo code as a client with READ, WRITE, and ADMIN role", async () => {
          return await promoCodesController.togglePromoCode(
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
