import { APIRequestContext } from "@playwright/test";
import { OauthController } from "./OauthController";
import { RevokeController } from "./RevokeController";
import { RegisterClientController } from "./RegisterClientController";

export class ApiClient {
  private oauthController: OauthController;
  private revokeController: RevokeController;
  private registerClientController: RegisterClientController;

  constructor(request: APIRequestContext) {
    this.oauthController = new OauthController(request);
    this.revokeController = new RevokeController(request);
    this.registerClientController = new RegisterClientController(request);
  }

  //Login to the app with revoked token
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

  //Login to the app using credentials of the created new client
  async loginWithCredentialsOfNewClient(name: string, scopes: Array<string>) {
    const responseCreate = await this.registerClientController.createClient(
      { name: name, scopes: scopes },
      { failOnStatusCode: true },
    );
    const jsonCreate = await responseCreate.json();
    const clientId = jsonCreate.clientId;
    const clientSecret = jsonCreate.clientSecret;
    const id = jsonCreate.id;

    const response = await this.oauthController.withClientIdAndSecret(
      {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      },
      { failOnStatusCode: true },
    );

    return { response, clientId };
  }
}
