export class Endpoints {
  static readonly baseEndpoint = "/api/";

  //OAuth2 endpoints
  static readonly oauthEndpoint = this.baseEndpoint + "oauth/";
  static readonly authEndpoint = this.baseEndpoint + "auth/register";
  static readonly tokenEndpoint = this.oauthEndpoint + "token";
  static readonly clientsEndpoint = this.oauthEndpoint + "clients";
  static readonly revokeEndpoint = this.oauthEndpoint + "revoke";
  static readonly userInfoEndpoint = this.oauthEndpoint + "userinfo";

  //Courses endpoints
  static readonly coursesEndpoint = this.baseEndpoint + "courses";
  static readonly categoriesEndpoint = this.baseEndpoint + "categories";

  //Learning paths endpoint
  static readonly learningPathsEndpoint = this.baseEndpoint + "learning-paths";

  //Purchases endpoint
  static readonly purchasesEndpoint = this.baseEndpoint + "purchases";

  //Blog endpoints
  static readonly tagsEndpoint = this.baseEndpoint + "tags";
  static readonly postsEndpoint = this.baseEndpoint + "posts";

  //Admin endpoints
  static readonly adminEndpoint = this.baseEndpoint + "admin/";
  static readonly adminUsersEndpoint = this.adminEndpoint + "users";
  static readonly adminCoursesEndpoint = this.adminEndpoint + "courses";

  //Upload endpoint
  static readonly uploadFieEndpoint = this.baseEndpoint + "upload";
}
