import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import { CourseBuilder } from "../../app/utils/builders/CourseBuilder";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { courseCreatedSchema } from "../../app/json-schemas/courseSchemas";

//Update course by ID: positive tests
test.describe(
  "PATCH /courses/{courseId} - Update a course: should be successful",
  { tag: [TAG.courses, TAG.smoke, TAG.regression] },
  () => {
    let courseTitle: string;
    let categoryName: string;
    let courseId: string;
    let categoryId: string;

    test.beforeEach(
      "Prepare test data: create the course and category",
      async ({ coursesController, categoriesController }) => {
        courseTitle = "New Course" + Math.floor(Math.random() * 1_000);
        categoryName = "New Category" + Math.floor(Math.random() * 1_000);

        const responseCourseCreate =
          await test.step("Create a new resource", async () => {
            return await coursesController.createCourse(
              { title: courseTitle },
              { failOnStatusCode: true },
            );
          });
        const jsonCourseCreate = await responseCourseCreate.json();
        courseId = jsonCourseCreate.id;

        const responseCategoryCreate =
          await test.step("Create a new category", async () => {
            return await categoriesController.createCategory(
              { name: categoryName },
              { failOnStatusCode: true },
            );
          });
        const jsonCreateCategory = await responseCategoryCreate.json();
        categoryId = jsonCreateCategory.id;
      },
    );

    test.afterEach(
      "Delete the created course and category",
      async ({ coursesController, categoriesController }) => {
        await test.step("Delete the created course", async () => {
          await coursesController.deleteCourseById(courseId, {
            failOnStatusCode: true,
          });
        });
        await test.step("Delete the created category", async () => {
          await categoriesController.deleteCategory(categoryId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Update all properties - should be successful", async ({
      coursesController,
    }) => {
      const courseBuilder = new CourseBuilder()
        .withTitle("Updated Course")
        .withRequirements(["requirement1"])
        .withPrice(100.0)
        .withOutcomes(["outcome"])
        .withImageUrl("https://freecatphotoapp.com")
        .withDescription("Updated description")
        .withCategoryIds([categoryId])
        .withAuthorRole("Test")
        .withAuthorName("Test Name")
        .build();

      const responseUpdate =
        await test.step("Update all properties of a course", async () => {
          return await coursesController.updateCourse(courseId, courseBuilder, {
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(responseUpdate);
      await checkOKStatusCode(responseUpdate);

      const json = await responseUpdate.json();
      await checkSchema(json, courseCreatedSchema);

      await test.step("Verify if all properties were updated", async () => {
        const responseGet =
          await test.step("Get the updated course", async () => {
            return await coursesController.getCourseById(courseId, {
              failOnStatusCode: true,
            });
          });
        const jsonGet = await responseGet.json();
        expect.soft(json.id).toBe(jsonGet.id);
        expect.soft(json.title).toBe(jsonGet.title);
        expect.soft(json.description).toBe(jsonGet.description);
        expect.soft(json.imageUrl).toBe(jsonGet.imageUrl);
        expect.soft(json.price).toBe(jsonGet.price);
        expect.soft(json.outcomes).toEqual(jsonGet.outcomes);
        expect.soft(json.requirements).toEqual(jsonGet.requirements);
        expect.soft(json.authorName).toBe(jsonGet.authorName);
        expect.soft(json.authorRole).toBe(jsonGet.authorRole);
        expect.soft(categoryId).toBe(jsonGet.categories[0].id);
        expect.soft(categoryName).toBe(jsonGet.categories[0].name);
      });
    });

    test("Update only price - other fields remain unchanged", async ({
      coursesController,
    }) => {
      const price = 100;
      const courseBuilder = new CourseBuilder().withPrice(price).build();
      const responseUpdate =
        await test.step("Update only price of a course", async () => {
          return await coursesController.updateCourse(courseId, courseBuilder, {
            failOnStatusCode: true,
          });
        });

      await checkOKStatusCode(responseUpdate);
      await checkMandatoryHeaders(responseUpdate);

      const json = await responseUpdate.json();
      await checkSchema(json, courseCreatedSchema);

      await test.step("Verify if a price has been updated", async () => {
        const responseGet =
          await test.step("Get the updated course", async () => {
            return await coursesController.getCourseById(courseId, {
              failOnStatusCode: true,
            });
          });
        const jsonGet = await responseGet.json();
        expect.soft(json.price).toBe(jsonGet.price);
      });

      await test.step("Verify if other fields remain unchanged", async () => {
        expect.soft(json.id).toBe(courseId);
        expect.soft(json.title).toBe(courseTitle);
        expect.soft(json.description).toBeNull;
        expect.soft(json.imageUrl).toBeNull;
        expect.soft(json.price).toBe(price.toString());
        expect.soft(json.outcomes).toBeNull;
        expect.soft(json.requirements).toBeNull;
        expect.soft(json.authorName).toBeNull;
        expect.soft(json.authorRole).toBeNull;
        expect.soft(categoryId).toBeNull;
        expect.soft(categoryName).toBeNull;
      });
    });
  },
);

//NEGATIVE tests for updating a course without admin permission or auth
test.describe(
  "PATCH /courses - Update a course without auth or admin permission - should be 401/403 error",
  {
    tag: [
      TAG.negative,
      TAG.courses,
      TAG.smoke,
      TAG.regression,
      TAG.permissions,
    ],
  },
  () => {
    test.use({ isAuthorized: false });

    test("Update a course without authorization - should be 401 error", async ({
      coursesController,
    }) => {
      const courseBuilder = new CourseBuilder().withPrice(100.0).build();

      const responseUpdate =
        await test.step("Update a course without authorization", async () => {
          return await coursesController.updateCourse(
            "dsdsdsd",
            courseBuilder,
            {
              failOnStatusCode: false,
            },
          );
        });

      await checkUnauthorizedStatusCode(responseUpdate);
      await checkAcceptEncodingHeaders(responseUpdate);
      await test.step("Verify the error message in the response", async () => {
        const json = await responseUpdate.json();
        expect.soft(json.error).toBe("Unauthorized");
      });
    });

    test("Update a course as a client with READ permission - should be 403 error", async ({
      coursesController,
      readClientToken,
    }) => {
      const courseBuilder = new CourseBuilder().withPrice(100.0).build();

      const responseUpdate =
        await test.step("Update a course as a client with READ permission", async () => {
          return await coursesController.updateCourse("sdsdsd", courseBuilder, {
            headers: { Authorization: `Bearer ${readClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkForbiddenStatusCode(responseUpdate);
      await checkMandatoryHeaders(responseUpdate);
      await test.step("Verify the error message in the response", async () => {
        const json = await responseUpdate.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Update a course as a client with READ and WRITE permissions - should be 403 error", async ({
      coursesController,
      readWriteClientToken,
    }) => {
      const courseBuilder = new CourseBuilder().withPrice(100.0).build();
      const responseUpdate =
        await test.step("Update a course as a client with READ and WRITE permissions", async () => {
          return await coursesController.updateCourse("sdsdsd", courseBuilder, {
            headers: { Authorization: `Bearer ${readWriteClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkForbiddenStatusCode(responseUpdate);
      await checkMandatoryHeaders(responseUpdate);
      await test.step("Verify the error message in the response", async () => {
        const json = await responseUpdate.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Update a course as a client with READ, WRITE, and ADMIN permissions - should be 403 error", async ({
      coursesController,
      readWriteAdminClientToken,
    }) => {
      const courseBuilder = new CourseBuilder().withPrice(100.0).build();
      const responseUpdate =
        await test.step("Update a course as a client with READ, WRITE, and ADMIN permissions", async () => {
          return await coursesController.updateCourse("sdsdsd", courseBuilder, {
            headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkForbiddenStatusCode(responseUpdate);
      await checkMandatoryHeaders(responseUpdate);
      await test.step("Verify the error message in the response", async () => {
        const json = await responseUpdate.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });
  },
);

//NEGATIVE tests for updating a course using invalid data
test.describe(
  "PATCH /courses/{courseId} - Update a course using invalid data",
  { tag: [TAG.courses, TAG.negative, TAG.regression] },
  () => {
    const courseTitle = "New Course" + Math.floor(Math.random() * 1_000);
    const categoryName = "New Category" + Math.floor(Math.random() * 1_000);
    let courseId: string;
    let categoryId: string;

    test.beforeEach(
      "Prepare test data: create the course and category",
      async ({ coursesController, categoriesController }) => {
        const responseCourseCreate =
          await test.step("Create a new resource", async () => {
            return await coursesController.createCourse(
              { title: courseTitle },
              { failOnStatusCode: true },
            );
          });
        const jsonCourseCreate = await responseCourseCreate.json();
        courseId = jsonCourseCreate.id;

        const responseCategoryCreate =
          await test.step("Create a new category", async () => {
            return await categoriesController.createCategory(
              { name: categoryName },
              { failOnStatusCode: true },
            );
          });
        const jsonCreateCategory = await responseCategoryCreate.json();
        categoryId = jsonCreateCategory.id;
      },
    );

    test.afterEach(
      "Delete the created course and category",
      async ({ coursesController, categoriesController }) => {
        await test.step("Delete the created course", async () => {
          await coursesController.deleteCourseById(courseId, {
            failOnStatusCode: true,
          });
        });
        await test.step("Delete the created category", async () => {
          await categoriesController.deleteCategory(categoryId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    //! Update course using non-existing category ID - 500 Error
    test("Update course using non-existing category ID - should be error", async ({
      coursesController,
    }) => {
      const courseBuilder = new CourseBuilder()
        .withCategoryIds(["non-existing"])
        .build();
      const responseUpdate =
        await test.step("Update course using non-existing category ID", async () => {
          return await coursesController.updateCourse(courseId, courseBuilder, {
            failOnStatusCode: false,
          });
        });

      expect(responseUpdate.status()).toBeLessThan(500);
    });

    //! Update course using non-existing course ID - 500 Error
    test("Update course using non-existing course ID - should be error", async ({
      coursesController,
    }) => {
      const courseBuilder = new CourseBuilder().withPrice(10).build();
      const responseUpdate =
        await test.step("Update course using non-existing course ID", async () => {
          return await coursesController.updateCourse(
            "non-existing-id",
            courseBuilder,
            {
              failOnStatusCode: false,
            },
          );
        });

      expect(responseUpdate.status()).toBeLessThan(500);
    });
  },
);
