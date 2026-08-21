import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkNotFoundStatusCode,
  checkOKStatusCode,
  checkSchema,
} from "../../app/utils/general-expect-helpers";
import { courseSchema } from "../../app/json-schemas/courseSchemas";

//Positive tests for getting a course by iD
test.describe(
  "GET /courses/courseId - get course by ID: should be successful",
  { tag: [TAG.courses, TAG.smoke, TAG.regression] },
  () => {
    let courseId: string;
    const title = "New Course";

    test.beforeEach("Create a new course", async ({ coursesController }) => {
      const response = await test.step("Create a new course", async () => {
        return await coursesController.createCourse(
          { title: title },
          { failOnStatusCode: true },
        );
      });
      const json = await response.json();
      courseId = json.id;
    });

    test.afterEach(
      "Delete the created course",
      async ({ coursesController }) => {
        await test.step("Delete the created course", async () => {
          coursesController.deleteCourseById(courseId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Take course by ID - should be successful", async ({
      coursesController,
    }) => {
      const response = await test.step("Get course by ID", async () => {
        return await coursesController.getCourseById(courseId, {
          failOnStatusCode: true,
        });
      });

      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(
        json,
        courseSchema,
        "JSON of the received course does NOT match expected schema",
      );

      await test.step("Check if the received course matches the created course", async () => {
        expect(json.id).toBe(courseId);
      });
    });
  },
);

//Negative tests for getting a course by iD
test.describe(
  "GET /courses/courseId - get course by non-existing ID: should be 404 error",
  { tag: [TAG.courses, TAG.negative, TAG.regression] },
  () => {
    test("Take course by non-existing ID - should be 404 error", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Get course by non-existing ID", async () => {
          return await coursesController.getCourseById("non-existing ID", {
            failOnStatusCode: false,
          });
        });

      await checkNotFoundStatusCode(response);

      test.step("Check if error message", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Course not found");
      });
    });
  },
);
