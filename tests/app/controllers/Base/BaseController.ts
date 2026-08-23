import { APIRequestContext } from "@playwright/test";

//Thin wrapper over Playwright's APIRequestContext - all resource controllers extend this
export class BaseController {
  protected request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }
}
