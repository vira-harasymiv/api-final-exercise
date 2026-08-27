import { check } from "k6";
import { RefinedResponse, ResponseType } from "k6/http";

export function checkStatus(
  response: RefinedResponse<ResponseType | undefined>,
) {
  check(response, {
    "status is successful": (response) => {
      return response.status >= 200 && response.status < 300;
    },
  });
}
