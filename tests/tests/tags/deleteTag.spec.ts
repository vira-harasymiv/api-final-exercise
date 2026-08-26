import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";

//Positive tests for deleting a tag by an admin
test.describe(
  "DELETE /tags/{tagId} - delete tag: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.tags] },
  () => {
    let tagId: string;

    test.beforeEach(
      "Prepare test data: create a new tag",
      async ({ tagsController, randomString }) => {
        const response = await tagsController.createTag(
          { name: "Tag " + randomString },
          { failOnStatusCode: true },
        );
        tagId = (await response.json()).id;
      },
    );

    test("Delete an existing tag by admin - should be successful", async ({
      tagsController,
    }) => {
      const response = await test.step("Delete the created tag", async () => {
        return await tagsController.deleteTag(tagId, {
          failOnStatusCode: true,
        });
      });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      const json = await response.json();
      expect.soft(json.success).toBe(true);

      await test.step("Verify the tag is no longer present in the tags list", async () => {
        const responseGet = await tagsController.getTags({
          failOnStatusCode: true,
        });
        const jsonGet = await responseGet.json();
        expect
          .soft(jsonGet.find((tag: { id: string }) => tag.id === tagId))
          .toBeFalsy();
      });
    });
  },
);

//Negative test for deleting a tag by a non-existing ID
test.describe(
  "DELETE /tags/{tagId} - delete tag with non-existing ID: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.tags, TAG.nonExistingValues] },
  () => {
    //! The route does not catch Prisma's "record not found" error on delete, so a
    //! non-existing tagId currently produces an uncaught 500 with an empty body
    //! instead of a 404 - this looks like a real bug in src/app/api/tags/[tagId]/route.ts.
    test("Delete tag with non-existing ID - returns an uncaught 500 error instead of 404", async ({
      tagsController,
    }) => {
      const response =
        await test.step("Try to delete a tag with a non-existing ID", async () => {
          return await tagsController.deleteTag("non-existing-tag-id", {
            failOnStatusCode: false,
          });
        });
      expect(response.status()).toBeLessThan(500);
    });
  },
);

//Negative tests for deleting a tag without proper authorization
test.describe(
  "DELETE /tags/{tagId} - delete tag without proper authorization: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.tags, TAG.permissions] },
  () => {
    test.use({ isAuthorized: false });

    let tagId: string;
    let adminToken: string;

    test.beforeAll(
      "Prepare test data: create a tag by admin",
      async ({ tagsController, oauthController, randomString }) => {
        adminToken = await oauthController.takeAdminToken();

        const responseCreate =
          await test.step("Create a tag as admin", async () => {
            return await tagsController.createTag(
              { name: "Tag " + randomString },
              {
                headers: { Authorization: `Bearer ${adminToken}` },
                failOnStatusCode: true,
              },
            );
          });
        const jsonCreate = await responseCreate.json();
        tagId = jsonCreate.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created tag",
      async ({ tagsController }) => {
        await tagsController.deleteTag(tagId, {
          headers: { Authorization: `Bearer ${adminToken}` },
          failOnStatusCode: true,
        });
      },
    );

    test("Delete tag without authorization - should be 401 error", async ({
      tagsController,
    }) => {
      const response =
        await test.step("Try to delete a tag without authorization", async () => {
          return await tagsController.deleteTag(tagId, {
            failOnStatusCode: false,
          });
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });

    test("Delete tag as a client with READ permissions - should be 403 error", async ({
      tagsController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to delete a tag as a client with READ permissions", async () => {
          return await tagsController.deleteTag(tagId, {
            headers: { Authorization: `Bearer ${readClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("Delete tag as a client with READ and WRITE permissions - should be 403 error", async ({
      tagsController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to delete a tag as a client with READ and WRITE permissions", async () => {
          return await tagsController.deleteTag(tagId, {
            headers: { Authorization: `Bearer ${readWriteClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("Delete tag as a client with READ, WRITE, and ADMIN permissions - should be 403 error", async ({
      tagsController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to delete a tag as a client with READ, WRITE, and ADMIN permissions", async () => {
          return await tagsController.deleteTag(tagId, {
            headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });
  },
);
