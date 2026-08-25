import {
  APIRequestContext,
  test as base,
  request as APIRequest,
} from "@playwright/test";
import { promises } from "fs";
import { faker } from "@faker-js/faker";

type myFixture = {
  isAuthorized: boolean;
  randomString: string;
  readClientToken: string;
  readWriteClientToken: string;
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

  //Random word + number, unique enough to avoid collisions between test runs
  randomString: async ({}, use) => {
    const random = Math.floor(Math.random() * 1_000_000);
    const title = faker.lorem.word({ length: 5 }) + random;
    await use(random + title);
  },

  //Token of a client created with only the `read` scope, cached the same way as the admin token
  readClientToken: async ({ request }, use) => {
    const token = await getScopedClientToken(
      request,
      ["read"],
      ".accessTokenRead",
    );
    await use(token);
  },

  //Token of a client created with the `read` and `write` scopes, cached the same way as the admin token
  readWriteClientToken: async ({ request }, use) => {
    const token = await getScopedClientToken(
      request,
      ["read", "write"],
      ".accessTokenReadWrite",
    );
    await use(token);
  },
});

async function getAccessToken(request: APIRequestContext) {
  return getCachedToken(".accessToken", request, async () => {
    const response = await request.post("/api/oauth/token", {
      data: {
        grant_type: "password",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      },
      failOnStatusCode: true,
    });
    const json = await response.json();
    return json.access_token;
  });
}

//Reuse the token cached in `cacheFile` if it's still valid; otherwise log in as admin,
//create a new client with the given `scopes`, log in as that client, and refresh the cache
async function getScopedClientToken(
  request: APIRequestContext,
  scopes: Array<string>,
  cacheFile: string,
) {
  return getCachedToken(cacheFile, request, async () => {
    const adminToken = await getAccessToken(request);
    const responseCreate = await request.post("/api/oauth/clients", {
      data: { name: `fixtureClient-${scopes.join("-")}`, scopes },
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      failOnStatusCode: true,
    });
    const jsonCreate = await responseCreate.json();

    const responseLogin = await request.post("/api/oauth/token", {
      data: {
        grant_type: "client_credentials",
        client_id: jsonCreate.clientId,
        client_secret: jsonCreate.clientSecret,
      },
      failOnStatusCode: true,
    });
    const jsonLogin = await responseLogin.json();
    return jsonLogin.access_token;
  });
}

//Shared caching logic: reuse the token in `cacheFile` if it still passes /userinfo, otherwise
//call `fetchNewToken` and (re)write the cache file - covers both an expired token and a
//missing file (deleted cache), since a failed read falls through to fetching a new one
async function getCachedToken(
  cacheFile: string,
  request: APIRequestContext,
  fetchNewToken: () => Promise<string>,
) {
  try {
    const cachedToken = await promises.readFile(cacheFile, {
      encoding: "utf-8",
    });
    if (await isAccessTokenValid(request, cachedToken)) {
      return cachedToken;
    }
  } catch (error) {
    // cache file missing or unreadable - fall through to fetch a new token
  }
  const freshToken = await fetchNewToken();
  await promises.writeFile(cacheFile, freshToken);
  return freshToken;
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
