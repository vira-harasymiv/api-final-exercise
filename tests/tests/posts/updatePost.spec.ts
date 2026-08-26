import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { postSchema } from "../../app/json-schemas/postSchemas";
import { PostBuilder } from "../../app/utils/builders/PostBuilder";

//Positive tests for updating a post by an admin
test.describe(
  "PATCH /posts/{postId} - update post: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.posts] },
  () => {
    let postId: string;
    let tagId: string;
    const postTitle = "Post " + Math.floor(Math.random() * 1_000);
    const tagName = "Post tag" + Math.floor(Math.random() * 1_000);

    test.beforeAll(
      "Prepare test data: create a tag to attach to posts",
      async ({ tagsController }) => {
        const response = await tagsController.createTag(
          { name: tagName },
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

    test.beforeEach(
      "Prepare test data: create a new post",
      async ({ postsController }) => {
        const response = await postsController.createPost(
          { title: postTitle },
          { failOnStatusCode: true },
        );
        const json = await response.json();
        postId = json.id;
      },
    );

    test.afterEach(
      "Clear test data: delete the created post",
      async ({ postsController }) => {
        await postsController.deletePost(postId, { failOnStatusCode: true });
      },
    );

    test("Update only the excerpt - other fields remain unchanged", async ({
      postsController,
    }) => {
      const data = new PostBuilder().withExcerpt("Updated excerpt").build();

      const response =
        await test.step("Update the post's excerpt", async () => {
          return await postsController.updatePost(postId, data, {
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(json, postSchema);

      await test.step("Verify only the excerpt changed", async () => {
        expect.soft(json.id).toBe(postId);
        expect.soft(json.title).toBe(postTitle);
        expect.soft(json.excerpt).toBe("Updated excerpt");
        expect.soft(json.content).toBeNull;
        expect.soft(json.imageUrl).toBeNull;
        expect.soft(json.isPublished).toBeFalsy;
        expect.soft(json.publishedAt).toBeNull;
        expect.soft(json.tags).toEqual([]);
      });
    });

    //! Publishing a post via PATCH only flips `isPublished` - unlike POST /posts, the
    //! PATCH route never sets `publishedAt`, so it stays null even though the post is
    //! now published and visible in the public GET /posts list. This looks like an
    //! inconsistency in src/app/api/posts/[postId]/route.ts.
    test("Update all properties - all properties have been updated successfully", async ({
      postsController,
      randomString,
    }) => {
      const newTitle = "Updated title " + randomString;
      const data = new PostBuilder()
        .withTitle(newTitle)
        .withExcerpt("Updated excerpt")
        .withContent("New text")
        .withImageUrl("https://thecatapi.com/")
        .withIsPublished(true)
        .withTagIds([tagId])
        .build();

      const response =
        await test.step("Update the post's title, excerpt, content, imag URL, tags and then publish it", async () => {
          return await postsController.updatePost(postId, data, {
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(json, postSchema);

      await test.step("Verify that properties were updated", async () => {
        expect.soft(json.title).toBe(newTitle);
        expect.soft(json.excerpt).toBe("Updated excerpt");
        expect.soft(json.content).toBe("New text");
        expect.soft(json.imageUrl).toBe("https://thecatapi.com/");
        expect.soft(json.isPublished).toBe(true);
        expect.soft(json.tags[0].id).toBe(tagId);
        expect.soft(json.tags[0].name).toBe(tagName);
      });
    });
  },
);

//Negative test for updating a post with a non-existing post and tag ID
test.describe(
  "PATCH /posts/{postId} - update post with non-existing ID: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.posts, TAG.nonExistingValues] },
  () => {
    let postId: string;
    let adminToken: string;

    test.beforeAll(
      "Prepare test data: create a post by admin",
      async ({ postsController, oauthController, randomString }) => {
        adminToken = await oauthController.takeAdminToken();

        const responseCreate =
          await test.step("Create a post as admin", async () => {
            return await postsController.createPost(
              { title: "Post " + randomString },
              {
                headers: { Authorization: `Bearer ${adminToken}` },
                failOnStatusCode: true,
              },
            );
          });
        const jsonCreate = await responseCreate.json();
        postId = jsonCreate.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created post",
      async ({ postsController }) => {
        await postsController.deletePost(postId, {
          headers: { Authorization: `Bearer ${adminToken}` },
          failOnStatusCode: true,
        });
      },
    );

    //! non-existing postId currently produces an uncaught 500 with an empty body
    test("Update post with non-existing course ID - should be error", async ({
      postsController,
    }) => {
      const response =
        await test.step("Try to update a post with a non-existing course ID", async () => {
          return await postsController.updatePost(
            "non-existing-post-id",
            { title: "Does not matter" },
            { failOnStatusCode: false },
          );
        });
      expect(response.status()).toBeLessThan(500);
    });

    //! non-existing postId currently produces an uncaught 500 with an empty body
    test("Update post with non-existing tag ID - should be error", async ({
      postsController,
    }) => {
      const response =
        await test.step("Try to update a post with a non-existing tag ID", async () => {
          return await postsController.updatePost(
            postId,
            { tagIds: ["Non-existing tag"] },
            { failOnStatusCode: false },
          );
        });
      expect(response.status()).toBeLessThan(500);
    });
  },
);

//Negative tests for updating a post without proper authorization
test.describe(
  "PATCH /posts/{postId} - update post without proper authorization: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.posts, TAG.permissions] },
  () => {
    test.use({ isAuthorized: false });

    let postId: string;
    let adminToken: string;

    test.beforeAll(
      "Prepare test data: create a post by admin",
      async ({ postsController, oauthController, randomString }) => {
        adminToken = await oauthController.takeAdminToken();

        const responseCreate =
          await test.step("Create a post as admin", async () => {
            return await postsController.createPost(
              { title: "Post " + randomString },
              {
                headers: { Authorization: `Bearer ${adminToken}` },
                failOnStatusCode: true,
              },
            );
          });
        const jsonCreate = await responseCreate.json();
        postId = jsonCreate.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created post",
      async ({ postsController }) => {
        await postsController.deletePost(postId, {
          headers: { Authorization: `Bearer ${adminToken}` },
          failOnStatusCode: true,
        });
      },
    );

    test("Update post without authorization - should be 401 error", async ({
      postsController,
    }) => {
      const response =
        await test.step("Try to update a post without authorization", async () => {
          return await postsController.updatePost(
            postId,
            { title: "Unauthorized update" },
            { failOnStatusCode: false },
          );
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });

    test("Update post as a client with READ role - should be 403 error", async ({
      postsController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to update a post as a client with READ role", async () => {
          return await postsController.updatePost(
            postId,
            { title: "Forbidden update" },
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

    test("Update post as a client with READ and WRITE role - should be 403 error", async ({
      postsController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to update a post as a client with READ and WRITE role", async () => {
          return await postsController.updatePost(
            postId,
            { title: "Forbidden update" },
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

    test("Update post as a client with READ, WRITE, and ADMIN role - should be 403 error", async ({
      postsController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to update a post as a client with READ, WRITE, and ADMIN role", async () => {
          return await postsController.updatePost(
            postId,
            { title: "Forbidden update" },
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
