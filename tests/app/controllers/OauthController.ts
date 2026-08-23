import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { passwordGrantPayload } from "../../tests/oauth2/testData/payloads";

export class OauthController extends BaseController {
  private tokenEndpoint = Endpoints.tokenEndpoint;

  //POST request to receive admin's token using Password Grant
  async withPasswordGrant(
    data?: {
      grant_type?: string;
      email?: string;
      password?: string;
      scope?: string;
    },
    options?: {
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.tokenEndpoint, {
      data,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to receive token using Password Grant and invalid data types
  async withInvalidPasswordGrant(data?: {
    grant_type?: string | any;
    email?: string | any;
    password?: string | any;
    scope?: string | any;
  }) {
    return await this.request.post(this.tokenEndpoint, {
      data,
      failOnStatusCode: false,
    });
  }

  //POST request to receive admin's token using client id & secret
  async withClientIdAndSecret(
    data?: {
      grant_type?: string;
      client_id?: string;
      client_secret?: string;
      scope?: string;
    },
    options?: {
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.tokenEndpoint, {
      data,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to receive admin's token using Refresh Token Grant
  async withRefreshTokenGrant(
    data?: { grant_type?: string; refresh_token?: string },
    options?: {
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.tokenEndpoint, {
      data,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to receive admin's token using Password Grant
  async takeAdminToken() {
    const response = await this.request.post(this.tokenEndpoint, {
      data: passwordGrantPayload,
      failOnStatusCode: true,
    });
    const json = await response.json();
    return json.access_token;
  }
}
