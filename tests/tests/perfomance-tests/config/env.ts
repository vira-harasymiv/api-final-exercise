// k6 does not read .env files - values come from OS environment variables or
// `-e KEY=value` flags passed to `k6 run`. Defaults below match the repo's .env.
export const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
export const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || "admin@dojo.api";
export const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || "Password1";
export const COURSE_PRICE = Number(__ENV.COURSE_PRICE || 100);
