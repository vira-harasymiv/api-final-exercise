import { test } from "../../fixtures/fixture";

test("register client", async ({ request }) => {
  const response = await request.post("/api/oauth/clients", {
    data: {
      name: "Test Admin",
      grants: ["client_credentials"],
      scopes: ["read", "write"],
    },
    failOnStatusCode: true,
  });
});
