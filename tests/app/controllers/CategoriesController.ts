import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { RequestOptions } from "../utils/interfaces";

export class CategoriesController extends BaseController {
  private categoriesEndpoint = Endpoints.categoriesEndpoint;

  //Create a new category with POST
  createCategory(data?: { name: string }, options?: RequestOptions) {
    return this.post(this.categoriesEndpoint, { name: data?.name }, options);
  }

  //Delete the created category
  deleteCategory(categoryId: string, options?: RequestOptions) {
    return this.delete(`${this.categoriesEndpoint}/${categoryId}`, options);
  }

  //Get categories list
  getListOfCategories(options?: RequestOptions) {
    return this.get(this.categoriesEndpoint, options);
  }
}
