import { BaseController } from "../Base/BaseController";
import { Endpoints } from "../../utils/Endpoints";

export class RevokeController extends BaseController {
  private revokeEndpoint = Endpoints.revokeEndpoint;

  //POST request to revoke refresh token
  async revokeToken(
    data?: {
      token?: string;
    },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    const response = await this.request.post(this.revokeEndpoint, {
      data: data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }

  //POST request to revoke invalid refresh token
  async revokeInvalidToken(
    data?: {
      token?: string | any;
    },
    options?: { failOnStatusCode?: false },
  ) {
    const response = await this.request.post(this.revokeEndpoint, {
      data: data,
    });
    return response;
  }
}
