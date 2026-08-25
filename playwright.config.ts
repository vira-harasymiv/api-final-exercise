import { defineConfig } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
  },
  reporter: [["html", { open: "never" }]],
  // webServer: {
  //   command: "npm run dev",
  //   url: "http://172.20.80.1:3000/api/docs",
  //   reuseExistingServer: true,
  //   timeout: 60_000,
  // },
});
