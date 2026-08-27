import { PromoCodeBody } from "../interfaces/PromoCodeBody";

//Fluent builder for a promo code create payload - chain the withX() setters for only the
//fields a test needs, then call build() to get the resulting PromoCodeBody
class PromoCodeBuilder {
  private promoCode: PromoCodeBody = {};

  withCode(code: string) {
    this.promoCode.code = code;
    return this;
  }

  withDiscountPercent(discountPercent: number) {
    this.promoCode.discountPercent = discountPercent;
    return this;
  }

  withMaxUses(maxUses: number | null) {
    this.promoCode.maxUses = maxUses;
    return this;
  }

  withExpiresAt(expiresAt: string) {
    this.promoCode.expiresAt = expiresAt;
    return this;
  }

  build(): PromoCodeBody {
    return this.promoCode;
  }
}

export { PromoCodeBuilder };
