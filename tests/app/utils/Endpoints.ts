export class Endpoints {
  static readonly baseEndpoint = "/api/";

  //OAuth2 endpoints
  static readonly oauthEndpoint = this.baseEndpoint + "oauth/";
  static readonly authEndpoint = this.baseEndpoint + "auth/register";
  static readonly tokenEndpoint = this.oauthEndpoint + "token";
  static readonly clientsEndpoint = this.oauthEndpoint + "clients";
  static readonly revokeEndpoint = this.oauthEndpoint + "revoke";
  static readonly userInfoEndpoint = this.oauthEndpoint + "userinfo";
  static readonly coursesEndpoint = this.baseEndpoint + "courses";
  static readonly categoriesEndpoint = this.baseEndpoint + "categories";

  //Admin endpoints
  static readonly adminEndpoint = this.baseEndpoint + "admin/";
  static readonly adminUsersEndpoint = this.adminEndpoint + "users";
}
