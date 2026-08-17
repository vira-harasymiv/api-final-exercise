import {
  APIRequestContext,
  test as base,
  expect,
  request as APIRequest,
} from "@playwright/test";
import { promises } from "fs";

type myFixture = {
  isAuthorized: boolean;
};

export const test = base.extend<myFixture>({
  isAuthorized: true,
  request: async ({ request, isAuthorized }, use) => {
    if (isAuthorized === true) {
      const accessToken = await getAccessToken(request);
      const req = await APIRequest.newContext({
        extraHTTPHeaders: {
          Authorization: "Bearer " + accessToken,
        },
      });
      await use(req);
    } else {
      await use(request);
    }
  },
});

async function getAccessToken(request: APIRequestContext) {
  let accessToken: string;
  try {
    accessToken = await promises.readFile(".accessToken", {
      encoding: "utf-8",
    });
    const isValid = await isAccessTokenValid(request, accessToken);
    expect(isValid).toBeTruthy;
  } catch (error) {
    const response = await request.post("/api/oauth/token", {
      data: {
        grant_type: "password",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      },
      failOnStatusCode: true,
    });
    const json = await response.json();
    accessToken = json.access_token;
    await promises.writeFile(".accessToken", accessToken);
  }
  return accessToken;
}

async function isAccessTokenValid(
  request: APIRequestContext,
  accessToken: string,
) {
  const response = await request.get("/api/oauth/userinfo", {
    headers: {
      Authorization: "Bearer" + accessToken,
    },
    failOnStatusCode: false,
  });
  return response.ok();
}
