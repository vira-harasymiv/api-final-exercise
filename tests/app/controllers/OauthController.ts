import { BaseController } from "./BaseController";
import { Endpoints } from "../utils/Endpoints";

export class OauthController extends BaseController {
  private tokenEndpoint = Endpoints.tokenEndpoint;

  //POST request to receive admin's token using Password Grant (all arguments are NOT mandatory)
  async withPasswordGrant(
    data?: {
      grant_type?: string;
      email?: string;
      password?: string;
      scope?: string;
    },
    options?: { failOnStatusCode?: boolean },
  ) {
    const response = await this.request.post(this.tokenEndpoint, {
      data: data,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }

  //POST request to receive token using Password Grant and invalid data types
  async withInvalidPasswordGrant(data?: {
    grant_type?: string | any;
    email?: string | any;
    password?: string | any;
    scope?: string | any;
  }) {
    const response = await this.request.post(this.tokenEndpoint, {
      data: data,
      failOnStatusCode: false,
    });
    return response;
  }

  //POST request to receive admin's token using client id & secret (all arguments are NOT mandatory)
  async withClientIdAndSecret(
    data?: {
      grant_type?: string;
      client_id?: string;
      client_secret?: string;
      scope?: string;
    },
    options?: { failOnStatusCode?: boolean },
  ) {
    const response = await this.request.post(this.tokenEndpoint, {
      data: data,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }

  //POST request to receive admin's token using Refresh Token Grant (all arguments are NOT mandatory)
  async withRefreshTokenGrant(
    data?: {
      grant_type?: string;
      refresh_token?: string;
    },
    options?: { failOnStatusCode?: boolean },
  ) {
    const response = await this.request.post(this.tokenEndpoint, {
      data: data,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }
}
