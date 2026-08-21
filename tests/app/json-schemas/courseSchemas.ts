import { z } from "zod";

// Created course item
export const courseCreatedSchema = z.object({
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
export type CourseCreated = z.infer<typeof courseCreatedSchema>;

// Course detail item (created course + relations)
export const courseSchema = courseCreatedSchema.extend({
  categories: z.array(z.string()),
  chapters: z.array(z.string()),
  attachments: z.array(z.string()),
});
export type CourseDetail = z.infer<typeof courseSchema>;

// Category item
export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
});
export type Category = z.infer<typeof categorySchema>;

// Course list item (created course + categories + _count, no chapters/attachments)
export const courseListItemSchema = courseCreatedSchema.extend({
  categories: z.array(categorySchema),
  _count: z.record(z.string(), z.number()),
});
export type CourseListItem = z.infer<typeof courseListItemSchema>;

// Pagination metadata
export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type Pagination = z.infer<typeof paginationSchema>;

// Full GET /courses response
export const coursesListResponseSchema = z.object({
  data: z.array(courseListItemSchema),
  pagination: paginationSchema,
});
export type CoursesListResponse = z.infer<typeof coursesListResponseSchema>;
