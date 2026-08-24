import { test, expect } from "../fixtures/api-fixtures";
import { CourseBuilder } from "../../app/utils/builders/CourseBuilder";
import { ChapterBuilder } from "../../app/utils/builders/ChapterBuilder";
import {
  checkBadStatusCode,
  checkMandatoryHeaders,
  checkOKStatusCode,
  checkSchema,
} from "../../app/utils/expect-helpers";
import { TAG } from "../../app/utils/tags";
import { courseCreatedSchema } from "../../app/json-schemas/courseSchemas";

//Positive test scenario for the course unpublish
test.describe("PATCH /courses/{courseId}/publish - unpublish course: should be successful", () => {
  // Course with a published chapter, non-empty title/description/image/price
  let courseId: string;
  let chapterId: string;
  const title = "New Course" + Math.floor(Math.random() * 1_000);
  const chapterTitle = "New Chapter" + Math.floor(Math.random() * 1_000);

  test.beforeAll(
    "Publish the new created course",
    async ({ coursesController }) => {
      //Create a course
      const responseCreate =
        await test.step("1. Create a new course", async () => {
          return await coursesController.createCourse(
            { title: title },
            { failOnStatusCode: true },
          );
        });
      courseId = (await responseCreate.json()).id;

      await test.step("2. Update the created course so that title, description, image, price are NOT empty", async () => {
        const payload = new CourseBuilder()
          .withDescription("Updated Description")
          .withImageUrl("https://freecatphotoapp.com")
          .withPrice(1.99)
          .build();
        await coursesController.updateCourse(courseId, payload, {
          failOnStatusCode: true,
        });
      });

      const responseAddChapter =
        await test.step("3. Add a chapter to the created and updated course", async () => {
          return await coursesController.addChapterToCourse(
            courseId,
            { title: chapterTitle },
            { failOnStatusCode: true },
          );
        });
      chapterId = (await responseAddChapter.json()).id;

      await test.step("4. Publish the added chapter", async () => {
        const payload = new ChapterBuilder().withIsPublished(true).build();
        await coursesController.updateChapter(courseId, chapterId, payload, {
          failOnStatusCode: true,
        });
      });

      const responsePublished =
        await test.step("5. Publish the created course", async () => {
          return await coursesController.publishCourseById(courseId, {
            failOnStatusCode: true,
          });
        });
      const json = await responsePublished.json();
      expect(json.isPublished).toBe(true);
    },
  );

  test.afterAll(
    "Clear test data: Delete the created course",
    async ({ coursesController }) => {
      await test.step("Delete the valid chapter", async () => {
        await coursesController.deleteChapter(courseId, chapterId, {
          failOnStatusCode: true,
        });
      });

      await test.step("Delete the valid course", async () => {
        await coursesController.deleteCourseById(courseId, {
          failOnStatusCode: true,
        });
      });
    },
  );

  test(
    "Unpublish a course - should be successful",
    { tag: [TAG.smoke, TAG.courses, TAG.regression, TAG.chapter] },
    async ({ coursesController }) => {
      const response =
        await test.step("Unpublish the created course", async () => {
          return await coursesController.publishCourseById(courseId, {
            failOnStatusCode: true,
          });
        });

      await checkMandatoryHeaders(response);
      await checkOKStatusCode(response);

      const json = await response.json();

      await checkSchema(
        json,
        courseCreatedSchema,
        "Course JSON does NOT match the schema",
      );

      expect.soft(json.isPublished).toBe(false);
      expect.soft(json.description.length).toBeGreaterThan(0);
      expect.soft(json.imageUrl.length).toBeGreaterThan(0);
      expect.soft(json.price.length).toBeGreaterThan(0);
    },
  );
});
