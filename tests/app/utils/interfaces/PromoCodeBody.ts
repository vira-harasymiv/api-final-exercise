//Request body shape for POST /admin/courses/{courseId}/promo-codes - code, discountPercent,
//and expiresAt are required; maxUses is optional (built via PromoCodeBuilder)
export interface PromoCodeBody {
  code?: string;
  discountPercent?: number;
  maxUses?: number | null;
  expiresAt?: string;
}
