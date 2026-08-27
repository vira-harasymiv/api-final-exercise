import { CoursesController } from "../../../app/controllers/CoursesController";
import { CourseBuilder } from "../../../app/utils/builders/CourseBuilder";
import { ChapterBuilder } from "../../../app/utils/builders/ChapterBuilder";

//A date one year in the future - satisfies the "must be in the future" rule for a promo code's expiresAt
export const futureDate = () =>
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

//Short unique promo code that stays within the 20-char limit regardless of prefix length
export const randomCode = (prefix: string) =>
  (prefix + Math.floor(Math.random() * 1_000_000)).toUpperCase().slice(0, 20);

//Creates a published course with a non-empty description/image and the given price, plus a
//single published chapter - the minimum state a course must be in to be purchasable
export async function createPurchasableCourse(
  coursesController: CoursesController,
  title: string,
  price: number,
) {
  const responseCreate = await coursesController.createCourse(
    { title },
    { failOnStatusCode: true },
  );
  const jsonCreate = await responseCreate.json();
  const courseId: string = jsonCreate.id;

  const updatePayload = new CourseBuilder()
    .withDescription("Purchasable course description")
    .withImageUrl("https://freecatphotoapp.com")
    .withPrice(price)
    .build();
  await coursesController.updateCourse(courseId, updatePayload, {
    failOnStatusCode: true,
  });

  const responseChapter = await coursesController.addChapterToCourse(
    courseId,
    { title: "Chapter 1" },
    { failOnStatusCode: true },
  );
  const jsonChapter = await responseChapter.json();
  const chapterId: string = jsonChapter.id;

  const chapterPayload = new ChapterBuilder().withIsPublished(true).build();
  await coursesController.updateChapter(courseId, chapterId, chapterPayload, {
    failOnStatusCode: true,
  });

  await coursesController.publishCourseById(courseId, {
    failOnStatusCode: true,
  });

  return { courseId, chapterId };
}
