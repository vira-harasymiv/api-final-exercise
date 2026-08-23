import { BaseController } from "./Base/BaseController";
import { Endpoints } from "../utils/Endpoints";

export class UserInfoController extends BaseController {
  private userInfoEndpoint = Endpoints.userInfoEndpoint;

  //GET request to receive info about the currently authorized user (admin or client)
  async getUserInfo(options?: {
    headers?: { Authorization?: string };
    failOnStatusCode?: boolean;
  }) {
    return await this.request.get(this.userInfoEndpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }
}
