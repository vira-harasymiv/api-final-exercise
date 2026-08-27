import { z } from "zod";

// Category, as nested in the LearningPath response
export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
});

// Module nested in the LearningPath response
export const learningPathModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  position: z.number(),
  learningPathId: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// YouTubeVideo nested in the LearningPath response
export const youTubeVideoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  videoId: z.string().min(1),
  description: z.string().nullable(),
  position: z.number(),
  isPublished: z.boolean(),
  createdAt: z.iso.datetime(),
});

// Certificate nested in the LearningPath response
export const certificateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  templateUrl: z.string().nullable(),
  learningPathId: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// Instructor nested in the LearningPath response
export const instructorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// Full LearningPath response, as returned by POST /learning-paths
export const learningPathSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  isPublished: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  modules: z.array(learningPathModuleSchema),
  categories: z.array(categorySchema),
  video: youTubeVideoSchema.nullable(),
  certificate: certificateSchema.nullable(),
  instructor: instructorSchema,
});
export type LearningPath = z.infer<typeof learningPathSchema>;
