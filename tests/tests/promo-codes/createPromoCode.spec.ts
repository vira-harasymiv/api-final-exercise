import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkCreatedStatusCode,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkNotFoundStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { promoCodeListItemSchema } from "../../app/json-schemas/promoCodeSchemas";
import { PromoCodeBuilder } from "../../app/utils/builders/PromoCodeBuilder";
import { futureDate, randomCode } from "./testData/testData";
import { prisma } from "@/lib/prisma";

//Positive tests for creating a promo code for a course by an admin
test.describe(
  "POST /admin/courses/{courseId}/promo-codes - create promo code: positive tests",
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

    test.afterEach(
      "Clear test data: delete the created promo code",
      async ({ promoCodesController }) => {
        await promoCodesController.deletePromoCode(courseId, promoCodeId, {
          failOnStatusCode: true,
        });
      },
    );

    test("Create a promo code with only the required fields - should be successful with defaults applied", async ({
      promoCodesController,
    }) => {
      const code = randomCode("REQ");
      const expiresAt = futureDate();
      const data = new PromoCodeBuilder()
        .withCode(code)
        .withDiscountPercent(10)
        .withExpiresAt(expiresAt)
        .build();

      const response = await test.step("Create a new promo code", async () => {
        return await promoCodesController.createPromoCode(courseId, data, {
          failOnStatusCode: true,
        });
      });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      promoCodeId = json.id;

      await test.step("Verify the fields and defaults in the response", async () => {
        expect.soft(json.code).toBe(code);
        expect.soft(json.courseId).toBe(courseId);
        expect.soft(json.discountPercent).toBe(10);
        expect.soft(json.maxUses).toBeNull();
        expect.soft(json.currentUses).toBe(0);
        expect.soft(json.isActive).toBe(true);
      });

      await test.step("Check if the promo code has been created", async () => {
        const responseList = await promoCodesController.getPromoCodes(
          courseId,
          { failOnStatusCode: true },
        );
        const jsonList = await responseList.json();
        await checkSchema(jsonList, promoCodeListItemSchema.array());
        const created = jsonList.find(
          (promoCode: { id: string }) => promoCode.id === promoCodeId,
        );
        expect.soft(created).toBeTruthy();
        expect.soft(created.code).toBe(code);
      });

      await test.step("Check the created promo code in db", async () => {
        const createdPromoCode = await prisma.promoCode.findFirst({
          where: { id: promoCodeId },
        });
        expect.soft(createdPromoCode).not.toBeNull;
        expect.soft(createdPromoCode?.code).toBe(code);
        expect.soft(createdPromoCode?.courseId).toBe(courseId);
        expect.soft(createdPromoCode?.discountPercent).toBe(10);
        expect.soft(createdPromoCode?.maxUses).toBeNull;
        expect.soft(createdPromoCode?.currentUses).toBe(0);
        expect.soft(createdPromoCode?.isActive).toBe(true);
        expect.soft(createdPromoCode?.expiresAt.toISOString()).toBe(expiresAt);
      });
    });

    test("Create a promo code with all fields, including maxUses - should be successful", async ({
      promoCodesController,
    }) => {
      const code = randomCode("FULL");
      const expiresAt = futureDate();
      const data = new PromoCodeBuilder()
        .withCode(code)
        .withDiscountPercent(50)
        .withMaxUses(100)
        .withExpiresAt(expiresAt)
        .build();

      const response =
        await test.step("Create a new promo code with all fields", async () => {
          return await promoCodesController.createPromoCode(courseId, data, {
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      promoCodeId = json.id;

      await test.step("Verify all the fields in the response", async () => {
        expect.soft(json.code).toBe(code);
        expect.soft(json.discountPercent).toBe(50);
        expect.soft(json.maxUses).toBe(100);
        expect.soft(json.currentUses).toBe(0);
        expect.soft(json.isActive).toBe(true);
      });

      await test.step("Check the created promo code in db", async () => {
        const createdPromoCode = await prisma.promoCode.findFirst({
          where: { id: promoCodeId },
        });
        expect.soft(createdPromoCode).not.toBeNull;
        expect.soft(createdPromoCode?.code).toBe(code);
        expect.soft(createdPromoCode?.courseId).toBe(courseId);
        expect.soft(createdPromoCode?.discountPercent).toBe(50);
        expect.soft(createdPromoCode?.maxUses).toBe(100);
        expect.soft(createdPromoCode?.currentUses).toBe(0);
        expect.soft(createdPromoCode?.isActive).toBe(true);
        expect.soft(createdPromoCode?.expiresAt.toISOString()).toBe(expiresAt);
      });
    });
  },
);

//Negative tests for creating a promo code without proper authorization
test.describe(
  "POST /admin/courses/{courseId}/promo-codes - create promo code without proper authorization: negative tests",
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

    test("Create a promo code without authorization - should be 401 error", async ({
      promoCodesController,
    }) => {
      const response =
        await test.step("Try to create a promo code without authorization", async () => {
          return await promoCodesController.createPromoCode(
            courseId,
            {
              code: "UNAUTH1",
              discountPercent: 10,
              expiresAt: futureDate(),
            },
            { failOnStatusCode: false },
          );
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });

    test("Create a promo code as a client with READ role - should be 403 error", async ({
      promoCodesController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to create a promo code as a client with READ role", async () => {
          return await promoCodesController.createPromoCode(
            courseId,
            {
              code: "FORBID1",
              discountPercent: 10,
              expiresAt: futureDate(),
            },
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

    test("Create a promo code as a client with READ and WRITE role - should be 403 error", async ({
      promoCodesController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to create a promo code as a client with READ and WRITE role", async () => {
          return await promoCodesController.createPromoCode(
            courseId,
            {
              code: "FORBID2",
              discountPercent: 10,
              expiresAt: futureDate(),
            },
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

    test("Create a promo code as a client with READ, WRITE, and ADMIN role - should be 403 error", async ({
      promoCodesController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to create a promo code as a client with READ, WRITE, and ADMIN role", async () => {
          return await promoCodesController.createPromoCode(
            courseId,
            {
              code: "FORBID3",
              discountPercent: 10,
              expiresAt: futureDate(),
            },
            {
              headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
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

//Negative test for creating a promo code for a non-existing course
test.describe(
  "POST /admin/courses/{courseId}/promo-codes - create promo code for a non-existing course: negative tests",
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
    test("Create a promo code for a non-existing course - should be 404 error", async ({
      promoCodesController,
    }) => {
      const data = new PromoCodeBuilder()
        .withCode(randomCode("NOCOURSE"))
        .withDiscountPercent(10)
        .withExpiresAt(futureDate())
        .build();

      const response =
        await test.step("Try to create a promo code for a non-existing course", async () => {
          return await promoCodesController.createPromoCode(
            "non-existing-course-id",
            data,
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Course not found");
    });
  },
);
