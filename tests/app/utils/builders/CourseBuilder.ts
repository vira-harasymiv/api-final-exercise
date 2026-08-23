import { CourseUpdateBody } from "../interfaces/CourseUpdateBode";

class CourseBuilder {
  private course: CourseUpdateBody = {};

  withTitle(title: string) {
    this.course.title = title;
    return this;
  }

  withDescription(description: string) {
    this.course.description = description;
    return this;
  }

  withImageUrl(imageUrl: string) {
    this.course.imageUrl = imageUrl;
    return this;
  }

  withPrice(price: number) {
    this.course.price = price;
    return this;
  }

  withCategoryIds(categoryIds: string[]) {
    this.course.categoryIds = categoryIds;
    return this;
  }

  withOutcomes(outcomes: string[]) {
    this.course.outcomes = outcomes;
    return this;
  }

  withRequirements(requirements: string[]) {
    this.course.requirements = requirements;
    return this;
  }

  withAuthorName(authorName: string) {
    this.course.authorName = authorName;
    return this;
  }

  withAuthorRole(authorRole: string) {
    this.course.authorRole = authorRole;
    return this;
  }

  build(): CourseUpdateBody {
    return this.course;
  }
}

export { CourseBuilder };
