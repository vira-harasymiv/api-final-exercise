import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkConflictStatusCode,
  checkCreatedStatusCode,
  checkMandatoryHeaders,
} from "../../app/utils/expect-helpers";
import { PromoCodeBuilder } from "../../app/utils/builders/PromoCodeBuilder";
import { futureDate, randomCode } from "./testData/testData";

//Test scenario for purchasing a course using INACTIVE promo code
test.describe(
  "POST /courses/{courseId}/purchase - purchase a course with inactive promo code: should be an error",
  {
    tag: [
      TAG.negative,
      TAG.regression,
      TAG.purchases,
      TAG.courses,
      TAG.promoCodes,
    ],
  },
  async () => {
    let courseId: string;
    const inactiveCode = randomCode("INACTIVE");

    test.beforeAll(
      "Prepare a course and inactive promo code",
      async ({ apiClient, randomString, promoCodesController }) => {
        const result =
          await test.step("1. Create a purchasable course for the inactive promo code scenario", async () => {
            return await apiClient.createPurchasableCourse(
              "Inactive Promo Course " + randomString,
              80,
            );
          });

        courseId = result.courseId;

        await test.step("2. Create a promo code and immediately deactivate it", async () => {
          const data = new PromoCodeBuilder()
            .withCode(inactiveCode)
            .withDiscountPercent(50)
            .withExpiresAt(futureDate())
            .build();
          const responsePromo = await promoCodesController.createPromoCode(
            courseId,
            data,
            { failOnStatusCode: true },
          );
          const jsonPromo = await responsePromo.json();
          await promoCodesController.togglePromoCode(courseId, jsonPromo.id, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test.afterAll(
      "Clear test data: delete the created course",
      async ({ coursesController }) => {
        await test.step("Delete the inactive-promo-code course", async () => {
          await coursesController.deleteCourseById(courseId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Purchase a course using an inactive promo code - should succeed at full price without applying the discount", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Purchase the course using the inactive promo code", async () => {
          return await purchasesController.purchaseCourse(
            courseId,
            { promoCode: inactiveCode },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      await test.step("Verify the purchase was charged at full price with no promo code applied", async () => {
        expect.soft(Number(json.amount)).toBe(80);
        expect.soft(json.promoCode).toBeNull();
      });
    });
  },
);

//Test scenario for purchasing a course with a promo code belonging to ANOTHER course
test.describe(
  "POST /courses/{courseId}/purchase - purchase a course with a promo code belonging to another course: should be an error",
  {
    tag: [
      TAG.negative,
      TAG.regression,
      TAG.purchases,
      TAG.courses,
      TAG.promoCodes,
    ],
  },
  async () => {
    let ownerCourseId: string;
    let otherCourseId: string;

    const wrongCourseCode = randomCode("WRONG");
    const priceOfOwnerCourse = 100;
    const priceOfOtherCourse = 200;

    test.beforeAll(
      "Prepare 2 courses and promo code",
      async ({ apiClient, randomString, promoCodesController }) => {
        const firstCourse =
          await test.step("1. Create the first purchasable course", async () => {
            return await apiClient.createPurchasableCourse(
              "Inactive Promo Course " + randomString,
              priceOfOwnerCourse,
            );
          });

        ownerCourseId = firstCourse.courseId;

        const secondCourse =
          await test.step("2. Create the second purchasable course", async () => {
            return await apiClient.createPurchasableCourse(
              "Inactive Promo Course " + randomString,
              priceOfOtherCourse,
            );
          });

        otherCourseId = secondCourse.courseId;

        await test.step("3. Create an active promo code for the owner course", async () => {
          const data = new PromoCodeBuilder()
            .withCode(wrongCourseCode)
            .withDiscountPercent(50)
            .withExpiresAt(futureDate())
            .build();
          await promoCodesController.createPromoCode(ownerCourseId, data, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test.afterAll(
      "Clear test data: delete the created courses",
      async ({ coursesController }) => {
        await test.step("Delete the created courses", async () => {
          await coursesController.deleteCourseById(ownerCourseId, {
            failOnStatusCode: true,
          });

          await coursesController.deleteCourseById(otherCourseId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Purchase a course using a promo code that belongs to a different course - should succeed at full price without applying the discount", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Purchase the OTHER course using that promo code", async () => {
          return await purchasesController.purchaseCourse(
            otherCourseId,
            { promoCode: wrongCourseCode },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      await test.step("Verify the purchase was charged at full price with no promo code applied", async () => {
        expect.soft(Number(json.amount)).toBe(priceOfOtherCourse);
        expect.soft(json.promoCode).toBeNull();
      });
    });
  },
);

//Test scenarios for trying to apply the already used promo code by the same user and another user
test.describe(
  "POST /courses/{courseId}/purchase - purchase a course with a promo code that has already been used by the same user and another user",
  {
    tag: [
      TAG.negative,
      TAG.regression,
      TAG.purchases,
      TAG.courses,
      TAG.promoCodes,
    ],
  },
  async () => {
    let courseId: string;

    const promoCode = randomCode("MAXED");
    const coursePrice = 200;
    const discountPercent = 20;

    test.beforeAll(
      "Prepare test data: course and promo code. Apply the promo code to created course",
      async ({
        apiClient,
        randomString,
        promoCodesController,
        purchasesController,
      }) => {
        const course = await test.step("1. Create the course", async () => {
          return await apiClient.createPurchasableCourse(
            "Inactive Promo Course " + randomString,
            coursePrice,
          );
        });

        courseId = course.courseId;

        await test.step("2. Create a promo code allowing only a single use", async () => {
          const data = new PromoCodeBuilder()
            .withCode(promoCode)
            .withDiscountPercent(discountPercent)
            .withMaxUses(1)
            .withExpiresAt(futureDate())
            .build();
          await promoCodesController.createPromoCode(courseId, data, {
            failOnStatusCode: true,
          });
        });

        await test.step("3. Consume the promo code's single use by purchasing the course", async () => {
          await purchasesController.purchaseCourse(
            courseId,
            { promoCode: promoCode },
            { failOnStatusCode: true },
          );
        });
      },
    );

    test.afterAll(
      "Clear test data: delete the created courses",
      async ({ coursesController }) => {
        await test.step("Delete the created courses", async () => {
          await coursesController.deleteCourseById(courseId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Purchase a course using the already used promo code by another client - should succeed at full price without applying the discount", async ({
      purchasesController,
      apiClient,
      randomString,
    }) => {
      let token: string;

      await test.step("Login as another client", async () => {
        const result = await apiClient.loginWithCredentialsOfNewClient(
          randomString,
          ["read"],
        );
        token = result.token;
      });

      const response =
        await test.step("Purchase the course, using the already-exhausted promo code", async () => {
          return await purchasesController.purchaseCourse(
            courseId,
            { promoCode: promoCode },
            {
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: true,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      await test.step("Verify the purchase was charged at full price with no promo code applied", async () => {
        expect.soft(Number(json.amount)).toBe(coursePrice);
        expect.soft(json.promoCode).toBeNull();
      });
    });

    test("Purchase a course using the already used promo code by the same client - should be an error", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Purchase the course, using the already-exhausted promo code", async () => {
          return await purchasesController.purchaseCourse(
            courseId,
            { promoCode: promoCode },
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkConflictStatusCode(response);
      await test.step("Check the error message", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Already purchased");
      });
    });
  },
);
