import { request, expect, FullConfig } from "@playwright/test";

//Make sure the API is available before running tests
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL;
  const apiRequest = await request.newContext();
  const response = await apiRequest.get(baseURL + "/api/courses", {
    failOnStatusCode: true,
  });
  expect(response.ok()).toBeTruthy();
}
export default globalSetup;
