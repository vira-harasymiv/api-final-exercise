import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkAcceptEncodingHeaders,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";

//Positive tests for deleting a post by an admin
test.describe(
  "DELETE /posts/{postId} - delete post: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.posts] },
  () => {
    let postId: string;

    test.beforeEach(
      "Prepare test data: create a new published post",
      async ({ postsController, randomString }) => {
        const response = await postsController.createPost(
          { title: "Post " + randomString, isPublished: true },
          { failOnStatusCode: true },
        );
        postId = (await response.json()).id;
      },
    );

    test("Delete an existing post by admin - should be successful", async ({
      postsController,
    }) => {
      const response = await test.step("Delete the created post", async () => {
        return await postsController.deletePost(postId, {
          failOnStatusCode: true,
        });
      });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);
      const json = await response.json();
      expect.soft(json.success).toBe(true);

      await test.step("Verify the post is no longer present in the public posts list", async () => {
        const responseGet = await postsController.getPosts({
          failOnStatusCode: true,
        });
        const jsonGet = await responseGet.json();
        expect
          .soft(jsonGet.find((post: { id: string }) => post.id === postId))
          .toBeFalsy();
      });
    });
  },
);

//Negative test for deleting a post by a non-existing ID
test.describe(
  "DELETE /posts/{postId} - delete post with non-existing ID: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.posts, TAG.nonExistingValues] },
  () => {
    //! The route does not catch Prisma's "record not found" error on delete, so a
    //! non-existing postId currently produces an uncaught 500 with an empty body
    //! instead of a 404 - this looks like a real bug in src/app/api/posts/[postId]/route.ts.
    test("Delete post with non-existing ID - returns an uncaught 500 error instead of 404", async ({
      postsController,
    }) => {
      const response =
        await test.step("Try to delete a post with a non-existing ID", async () => {
          return await postsController.deletePost("non-existing-post-id", {
            failOnStatusCode: false,
          });
        });
      expect(response.status()).toBeLessThan(500);
    });
  },
);

//Negative tests for deleting a post without proper authorization
test.describe(
  "DELETE /posts/{postId} - delete post without proper authorization: negative tests",
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

    test("Delete post without authorization - should be 401 error", async ({
      postsController,
    }) => {
      const response =
        await test.step("Try to delete a post without authorization", async () => {
          return await postsController.deletePost(postId, {
            failOnStatusCode: false,
          });
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });

    test("Delete post as a client with READ permissions - should be 403 error", async ({
      postsController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to delete a post as a client with READ permissions", async () => {
          return await postsController.deletePost(postId, {
            headers: { Authorization: `Bearer ${readClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("Delete post as a client with READ and WRITE permissions - should be 403 error", async ({
      postsController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to delete a post as a client with READ and WRITE permissions", async () => {
          return await postsController.deletePost(postId, {
            headers: { Authorization: `Bearer ${readWriteClientToken}` },
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Forbidden");
    });

    test("Delete post as a client with READ, WRITE, and ADMIN permissions - should be 403 error", async ({
      postsController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to delete a post as a client with READ, WRITE, and ADMIN permissions", async () => {
          return await postsController.deletePost(postId, {
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
