import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
import {
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
} from "../../app/utils/expect-helpers";
import { postsListResponseSchema } from "../../app/json-schemas/postSchemas";

//Positive test for getting the list of posts - the endpoint is public, no authorization required
test.describe(
  "GET /posts - get the posts list without authorization: should be successful",
  { tag: [TAG.smoke, TAG.regression, TAG.posts] },
  () => {
    test.use({ isAuthorized: false });

    test("Get the list of posts - should be successful", async ({
      postsController,
    }) => {
      const response = await test.step("Get the list of posts", async () => {
        return await postsController.getPosts({ failOnStatusCode: true });
      });
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(json, postsListResponseSchema);
    });
  },
);

//Positive test verifying that a newly created, published post is returned in the public list
test.describe(
  "GET /posts - get the posts list reflecting a newly published post: should be successful",
  { tag: [TAG.regression, TAG.posts] },
  () => {
    let postId: string;
    let title: string;

    test.beforeAll(
      "Prepare test data: create a published post",
      async ({ postsController, randomString }) => {
        title = "Published post " + randomString;
        const response = await postsController.createPost(
          { title, isPublished: true },
          { failOnStatusCode: true },
        );
        const json = await response.json();
        postId = json.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created post",
      async ({ postsController }) => {
        await postsController.deletePost(postId, { failOnStatusCode: true });
      },
    );

    test("Newly published post appears in the public posts list", async ({
      postsController,
    }) => {
      const response = await test.step("Get the list of posts", async () => {
        return await postsController.getPosts({ failOnStatusCode: true });
      });
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(json, postsListResponseSchema);

      await test.step("Verify the published post is present in the list", async () => {
        const createdPost = json.find(
          (post: { id: string }) => post.id === postId,
        );
        expect.soft(createdPost).toBeTruthy();
        expect.soft(createdPost?.title).toBe(title);
        expect.soft(createdPost?.isPublished).toBe(true);
      });
    });
  },
);

//Negative business-rule test verifying that unpublished posts are excluded from the public list
test.describe(
  "GET /posts - get the posts list excluding an unpublished post: should be successful",
  { tag: [TAG.regression, TAG.posts] },
  () => {
    let postId: string;

    test.beforeAll(
      "Prepare test data: create an unpublished post",
      async ({ postsController, randomString }) => {
        const response = await postsController.createPost(
          { title: "Draft post " + randomString },
          { failOnStatusCode: true },
        );
        const json = await response.json();
        postId = json.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created post",
      async ({ postsController }) => {
        await postsController.deletePost(postId, { failOnStatusCode: true });
      },
    );

    test("Unpublished post does NOT appear in the public posts list", async ({
      postsController,
    }) => {
      const response = await test.step("Get the list of posts", async () => {
        return await postsController.getPosts({ failOnStatusCode: true });
      });
      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();
      await checkSchema(json, postsListResponseSchema);

      await test.step("Verify the unpublished post is absent from the list", async () => {
        const draftPost = json.find(
          (post: { id: string }) => post.id === postId,
        );
        expect.soft(draftPost).toBeFalsy();
      });
    });
  },
);
