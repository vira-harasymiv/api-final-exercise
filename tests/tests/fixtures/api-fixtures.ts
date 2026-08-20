import { test as base } from "../fixtures/fixture";
import { OauthController } from "../../app/controllers/OauthController";
import { AuthController } from "../../app/controllers/AuthController";
import { RegisterClientController } from "../../app/controllers/RegisterClientController";
import { RevokeController } from "../../app/controllers/RevokeController";
import { ApiClient } from "../../app/controllers/ApiClient";
import { UserInfoController } from "../../app/controllers/UseInfoController";
export { expect } from "@playwright/test";

type Fixtures = {
  oauthController: OauthController;
  authController: AuthController;
  registerClient: RegisterClientController;
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

  registerClient: async ({ request }, use) => {
    await use(new RegisterClientController(request));
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
