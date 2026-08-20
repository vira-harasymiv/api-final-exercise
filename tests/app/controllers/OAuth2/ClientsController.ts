import { BaseController } from "../Base/BaseController";
import { Endpoints } from "../../utils/Endpoints";

export class ClientsController extends BaseController {
  private clientsEndpoint = Endpoints.clientsEndpoint;

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
    const response = await this.request.post(this.clientsEndpoint, {
      data: data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }

  //GET request to get all clients
  async getClients(options?: {
    headers?: { Authorization?: string };
    failOnStatusCode?: boolean;
  }) {
    return await this.request.get(this.clientsEndpoint);
  }
}
