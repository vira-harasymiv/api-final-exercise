import { z } from "zod";

// Tag item (returned by GET /tags list and POST /tags create)
export const tagSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
});
export type Tag = z.infer<typeof tagSchema>;

// Full GET /tags response - plain array, no pagination
export const tagsListResponseSchema = z.array(tagSchema);
export type TagsListResponse = z.infer<typeof tagsListResponseSchema>;
