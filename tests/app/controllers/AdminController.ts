import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";

export class AdminController extends BaseController {
  private adminUsersEndpoint = Endpoints.adminUsersEndpoint;

  //Search the registered user by name or email passed in query params
  async searchUser(
    params?: {
      search?: string;
    },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.get(this.adminUsersEndpoint, {
      params: params,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //Update user using user's ID by admin
  async updateUser(
    userId: string,
    data?: { email?: string; isActive?: boolean; name?: string },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.patch(`${this.adminUsersEndpoint}/${userId}`, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //Update user using user's ID by admin using INVALID data
  async updateUserWithInvalidData(
    userId: string,
    data?: { email?: any; isActive?: any; name?: any; role?: any },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.patch(`${this.adminUsersEndpoint}/${userId}`, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }
}
