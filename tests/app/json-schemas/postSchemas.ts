import { z } from "zod";
import { tagSchema } from "./tagSchemas";

// Post item (returned by GET /posts list, POST /posts create, and PATCH /posts/{postId})
export const postSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().nullable(),
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isPublished: z.boolean(),
  publishedAt: z.iso.datetime().nullable(),
  tags: z.array(tagSchema),
  createdAt: z.iso.datetime(),
});
export type Post = z.infer<typeof postSchema>;

// Full GET /posts response - plain array, no pagination
export const postsListResponseSchema = z.array(postSchema);
export type PostsListResponse = z.infer<typeof postsListResponseSchema>;
