import { test } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkOKStatusCode,
  checkSchema,
} from "../../app/utils/general-expect-helpers";
import { coursesListResponseSchema } from "../../app/json-schemas/courseSchemas";

//Positive tests for getting the list of courses
test.describe(
  "GET /courses - get the courses list: should be successful",
  { tag: [TAG.smoke, TAG.regression, TAG.courses] },
  () => {
    test("Get the list of courses - should be successful", async ({
      coursesController,
    }) => {
      const response = await test.step("Get the list of courses", async () => {
        return await coursesController.getCourses({ failOnStatusCode: true });
      });
      await checkOKStatusCode(response);

      const json = await response.json();
      checkSchema(
        json,
        coursesListResponseSchema,
        "JSON of the courses list does NOT match the schema",
      );
    });
  },
);
