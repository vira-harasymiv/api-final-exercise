import { test } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
} from "../../app/utils/expect-helpers";
import { coursesListResponseSchema } from "../../app/json-schemas/courseSchemas";

//Positive tests for getting the list of courses
test.describe(
  "GET /courses - get the courses list: should be successful",
  { tag: [TAG.smoke, TAG.regression, TAG.courses] },
  () => {
    test("Get the list of courses by admin- should be successful", async ({
      coursesController,
    }) => {
      const response = await test.step("Get the list of courses", async () => {
        return await coursesController.getCourses({ failOnStatusCode: true });
      });
      await checkMandatoryHeaders(response);
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
