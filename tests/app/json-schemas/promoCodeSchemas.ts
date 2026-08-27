import { z } from "zod";

// Promo code item (returned by POST /admin/courses/{courseId}/promo-codes create
// and PATCH .../promo-codes/{promoCodeId} toggle)
export const promoCodeSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  courseId: z.string().min(1),
  discountPercent: z.number(),
  maxUses: z.number().nullable(),
  currentUses: z.number(),
  expiresAt: z.iso.datetime(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type PromoCode = z.infer<typeof promoCodeSchema>;

// Promo code list item (promo code + _count, as returned by GET .../promo-codes)
export const promoCodeListItemSchema = promoCodeSchema.extend({
  _count: z.object({ usages: z.number() }),
});
export type PromoCodeListItem = z.infer<typeof promoCodeListItemSchema>;

// Full GET .../promo-codes response - plain array, no pagination
export const promoCodesListResponseSchema = z.array(promoCodeListItemSchema);
export type PromoCodesListResponse = z.infer<
  typeof promoCodesListResponseSchema
>;
