import { test, expect } from "../fixtures/api-fixtures";
import { CourseBuilder } from "../../app/utils/builders/CourseBuilder";
import { ChapterBuilder } from "../../app/utils/builders/ChapterBuilder";
import {
  checkAcceptEncodingHeaders,
  checkBadStatusCode,
  checkMandatoryHeaders,
  checkNotFoundStatusCode,
  checkOKStatusCode,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { TAG } from "../../app/utils/tags";
import { courseCreatedSchema } from "../../app/json-schemas/courseSchemas";

//Positive and negative tests of publish/unpublish a course
test.describe("PATCH /courses/{courseId}/publish - publish course: positive tests", () => {
  // Course with a published chapter, non-empty title/description/image/price
  let validCourseId: string;
  let validChapterId: string;
  const validTitle = "New Course" + Math.floor(Math.random() * 1_000);
  const validChapterTitle = "New Chapter" + Math.floor(Math.random() * 1_000);

  // Course with an unpublished chapter
  let courseWithUnpublishedChapterId: string;
  let unpublishedChapterId: string;
  const unpublishedChapterCourseTitle =
    "Course Unpublished Chapter" + Math.floor(Math.random() * 1_000);
  const unpublishedChapterTitle =
    "Unpublished Chapter" + Math.floor(Math.random() * 1_000);

  // Course without any chapter
  let courseWithoutChapterId: string;
  const courseWithoutChapterTitle =
    "Course Without Chapter" + Math.floor(Math.random() * 1_000);

  // Course with empty description, image, price
  let courseWithEmptyPropsId: string;
  const courseWithEmptyPropsTitle =
    "Course Empty Props" + Math.floor(Math.random() * 1_000);

  test.beforeAll(
    "Prepare test data: a course with non-empty title, description, image, price and added at least one published chapter, a course with non-published chapter, a course without chapter, a course with empty description, image, price",
    async ({ coursesController }) => {
      //Course 1: valid course with published chapter
      const responseCreate =
        await test.step("1. Create a new course", async () => {
          return await coursesController.createCourse(
            { title: validTitle },
            { failOnStatusCode: true },
          );
        });
      const jsonCreate = await responseCreate.json();
      validCourseId = jsonCreate.id;

      await test.step("2. Update the created course so that title, description, image, price are NOT empty", async () => {
        const payload = new CourseBuilder()
          .withDescription("Updated Description")
          .withImageUrl("https://freecatphotoapp.com")
          .withPrice(1.99)
          .build();
        await coursesController.updateCourse(validCourseId, payload, {
          failOnStatusCode: true,
        });
      });

      const responseAddChapter =
        await test.step("3. Add a chapter to the created and updated course", async () => {
          return await coursesController.addChapterToCourse(
            validCourseId,
            { title: validChapterTitle },
            { failOnStatusCode: true },
          );
        });
      const jsonAddChapter = await responseAddChapter.json();
      validChapterId = jsonAddChapter.id;

      await test.step("4. Publish the added chapter", async () => {
        const payload = new ChapterBuilder().withIsPublished(true).build();
        await coursesController.updateChapter(
          validCourseId,
          validChapterId,
          payload,
          { failOnStatusCode: true },
        );
      });

      //Course 2: course with an unpublished chapter
      const responseCreateUnpublished =
        await test.step("5. Create a course with an unpublished chapter", async () => {
          return await coursesController.createCourse(
            { title: unpublishedChapterCourseTitle },
            { failOnStatusCode: true },
          );
        });
      const jsonCreateUnpublished = await responseCreateUnpublished.json();
      courseWithUnpublishedChapterId = jsonCreateUnpublished.id;

      const responseUpdateUnpublished =
        await test.step("6. Update the created course so that title, description, image, price are NOT empty", async () => {
          const payload = new CourseBuilder()
            .withDescription("Updated Description")
            .withImageUrl("https://freecatphotoapp.com")
            .withPrice(2.99)
            .build();
          return await coursesController.updateCourse(
            courseWithUnpublishedChapterId,
            payload,
            {
              failOnStatusCode: true,
            },
          );
        });

      const responseAddUnpublishedChapter =
        await test.step("7. Add a chapter without publishing it", async () => {
          return await coursesController.addChapterToCourse(
            courseWithUnpublishedChapterId,
            { title: unpublishedChapterTitle },
            { failOnStatusCode: true },
          );
        });
      const jsonAddUnpublishedChapter =
        await responseAddUnpublishedChapter.json();
      unpublishedChapterId = jsonAddUnpublishedChapter.id;

      //Course 3: course without any chapter
      const responseCreateWithoutChapter =
        await test.step("8. Create a course without any chapter", async () => {
          return await coursesController.createCourse(
            { title: courseWithoutChapterTitle },
            { failOnStatusCode: true },
          );
        });
      const jsonCreateWithoutChapter =
        await responseCreateWithoutChapter.json();
      courseWithoutChapterId = jsonCreateWithoutChapter.id;

      const responseUpdatedWithoutChapter =
        await test.step("9. Update the created course so that title, description, image, price are NOT empty", async () => {
          const payload = new CourseBuilder()
            .withDescription("Updated Description")
            .withImageUrl("https://freecatphotoapp.com")
            .withPrice(2.99)
            .build();
          return await coursesController.updateCourse(
            courseWithoutChapterId,
            payload,
            {
              failOnStatusCode: true,
            },
          );
        });

      //Course 4: course with empty description, image, price
      const responseCreateEmptyProps =
        await test.step("10. Create a course with empty description, image, price", async () => {
          return await coursesController.createCourse(
            { title: courseWithEmptyPropsTitle },
            { failOnStatusCode: true },
          );
        });
      const jsonCreateEmptyProps = await await responseCreateEmptyProps.json();
      courseWithEmptyPropsId = jsonCreateEmptyProps.id;
    },
  );

  test.afterAll(
    "Clear test data: Delete all created courses and chapters",

    async ({ coursesController }) => {
      await test.step("Delete the valid chapter", async () => {
        await coursesController.deleteChapter(validCourseId, validChapterId, {
          failOnStatusCode: true,
        });
      });

      await test.step("Delete the valid course", async () => {
        await coursesController.deleteCourseById(validCourseId, {
          failOnStatusCode: true,
        });
      });

      await test.step("Delete the unpublished chapter", async () => {
        await coursesController.deleteChapter(
          courseWithUnpublishedChapterId,
          unpublishedChapterId,
          { failOnStatusCode: true },
        );
      });

      await test.step("Delete the course with unpublished chapter", async () => {
        await coursesController.deleteCourseById(
          courseWithUnpublishedChapterId,
          { failOnStatusCode: true },
        );
      });

      await test.step("Delete the course without chapter", async () => {
        await coursesController.deleteCourseById(courseWithoutChapterId, {
          failOnStatusCode: true,
        });
      });

      await test.step("Delete the course with empty properties", async () => {
        await coursesController.deleteCourseById(courseWithEmptyPropsId, {
          failOnStatusCode: true,
        });
      });
    },
  );

  test(
    "Publish a course - should be successful",
    { tag: [TAG.smoke, TAG.courses, TAG.regression, TAG.chapter] },
    async ({ coursesController }) => {
      const response =
        await test.step("Publish the created course", async () => {
          return await coursesController.publishCourseById(validCourseId, {
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();

      await checkSchema(json, courseCreatedSchema);

      await test.step("Verify if the course has been published", async () => {
        const responseGet = await coursesController.getCourseById(
          validCourseId,
          {
            failOnStatusCode: true,
          },
        );
        const jsonGet = await responseGet.json();
        const { categories, chapters, attachments, ...courseFieldsGet } =
          jsonGet;
        expect.soft(courseFieldsGet).toEqual(json);
        expect.soft(jsonGet.isPublished).toBe(true);
        expect.soft(jsonGet.description.length).toBeGreaterThan(0);
        expect.soft(jsonGet.imageUrl.length).toBeGreaterThan(0);
        expect.soft(jsonGet.price.length).toBeGreaterThan(0);
      });
    },
  );

  test(
    "Publish course with unpublished chapter - should be error",
    { tag: [TAG.negative, TAG.courses, TAG.regression, TAG.chapter] },
    async ({ coursesController }) => {
      const response =
        await test.step("Try to publish a course with an unpublished chapter", async () => {
          return await coursesController.publishCourseById(
            courseWithUnpublishedChapterId,
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkBadStatusCode(response);
      const json = await response.json();
      expect.soft(json.isPublished).toBeFalsy();
      expect
        .soft(json.error)
        .toBe("At least one published chapter is required");
      expect.soft(json.isPublished).toBeFalsy();
    },
  );

  test(
    "Publish course without added chapter - should be error",
    { tag: [TAG.negative, TAG.courses, TAG.regression] },
    async ({ coursesController }) => {
      const response =
        await test.step("Try to publish a course without any chapter", async () => {
          return await coursesController.publishCourseById(
            courseWithoutChapterId,
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkBadStatusCode(response);
      const json = await response.json();
      expect
        .soft(json.error)
        .toBe("At least one published chapter is required");
      expect.soft(json.isPublished).toBeFalsy();
    },
  );

  test(
    "Publish course with empty properties - should be error",
    { tag: [TAG.negative, TAG.courses, TAG.regression] },
    async ({ coursesController }) => {
      const response =
        await test.step("Try to publish a course with empty description, image, price", async () => {
          return await coursesController.publishCourseById(
            courseWithEmptyPropsId,
            { failOnStatusCode: false },
          );
        });

      await checkMandatoryHeaders(response);
      await checkBadStatusCode(response);
      const json = await response.json();
      expect
        .soft(json.error)
        .toBe("Missing required fields (title, description, image, price)");
      expect.soft(json.isPublished).toBeFalsy();
    },
  );

  test(
    "Publish course with non-existing ID - should be error",
    { tag: [TAG.negative, TAG.courses, TAG.regression] },
    async ({ coursesController }) => {
      const response =
        await test.step("Try to publish a course with non-existing ID", async () => {
          return await coursesController.publishCourseById("non-existing id", {
            failOnStatusCode: false,
          });
        });

      await checkMandatoryHeaders(response);
      await checkNotFoundStatusCode(response);
      const json = await response.json();
      expect.soft(json.error).toBe("Not found");
    },
  );
});

//Negative test scenario for the course publish without authorization
test.describe(
  "PATCH /courses/{courseId}/publish - publish course without authorization",
  {
    tag: [TAG.smoke, TAG.courses, TAG.regression, TAG.chapter, TAG.negative],
  },
  () => {
    test.use({ isAuthorized: false });

    test("Publish a course without authorization - should be 401 error", async ({
      coursesController,
    }) => {
      const response =
        await test.step("Publish the created course without authorization", async () => {
          return await coursesController.publishCourseById("any course", {
            failOnStatusCode: false,
          });
        });

      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Unauthorized");
      });
    });
  },
);
