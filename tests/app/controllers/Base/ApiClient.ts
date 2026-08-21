import { APIRequestContext } from "@playwright/test";
import { OauthController } from "../OauthController";
import { RevokeController } from "../RevokeController";
import { ClientsController } from "../ClientsController";
import { AuthController } from "../AuthController";
import { passwordGrantPayload } from "../../../tests/oauth2/testData/payloads";
import { UserInfoController } from "../UseInfoController";

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

  //Login as known client and get info about him using GET method
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
