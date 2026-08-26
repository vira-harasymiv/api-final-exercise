import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";

export class TagsController extends BaseController {
  private tagsEndpoint = Endpoints.tagsEndpoint;

  //GET request to get the list of all tags
  async getTags(options?: {
    headers?: { Authorization?: string };
    failOnStatusCode?: boolean;
  }) {
    return await this.request.get(this.tagsEndpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to create a new tag
  async createTag(
    data?: { name?: string },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.tagsEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to create a new tag using INVALID data
  async createTagWithInvalidData(
    data?: { name?: any },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.tagsEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //DELETE request to delete a tag by ID
  async deleteTag(
    tagId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.delete(`${this.tagsEndpoint}/${tagId}`, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }
}
