import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";

export class AuthController extends BaseController {
  private authEndpoint = Endpoints.authEndpoint;

  //POST request to register a new user
  async registerUser(
    data?: { name?: string; email?: string; password?: string },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.authEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }
}
