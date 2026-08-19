import {
  APIRequestContext,
  test as base,
  expect,
  request as APIRequest,
} from "@playwright/test";
import { promises } from "fs";
import { faker } from "@faker-js/faker";

type myFixture = {
  isAuthorized: boolean;
  randomString: string;
};

export const test = base.extend<myFixture>({
  isAuthorized: true,
  request: async ({ request, isAuthorized }, use) => {
    if (isAuthorized === true) {
      const accessToken = await getAccessToken(request);
      const req = await APIRequest.newContext({
        extraHTTPHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      await use(req);
    } else {
      await use(request);
    }
  },
  randomString: async ({}, use) => {
    const random = Math.floor(Math.random() * 1_000_000);
    const title = faker.lorem.word({ length: 5 }) + random;
    await use(random + title);
  },
});

async function getAccessToken(request: APIRequestContext) {
  let accessToken: string;
  try {
    accessToken = await promises.readFile(".accessToken", {
      encoding: "utf-8",
    });
    const isValid = await isAccessTokenValid(request, accessToken);
    expect(isValid).toBeTruthy();
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
      Authorization: `Bearer ${accessToken}`,
    },
    failOnStatusCode: false,
  });
  return response.ok();
}
