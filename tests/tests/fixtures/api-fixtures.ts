import { test as base } from "../fixtures/fixture";
import { OauthController } from "../../app/controllers/OauthController";
import { AuthController } from "../../app/controllers/AuthController";
import { RegisterClient } from "../../app/controllers/RegisterClient";
import { RevokeController } from "../../app/controllers/RevokeController";
import { ApiClient } from "../../app/controllers/ApiClient";
export { expect } from "@playwright/test";

type Fixtures = {
  oauthController: OauthController;
  authController: AuthController;
  registerClient: RegisterClient;
  revokeController: RevokeController;
  apiClient: ApiClient;
};

export const test = base.extend<Fixtures>({
  oauthController: async ({ request }, use) => {
    await use(new OauthController(request));
  },

  authController: async ({ request }, use) => {
    await use(new AuthController(request));
  },

  registerClient: async ({ request }, use) => {
    await use(new RegisterClient(request));
  },

  revokeController: async ({ request }, use) => {
    await use(new RevokeController(request));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});
