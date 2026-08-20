import { APIRequestContext } from "@playwright/test";

export class BaseController {
  protected request: APIRequestContext;
  constructor(request: APIRequestContext) {
    this.request = request;
  }
}
