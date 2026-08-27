import { Options } from "k6/options";
import { generateReport } from "../utils/reportGenerator.ts";
import {
  setupCourse,
  purchaseCourseIteration,
  teardownCourse,
  SetupData,
} from "./shared/purchaseCourseFlow.ts";

// SMOKE TEST (duration: 30s)
// Minimal load - verifies the register -> login -> purchase flow works
// end-to-end before running any of the heavier profiles below.

export const options: Options = {
  vus: 1,
  duration: "30s",
  thresholds: {
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
  return generateReport("dojo-purchase-course-smoke", data);
}
