import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";

export class ClientsController extends BaseController {
  private clientsEndpoint = Endpoints.clientsEndpoint;

  //POST request to create a new client
  async createClient(
    data?: { name?: string; grants?: Array<string>; scopes?: Array<string> },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.clientsEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to create a new client with INVALID properties
  async createClientWithInvalidData(
    data?: {
      name?: string | any;
      grants?: Array<string> | any;
      scopes?: Array<string> | any;
    },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.clientsEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //GET request to get all clients
  async getClients(options?: {
    headers?: { Authorization?: string };
    failOnStatusCode?: boolean;
  }) {
    return await this.request.get(this.clientsEndpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //Deactivate client by ID
  async deactivateClient(
    clientId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.delete(`${this.clientsEndpoint}/${clientId}`, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }
}
