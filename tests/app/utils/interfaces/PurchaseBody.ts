//Request body shape for POST /courses/{courseId}/purchase - promoCode is optional
export interface PurchaseBody {
  promoCode?: string;
}
