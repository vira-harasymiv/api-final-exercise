import { Options } from "k6/options";
import { average } from "../config/loadProfiles.ts";
import { generateReport } from "../utils/reportGenerator.ts";
import {
  setupCourse,
  purchaseCourseIteration,
  teardownCourse,
  SetupData,
} from "./shared/purchaseCourseFlow.ts";

// ramping-vus is a closed model: you control the number of users
// AVERAGE LOAD TEST (duration: ~1m30s) - models the typical expected number
// of clients purchasing a course at the same time.

export const options: Options = {
  scenarios: {
    average_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: average,
    },
  },
  thresholds: {
    purchase_course_duration: ["p(95)<1000"],
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
  return generateReport("dojo-purchase-course-average", data);
}
