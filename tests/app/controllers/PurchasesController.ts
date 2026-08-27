import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { PurchaseBody } from "../utils/interfaces/PurchaseBody";

export class PurchasesController extends BaseController {
  private coursesEndpoint = Endpoints.coursesEndpoint;
  private purchasesEndpoint = Endpoints.purchasesEndpoint;

  //POST request to purchase a course, optionally applying a promo code
  async purchaseCourse(
    courseId: string,
    data?: PurchaseBody,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(
      `${this.coursesEndpoint}/${courseId}/purchase`,
      {
        data,
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }

  //GET request to list the authenticated user's purchases
  async getPurchases(options?: {
    headers?: { Authorization?: string };
    failOnStatusCode?: boolean;
  }) {
    return await this.request.get(this.purchasesEndpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }
}
