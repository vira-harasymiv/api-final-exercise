import { test, request, APIRequestContext } from "@playwright/test";

test("register client", async ({ request }) => {
  const token = await getToken(request);
  const response = await request.post("/api/oauth/clients", {
    headers: {
      Authorization: "Bearer " + token,
    },
    data: {
      name: "Test Admin",
      grants: ["client_credentials"],
      scopes: ["read", "write"],
    },
    failOnStatusCode: true,
  });
});

async function getToken(request: APIRequestContext) {
  const response = await request.post("/api/oauth/token", {
    data: {
      grant_type: "password",
      email: "admin@dojo.api",
      password: "Password1",
    },
    failOnStatusCode: true,
  });

  const json = await response.json();
  return json.access_token;
}
