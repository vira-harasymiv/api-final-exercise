import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { RequestOptions } from "../utils/interfaces/RequestOptions";

export class AuthController extends BaseController {
  private tokenEndpoint = Endpoints.authEndpoint;

  //POST request to receive admin's token (all arguments are not mandatory)
  registerUser(
    data?: { name?: string; email?: string; password?: string },
    options?: RequestOptions,
  ) {
    return this.post(this.tokenEndpoint, data, options);
  }
}
