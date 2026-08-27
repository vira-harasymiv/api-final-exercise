import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { LearningPathBody } from "../utils/interfaces/LearningPathBody";

export class LearningPathsController extends BaseController {
  private learningPathsEndpoint = Endpoints.learningPathsEndpoint;

  //POST request to create a new learning path with nested resources
  async createLearningPath(
    data?: LearningPathBody,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.learningPathsEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to create a new learning path using INVALID data
  async createLearningPathWithInvalidData(
    data?: Record<string, any>,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.learningPathsEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }
}
