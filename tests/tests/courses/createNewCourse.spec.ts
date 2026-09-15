import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkBadStatusCode,
  checkCreatedStatusCode,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { courseCreatedSchema } from "../../app/json-schemas/courseSchemas";
import { invalidDataTypes } from "./testData/testData";
import { prisma } from "@/lib/prisma";

//Positive test for creating course
test.describe(
  "POST /courses - Create a course: should be successful",
  { tag: [TAG.courses, TAG.smoke, TAG.regression] },
  () => {
    let courseId: string;
    const title = "New Course" + Math.floor(Math.random() * 1_000);

    test("Create a course by admin - should be successful", async ({
      coursesController,
    }) => {
      const response = await test.step("Create a new course", async () => {
        return await coursesController.createCourse(
          { title: title },
          { failOnStatusCode: true },
        );
      });

      await checkMandatoryHeaders(response);
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

      await test.step("Check the created course in db", async () => {
        const createdCourse = await prisma.course.findFirst({
          where: { id: courseId },
        });
        expect.soft(createdCourse).not.toBeNull();
        expect.soft(createdCourse?.title).toBe(title);
      });
    });
  },
);

//NEGATIVE tests for creating course using invalid data
test.describe(
  "POST /courses - Create a course: negative cases using invalid data",
  { tag: [TAG.courses, TAG.negative, TAG.regression, TAG.invalidDataTypes] },
  () => {
    for (const { id, dataType, data } of invalidDataTypes) {
      test(`${id} Verify creating a new course with title = ${dataType}`, async ({
        coursesController,
      }) => {
        const response =
          await test.step(`Try to create a course using title = ${dataType}`, async () => {
            return await coursesController.createInvalidCourse({ title: data });
          });
        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        const json = await response.json();
        await test.step("Verify error message", async () => {
          expect.soft(json.error).toBe("Title must be at least 3 characters");
        });
      });
    }
  },
);

//Negative tests for creating a course without admin permission or auth
test.describe(
  "POST /courses - Create a course without auth or admin permission - should be 401/403 error",
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

    test("Create a course without authorization - should be 401 error", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Try to create a course without authorization", async () => {
          return await coursesController.createCourse(
            { title: "Test" },
            { failOnStatusCode: false },
          );
        });
      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Unauthorized");
      });
    });

    test("Create a course as a client with READ permission - should be 403 error", async ({
      coursesController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to create a course as a client with READ permission", async () => {
          return await coursesController.createCourse(
            { title: "Test" },
            {
              headers: { Authorization: `Bearer ${readClientToken}` },
              failOnStatusCode: false,
            },
          );
        });
      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Create a course as a client with READ and WRITE permission - should be 403 error", async ({
      coursesController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to create a course as a client with READ and WRITE permission", async () => {
          return await coursesController.createCourse(
            { title: "Test" },
            {
              headers: { Authorization: `Bearer ${readWriteClientToken}` },
              failOnStatusCode: false,
            },
          );
        });
      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Create a course as a client with READ, WRITE, and ADMIN permission - should be 403 error", async ({
      coursesController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to create a course as a client with READ, WRITE, and ADMIN permissions permission", async () => {
          return await coursesController.createCourse(
            { title: "Test" },
            {
              headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
              failOnStatusCode: false,
            },
          );
        });
      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });
  },
);
