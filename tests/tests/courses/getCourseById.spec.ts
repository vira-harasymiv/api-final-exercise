import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkMandatoryHeaders,
  checkNotFoundStatusCode,
  checkOKStatusCode,
  checkSchema,
} from "../../app/utils/expect-helpers";
import { courseSchema } from "../../app/json-schemas/courseSchemas";

//Positive tests for getting a course by iD
test.describe(
  "GET /courses/courseId - get course by ID: should be successful",
  { tag: [TAG.courses, TAG.smoke, TAG.regression] },
  () => {
    let courseId: string;
    const title = "New Course" + Math.floor(Math.random() * 1_000);

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
          await coursesController.deleteCourseById(courseId, {
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

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(json, courseSchema);

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

      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);

      test.step("Check the error message", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Course not found");
      });
    });
  },
);

//Negative tests for getting an unpublished course without admin permission
//GET /courses/{courseId} does not require authentication: it hides unpublished
//courses behind a 404 for anyone whose token role isn't ADMIN (including an
//absent token and client_credentials tokens, whose role is always "CLIENT"
//regardless of scope), instead of returning 401/403.
test.describe(
  "GET /courses/{courseId} - Get an unpublished course without admin permission - should be 404 error",
  {
    tag: [TAG.negative, TAG.courses, TAG.regression, TAG.permissions],
  },
  () => {
    test.use({ isAuthorized: false });

    let adminToken: string;
    let courseId: string;

    test.beforeAll(
      "Create a new course",
      async ({ coursesController, oauthController }) => {
        adminToken = await oauthController.takeAdminToken();

        const response = await test.step("Create a new course", async () => {
          return await coursesController.createCourse(
            { title: "New Course" + Math.floor(Math.random() * 1_000) },
            {
              headers: { Authorization: `Bearer ${adminToken}` },
              failOnStatusCode: true,
            },
          );
        });
        const json = await response.json();
        courseId = json.id;
        console.log(courseId);
      },
    );

    test.afterAll(
      "Delete the created course",
      async ({ coursesController }) => {
        await test.step("Delete the created course", async () => {
          await coursesController.deleteCourseById(courseId, {
            headers: { Authorization: `Bearer ${adminToken}` },
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Get an unpublished course without authorization - should be 404 error", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Get a course without authorization", async () => {
          return await coursesController.getCourseById(courseId, {
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Course not found");
      });
    });

    test("Get an unpublished course as a client with READ permission - should be 404 error", async ({
      coursesController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to get a course as a client with READ permission", async () => {
          return await coursesController.getCourseById(courseId, {
            headers: { Authorization: `Bearer ${readClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Course not found");
      });
    });

    test("Get an unpublished course as a client with READ and WRITE permissions - should be 404 error", async ({
      coursesController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to get a course as a client with READ and WRITE permissions", async () => {
          return await coursesController.getCourseById(courseId, {
            headers: { Authorization: `Bearer ${readWriteClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Course not found");
      });
    });

    test("Get an unpublished course as a client with READ, WRITE, and ADMIN permissions - should be 404 error", async ({
      coursesController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to get a course as a client with READ, WRITE, and ADMIN permissions", async () => {
          return await coursesController.getCourseById(courseId, {
            headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Course not found");
      });
    });
  },
);
