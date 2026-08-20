import { BaseController } from "./BaseController";
import { Endpoints } from "../utils/Endpoints";

export class UserInfoController extends BaseController {
  private userInfoEndpoint = Endpoints.userInfoEndpoint;

  async getUserInfo(options: {
    headers?: { Authorization?: string };
    failOnStatusCode?: boolean;
  }) {
    const response = await this.request.get(this.userInfoEndpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }
}
