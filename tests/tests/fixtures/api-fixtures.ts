import { test as base } from "../fixtures/fixture";
import { OauthController } from "../../app/controllers/OauthController";
import { AuthController } from "../../app/controllers/AuthController";
import { ClientsController } from "../../app/controllers/ClientsController";
import { RevokeController } from "../../app/controllers/RevokeController";
import { ApiClient } from "../../app/controllers/Base/ApiClient";
import { UserInfoController } from "../../app/controllers/UseInfoController";
import { CoursesController } from "../../app/controllers/CoursesController";
import { CategoriesController } from "../../app/controllers/CategoriesController";
import { AdminController } from "../../app/controllers/AdminController";
import { UploadController } from "../../app/controllers/UploadController";
import { TagsController } from "../../app/controllers/TagsController";
export { expect } from "@playwright/test";

type Fixtures = {
  oauthController: OauthController;
  authController: AuthController;
  clientsController: ClientsController;
  revokeController: RevokeController;
  apiClient: ApiClient;
  userInfoController: UserInfoController;
  coursesController: CoursesController;
  categoriesController: CategoriesController;
  adminController: AdminController;
  uploadController: UploadController;
  tagsController: TagsController;
};

//Second fixture layer: extends the base `test` (fixture.ts) with one ready-to-use
//controller instance per API resource, so specs just destructure what they need
//from the test callback instead of constructing controllers themselves
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

  coursesController: async ({ request }, use) => {
    await use(new CoursesController(request));
  },

  categoriesController: async ({ request }, use) => {
    await use(new CategoriesController(request));
  },

  adminController: async ({ request }, use) => {
    await use(new AdminController(request));
  },

  uploadController: async ({ request }, use) => {
    await use(new UploadController(request));
  },

  tagsController: async ({ request }, use) => {
    await use(new TagsController(request));
  },
});
