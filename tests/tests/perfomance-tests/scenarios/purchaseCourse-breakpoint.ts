import { Options } from "k6/options";
import { breakpoint } from "../config/loadProfiles.ts";
import { generateReport } from "../utils/reportGenerator.ts";
import {
  setupCourse,
  purchaseCourseIteration,
  teardownCourse,
  SetupData,
} from "./shared/purchaseCourseFlow.ts";

// ramping-vus is a closed model: you control the number of users
// BREAKPOINT TEST (duration: ~2m30s) - iteratively increases load to find
// the point where the purchase flow's latency or error rate degrades badly.
// Aborts early once http_req_failed crosses 10%.

export const options: Options = {
  scenarios: {
    breakpoint_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: breakpoint,
    },
  },
  thresholds: {
    purchase_course_duration: ["p(95)<500"],
    http_req_failed: [{ threshold: "rate<0.10", abortOnFail: true }],
  },
};

export function setup(): SetupData {
  return setupCourse();
}

export default function (data: SetupData) {
  purchaseCourseIteration(data);
}

export function teardown(data: SetupData) {
  teardownCourse(data);
}

export function handleSummary(data: any) {
  return generateReport("dojo-purchase-course-breakpoint", data);
}
