import { test as base } from "../fixtures/fixture";
import { OauthController } from "../../app/controllers/OauthController";
import { AuthController } from "../../app/controllers/AuthController";
import { RegisterClient } from "../../app/controllers/RegisterClient";
export { expect } from "@playwright/test";

type Fixtures = {
  oauthController: OauthController;
  authController: AuthController;
  registerClient: RegisterClient;
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
});
