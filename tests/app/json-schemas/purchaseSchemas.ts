import { z } from "zod";

// Purchase item (returned by POST /courses/{courseId}/purchase and GET /purchases)
export const purchaseSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  courseId: z.string().min(1),
  amount: z.string(),
  promoCode: z.string().nullable(),
  createdAt: z.iso.datetime(),
});
export type Purchase = z.infer<typeof purchaseSchema>;

// Purchase item as returned by GET /purchases - includes nested course info
export const purchaseWithCourseSchema = purchaseSchema.extend({
  course: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    slug: z.string().min(1),
    imageUrl: z.string().nullable(),
  }),
});
export type PurchaseWithCourse = z.infer<typeof purchaseWithCourseSchema>;

// Full GET /purchases response - plain array, no pagination
export const purchasesListResponseSchema = z.array(purchaseWithCourseSchema);
export type PurchasesListResponse = z.infer<
  typeof purchasesListResponseSchema
>;
