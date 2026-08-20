export class Endpoints {
  static readonly baseEndpoint = "/api/";

  //Oauth endpoints
  static readonly oauthEndpoint = this.baseEndpoint + "oauth/";
  static readonly authEndpoint = this.baseEndpoint + "auth/register";
  static readonly tokenEndpoint = this.oauthEndpoint + "token";
  static readonly clientsEndpoint = this.oauthEndpoint + "clients";
  static readonly revokeEndpoint = this.oauthEndpoint + "revoke";
  static readonly userInfoEndpoint = this.oauthEndpoint + "userinfo";
}
