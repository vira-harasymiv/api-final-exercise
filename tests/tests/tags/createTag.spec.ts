import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkBadStatusCode,
  checkConflictStatusCode,
  checkCreatedStatusCode,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { tagSchema } from "../../app/json-schemas/tagSchemas";
import {
  invalidDataTypesForName,
  tooShortNamesForName,
} from "./testData/testData";
import { prisma } from "@/lib/prisma";

//Positive tests for creating a tag by an admin
test.describe(
  "POST /tags - create tag: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.tags] },
  () => {
    let tagId: string;

    test.afterEach(
      "Clear test data: delete the created tag",
      async ({ tagsController }) => {
        await tagsController.deleteTag(tagId, { failOnStatusCode: true });
      },
    );

    test("Create a tag with a valid name - should be successful", async ({
      tagsController,
      randomString,
    }) => {
      const name = "Tag " + randomString;
      const response = await test.step("Create a new tag", async () => {
        return await tagsController.createTag(
          { name },
          { failOnStatusCode: true },
        );
      });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      tagId = json.id;
      await checkSchema(json, tagSchema);

      await test.step("Verify the tag name and slug in the response", async () => {
        expect.soft(json.name).toBe(name);
        expect.soft(json.slug).toBe(name.toLowerCase().replace(/\s+/g, "-"));
      });

      await test.step("Verify the created tag fields in db", async () => {
        const createdTag = await prisma.tag.findFirst({ where: { id: tagId } });
        expect.soft(createdTag).not.toBeNull;
        expect.soft(createdTag?.name).toBe(name);
        expect
          .soft(createdTag?.slug)
          .toBe(name.toLowerCase().replace(/\s+/g, "-"));
      });
    });

    test("Create a tag with a name containing extra whitespace and punctuation - name is trimmed and slug is normalized", async ({
      tagsController,
      randomString,
    }) => {
      const name = `  GraphQL API!! ${randomString}  `;
      const response =
        await test.step("Create a new tag with a padded, punctuated name", async () => {
          return await tagsController.createTag(
            { name },
            { failOnStatusCode: true },
          );
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      tagId = json.id;
      await checkSchema(json, tagSchema);

      await test.step("Verify the name is trimmed and the slug has no punctuation or leading/trailing hyphens", async () => {
        expect.soft(json.name).toBe(name.trim());
        expect.soft(json.slug).not.toMatch(/^-|-$/);
        expect.soft(json.slug).not.toMatch(/[!]/);
      });
    });
  },
);

//Negative tests for creating a tag with an invalid name value
test.describe(
  "POST /tags - create tag with invalid name: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.tags] },
  () => {
    for (const { id, description, data } of tooShortNamesForName) {
      test(`${id}. Create a tag with ${description} - should be 400 error`, async ({
        tagsController,
      }) => {
        const response =
          await test.step(`Try to create a tag with ${description}`, async () => {
            return await tagsController.createTagWithInvalidData(
              data === undefined ? {} : { name: data },
              { failOnStatusCode: false },
            );
          });

        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        const json = await response.json();
        expect.soft(json.error).toBe("Name must be at least 2 characters");
      });
    }

    for (const { id, dataType, data } of invalidDataTypesForName) {
      test(
        `${id}. Create a tag using an invalid data type for name = ${dataType} - should be 400 error`,
        { tag: [TAG.invalidDataTypes] },
        async ({ tagsController }) => {
          const response =
            await test.step(`Try to create a tag with name = ${dataType}`, async () => {
              return await tagsController.createTagWithInvalidData(
                { name: data },
                { failOnStatusCode: false },
              );
            });

          await checkMandatoryHeaders(response);
          await checkBadStatusCode(response);
          const json = await response.json();
          expect.soft(json.error).toBe("Name must be at least 2 characters");
        },
      );
    }
  },
);

//Negative test for creating a tag whose name slugifies to an already existing tag's slug
test.describe(
  "POST /tags - create tag with a duplicate slug: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.tags] },
  () => {
    let tagId: string;
    let tagName: string;

    test.beforeEach(
      "Prepare test data: create a tag",
      async ({ tagsController, randomString }) => {
        tagName = "Duplicate " + randomString;
        const response = await tagsController.createTag(
          { name: tagName },
          { failOnStatusCode: true },
        );
        const json = await response.json();
        tagId = json.id;
      },
    );

    test.afterEach(
      "Clear test data: delete the created tag",
      async ({ tagsController }) => {
        await tagsController.deleteTag(tagId, { failOnStatusCode: true });
      },
    );

    test("Create a tag with the exact same name - should be 409 error", async ({
      tagsController,
    }) => {
      const response =
        await test.step("Try to create a tag with the same name", async () => {
          return await tagsController.createTag(
            { name: tagName },
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkConflictStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Tag already exists");
    });

    test("Create a tag with different formatting that slugifies to the same slug - should be 409 error", async ({
      tagsController,
    }) => {
      const differentlyFormattedName = `   ${tagName.toUpperCase()}!!!   `;
      const response =
        await test.step("Try to create a tag whose slug matches an existing one", async () => {
          return await tagsController.createTag(
            { name: differentlyFormattedName },
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkConflictStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Tag already exists");
    });
  },
);

//Negative tests for creating a tag without proper authorization
test.describe(
  "POST /tags - create tag without proper authorization: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.tags, TAG.permissions] },
  () => {
    test.use({ isAuthorized: false });

    test("Create tag without authorization - should be 401 error", async ({
      tagsController,
    }) => {
      const response =
        await test.step("Try to create a tag without authorization", async () => {
          return await tagsController.createTag(
            { name: "Unauthorized Tag" },
            { failOnStatusCode: false },
          );
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });

    test("Create tag as a client with READ role - should be 403 error", async ({
      tagsController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to create a tag as a non-admin user", async () => {
          return await tagsController.createTag(
            { name: "Forbidden Tag" },
            {
              headers: { Authorization: `Bearer ${readClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("Create tag as a client with READ and WRITE role - should be 403 error", async ({
      tagsController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to create a tag as a client with READ and WRITE role", async () => {
          return await tagsController.createTag(
            { name: "Forbidden Tag" },
            {
              headers: { Authorization: `Bearer ${readWriteClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("Create tag as a client with READ, WRITE, and ADMIN role - should be 403 error", async ({
      tagsController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to create a tag as a client with READ, WRITE, and ADMIN role", async () => {
          return await tagsController.createTag(
            { name: "Forbidden Tag" },
            {
              headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
              failOnStatusCode: false,
            },
          );
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });
  },
);
