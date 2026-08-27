import {
  LearningPathBody,
  LearningPathCertificateInput,
  LearningPathInstructorInput,
  LearningPathModuleInput,
  LearningPathVideoInput,
} from "../interfaces/LearningPathBody";

//Fluent builder for a learning path create payload - chain the withX() setters for only the
//fields a test needs, then call build() to get the resulting LearningPathBody
class LearningPathBuilder {
  private learningPath: LearningPathBody = {};

  withTitle(title: string) {
    this.learningPath.title = title;
    return this;
  }

  withDescription(description: string) {
    this.learningPath.description = description;
    return this;
  }

  withModules(modules: LearningPathModuleInput[]) {
    this.learningPath.modules = modules;
    return this;
  }

  withCategoryIds(categoryIds: string[]) {
    this.learningPath.categoryIds = categoryIds;
    return this;
  }

  withVideo(video: LearningPathVideoInput) {
    this.learningPath.video = video;
    return this;
  }

  withCertificate(certificate: LearningPathCertificateInput) {
    this.learningPath.certificate = certificate;
    return this;
  }

  withInstructor(instructor: LearningPathInstructorInput) {
    this.learningPath.instructor = instructor;
    return this;
  }

  build(): LearningPathBody {
    return this.learningPath;
  }
}

export { LearningPathBuilder };
