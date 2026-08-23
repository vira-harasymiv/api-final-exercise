import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";

export class CategoriesController extends BaseController {
  private categoriesEndpoint = Endpoints.categoriesEndpoint;

  //Create a new category with POST
  async createCategory(
    data?: { name: string },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.categoriesEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //Delete the created category
  async deleteCategory(
    categoryId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.delete(
      `${this.categoriesEndpoint}/${categoryId}`,
      {
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }

  //Get categories list
  async getListOfCategories(options?: {
    headers?: { Authorization?: string };
    failOnStatusCode?: boolean;
  }) {
    return await this.request.get(this.categoriesEndpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }
}
