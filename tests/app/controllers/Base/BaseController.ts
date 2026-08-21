import { APIRequestContext } from "@playwright/test";
import { RequestOptions } from "../../utils/interfaces";

export class BaseController {
  protected request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  protected async get(endpoint: string, options?: RequestOptions) {
    return this.request.get(endpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  protected async post(
    endpoint: string,
    data?: object,
    options?: RequestOptions,
  ) {
    return this.request.post(endpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  protected async patch(
    endpoint: string,
    data?: object,
    options?: RequestOptions,
  ) {
    return this.request.patch(endpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  protected async delete(endpoint: string, options?: RequestOptions) {
    return this.request.delete(endpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }
}
