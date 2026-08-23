import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { RequestOptions } from "../utils/interfaces/RequestOptions";

export class ClientsController extends BaseController {
  private clientsEndpoint = Endpoints.clientsEndpoint;

  //POST request to create a new client
  createClient(
    data?: { name?: string; grants?: Array<string>; scopes?: Array<string> },
    options?: RequestOptions,
  ) {
    return this.post(this.clientsEndpoint, data, options);
  }

  //POST request to create a new client with INVALID properties
  createClientWithInvalidData(
    data?: {
      name?: string | any;
      grants?: Array<string> | any;
      scopes?: Array<string> | any;
    },
    options?: RequestOptions,
  ) {
    return this.post(this.clientsEndpoint, data, {
      ...options,
      failOnStatusCode: false,
    });
  }

  //GET request to get all clients
  getClients(options?: RequestOptions) {
    return this.get(this.clientsEndpoint, options);
  }

  //Deactivate client by ID
  deactivateClient(clientId: string, options?: RequestOptions) {
    return this.delete(`${this.clientsEndpoint}/${clientId}`, options);
  }
}
