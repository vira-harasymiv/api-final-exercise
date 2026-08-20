import { test as base } from "../fixtures/fixture";
import { OauthController } from "../../app/controllers/OAuth2/OauthController";
import { AuthController } from "../../app/controllers/Auth/AuthController";
import { ClientsController } from "../../app/controllers/OAuth2/ClientsController";
import { RevokeController } from "../../app/controllers/OAuth2/RevokeController";
import { ApiClient } from "../../app/controllers/Base/ApiClient";
import { UserInfoController } from "../../app/controllers/OAuth2/UseInfoController";
export { expect } from "@playwright/test";

type Fixtures = {
  oauthController: OauthController;
  authController: AuthController;
  clientsController: ClientsController;
  revokeController: RevokeController;
  apiClient: ApiClient;
  userInfoController: UserInfoController;
};

export const test = base.extend<Fixtures>({
  oauthController: async ({ request }, use) => {
    await use(new OauthController(request));
  },

  authController: async ({ request }, use) => {
    await use(new AuthController(request));
  },

  clientsController: async ({ request }, use) => {
    await use(new ClientsController(request));
  },

  revokeController: async ({ request }, use) => {
    await use(new RevokeController(request));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  userInfoController: async ({ request }, use) => {
    await use(new UserInfoController(request));
  },
});
