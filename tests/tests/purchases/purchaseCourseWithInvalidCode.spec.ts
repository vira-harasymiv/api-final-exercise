import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkConflictStatusCode,
  checkCreatedStatusCode,
  checkMandatoryHeaders,
  checkNotFoundStatusCode,
} from "../../app/utils/expect-helpers";
import { PromoCodeBuilder } from "../../app/utils/builders/PromoCodeBuilder";
import {
  createPurchasableCourse,
  futureDate,
  randomCode,
} from "./testData/testData";

//Tests for purchasing a course with a promo code that should NOT be applied - the API does
//not reject these purchases with an error, it silently ignores the promo code and charges
//the course's full price instead
test.describe(
  "POST /courses/{courseId}/purchase - purchase a course with a non-applicable promo code: negative tests",
  {
    tag: [
      TAG.negative,
      TAG.regression,
      TAG.purchases,
      TAG.courses,
      TAG.promoCodes,
    ],
  },
  () => {
    // Scenario 1: an active promo code that was deactivated before use
    let inactiveCourseId: string;
    let inactiveCode: string;

    // Scenario 2: a promo code used on a course it does not belong to
    let ownerCourseId: string;
    let otherCourseId: string;
    let wrongCourseCode: string;

    // Scenario 3: a promo code that already reached its usage limit
    let maxedCourseId: string;
    let maxedCode: string;
    let secondUserToken: string;

    test.beforeAll(
      "Prepare courses and promo codes for the non-applicable scenarios",
      async ({
        coursesController,
        promoCodesController,
        purchasesController,
        oauthController,
        randomString,
      }) => {
        ({ courseId: inactiveCourseId } =
          await test.step("1. Create a purchasable course for the inactive promo code scenario", async () => {
            return await createPurchasableCourse(
              coursesController,
              "Inactive Promo Course " + randomString,
              80,
            );
          }));

        inactiveCode = randomCode("INACTIVE");
        await test.step("2. Create a promo code and immediately deactivate it", async () => {
          const data = new PromoCodeBuilder()
            .withCode(inactiveCode)
            .withDiscountPercent(50)
            .withExpiresAt(futureDate())
            .build();
          const responsePromo = await promoCodesController.createPromoCode(
            inactiveCourseId,
            data,
            { failOnStatusCode: true },
          );
          const jsonPromo = await responsePromo.json();
          await promoCodesController.togglePromoCode(
            inactiveCourseId,
            jsonPromo.id,
            { failOnStatusCode: true },
          );
        });

        ({ courseId: ownerCourseId } =
          await test.step("3. Create the course the promo code actually belongs to", async () => {
            return await createPurchasableCourse(
              coursesController,
              "Promo Owner Course " + randomString,
              60,
            );
          }));
        ({ courseId: otherCourseId } =
          await test.step("4. Create a second, unrelated course", async () => {
            return await createPurchasableCourse(
              coursesController,
              "Other Course " + randomString,
              60,
            );
          }));

        wrongCourseCode = randomCode("WRONGC");
        await test.step("5. Create an active promo code for the owner course", async () => {
          const data = new PromoCodeBuilder()
            .withCode(wrongCourseCode)
            .withDiscountPercent(50)
            .withExpiresAt(futureDate())
            .build();
          await promoCodesController.createPromoCode(ownerCourseId, data, {
            failOnStatusCode: true,
          });
        });

        ({ courseId: maxedCourseId } =
          await test.step("6. Create a purchasable course for the already-exhausted promo code scenario", async () => {
            return await createPurchasableCourse(
              coursesController,
              "Maxed Promo Course " + randomString,
              90,
            );
          }));

        maxedCode = randomCode("MAXED");
        await test.step("7. Create a promo code allowing only a single use", async () => {
          const data = new PromoCodeBuilder()
            .withCode(maxedCode)
            .withDiscountPercent(50)
            .withMaxUses(1)
            .withExpiresAt(futureDate())
            .build();
          await promoCodesController.createPromoCode(maxedCourseId, data, {
            failOnStatusCode: true,
          });
        });

        await test.step("8. Consume the promo code's single use by purchasing the course as the admin user", async () => {
          await purchasesController.purchaseCourse(
            maxedCourseId,
            { promoCode: maxedCode },
            { failOnStatusCode: true },
          );
        });

        await test.step("9. Log in as a second user to attempt reusing the exhausted promo code", async () => {
          const responseLogin = await oauthController.withPasswordGrant(
            {
              grant_type: "password",
              email: "user@dojo.api",
              password: "Password1",
            },
            { failOnStatusCode: true },
          );
          const jsonLogin = await responseLogin.json();
          secondUserToken = jsonLogin.access_token;
        });
      },
    );

    test.afterAll(
      "Clear test data: delete the created courses",
      async ({ coursesController }) => {
        await test.step("Delete the inactive-promo-code course", async () => {
          await coursesController.deleteCourseById(inactiveCourseId, {
            failOnStatusCode: true,
          });
        });

        await test.step("Delete the promo owner course", async () => {
          await coursesController.deleteCourseById(ownerCourseId, {
            failOnStatusCode: true,
          });
        });

        await test.step("Delete the unrelated other course", async () => {
          await coursesController.deleteCourseById(otherCourseId, {
            failOnStatusCode: true,
          });
        });

        await test.step("Delete the maxed-promo-code course", async () => {
          await coursesController.deleteCourseById(maxedCourseId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Purchase a course using an inactive promo code - should succeed at full price without applying the discount", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Purchase the course using the now-inactive promo code", async () => {
          return await purchasesController.purchaseCourse(
            inactiveCourseId,
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
        expect.soft(Number(json.amount)).toBe(60);
        expect.soft(json.promoCode).toBeNull();
      });
    });

    test("Purchase a course using a promo code that does not exist - should succeed at full price without applying the discount", async ({
      coursesController,
      purchasesController,
      randomString,
    }) => {
      const { courseId } =
        await test.step("Create a purchasable course", async () => {
          return await createPurchasableCourse(
            coursesController,
            "Non-existing Promo Course " + randomString,
            40,
          );
        });

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
        expect.soft(Number(json.amount)).toBe(40);
        expect.soft(json.promoCode).toBeNull();
      });

      await test.step("Delete the created course", async () => {
        await coursesController.deleteCourseById(courseId, {
          failOnStatusCode: true,
        });
      });
    });

    test("Purchase a course using a promo code that has already reached its usage limit - should succeed at full price without applying the discount", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Purchase the course as a second user, using the already-exhausted promo code", async () => {
          return await purchasesController.purchaseCourse(
            maxedCourseId,
            { promoCode: maxedCode },
            {
              headers: { Authorization: `Bearer ${secondUserToken}` },
              failOnStatusCode: true,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      await test.step("Verify the purchase was charged at full price with no promo code applied", async () => {
        expect.soft(Number(json.amount)).toBe(90);
        expect.soft(json.promoCode).toBeNull();
      });
    });
  },
);

//Negative tests around the purchase business rules: unknown/unpublished course, duplicate purchase
test.describe(
  "POST /courses/{courseId}/purchase - purchase business rules: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.purchases, TAG.courses] },
  () => {
    let unpublishCourseId: string;
    let purchasedCourseId: string;

    test.beforeAll(
      "Prepare test data",
      async ({ coursesController, purchasesController, randomString }) => {
        const responseCreateUnpublishCourse =
          await test.step("Create a course without publishing it", async () => {
            return await coursesController.createCourse(
              { title: "Unpublished Course " + randomString },
              { failOnStatusCode: true },
            );
          });
        const jsonCreateUnpublishCourse =
          await responseCreateUnpublishCourse.json();
        unpublishCourseId = jsonCreateUnpublishCourse.id;

        ({ courseId: purchasedCourseId } =
          await test.step("Create a purchasable course", async () => {
            return await createPurchasableCourse(
              coursesController,
              "Duplicate Purchase Course " + randomString,
              20,
            );
          }));

        await test.step("Purchase the course for the first time", async () => {
          await purchasesController.purchaseCourse(
            purchasedCourseId,
            {},
            { failOnStatusCode: true },
          );
        });
      },
    );

    test.afterAll("Clear data", async ({ coursesController }) => {
      await test.step("Delete the unpublished course", async () => {
        await coursesController.deleteCourseById(unpublishCourseId, {
          failOnStatusCode: true,
        });
      });

      await test.step("Delete the purchased course", async () => {
        await coursesController.deleteCourseById(purchasedCourseId, {
          failOnStatusCode: true,
        });
      });
    });

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

    test("Purchase an unpublished course - should be 404 error", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Try to purchase the unpublished course", async () => {
          return await purchasesController.purchaseCourse(
            unpublishCourseId,
            {},
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Course not found");
    });

    test("Purchase a course that was already purchased - should be 409 error", async ({
      purchasesController,
    }) => {
      const response =
        await test.step("Try to purchase the same course a second time", async () => {
          return await purchasesController.purchaseCourse(
            purchasedCourseId,
            {},
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkConflictStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Already purchased");
    });
  },
);
