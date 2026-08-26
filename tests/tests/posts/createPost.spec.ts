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
import { postSchema } from "../../app/json-schemas/postSchemas";
import { PostBuilder } from "../../app/utils/builders/PostBuilder";
import { invalidDataTypesForTitle, tooShortTitles } from "./testData/testData";

//Positive tests for creating a post by an admin
test.describe(
  "POST /posts - create post: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.posts] },
  () => {
    let postId: string;
    let tagId: string;

    test.beforeAll(
      "Prepare test data: create a tag to attach to posts",
      async ({ tagsController, randomString }) => {
        const response = await tagsController.createTag(
          { name: "Post tag " + randomString },
          { failOnStatusCode: true },
        );
        const json = await response.json();
        tagId = json.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created tag",
      async ({ tagsController }) => {
        await tagsController.deleteTag(tagId, { failOnStatusCode: true });
      },
    );

    test.afterEach(
      "Clear test data: delete the created post",
      async ({ postsController }) => {
        await postsController.deletePost(postId, { failOnStatusCode: true });
      },
    );

    test("Create a post with only the required title - should be successful with defaults applied", async ({
      postsController,
      randomString,
    }) => {
      const title = "Post " + randomString;
      const data = new PostBuilder().withTitle(title).build();

      const response = await test.step("Create a new post", async () => {
        return await postsController.createPost(data, {
          failOnStatusCode: true,
        });
      });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      postId = json.id;
      await checkSchema(json, postSchema);

      await test.step("Verify the title, slug, and defaults in the response", async () => {
        expect.soft(json.title).toBe(title);
        expect.soft(json.slug).toBe(title.toLowerCase().replace(/\s+/g, "-"));
        expect.soft(json.excerpt).toBeNull();
        expect.soft(json.content).toBeNull();
        expect.soft(json.imageUrl).toBeNull();
        expect.soft(json.isPublished).toBe(false);
        expect.soft(json.publishedAt).toBeNull();
        expect.soft(json.tags).toEqual([]);
      });
    });

    test("Create a published post with all fields, including a tag - should be successful", async ({
      postsController,
      randomString,
    }) => {
      const title = "Post " + randomString;
      const data = new PostBuilder()
        .withTitle(title)
        .withExcerpt("A short excerpt")
        .withContent("Full post content")
        .withImageUrl("/api/uploads/post-image.png")
        .withTagIds([tagId])
        .withIsPublished(true)
        .build();

      const response =
        await test.step("Create a new published post with all fields", async () => {
          return await postsController.createPost(data, {
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      postId = json.id;
      await checkSchema(json, postSchema);

      await test.step("Verify the fields, publishedAt, and attached tag in the response", async () => {
        expect.soft(json.excerpt).toBe("A short excerpt");
        expect.soft(json.content).toBe("Full post content");
        expect.soft(json.imageUrl).toBe("/api/uploads/post-image.png");
        expect.soft(json.isPublished).toBe(true);
        expect.soft(json.publishedAt).toBeTruthy();
        expect.soft(json.tags).toHaveLength(1);
        expect.soft(json.tags[0].id).toBe(tagId);
      });
    });

    test("Create a post with a title containing extra whitespace and punctuation - title is trimmed and slug is normalized", async ({
      postsController,
      randomString,
    }) => {
      const title = `  Next.js Deep Dive!! ${randomString}  `;
      const data = new PostBuilder().withTitle(title).build();

      const response =
        await test.step("Create a new post with a padded, punctuated title", async () => {
          return await postsController.createPost(data, {
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();
      postId = json.id;
      await checkSchema(json, postSchema);

      await test.step("Verify the title is trimmed and the slug has no punctuation or leading/trailing hyphens", async () => {
        expect.soft(json.title).toBe(title.trim());
        expect.soft(json.slug).not.toMatch(/^-|-$/);
        expect.soft(json.slug).not.toMatch(/[!]/);
      });
    });
  },
);

//Negative tests for creating a post with an invalid title value
test.describe(
  "POST /posts - create post with invalid title: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.posts] },
  () => {
    for (const { id, description, data } of tooShortTitles) {
      test(`${id}. Create a post with ${description} - should be 400 error`, async ({
        postsController,
      }) => {
        const response =
          await test.step(`Try to create a post with ${description}`, async () => {
            return await postsController.createPostWithInvalidData(
              data === undefined ? {} : { title: data },
              { failOnStatusCode: false },
            );
          });

        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        const json = await response.json();
        expect.soft(json.error).toBe("Title must be at least 3 characters");
      });
    }

    for (const { id, dataType, data } of invalidDataTypesForTitle) {
      test(
        `${id}. Create a post using an invalid data type for title = ${dataType} - should be 400 error`,
        { tag: [TAG.invalidDataTypes] },
        async ({ postsController }) => {
          const response =
            await test.step(`Try to create a post with title = ${dataType}`, async () => {
              return await postsController.createPostWithInvalidData(
                { title: data },
                { failOnStatusCode: false },
              );
            });

          await checkMandatoryHeaders(response);
          await checkBadStatusCode(response);
          const json = await response.json();
          expect.soft(json.error).toBe("Title must be at least 3 characters");
        },
      );
    }
  },
);

//Negative tests for creating a post without proper authorization
test.describe(
  "POST /posts - create post without proper authorization: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.posts, TAG.permissions] },
  () => {
    test.use({ isAuthorized: false });

    test("Create post without authorization - should be 401 error", async ({
      postsController,
    }) => {
      const response =
        await test.step("Try to create a post without authorization", async () => {
          return await postsController.createPost(
            { title: "Unauthorized Post" },
            { failOnStatusCode: false },
          );
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });

    test("Create post as a client with READ role - should be 403 error", async ({
      postsController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to create a post as a client with READ role", async () => {
          return await postsController.createPost(
            { title: "Forbidden Post" },
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

    test("Create post as a client with READ and WRITE role - should be 403 error", async ({
      postsController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to create a post as a client with READ and WRITE role", async () => {
          return await postsController.createPost(
            { title: "Forbidden Post" },
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

    test("Create post as a client with READ, WRITE, and ADMIN role - should be 403 error", async ({
      postsController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to create a post as a client with READ, WRITE, and ADMIN role", async () => {
          return await postsController.createPost(
            { title: "Forbidden Post" },
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
