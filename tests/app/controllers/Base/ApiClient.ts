import { APIRequestContext } from "@playwright/test";
import { OauthController } from "../OAuth2/OauthController";
import { RevokeController } from "../OAuth2/RevokeController";
import { ClientsController } from "../OAuth2/ClientsController";
import { AuthController } from "../Auth/AuthController";
import { passwordGrantPayload } from "../../../tests/oauth2/testData/payloads";
import { UserInfoController } from "../OAuth2/UseInfoController";

export class ApiClient {
  private oauthController: OauthController;
  private revokeController: RevokeController;
  private clientsController: ClientsController;
  private authController: AuthController;
  private userInfoController: UserInfoController;

  constructor(request: APIRequestContext) {
    this.oauthController = new OauthController(request);
    this.revokeController = new RevokeController(request);
    this.clientsController = new ClientsController(request);
    this.authController = new AuthController(request);
    this.userInfoController = new UserInfoController(request);
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
    const responseLoginAsAdmin = await this.oauthController.withPasswordGrant(
      passwordGrantPayload,
      { failOnStatusCode: true },
    );
    const jsonLoginAsAdmin = await responseLoginAsAdmin.json();
    const adminToken = jsonLoginAsAdmin.access_token;

    const responseCreate = await this.clientsController.createClient(
      { name: name, scopes: scopes },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        failOnStatusCode: true,
      },
    );
    const jsonCreate = await responseCreate.json();
    const clientId = jsonCreate.clientId;
    const clientSecret = jsonCreate.clientSecret;

    const responseLogin = await this.oauthController.withClientIdAndSecret(
      {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      },
      { failOnStatusCode: true },
    );

    const jsonLogin = await responseLogin.json();
    const token = jsonLogin.access_token;
    const refreshToken = jsonLogin.refresh_token;

    return { responseLogin, clientId, token, refreshToken };
  }

  //Get token of the created user
  async getUserTokenAndRefreshToken(
    name: string,
    email: string,
    password: string,
  ) {
    await this.authController.registerUser(
      { name: name, email: email, password: password },
      { failOnStatusCode: true },
    );

    const loginResponse = await this.oauthController.withPasswordGrant(
      { grant_type: "password", email: email, password: password },
      { failOnStatusCode: true },
    );

    const json = await loginResponse.json();
    const token = json.access_token;
    const refreshToken = json.refresh_token;
    return { token, refreshToken };
  }

  async getClientInfo(clientId: string, clientSecret: string) {
    const responseLogin = await this.oauthController.withClientIdAndSecret(
      {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      },
      { failOnStatusCode: true },
    );

    const jsonLogin = await responseLogin.json();
    const token = jsonLogin.access_token;

    const responseGet = await this.userInfoController.getUserInfo({
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: true,
    });
    const jsonGet = await responseGet.json();
    return jsonGet;
  }
}
