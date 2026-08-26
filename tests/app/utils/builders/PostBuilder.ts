import { PostBody } from "../interfaces/PostBody";

//Fluent builder for a post create/update payload - chain the withX() setters for only the
//fields a test needs, then call build() to get the resulting PostBody
class PostBuilder {
  private post: PostBody = {};

  withTitle(title: string) {
    this.post.title = title;
    return this;
  }

  withExcerpt(excerpt: string) {
    this.post.excerpt = excerpt;
    return this;
  }

  withContent(content: string) {
    this.post.content = content;
    return this;
  }

  withImageUrl(imageUrl: string) {
    this.post.imageUrl = imageUrl;
    return this;
  }

  withTagIds(tagIds: string[]) {
    this.post.tagIds = tagIds;
    return this;
  }

  withIsPublished(isPublished: boolean) {
    this.post.isPublished = isPublished;
    return this;
  }

  build(): PostBody {
    return this.post;
  }
}

export { PostBuilder };
