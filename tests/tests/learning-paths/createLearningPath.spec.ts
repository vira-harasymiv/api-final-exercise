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
import { learningPathSchema } from "../../app/json-schemas/learningPathSchemas";
import { LearningPathBuilder } from "../../app/utils/builders/LearningPathBuilder";
import {
  invalidInstructors,
  invalidTitleDataTypes,
  invalidTitles,
} from "./testData/testData";
import { prisma } from "@/lib/prisma";

//Positive tests for creating a learning path with nested resources by an admin
test.describe(
  "POST /learning-paths - Create a learning path: should be successful",
  { tag: [TAG.smoke, TAG.regression, TAG.learningPaths] },
  () => {
    let categoryId: string;

    test.beforeAll(
      "Prepare test data: create a category to attach to the learning path",
      async ({ categoriesController, randomString }) => {
        const response = await categoriesController.createCategory(
          { name: "LP Category " + randomString },
          { failOnStatusCode: true },
        );
        const json = await response.json();
        categoryId = json.id;
      },
    );

    test.afterAll(
      "Clear test data: delete the created category",
      async ({ categoriesController }) => {
        await test.step("Delete the created category", async () => {
          await categoriesController.deleteCategory(categoryId, {
            failOnStatusCode: true,
          });
        });
      },
    );

    test("Create a learning path with only the required fields - should be successful with defaults applied", async ({
      learningPathsController,
      randomString,
    }) => {
      const uniqueTitle =
        "Learning path only with required fields" + randomString;
      const uniqueInstructor = "Instructor" + randomString;
      const data = new LearningPathBuilder()
        .withTitle(uniqueTitle)
        .withInstructor({ name: uniqueInstructor })
        .build();

      const response =
        await test.step("Create a new learning path", async () => {
          return await learningPathsController.createLearningPath(data, {
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();

      await checkSchema(
        json,
        learningPathSchema,
        "JSON of the created learning path does NOT match expected schema",
      );

      await test.step("Verify the fields and defaults in the response", async () => {
        expect.soft(json.title).toBe(uniqueTitle);
        expect.soft(json.description).toBeNull();
        expect.soft(json.isPublished).toBe(false);
        expect.soft(json.modules).toEqual([]);
        expect.soft(json.categories).toEqual([]);
        expect.soft(json.video).toBeNull();
        expect.soft(json.certificate).toBeNull();
        expect.soft(json.instructor.name).toBe(uniqueInstructor);
        expect.soft(json.instructor.bio).toBeNull();
      });

      await test.step("Check the created learning path in db", async () => {
        const learningPath = await prisma.learningPath.findFirst({
          where: { id: json.id },
        });
        expect.soft(learningPath).not.toBeNull();
        expect.soft(learningPath?.title).toBe(uniqueTitle);
        expect.soft(learningPath?.description).toBe(null);
        expect.soft(learningPath?.isPublished).toBe(false);
        expect.soft(learningPath?.videoId).toBe(null);
        expect.soft(learningPath?.instructorId).toBe(json.instructor.id);
      });
    });

    test("Create a learning path with all fields - should be successful", async ({
      learningPathsController,
      randomString,
    }) => {
      const uniqueTitle = "Full LP" + randomString;
      const uniqueDescription = "A complete learning path" + randomString;
      const data = new LearningPathBuilder()
        .withTitle(uniqueTitle)
        .withDescription(uniqueDescription)
        .withModules([{ title: "Module 1", description: "Intro", position: 1 }])
        .withCategoryIds([categoryId])
        .withVideo({ title: "Intro video", videoId: "dQw4w9WgXcQ" })
        .withCertificate({
          name: "Completion Certificate",
          description: "Awarded on completion",
          templateUrl: "https://example.com/template.png",
        })
        .withInstructor({
          name: "John Smith",
          bio: "Senior instructor",
          avatarUrl: "https://example.com/avatar.png",
        })
        .build();

      const response =
        await test.step("Create a new learning path with all fields", async () => {
          return await learningPathsController.createLearningPath(data, {
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(response);
      await checkCreatedStatusCode(response);

      const json = await response.json();

      await checkSchema(
        json,
        learningPathSchema,
        "JSON of the created learning path does NOT match expected schema",
      );

      await test.step("Verify all the fields in the response", async () => {
        expect.soft(json.title).toBe(uniqueTitle);
        expect.soft(json.description).toBe(uniqueDescription);
        expect.soft(json.modules).toHaveLength(1);
        expect.soft(json.modules[0].title).toBe("Module 1");
        expect.soft(json.categories).toHaveLength(1);
        expect.soft(json.categories[0].id).toBe(categoryId);
        expect.soft(json.video.videoId).toBe("dQw4w9WgXcQ");
        expect.soft(json.certificate.name).toBe("Completion Certificate");
        expect.soft(json.instructor.name).toBe("John Smith");
        expect.soft(json.instructor.bio).toBe("Senior instructor");
      });

      await test.step("Check the created learning path in db", async () => {
        const learningPath = await prisma.learningPath.findFirst({
          where: { id: json.id },
        });
        expect.soft(learningPath).not.toBeNull();
        expect.soft(learningPath?.title).toBe(uniqueTitle);
        expect
          .soft(learningPath?.slug)
          .toBe(uniqueTitle.toLowerCase().replace(/\s+/g, "-"));
        expect.soft(learningPath?.description).toBe(uniqueDescription);
        expect.soft(learningPath?.isPublished).toBe(false);
        expect.soft(learningPath?.videoId).toBe(json.video.id);
        expect.soft(learningPath?.instructorId).toBe(json.instructor.id);
      });

      await test.step("Check learning path module in db", async () => {
        const learningPathModule = await prisma.learningPathModule.findFirst({
          where: { id: json.modules[0].id },
        });
        expect.soft(learningPathModule).not.toBeNull;
        expect.soft(learningPathModule?.title).toBe("Module 1");
        expect.soft(learningPathModule?.description).toBe("Intro");
        expect.soft(learningPathModule?.position).toBe(1);
        expect.soft(learningPathModule?.learningPathId).toBe(json.id);
      });
    });
  },
);

//Negative tests for creating a learning path with an invalid title
test.describe(
  "POST /learning-paths - Create a learning path with invalid title: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.learningPaths] },
  () => {
    for (const { id, description, data } of invalidTitles) {
      test(`${id}. Create a learning path with ${description} - should be 400 error`, async ({
        learningPathsController,
      }) => {
        const response =
          await test.step(`Try to create a learning path with ${description}`, async () => {
            return await learningPathsController.createLearningPathWithInvalidData(
              { title: data, instructor: { name: "Jane Doe" } },
              { failOnStatusCode: false },
            );
          });

        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        const json = await response.json();
        expect.soft(json.error).toBe("Title must be at least 3 characters");
      });
    }

    for (const { id, dataType, data } of invalidTitleDataTypes) {
      test(
        `${id}. Create a learning path using an invalid data type for title = ${dataType} - should be 400 error`,
        { tag: [TAG.invalidDataTypes] },
        async ({ learningPathsController }) => {
          const response =
            await test.step(`Try to create a learning path with title = ${dataType}`, async () => {
              return await learningPathsController.createLearningPathWithInvalidData(
                { title: data, instructor: { name: "Jane Doe" } },
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

//Negative tests for creating a learning path with an invalid instructor
test.describe(
  "POST /learning-paths - Create a learning path with invalid instructor: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.learningPaths] },
  () => {
    for (const { id, description, data } of invalidInstructors) {
      test(`${id}. Create a learning path with ${description} - should be 400 error`, async ({
        learningPathsController,
      }) => {
        const response =
          await test.step(`Try to create a learning path with ${description}`, async () => {
            return await learningPathsController.createLearningPathWithInvalidData(
              { title: "Valid Title", instructor: data },
              { failOnStatusCode: false },
            );
          });

        await checkMandatoryHeaders(response);
        await checkBadStatusCode(response);
        const json = await response.json();
        expect
          .soft(json.error)
          .toBe("Instructor is required with at least a name");
      });
    }
  },
);

//Negative test for creating a learning path referencing a non-existing category
test.describe(
  "POST /learning-paths - Create a learning path with a non-existing category: negative tests",
  {
    tag: [
      TAG.negative,
      TAG.regression,
      TAG.learningPaths,
      TAG.nonExistingValues,
    ],
  },
  () => {
    //! a non-existing categoryId currently produces an uncaught 500 instead of a 400/404
    test("Create a learning path with a non-existing categoryId - should be error", async ({
      learningPathsController,
    }) => {
      const response =
        await test.step("Try to create a learning path with a non-existing categoryId", async () => {
          return await learningPathsController.createLearningPathWithInvalidData(
            {
              title: "Bad Category LP",
              instructor: { name: "Jane Doe" },
              categoryIds: ["non-existing-category-id"],
            },
            { failOnStatusCode: false },
          );
        });
      expect(response.status()).toBeLessThan(500);
    });
  },
);

//Negative tests for creating a learning path without proper authorization
test.describe(
  "POST /learning-paths - Create a learning path without proper authorization: negative tests",
  {
    tag: [TAG.negative, TAG.regression, TAG.learningPaths, TAG.permissions],
  },
  () => {
    test.use({ isAuthorized: false });

    test("Create a learning path without authorization - should be 401 error", async ({
      learningPathsController,
    }) => {
      const response =
        await test.step("Try to create a learning path without authorization", async () => {
          return await learningPathsController.createLearningPath(
            { title: "Unauthorized LP", instructor: { name: "Jane Doe" } },
            { failOnStatusCode: false },
          );
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Unauthorized");
    });

    test("Create a learning path as a client with READ role - should be 403 error", async ({
      learningPathsController,
      readClientToken,
    }) => {
      const response =
        await test.step("Try to create a learning path as a client with READ role", async () => {
          return await learningPathsController.createLearningPath(
            { title: "Forbidden LP", instructor: { name: "Jane Doe" } },
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

    test("Create a learning path as a client with READ and WRITE role - should be 403 error", async ({
      learningPathsController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Try to create a learning path as a client with READ and WRITE role", async () => {
          return await learningPathsController.createLearningPath(
            { title: "Forbidden LP", instructor: { name: "Jane Doe" } },
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

    test("Create a learning path as a client with READ, WRITE, and ADMIN role - should be 403 error", async ({
      learningPathsController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Try to create a learning path as a client with READ, WRITE, and ADMIN role", async () => {
          return await learningPathsController.createLearningPath(
            { title: "Forbidden LP", instructor: { name: "Jane Doe" } },
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
