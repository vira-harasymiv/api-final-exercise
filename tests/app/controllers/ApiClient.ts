import { APIRequestContext } from "@playwright/test";
import { OauthController } from "./OauthController";
import { RevokeController } from "./RevokeController";

export class ApiClient {
  private oauthController: OauthController;
  private revokeController: RevokeController;

  constructor(request: APIRequestContext) {
    this.oauthController = new OauthController(request);
    this.revokeController = new RevokeController(request);
  }

  async loginWithRevokedToken(token: string, refreshToken: string) {
    await this.revokeController.revokeToken(
      { token: refreshToken },
      {
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: true,
      },
    );

    return await this.oauthController.withRefreshTokenGrant(
      {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
      { failOnStatusCode: false },
    );
  }
}
