import { z } from "zod";

export const courseUpdatedSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  slug: z.string().min(1),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: z.string().nullable(),
  isPublished: z.boolean(),
  isListed: z.boolean(),
  isFeatured: z.boolean(),
  featuredOrder: z.number(),
  outcomes: z.string().nullable(),
  requirements: z.string().nullable(),
  authorName: z.string().nullable(),
  authorRole: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type CourseUpdated = z.infer<typeof courseUpdatedSchema>;
