import { defineConfig } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  globalSetup: "global-setup.ts",
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
  },
  reporter: [["html", { open: "never" }]],
  //to start server automatically
  webServer: {
    command: "npm run dev",
    url: process.env.BASE_URL || "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
