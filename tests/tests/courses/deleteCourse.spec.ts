import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkNotFoundStatusCode,
  checkOKStatusCode,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";

//Positive test cases - deleting a course
test.describe(
  "DELETE /{courseId} - delete a course: should be successful",
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

    test("Delete course - should be successful", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Delete the created course", async () => {
          return await coursesController.deleteCourseById(courseId, {
            failOnStatusCode: true,
          });
        });
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();

      await test.step("Check the error message", async () => {
        expect(json.success).toBe(true);
      });

      await test.step("Check if the course has been deleting", async () => {
        const responseGet = await coursesController.getCourseById(courseId, {
          failOnStatusCode: false,
        });
        await checkMandatoryHeaders(response);
        await checkNotFoundStatusCode(responseGet);
        await test.step("Verify the error message in the response", async () => {
          const jsonGet = await responseGet.json();
          expect.soft(jsonGet.error).toBe("Course not found");
        });
      });
    });
  },
);

//Negative tests for deleting a course without admin permission or auth
test.describe(
  "DELETE /{courseId} - Delete a course without auth or admin permission - should be 401/403 error",
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

    test("Delete a course without authorization - should be 401 error", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Delete a course without authorization", async () => {
          return await coursesController.deleteCourseById(courseId, {
            failOnStatusCode: false,
          });
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Unauthorized");
      });
    });

    test("Delete a course as a client with READ permission - should be 403 error", async ({
      coursesController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to delete a course as a client with READ permission", async () => {
          return await coursesController.deleteCourseById(courseId, {
            headers: { Authorization: `Bearer ${readClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Delete a course as a client with READ and WRITE permissions - should be 403 error", async ({
      coursesController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to delete a course as a client with READ and WRITE permissions", async () => {
          return await coursesController.deleteCourseById(courseId, {
            headers: { Authorization: `Bearer ${readWriteClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Delete a course as a client with READ, WRITE, and ADMIN permissions - should be 403 error", async ({
      coursesController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to delete a course as a client with READ, WRITE, and ADMIN permissions", async () => {
          return await coursesController.deleteCourseById(courseId, {
            headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
            failOnStatusCode: false,
          });
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

//!Delete course by non-existing ID - 500 ERROR
//Negative tests for deleting a course using non-existing ID
test.describe(
  "DELETE /{courseId} - delete a course using non-existing course ID: should be error",
  { tag: [TAG.courses, TAG.negative, TAG.regression] },
  () => {
    test("Delete course using non-existing - should be error", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Delete course using non-existing", async () => {
          return await coursesController.deleteCourseById("non-existing ID", {
            failOnStatusCode: false,
          });
        });
      expect(response.status()).toBeLessThan(500);
    });
  },
);
