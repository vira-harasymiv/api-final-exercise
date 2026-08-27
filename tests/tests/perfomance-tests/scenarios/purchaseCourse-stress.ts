import { Options } from "k6/options";
import { stress } from "../config/loadProfiles.ts";
import { generateReport } from "../utils/reportGenerator.ts";
import {
  setupCourse,
  purchaseCourseIteration,
  teardownCourse,
  SetupData,
} from "./shared/purchaseCourseFlow.ts";

// ramping-vus is a closed model: you control the number of users
// STRESS TEST (duration: ~2m) - sustained load above the expected average to
// see how the purchase flow degrades under heavier traffic.

export const options: Options = {
  scenarios: {
    stress_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: stress,
    },
  },
  thresholds: {
    purchase_course_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
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
  return generateReport("dojo-purchase-course-stress", data);
}
