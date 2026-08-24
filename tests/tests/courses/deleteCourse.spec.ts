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
      });
    });
  },
);

//Negative tests for deleting a course without admin permission or auth
test.describe(
  "DELETE /{courseId} - Delete a course without auth or admin permission - should be 401/403 error",
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

    let courseId: string;
    const title = "New Course";

    test("Delete a course without auth - should be 401 error", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Delete a course without auth", async () => {
          return await coursesController.deleteCourseById("any ID", {
            failOnStatusCode: false,
          });
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
    });

    test("Update a course without admin permission - should be 403 error", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Try to delete a course without admin permission", async () => {
          return await coursesController.deleteCourseById("any ID", {
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
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
