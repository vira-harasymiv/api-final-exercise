import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";

export class RevokeController extends BaseController {
  private revokeEndpoint = Endpoints.revokeEndpoint;

  //POST request to revoke refresh token
  async revokeToken(
    data?: { token?: string },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.revokeEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to revoke invalid refresh token
  async revokeInvalidToken(data?: { token?: string | any }) {
    return await this.request.post(this.revokeEndpoint, {
      data,
      failOnStatusCode: false,
    });
  }
}
