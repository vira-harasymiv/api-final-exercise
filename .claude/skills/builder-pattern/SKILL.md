---
name: builder-pattern
description: when you need to build request body with 3 or more properties, use this pattern
---

- create new interfaces in this folder:
  `tests/app/utils/interfaces`
- builder classes create in this folder: `tests/app/utils/builders`
- Class properties should be private.
- Follow this example:

```typescript
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
}
export { ChapterBuilder };
```
