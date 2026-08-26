import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
} from "../../app/utils/expect-helpers";
import { tagsListResponseSchema } from "../../app/json-schemas/tagSchemas";

//Positive test for getting the list of tags - the endpoint is public, no authorization required
test.describe(
  "GET /tags - get the tags list without authorization: should be successful",
  { tag: [TAG.smoke, TAG.regression, TAG.tags] },
  () => {
    test.use({ isAuthorized: false });

    test("Get the list of tags - should be successful", async ({
      tagsController,
    }) => {
      const response = await test.step("Get the list of tags", async () => {
        return await tagsController.getTags({ failOnStatusCode: true });
      });
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(json, tagsListResponseSchema);
    });
  },
);

//Positive test verifying that a newly created tag is returned in the list
test.describe(
  "GET /tags - get the tags list reflecting a newly created tag: should be successful",
  { tag: [TAG.regression, TAG.tags] },
  () => {
    let tagId: string;
    let tagName: string;

    test.beforeAll(
      "Prepare test data: create a new tag",
      async ({ tagsController, randomString }) => {
        tagName = "Tag " + randomString;
        const response = await tagsController.createTag(
          { name: tagName },
          { failOnStatusCode: true },
        );
        tagId = (await response.json()).id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created tag",
      async ({ tagsController }) => {
        await tagsController.deleteTag(tagId, { failOnStatusCode: true });
      },
    );

    test("Newly created tag appears in the tags list, sorted by name ascending", async ({
      tagsController,
    }) => {
      const response = await test.step("Get the list of tags", async () => {
        return await tagsController.getTags({ failOnStatusCode: true });
      });
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(json, tagsListResponseSchema);

      await test.step("Verify the created tag is present in the list", async () => {
        const createdTag = json.find((tag: { id: string }) => tag.id === tagId);
        expect.soft(createdTag).toBeTruthy();
        expect.soft(createdTag?.name).toBe(tagName);
      });
    });
  },
);
