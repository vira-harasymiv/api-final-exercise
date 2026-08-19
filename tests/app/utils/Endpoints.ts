export class Endpoints {
  static readonly baseEndpoint = "/api/";

  //Oauth endpoints
  static readonly oauthEndpoint = this.baseEndpoint + "oauth/";
  static readonly authEndpoint = this.baseEndpoint + "auth/register";
  static readonly tokenEndpoint = this.oauthEndpoint + "token";
  static readonly registerClient = this.oauthEndpoint + "clients";
}
