import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";

export class AuthController extends BaseController {
  private tokenEndpoint = Endpoints.authEndpoint;

  //POST request to receive admin's token (all arguments are not mandatory)
  async registerUser(
    data?: { name?: string; email?: string; password?: string },
    options?: { failOnStatusCode?: boolean },
  ) {
    const response = await this.request.post(this.tokenEndpoint, {
      data: data,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }
}
