import { Options } from "k6/options";
import { spike } from "../config/loadProfiles.ts";
import { generateReport } from "../utils/reportGenerator.ts";
import {
  setupCourse,
  purchaseCourseIteration,
  teardownCourse,
  SetupData,
} from "./shared/purchaseCourseFlow.ts";

// ramping-vus is a closed model: you control the number of users
// SPIKE TEST (duration: ~1m) - a sudden burst of clients (e.g. a promo going
// live) to validate how the purchase flow handles an abrupt surge.

export const options: Options = {
  scenarios: {
    spike_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: spike,
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
  return generateReport("dojo-purchase-course-spike", data);
}
