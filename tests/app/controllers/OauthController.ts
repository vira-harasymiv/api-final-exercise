import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { passwordGrantPayload } from "../../tests/oauth2/testData/payloads";
import { RequestOptions } from "../utils/interfaces/RequestOptions";

export class OauthController extends BaseController {
  private tokenEndpoint = Endpoints.tokenEndpoint;

  //POST request to receive admin's token using Password Grant (all arguments are NOT mandatory)
  withPasswordGrant(
    data?: {
      grant_type?: string;
      email?: string;
      password?: string;
      scope?: string;
    },
    options?: RequestOptions,
  ) {
    return this.post(this.tokenEndpoint, data, options);
  }

  //POST request to receive token using Password Grant and invalid data types
  withInvalidPasswordGrant(data?: {
    grant_type?: string | any;
    email?: string | any;
    password?: string | any;
    scope?: string | any;
  }) {
    return this.post(this.tokenEndpoint, data, { failOnStatusCode: false });
  }

  //POST request to receive admin's token using client id & secret (all arguments are NOT mandatory)
  withClientIdAndSecret(
    data?: {
      grant_type?: string;
      client_id?: string;
      client_secret?: string;
      scope?: string;
    },
    options?: RequestOptions,
  ) {
    return this.post(this.tokenEndpoint, data, options);
  }

  //POST request to receive admin's token using Refresh Token Grant (all arguments are NOT mandatory)
  withRefreshTokenGrant(
    data?: { grant_type?: string; refresh_token?: string },
    options?: RequestOptions,
  ) {
    return this.post(this.tokenEndpoint, data, options);
  }

  //POST request to receive admin's token using Password Grant
  async takeAdminToken() {
    const response = await this.post(this.tokenEndpoint, passwordGrantPayload, {
      failOnStatusCode: true,
    });
    const json = await response.json();
    return json.access_token;
  }
}
