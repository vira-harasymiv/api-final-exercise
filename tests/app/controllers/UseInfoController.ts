import { BaseController } from "./Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { RequestOptions } from "../utils/interfaces/RequestOptions";

export class UserInfoController extends BaseController {
  private userInfoEndpoint = Endpoints.userInfoEndpoint;

  getUserInfo(options: RequestOptions) {
    return this.get(this.userInfoEndpoint, options);
  }
}
