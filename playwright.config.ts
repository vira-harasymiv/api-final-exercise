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
});
