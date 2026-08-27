import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { PromoCodeBody } from "../utils/interfaces/PromoCodeBody";

export class PromoCodesController extends BaseController {
  private adminCoursesEndpoint = Endpoints.adminCoursesEndpoint;

  //GET request to get the list of promo codes for a course
  async getPromoCodes(
    courseId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.get(
      `${this.adminCoursesEndpoint}/${courseId}/promo-codes`,
      {
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }

  //POST request to create a new promo code for a course
  async createPromoCode(
    courseId: string,
    data?: PromoCodeBody,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(
      `${this.adminCoursesEndpoint}/${courseId}/promo-codes`,
      {
        data,
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }

  //POST request to create a new promo code using INVALID data
  async createPromoCodeWithInvalidData(
    courseId: string,
    data?: {
      code?: any;
      discountPercent?: any;
      maxUses?: any;
      expiresAt?: any;
    },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(
      `${this.adminCoursesEndpoint}/${courseId}/promo-codes`,
      {
        data,
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }

  //PATCH request to toggle a promo code's active status
  async togglePromoCode(
    courseId: string,
    promoCodeId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.patch(
      `${this.adminCoursesEndpoint}/${courseId}/promo-codes/${promoCodeId}`,
      {
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }

  //DELETE request to delete a promo code by ID
  async deletePromoCode(
    courseId: string,
    promoCodeId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.delete(
      `${this.adminCoursesEndpoint}/${courseId}/promo-codes/${promoCodeId}`,
      {
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }
}
