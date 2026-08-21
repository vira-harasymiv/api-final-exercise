import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkBadStatusCode,
  checkCreatedStatusCode,
  checkForbiddenStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/general-expect-helpers";
import { courseCreatedSchema } from "../../app/json-schemas/courseSchemas";
import { invalidDataTypes } from "./testData/testData";

//POSITIVE test for creating course
test.describe(
  "POST /courses - Create a course: should be successful",
  { tag: [TAG.courses, TAG.smoke, TAG.regression] },
  () => {
    let courseId: string;
    const title = "New Course";

    test.afterEach(
      "Delete the created course",
      async ({ coursesController }) => {
        await test.step("Delete the created course", async () => {
          await coursesController.deleteCourseById(courseId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Create a course by admin - should be successful", async ({
      coursesController,
    }) => {
      const response = await test.step("Create a new course", async () => {
        return await coursesController.createCourse(
          { title: title },
          { failOnStatusCode: true },
        );
      });

      await checkCreatedStatusCode(response);
      const json = await response.json();
      await checkSchema(
        json,
        courseCreatedSchema,
        "JSON of the created course does NOT match expected schema",
      );
      courseId = json.id;

      await test.step("Check if the course has been created", async () => {
        const responseCreated = await coursesController.getCourseById(
          courseId,
          { failOnStatusCode: true },
        );
        const jsonCreated = await responseCreated.json();
        const { categories, chapters, attachments, ...expectedJson } =
          jsonCreated;
        expect.soft(json).toMatchObject(expectedJson);
      });
    });
  },
);

//NEGATIVE tests for creating course using invalid data
test.describe(
  "POST /courses - Create a course: negative cases using invalid data",
  { tag: [TAG.courses, TAG.negative, TAG.regression] },
  () => {
    for (const { id, dataType, data } of invalidDataTypes) {
      test(`${id} Verify creating a new course with title = ${dataType}`, async ({
        coursesController,
      }) => {
        const response =
          await test.step(`Try to create a course using title = ${dataType}`, async () => {
            return await coursesController.createInvalidCourse({ title: data });
          });
        await checkBadStatusCode(response);
        const json = await response.json();
        await test.step("Verify error message", async () => {
          expect.soft(json.error).toBe("Title must be at least 3 characters");
        });
      });
    }
  },
);

//NEGATIVE tests for creating a course without admin permission or auth
test.describe(
  "POST /courses - Create a course without auth or admin permission - should be 401/403 error",
  { tag: [TAG.negative, TAG.courses, TAG.smoke, TAG.regression] },
  () => {
    test.use({ isAuthorized: false });

    let token: string;

    test.beforeAll(
      "Take token without admin permission",
      async ({ apiClient }) => {
        const result = await apiClient.loginWithCredentialsOfNewClient(
          "new client",
          ["read", "write"],
        );
        token = result.token;
      },
    );

    test("Create a course without auth - should be 401 error", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Try to create a course without auth", async () => {
          return await coursesController.createCourse(
            { title: "Test" },
            { failOnStatusCode: false },
          );
        });
      await checkUnauthorizedStatusCode(response);
    });

    test("Create a course without admin permission - should be 403 error", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Try to create a course without admin permission", async () => {
          return await coursesController.createCourse(
            { title: "Test" },
            {
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false,
            },
          );
        });
      await checkForbiddenStatusCode(response);
    });
  },
);
