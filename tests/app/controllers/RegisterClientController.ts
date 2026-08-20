import { BaseController } from "./BaseController";
import { Endpoints } from "../utils/Endpoints";

export class RegisterClientController extends BaseController {
  private registerEndpoint = Endpoints.registerClient;

  //POST request to create a new client)
  async createClient(
    data?: {
      name?: string;
      grants?: Array<string>;
      scopes?: Array<string>;
    },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    const response = await this.request.post(this.registerEndpoint, {
      data: data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }
}
