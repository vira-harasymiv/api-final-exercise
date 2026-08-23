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

//Base fixture layer: overrides Playwright's `request` so specs get an already-authorized
//APIRequestContext by default, and adds a `randomString` fixture for unique test data
export const test = base.extend<myFixture>({
  //Default true - set `test.use({ isAuthorized: false })` in a describe block for
  //unauthenticated/negative-auth specs, which get the plain, unauthenticated `request` instead
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
  //Random word + number, unique enough to avoid collisions between test runs
  randomString: async ({}, use) => {
    const random = Math.floor(Math.random() * 1_000_000);
    const title = faker.lorem.word({ length: 5 }) + random;
    await use(random + title);
  },
});

//Reuse the admin access token cached in the gitignored ".accessToken" file if it's still
//valid, to avoid logging in as admin before every test; log in and refresh the cache on
//first run or once the cached token expires/fails validation
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

//A cached token is valid only if the API still accepts it - checked via /userinfo
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
