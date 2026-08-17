import { test, request } from "@playwright/test";

test("get token and refresh token - should be successful", async ({
  request,
}) => {
  const response = await request.post("/api/oauth/token", {
    data: {
      grant_type: "password",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
    failOnStatusCode: true,
  });
  const json = await response.json();
  const token = json["access_token"];
  const refresh_token = json["refresh_token"];
  console.log(token);
});
//test commit
