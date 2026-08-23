import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { RequestOptions } from "../utils/interfaces/RequestOptions";

export class RevokeController extends BaseController {
  private revokeEndpoint = Endpoints.revokeEndpoint;

  //POST request to revoke refresh token
  revokeToken(data?: { token?: string }, options?: RequestOptions) {
    return this.post(this.revokeEndpoint, data, options);
  }

  //POST request to revoke invalid refresh token
  revokeInvalidToken(data?: { token?: string | any }) {
    return this.post(this.revokeEndpoint, data, { failOnStatusCode: false });
  }
}
