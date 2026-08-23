import { ChapterUpdateBody } from "../interfaces/ChapterUpdateBody";

//Fluent builder for a chapter update payload - chain the withX() setters for only the
//fields a test needs, then call build() to get the resulting ChapterUpdateBody
class ChapterBuilder {
  private chapter: ChapterUpdateBody = {};

  withTitle(title: string) {
    this.chapter.title = title;
    return this;
  }

  withDescription(description: string) {
    this.chapter.description = description;
    return this;
  }

  withVideoUrl(videoUrl: string) {
    this.chapter.videoUrl = videoUrl;
    return this;
  }

  withTimecodes(timecodes: string) {
    this.chapter.timecodes = timecodes;
    return this;
  }

  withNotes(notes: string) {
    this.chapter.notes = notes;
    return this;
  }

  withHomework(homework: string) {
    this.chapter.homework = homework;
    return this;
  }

  withIsPublished(isPublished: boolean) {
    this.chapter.isPublished = isPublished;
    return this;
  }

  withIsFree(isFree: boolean) {
    this.chapter.isFree = isFree;
    return this;
  }

  build(): ChapterUpdateBody {
    return this.chapter;
  }
}

export { ChapterBuilder };
