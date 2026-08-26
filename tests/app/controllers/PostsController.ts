import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { PostBody } from "../utils/interfaces/PostBody";

export class PostsController extends BaseController {
  private postsEndpoint = Endpoints.postsEndpoint;

  //GET request to get the list of published posts
  async getPosts(options?: {
    headers?: { Authorization?: string };
    failOnStatusCode?: boolean;
  }) {
    return await this.request.get(this.postsEndpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to create a new post
  async createPost(
    data?: PostBody,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.postsEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to create a new post using INVALID data
  async createPostWithInvalidData(
    data?: { title?: any },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.postsEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //PATCH request to update a post
  async updatePost(
    postId: string,
    data?: PostBody,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.patch(`${this.postsEndpoint}/${postId}`, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //DELETE request to delete a post by ID
  async deletePost(
    postId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.delete(`${this.postsEndpoint}/${postId}`, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }
}
